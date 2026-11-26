
import {
  hashValue,
  hashOtp,
  encryptValue,
  generateOtp,
  constantTimeEqual
} from "./crypto.js";

import {
  nowIso,
  plusSeconds,
  httpError,
  calculateEmailHashes
} from "./otp-common.js";

const TARGET_USER_ID =
  "6b3b4088-7e19-4efc-a942-387c7880460c";

const TARGET_EMAIL = "al.masri.ent@gmail.com";
const TARGET_NAME = "JUHUD MANAGER";

const OTP_PURPOSE = "SUPER_ADMIN_OWNER_VERIFY";
const OTP_LIFETIME_SECONDS = 5 * 60;
const OTP_LIFETIME_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;

function requireConfiguration({ db, env, delivery }) {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }

  if (
    !env?.HMAC_SECRET ||
    !env?.OTP_HASH_SECRET ||
    !env?.ENCRYPTION_KEY
  ) {
    throw new Error(
      "Owner verification security configuration is incomplete."
    );
  }

  if (
    !delivery ||
    typeof delivery.send !== "function"
  ) {
    throw httpError(
      "Owner verification email delivery is unavailable.",
      503
    );
  }
}

function getRequestMetadata(request) {
  return {
    ipAddress:
      request?.headers?.get("CF-Connecting-IP") ?? null,

    userAgent:
      request?.headers?.get("User-Agent") ?? null
  };
}

async function checkOwnerEligibility(db, env) {
  const { identityHash } = await calculateEmailHashes(
    env,
    TARGET_EMAIL
  );

  const target = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.account_status
     FROM super_admin_bootstrap_state s
     INNER JOIN users u
       ON u.user_id = s.user_id
     WHERE s.bootstrap_id = 1
       AND s.user_id = ?1
       AND s.bootstrap_status = 'PENDING'
       AND u.user_id = ?1
       AND u.full_name = ?2
       AND lower(u.email) = ?3
       AND u.account_status = 'DISABLED'

       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.user_id = u.user_id
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.role_id = 'role-super-admin'
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_credentials c
         WHERE c.user_id = u.user_id
           AND c.credential_type = 'PASSWORD'
           AND c.revoked_at IS NULL
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.user_id = u.user_id
           AND i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.verification_status IN ('PENDING', 'VERIFIED')
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.identity_hash = ?4
           AND i.verification_status IN ('PENDING', 'VERIFIED')
       )

     LIMIT 1`
  ).bind(
    TARGET_USER_ID,
    TARGET_NAME,
    TARGET_EMAIL,
    identityHash
  ).first();

  if (!target) {
    throw httpError(
      "The designated bootstrap owner is not eligible for email verification.",
      409
    );
  }

  return target;
}

async function invalidateOwnerOtp(db, ownerOtpId) {
  await db.prepare(
    `UPDATE super_admin_owner_verification_otps
     SET invalidated_at = ?1
     WHERE owner_otp_id = ?2
       AND consumed_at IS NULL
       AND invalidated_at IS NULL`
  ).bind(
    nowIso(),
    ownerOtpId
  ).run();
}

/**
 * Request an OTP for the immutable initial Super Admin owner.
 *
 * The destination is fixed in this module.
 * The caller cannot supply an email address or user ID.
 */
export async function requestSuperAdminOwnerVerification({
  db,
  env,
  delivery
}) {
  requireConfiguration({
    db,
    env,
    delivery
  });

  const target = await checkOwnerEligibility(db, env);

  const otp = generateOtp();

  const {
    identityHash,
    destinationHash
  } = await calculateEmailHashes(
    env,
    TARGET_EMAIL
  );

  const encryptedDestination = await encryptValue(
    env.ENCRYPTION_KEY,
    TARGET_EMAIL
  );

  const otpHash = await hashOtp(
    env.OTP_HASH_SECRET,
    OTP_PURPOSE,
    destinationHash,
    otp
  );

  const ownerOtpId = crypto.randomUUID();

  const currentTime = new Date();
  const createdAt = currentTime.toISOString();

  const expiresAt = plusSeconds(
    currentTime,
    OTP_LIFETIME_SECONDS
  );

  // Invalidate previous OTP and insert the new one
  // within one D1 batch.
  const results = await db.batch([
    db.prepare(
      `UPDATE super_admin_owner_verification_otps
       SET invalidated_at = ?1
       WHERE bootstrap_id = 1
         AND user_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      createdAt,
      TARGET_USER_ID
    ),

    db.prepare(
      `INSERT INTO super_admin_owner_verification_otps (
         owner_otp_id,
         bootstrap_id,
         user_id,
         destination_hash,
         identity_hash,
         destination_encrypted,
         destination_hash_key_version,
         otp_hash,
         otp_hash_key_version,
         expires_at,
         attempt_count,
         max_attempts,
         last_sent_at,
         created_at
       )
       SELECT
         ?1,
         1,
         ?2,
         ?3,
         ?4,
         ?5,
         1,
         ?6,
         1,
         ?7,
         0,
         ?8,
         ?9,
         ?9
       WHERE EXISTS (
         SELECT 1
         FROM super_admin_bootstrap_state s
         INNER JOIN users u
           ON u.user_id = s.user_id
         WHERE s.bootstrap_id = 1
           AND s.user_id = ?2
           AND s.bootstrap_status = 'PENDING'
           AND u.full_name = ?10
           AND lower(u.email) = ?11
           AND u.account_status = 'DISABLED'
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.user_id = ?2
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.role_id = 'role-super-admin'
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_credentials c
         WHERE c.user_id = ?2
           AND c.credential_type = 'PASSWORD'
           AND c.revoked_at IS NULL
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.user_id = ?2
           AND i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.verification_status IN ('PENDING', 'VERIFIED')
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.identity_hash = ?4
           AND i.verification_status IN ('PENDING', 'VERIFIED')
       )`
    ).bind(
      ownerOtpId,
      TARGET_USER_ID,
      destinationHash,
      identityHash,
      encryptedDestination,
      otpHash,
      expiresAt,
      OTP_MAX_ATTEMPTS,
      createdAt,
      TARGET_NAME,
      TARGET_EMAIL
    )
  ]);

  if ((results?.[1]?.meta?.changes ?? 0) !== 1) {
    throw httpError(
      "Owner verification OTP could not be created. Check bootstrap account eligibility.",
      409
    );
  }

  try {
    await delivery.send({
      destinationType: "EMAIL",
      destination: target.email,
      purpose: OTP_PURPOSE,
      otp,
      expiresInMinutes: OTP_LIFETIME_MINUTES
    });
  } catch {
    await invalidateOwnerOtp(
      db,
      ownerOtpId
    );

    throw httpError(
      "Owner verification email could not be delivered. Please request a new code later.",
      503
    );
  }

  return {
    requested: true,
    delivery: "EMAIL",
    expiresInMinutes: OTP_LIFETIME_MINUTES
  };
}

/**
 * Verify the OTP for the immutable initial Super Admin owner.
 *
 * On success, this function creates a VERIFIED global EMAIL
 * identity. It does not activate the account, create a password,
 * or assign any role.
 */
export async function verifySuperAdminOwnerVerification({
  db,
  env,
  otp,
  request
}) {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }

  if (
    !env?.HMAC_SECRET ||
    !env?.OTP_HASH_SECRET ||
    !env?.ENCRYPTION_KEY
  ) {
    throw new Error(
      "Owner verification security configuration is incomplete."
    );
  }

  if (
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp)
  ) {
    throw httpError(
      "Invalid or expired verification code.",
      400
    );
  }

  const {
    identityHash,
    destinationHash
  } = await calculateEmailHashes(
    env,
    TARGET_EMAIL
  );

  const currentTime = nowIso();

  const activeOtp = await db.prepare(
    `SELECT
       owner_otp_id,
       user_id,
       destination_hash,
       identity_hash,
       otp_hash,
       expires_at,
       attempt_count,
       max_attempts
     FROM super_admin_owner_verification_otps
     WHERE bootstrap_id = 1
       AND user_id = ?1
       AND destination_hash = ?2
       AND identity_hash = ?3
       AND consumed_at IS NULL
       AND invalidated_at IS NULL
       AND expires_at > ?4
       AND attempt_count < max_attempts
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(
    TARGET_USER_ID,
    destinationHash,
    identityHash,
    currentTime
  ).first();

  if (!activeOtp) {
    throw httpError(
      "Invalid or expired verification code.",
      400
    );
  }

  const submittedOtpHash = await hashOtp(
    env.OTP_HASH_SECRET,
    OTP_PURPOSE,
    destinationHash,
    otp
  );

  if (
    !constantTimeEqual(
      activeOtp.otp_hash,
      submittedOtpHash
    )
  ) {
    // Increment failed attempt count atomically.
    // The fifth failed attempt invalidates the OTP.
    await db.prepare(
      `UPDATE super_admin_owner_verification_otps
       SET
         attempt_count = attempt_count + 1,
         invalidated_at = CASE
           WHEN attempt_count + 1 >= max_attempts
           THEN ?1
           ELSE invalidated_at
         END
       WHERE owner_otp_id = ?2
         AND otp_hash = ?3
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND expires_at > ?1
         AND attempt_count < max_attempts`
    ).bind(
      currentTime,
      activeOtp.owner_otp_id,
      activeOtp.otp_hash
    ).run();

    throw httpError(
      "Invalid or expired verification code.",
      400
    );
  }

  const identityId = crypto.randomUUID();
  const eventId = crypto.randomUUID();

  const verifiedAt = nowIso();

  const metadata = getRequestMetadata(request);

  // Consume the OTP and create the verified identity
  // within one D1 batch.
  const results = await db.batch([
    db.prepare(
      `UPDATE super_admin_owner_verification_otps
       SET consumed_at = ?1
       WHERE owner_otp_id = ?2
         AND user_id = ?3
         AND destination_hash = ?4
         AND identity_hash = ?5
         AND otp_hash = ?6
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND expires_at > ?1
         AND attempt_count < max_attempts`
    ).bind(
      verifiedAt,
      activeOtp.owner_otp_id,
      TARGET_USER_ID,
      destinationHash,
      identityHash,
      activeOtp.otp_hash
    ),

    db.prepare(
      `INSERT INTO user_auth_identities (
         identity_id,
         user_id,
         identity_type,
         country_code,
         identity_scope,
         identity_hash,
         hash_key_version,
         encrypted_value,
         verification_status,
         expires_at,
         verified_at,
         revoked_at,
         revoked_by,
         created_at,
         updated_at
       )
       SELECT
         ?1,
         ?2,
         'EMAIL',
         NULL,
         'GLOBAL',
         ?3,
         1,
         ?4,
         'VERIFIED',
         NULL,
         ?5,
         NULL,
         NULL,
         ?5,
         ?5
       WHERE EXISTS (
         SELECT 1
         FROM super_admin_owner_verification_otps o
         WHERE o.owner_otp_id = ?6
           AND o.user_id = ?2
           AND o.consumed_at = ?5
           AND o.invalidated_at IS NULL
       )

       AND EXISTS (
         SELECT 1
         FROM super_admin_bootstrap_state s
         INNER JOIN users u
           ON u.user_id = s.user_id
         WHERE s.bootstrap_id = 1
           AND s.user_id = ?2
           AND s.bootstrap_status = 'PENDING'
           AND u.full_name = ?7
           AND lower(u.email) = ?8
           AND u.account_status = 'DISABLED'
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.user_id = ?2
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.role_id = 'role-super-admin'
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_credentials c
         WHERE c.user_id = ?2
           AND c.credential_type = 'PASSWORD'
           AND c.revoked_at IS NULL
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.user_id = ?2
           AND i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.verification_status IN ('PENDING', 'VERIFIED')
       )

       AND NOT EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.identity_hash = ?3
           AND i.verification_status IN ('PENDING', 'VERIFIED')
       )`
    ).bind(
      identityId,
      TARGET_USER_ID,
      identityHash,
      await encryptValue(
        env.ENCRYPTION_KEY,
        TARGET_EMAIL
      ),
      verifiedAt,
      activeOtp.owner_otp_id,
      TARGET_NAME,
      TARGET_EMAIL
    ),

    db.prepare(
      `INSERT INTO auth_events (
         event_id,
         user_id,
         session_id,
         event_type,
         event_status,
         ip_address,
         user_agent,
         event_details,
         created_at
       )
       SELECT
         ?1,
         ?2,
         NULL,
         'SUPER_ADMIN_OWNER_EMAIL_VERIFIED',
         'SUCCESS',
         ?3,
         ?4,
         ?5,
         ?6
       WHERE EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.identity_id = ?7
           AND i.user_id = ?2
           AND i.verification_status = 'VERIFIED'
           AND i.verified_at = ?6
       )`
    ).bind(
      eventId,
      TARGET_USER_ID,
      metadata.ipAddress,
      metadata.userAgent,
      JSON.stringify({
        purpose: OTP_PURPOSE,
        identityType: "EMAIL",
        identityScope: "GLOBAL"
      }),
      verifiedAt,
      identityId
    )
  ]);

  if ((results?.[0]?.meta?.changes ?? 0) !== 1) {
    throw httpError(
      "Verification code is invalid, expired, or already used.",
      400
    );
  }

  if ((results?.[1]?.meta?.changes ?? 0) !== 1) {
    throw httpError(
      "The bootstrap account is no longer eligible for verification.",
      409
    );
  }

  return {
    verified: true,
    identityType: "EMAIL",
    verificationStatus: "VERIFIED"
  };
}

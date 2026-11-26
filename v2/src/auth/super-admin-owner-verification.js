
import {
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

import {
  expirePendingIdentityReservations
} from "./identity-reservations.js";

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
 * The destination is fixed.
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

const { identityHash } = await calculateEmailHashes(
  env,
  TARGET_EMAIL
);

await expirePendingIdentityReservations({
  db,
  identityType: "EMAIL",
  identityScope: "GLOBAL",
  identityHash
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

  /*
   * Invalidate the previous OTP and insert the new OTP
   * in one D1 batch.
   *
   * The database trigger independently checks eligibility.
   * If the new OTP insert fails, the batch is rolled back.
   */
  await db.batch([
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
       VALUES (
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
      createdAt
    )
  ]);

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
 * On successful consumption, the database trigger:
 * - Creates the VERIFIED global EMAIL identity.
 * - Creates the authentication audit event.
 *
 * This function does not:
 * - Activate the account.
 * - Create a password.
 * - Assign a role.
 * - Change the user's email.
 */
export async function verifySuperAdminOwnerVerification({
  db,
  env,
  otp
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
    /*
     * Increment failed attempts.
     * The fifth failed attempt invalidates the OTP.
     */
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

  const verifiedAt = nowIso();

  /*
   * Consuming the OTP fires the database triggers.
   *
   * The triggers create the verified identity and audit event.
   * If either operation fails, this UPDATE fails atomically.
   */
  const result = await db.prepare(
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
  ).run();

  if ((result?.meta?.changes ?? 0) !== 1) {
    throw httpError(
      "Verification code is invalid, expired, or already used.",
      400
    );
  }

  return {
    verified: true,
    identityType: "EMAIL",
    verificationStatus: "VERIFIED"
  };
}

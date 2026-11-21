
import {
  constantTimeEqual,
  encryptValue,
  generateOtp,
  hashOtp,
  hashValue,
  normalizeDestination
} from "./crypto.js";

const OTP_LIFETIME_MINUTES = 5;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_REQUESTS = 5;

function nowIso() {
  return new Date().toISOString();
}

function plusSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(destination) {
  try {
    return normalizeDestination("EMAIL", destination);
  } catch (error) {
    throw httpError(error.message, 400);
  }
}

function requireEmailDestination(destinationType) {
  if (destinationType !== "EMAIL") {
    throw httpError(
      "Only email OTP verification is currently supported.",
      400
    );
  }
}

function requireOtpSecrets(env) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }
}

async function calculateEmailHashes(env, normalized) {
  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `EMAIL:GLOBAL:${normalized}`
  );

  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `EMAIL:${normalized}`
  );

  return { identityHash, destinationHash };
}

function registrationEligibilitySql() {
  return `
    EXISTS (
      SELECT 1
      FROM user_auth_identities i
      INNER JOIN users u
        ON u.user_id = i.user_id
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE i.identity_id = ?3
        AND i.user_id = ?2
        AND i.identity_type = 'EMAIL'
        AND i.identity_scope = 'GLOBAL'
        AND i.identity_hash = ?4
        AND i.verification_status = 'PENDING'
        AND i.expires_at > ?14
        AND u.account_status = 'DISABLED'
        AND u.email IS NULL
        AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
    )
  `;
}

export async function requestRegistrationOtp({
  db,
  env,
  userId,
  identityId,
  destinationType,
  destination
}) {
  requireOtpSecrets(env);
  requireEmailDestination(destinationType);

  if (!env.ENCRYPTION_KEY) {
    throw new Error("Encryption secret is not configured.");
  }

  if (!userId || !identityId) {
    throw httpError("User ID and identity ID are required.", 400);
  }

  if (!env.OTP_DELIVERY ||
      typeof env.OTP_DELIVERY.send !== "function") {
    throw httpError("OTP delivery provider is not configured.", 503);
  }

  const normalized = normalizeEmail(destination);
  const { identityHash, destinationHash } =
    await calculateEmailHashes(env, normalized);

  const currentTime = new Date();
  const currentIso = currentTime.toISOString();

  const identity = await db.prepare(
    `SELECT i.identity_id
     FROM user_auth_identities i
     INNER JOIN users u
       ON u.user_id = i.user_id
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE i.identity_id = ?1
       AND i.user_id = ?2
       AND i.identity_type = 'EMAIL'
       AND i.identity_scope = 'GLOBAL'
       AND i.identity_hash = ?3
       AND i.verification_status = 'PENDING'
       AND i.expires_at > ?4
       AND u.account_status = 'DISABLED'
       AND u.email IS NULL
       AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
     LIMIT 1`
  ).bind(
    identityId,
    userId,
    identityHash,
    currentIso
  ).first();

  if (!identity) {
    throw httpError(
      "Email reservation is invalid, expired or no longer eligible.",
      409
    );
  }

  const windowStart = new Date(
    currentTime.getTime() - RATE_WINDOW_MINUTES * 60000
  ).toISOString();

  const cooldownStart = new Date(
    currentTime.getTime() - OTP_RESEND_SECONDS * 1000
  ).toISOString();

  const otp = generateOtp();
  const otpRequestId = crypto.randomUUID();

  const otpHash = await hashOtp(
    env.OTP_HASH_SECRET,
    "REGISTER",
    destinationHash,
    otp
  );

  const encryptedDestination = await encryptValue(
    env.ENCRYPTION_KEY,
    normalized
  );

  const expiresAt = plusSeconds(
    currentTime,
    OTP_LIFETIME_MINUTES * 60
  );

  // Invalidate the previous OTP only when a new request
  // is eligible under the same rate and cooldown rules.
  //
  // This must happen before INSERT because the database
  // permits only one active OTP per destination and purpose.
  const eligibility = `
    (
      SELECT COUNT(*)
      FROM auth_otp_requests
      WHERE destination_type = 'EMAIL'
        AND destination_hash = ?2
        AND otp_purpose = 'REGISTER'
        AND created_at >= ?3
    ) < ?4
    AND NOT EXISTS (
      SELECT 1
      FROM auth_otp_requests
      WHERE destination_type = 'EMAIL'
        AND destination_hash = ?2
        AND otp_purpose = 'REGISTER'
        AND last_sent_at > ?5
    )
    AND EXISTS (
      SELECT 1
      FROM user_auth_identities i
      INNER JOIN users u
        ON u.user_id = i.user_id
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE i.identity_id = ?6
        AND i.user_id = ?7
        AND i.identity_type = 'EMAIL'
        AND i.identity_scope = 'GLOBAL'
        AND i.identity_hash = ?8
        AND i.verification_status = 'PENDING'
        AND i.expires_at > ?9
        AND u.account_status = 'DISABLED'
        AND u.email IS NULL
        AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
    )
  `;

  const results = await db.batch([
    // 1. Invalidate the previous active OTP, if eligible.
    db.prepare(
      `UPDATE auth_otp_requests
       SET invalidated_at = ?1
       WHERE destination_type = 'EMAIL'
         AND destination_hash = ?2
         AND otp_purpose = 'REGISTER'
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND ${eligibility}`
    ).bind(
      currentIso,
      destinationHash,
      windowStart,
      RATE_MAX_REQUESTS,
      cooldownStart,
      identityId,
      userId,
      identityHash,
      currentIso
    ),

    // 2. Insert the replacement OTP.
    db.prepare(
      `INSERT INTO auth_otp_requests (
         otp_request_id,
         user_id,
         identity_id,
         otp_purpose,
         destination_type,
         destination_hash,
         destination_encrypted,
         destination_hash_key_version,
         otp_hash,
         otp_hash_key_version,
         expires_at,
         attempt_count,
         max_attempts,
         last_sent_at
       )
       SELECT
         ?1, ?2, ?3, 'REGISTER', 'EMAIL', ?4, ?5, 1,
         ?6, 1, ?7, 0, ?8, ?9
       WHERE
         (
           SELECT COUNT(*)
           FROM auth_otp_requests
           WHERE destination_type = 'EMAIL'
             AND destination_hash = ?4
             AND otp_purpose = 'REGISTER'
             AND created_at >= ?10
         ) < ?11
         AND NOT EXISTS (
           SELECT 1
           FROM auth_otp_requests
           WHERE destination_type = 'EMAIL'
             AND destination_hash = ?4
             AND otp_purpose = 'REGISTER'
             AND last_sent_at > ?12
         )
         AND EXISTS (
           SELECT 1
           FROM user_auth_identities i
           INNER JOIN users u
             ON u.user_id = i.user_id
           INNER JOIN user_registration_reviews r
             ON r.user_id = u.user_id
           WHERE i.identity_id = ?3
             AND i.user_id = ?2
             AND i.identity_type = 'EMAIL'
             AND i.identity_scope = 'GLOBAL'
             AND i.identity_hash = ?13
             AND i.verification_status = 'PENDING'
             AND i.expires_at > ?14
             AND u.account_status = 'DISABLED'
             AND u.email IS NULL
             AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
         )`
    ).bind(
      otpRequestId,
      userId,
      identityId,
      destinationHash,
      encryptedDestination,
      otpHash,
      expiresAt,
      OTP_MAX_ATTEMPTS,
      currentIso,
      windowStart,
      RATE_MAX_REQUESTS,
      cooldownStart,
      identityHash,
      currentIso
    )
  ]);

  const inserted = results?.[1]?.meta?.changes ?? 0;

  if (inserted !== 1) {
    throw httpError(
      "Too many OTP requests or registration is no longer eligible. Please wait before trying again.",
      429
    );
  }

  try {
    await env.OTP_DELIVERY.send({
      destinationType: "EMAIL",
      destination: normalized,
      purpose: "REGISTER",
      otp,
      expiresInMinutes: OTP_LIFETIME_MINUTES
    });
  } catch {
    await db.prepare(
      `UPDATE auth_otp_requests
       SET invalidated_at = ?1
       WHERE otp_request_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      nowIso(),
      otpRequestId
    ).run();

    throw httpError(
      "OTP could not be delivered. Please try again later.",
      503
    );
  }

  return {
    requestId: otpRequestId,
    destinationType: "EMAIL",
    expiresAt,
    resendAfterSeconds: OTP_RESEND_SECONDS
  };
}

export async function verifyRegistrationOtp({
  db,
  env,
  userId,
  identityId,
  destinationType,
  destination,
  otp
}) {
  requireOtpSecrets(env);
  requireEmailDestination(destinationType);

  if (!userId || !identityId) {
    throw httpError("User ID and identity ID are required.", 400);
  }

  if (!/^\d{6}$/.test(String(otp ?? ""))) {
    throw httpError("A six-digit OTP is required.", 400);
  }

  const normalized = normalizeEmail(destination);

  const { identityHash, destinationHash } =
    await calculateEmailHashes(env, normalized);

  const currentTime = nowIso();

  const row = await db.prepare(
    `SELECT
       otp_request_id,
       user_id,
       identity_id,
       otp_hash,
       expires_at,
       attempt_count,
       max_attempts
     FROM auth_otp_requests
     WHERE user_id = ?1
       AND identity_id = ?2
       AND destination_type = 'EMAIL'
       AND destination_hash = ?3
       AND otp_purpose = 'REGISTER'
       AND consumed_at IS NULL
       AND invalidated_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(
    userId,
    identityId,
    destinationHash
  ).first();

  if (!row) {
    throw httpError("OTP is invalid or expired.", 400);
  }

  const expiryTime = new Date(row.expires_at).getTime();

  if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) {
    await db.prepare(
      `UPDATE auth_otp_requests
       SET invalidated_at = ?1
       WHERE otp_request_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      currentTime,
      row.otp_request_id
    ).run();

    throw httpError("OTP is invalid or expired.", 400);
  }

  if (row.attempt_count >= row.max_attempts) {
    throw httpError("OTP attempt limit reached.", 429);
  }

  const candidateHash = await hashOtp(
    env.OTP_HASH_SECRET,
    "REGISTER",
    destinationHash,
    String(otp)
  );

  if (!constantTimeEqual(candidateHash, row.otp_hash)) {
    const updated = await db.prepare(
      `UPDATE auth_otp_requests
       SET
         attempt_count = attempt_count + 1,
         invalidated_at = CASE
           WHEN attempt_count + 1 >= max_attempts THEN ?1
           ELSE invalidated_at
         END
       WHERE otp_request_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND expires_at > ?1
         AND attempt_count < max_attempts
       RETURNING attempt_count, max_attempts`
    ).bind(
      currentTime,
      row.otp_request_id
    ).first();

    if (!updated) {
      throw httpError("OTP is invalid or expired.", 400);
    }

    throw httpError(
      "OTP is invalid or expired.",
      updated.attempt_count >= updated.max_attempts ? 429 : 400
    );
  }

  // IMPORTANT:
  // All four statements execute in one D1 batch.
  //
  // The first three establish the verified registration state.
  // The final statement consumes the OTP.
  //
  // The migration trigger rejects the final statement if
  // the required state has not been established.

  const results = await db.batch([
    // 1. Verify the email identity.
    db.prepare(
      `UPDATE user_auth_identities
       SET
         verification_status = 'VERIFIED',
         verified_at = ?1,
         expires_at = NULL,
         updated_at = ?1
       WHERE identity_id = ?2
         AND user_id = ?3
         AND identity_type = 'EMAIL'
         AND identity_scope = 'GLOBAL'
         AND identity_hash = ?4
         AND verification_status = 'PENDING'
         AND expires_at > ?1
         AND EXISTS (
           SELECT 1
           FROM auth_otp_requests
           WHERE otp_request_id = ?5
             AND user_id = ?3
             AND identity_id = ?2
             AND destination_type = 'EMAIL'
             AND destination_hash = ?6
             AND otp_purpose = 'REGISTER'
             AND consumed_at IS NULL
             AND invalidated_at IS NULL
             AND expires_at > ?1
             AND attempt_count < max_attempts
         )`
    ).bind(
      currentTime,
      identityId,
      userId,
      identityHash,
      row.otp_request_id,
      destinationHash
    ),

    // 2. Store the normalized email on the user account.
    db.prepare(
      `UPDATE users
       SET
         email = ?1,
         updated_at = ?2
       WHERE user_id = ?3
         AND account_status = 'DISABLED'
         AND email IS NULL
         AND EXISTS (
           SELECT 1
           FROM user_auth_identities
           WHERE identity_id = ?4
             AND user_id = ?3
             AND identity_type = 'EMAIL'
             AND identity_hash = ?5
             AND verification_status = 'VERIFIED'
         )
         AND EXISTS (
           SELECT 1
           FROM auth_otp_requests
           WHERE otp_request_id = ?6
             AND user_id = ?3
             AND identity_id = ?4
             AND destination_hash = ?7
             AND consumed_at IS NULL
             AND invalidated_at IS NULL
             AND expires_at > ?2
             AND attempt_count < max_attempts
         )`
    ).bind(
      normalized,
      currentTime,
      userId,
      identityId,
      identityHash,
      row.otp_request_id,
      destinationHash
    ),

    // 3. Move registration into Admin review.
    db.prepare(
      `UPDATE user_registration_reviews
       SET
         registration_status = 'PENDING_REVIEW',
         updated_at = ?1
       WHERE user_id = ?2
         AND registration_status = 'AWAITING_EMAIL_VERIFICATION'
         AND reviewed_by IS NULL
         AND reviewed_at IS NULL
         AND EXISTS (
           SELECT 1
           FROM users
           WHERE user_id = ?2
             AND email = ?3
             AND account_status = 'DISABLED'
         )
         AND EXISTS (
           SELECT 1
           FROM user_auth_identities
           WHERE identity_id = ?4
             AND user_id = ?2
             AND identity_type = 'EMAIL'
             AND identity_hash = ?5
             AND verification_status = 'VERIFIED'
         )
         AND EXISTS (
           SELECT 1
           FROM auth_otp_requests
           WHERE otp_request_id = ?6
             AND user_id = ?2
             AND identity_id = ?4
             AND destination_hash = ?7
             AND consumed_at IS NULL
             AND invalidated_at IS NULL
             AND expires_at > ?1
             AND attempt_count < max_attempts
         )`
    ).bind(
      currentTime,
      userId,
      normalized,
      identityId,
      identityHash,
      row.otp_request_id,
      destinationHash
    ),

    // 4. Consume the OTP LAST.
    //
    // Do not add conditions here that silently allow a zero-row
    // update after earlier statements have changed the database.
    // The trigger validates the resulting registration state.
    db.prepare(
      `UPDATE auth_otp_requests
       SET consumed_at = ?1
       WHERE otp_request_id = ?2
         AND user_id = ?3
         AND identity_id = ?4
         AND destination_type = 'EMAIL'
         AND destination_hash = ?5
         AND otp_purpose = 'REGISTER'
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      currentTime,
      row.otp_request_id,
      userId,
      identityId,
      destinationHash
    )
  ]);

  const identityChanges = results?.[0]?.meta?.changes ?? 0;
  const userChanges = results?.[1]?.meta?.changes ?? 0;
  const reviewChanges = results?.[2]?.meta?.changes ?? 0;
  const otpChanges = results?.[3]?.meta?.changes ?? 0;

  if (
    identityChanges !== 1 ||
    userChanges !== 1 ||
    reviewChanges !== 1 ||
    otpChanges !== 1
  ) {
    throw httpError(
      "OTP verification or registration update could not be completed. Please check the registration status.",
      409
    );
  }

  return {
    verified: true,
    destinationType: "EMAIL",
    identityId,
    identityStatus: "VERIFIED",
    emailUpdated: true,
    registrationStatus: "PENDING_REVIEW",
    nextStep: "SET_PASSWORD"
  };
}

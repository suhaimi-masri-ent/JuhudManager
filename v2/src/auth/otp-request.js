
import {
  encryptValue,
  generateOtp,
  hashOtp
} from "./crypto.js";

import {
  calculateEmailHashes,
  httpError,
  nowIso,
  normalizeEmail,
  plusSeconds,
  requireEmailDestination,
  requireOtpSecrets
} from "./otp-common.js";

const OTP_LIFETIME_MINUTES = 5;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_REQUESTS = 5;

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

  if (
    !env.OTP_DELIVERY ||
    typeof env.OTP_DELIVERY.send !== "function"
  ) {
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

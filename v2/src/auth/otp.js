
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

function normalizeInput(destinationType, destination) {
  try {
    return normalizeDestination(destinationType, destination);
  } catch (error) {
    throw httpError(error.message, 400);
  }
}

export async function requestRegistrationOtp({
  db,
  env,
  userId,
  identityId,
  destinationType,
  destination
}) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET || !env.ENCRYPTION_KEY) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (!userId || !identityId) {
    throw httpError("User ID and identity ID are required.", 400);
  }

  if (!env.OTP_DELIVERY || typeof env.OTP_DELIVERY.send !== "function") {
    throw httpError("OTP delivery provider is not configured.", 503);
  }

  const normalized = normalizeInput(destinationType, destination);

  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `${destinationType}:GLOBAL:${normalized}`
  );

  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `${destinationType}:${normalized}`
  );

  const currentTime = new Date();
  const currentIso = currentTime.toISOString();

  const identity = await db.prepare(
    `SELECT identity_id
     FROM user_auth_identities
     WHERE identity_id = ?1
       AND user_id = ?2
       AND identity_type = ?3
       AND identity_scope = 'GLOBAL'
       AND identity_hash = ?4
       AND verification_status = 'PENDING'
       AND expires_at > ?5
     LIMIT 1`
  ).bind(
    identityId,
    userId,
    destinationType,
    identityHash,
    currentIso
  ).first();

  if (!identity) {
    throw httpError("Identity reservation is invalid or expired.", 409);
  }

  const windowStart = new Date(
    currentTime.getTime() - RATE_WINDOW_MINUTES * 60000
  ).toISOString();

  const recent = await db.prepare(
    `SELECT
       COUNT(*) AS total,
       MAX(last_sent_at) AS last_sent_at
     FROM auth_otp_requests
     WHERE destination_type = ?1
       AND destination_hash = ?2
       AND otp_purpose = 'REGISTER'
       AND created_at >= ?3`
  ).bind(
    destinationType,
    destinationHash,
    windowStart
  ).first();

  if ((recent?.total ?? 0) >= RATE_MAX_REQUESTS) {
    throw httpError("Too many OTP requests. Please try again later.", 429);
  }

  if (recent?.last_sent_at) {
    const lastSent = new Date(recent.last_sent_at).getTime();

    if (
      Number.isFinite(lastSent) &&
      currentTime.getTime() - lastSent < OTP_RESEND_SECONDS * 1000
    ) {
      throw httpError("Please wait before requesting another OTP.", 429);
    }
  }

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

  await db.batch([
    db.prepare(
      `UPDATE auth_otp_requests
       SET invalidated_at = ?1
       WHERE destination_type = ?2
         AND destination_hash = ?3
         AND otp_purpose = 'REGISTER'
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      currentIso,
      destinationType,
      destinationHash
    ),

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
       VALUES (
         ?1, ?2, ?3, 'REGISTER', ?4, ?5, ?6, 1,
         ?7, 1, ?8, 0, ?9, ?10
       )`
    ).bind(
      otpRequestId,
      userId,
      identityId,
      destinationType,
      destinationHash,
      encryptedDestination,
      otpHash,
      expiresAt,
      OTP_MAX_ATTEMPTS,
      currentIso
    )
  ]);

  try {
    await env.OTP_DELIVERY.send({
      destinationType,
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
    destinationType,
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
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (!userId || !identityId) {
    throw httpError("User ID and identity ID are required.", 400);
  }

  if (!/^\d{6}$/.test(String(otp ?? ""))) {
    throw httpError("A six-digit OTP is required.", 400);
  }

  const normalized = normalizeInput(destinationType, destination);

  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `${destinationType}:${normalized}`
  );

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
       AND destination_type = ?3
       AND destination_hash = ?4
       AND otp_purpose = 'REGISTER'
       AND consumed_at IS NULL
       AND invalidated_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(
    userId,
    identityId,
    destinationType,
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

  const statements = [
    db.prepare(
      `UPDATE auth_otp_requests
       SET consumed_at = ?1
       WHERE otp_request_id = ?2
         AND user_id = ?3
         AND identity_id = ?4
         AND destination_type = ?5
         AND destination_hash = ?6
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND expires_at > ?1
         AND attempt_count < max_attempts`
    ).bind(
      currentTime,
      row.otp_request_id,
      userId,
      identityId,
      destinationType,
      destinationHash
    ),

    db.prepare(
      `UPDATE user_auth_identities
       SET
         verification_status = 'VERIFIED',
         verified_at = ?1,
         expires_at = NULL,
         updated_at = ?1
       WHERE identity_id = ?2
         AND user_id = ?3
         AND identity_type = ?4
         AND verification_status = 'PENDING'
         AND expires_at > ?1
         AND EXISTS (
           SELECT 1
           FROM auth_otp_requests
           WHERE otp_request_id = ?5
             AND user_id = ?3
             AND identity_id = ?2
             AND consumed_at = ?1
         )`
    ).bind(
      currentTime,
      identityId,
      userId,
      destinationType,
      row.otp_request_id
    )
  ];

  if (destinationType === "EMAIL") {
    statements.push(
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
               AND verification_status = 'VERIFIED'
           )`
      ).bind(
        normalized,
        currentTime,
        userId,
        identityId
      )
    );
  }

  const results = await db.batch(statements);

  const otpChanges = results?.[0]?.meta?.changes ?? 0;
  const identityChanges = results?.[1]?.meta?.changes ?? 0;
  const emailChanges = destinationType === "EMAIL"
    ? results?.[2]?.meta?.changes ?? 0
    : null;

  if (
    otpChanges !== 1 ||
    identityChanges !== 1 ||
    (destinationType === "EMAIL" && emailChanges !== 1)
  ) {
    throw httpError(
      "OTP or identity reservation is invalid, expired or already linked.",
      409
    );
  }

  return {
    verified: true,
    destinationType,
    identityId,
    identityStatus: "VERIFIED",
    emailUpdated: destinationType === "EMAIL"
  };
}


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
    if (error instanceof TypeError) {
      throw httpError(error.message, 400);
    }
    throw error;
  }
}

function hasOneChange(result) {
  return result?.meta?.changes === 1;
}

export async function requestRegistrationOtp({
  db,
  env,
  destinationType,
  destination
}) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET || !env.ENCRYPTION_KEY) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (!env.OTP_DELIVERY || typeof env.OTP_DELIVERY.send !== "function") {
    throw httpError("OTP delivery provider is not configured.", 503);
  }

  const normalized = normalizeInput(destinationType, destination);
  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `${destinationType}:${normalized}`
  );

  const currentTime = new Date();
  const currentIso = currentTime.toISOString();
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
    throw httpError(
      "Too many OTP requests. Please try again later.",
      429
    );
  }

  if (recent?.last_sent_at) {
    const lastSent = new Date(recent.last_sent_at).getTime();
    const elapsed = currentTime.getTime() - lastSent;

    if (
      Number.isFinite(lastSent) &&
      elapsed < OTP_RESEND_SECONDS * 1000
    ) {
      throw httpError(
        "Please wait before requesting another OTP.",
        429
      );
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

  // Invalidate the previous OTP and insert the new OTP
  // in one D1 batch operation.
  //
  // D1 batch executes its statements transactionally.
  // This also protects the active-OTP unique index.
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
         ?1, 'REGISTER', ?2, ?3, ?4, 1, ?5, 1, ?6, 0, ?7, ?8
       )`
    ).bind(
      otpRequestId,
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
  destinationType,
  destination,
  otp
}) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (!/^\d{6}$/.test(String(otp ?? ""))) {
    throw httpError("A six-digit OTP is required.", 400);
  }

  const normalized = normalizeInput(destinationType, destination);

  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `${destinationType}:${normalized}`
  );

  const row = await db.prepare(
    `SELECT
       otp_request_id,
       otp_hash,
       expires_at,
       attempt_count,
       max_attempts
     FROM auth_otp_requests
     WHERE destination_type = ?1
       AND destination_hash = ?2
       AND otp_purpose = 'REGISTER'
       AND consumed_at IS NULL
       AND invalidated_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(
    destinationType,
    destinationHash
  ).first();

  if (!row) {
    throw httpError("OTP is invalid or expired.", 400);
  }

  const currentTime = nowIso();

  const expiryTime = new Date(row.expires_at).getTime();

  if (
    !Number.isFinite(expiryTime) ||
    expiryTime <= Date.now()
  ) {
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
    // Increment the attempt counter atomically.
    // The conditional UPDATE prevents concurrent requests
    // from exceeding the configured attempt limit.
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

  // Consume the OTP only if it is still active,
  // unexpired and below the attempt limit.
  //
  // RETURNING confirms that exactly one active OTP
  // was successfully consumed.
  const consumed = await db.prepare(
    `UPDATE auth_otp_requests
     SET consumed_at = ?1
     WHERE otp_request_id = ?2
       AND consumed_at IS NULL
       AND invalidated_at IS NULL
       AND expires_at > ?1
       AND attempt_count < max_attempts
     RETURNING otp_request_id`
  ).bind(
    currentTime,
    row.otp_request_id
  ).first();

  if (!consumed) {
    throw httpError("OTP is invalid or expired.", 400);
  }

  return {
    verified: true,
    destinationType
  };
}

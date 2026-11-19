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

export async function requestRegistrationOtp({ db, env, destinationType, destination }) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET || !env.ENCRYPTION_KEY) {
    throw new Error("Authentication secrets are not configured.");
  }
  if (!env.OTP_DELIVERY || typeof env.OTP_DELIVERY.send !== "function") {
    throw httpError("OTP delivery provider is not configured.", 503);
  }

  const normalized = normalizeDestination(destinationType, destination);
  const destinationHash = await hashValue(env.HMAC_SECRET, `${destinationType}:${normalized}`);
  const currentTime = new Date();
  const currentIso = currentTime.toISOString();
  const windowStart = new Date(currentTime.getTime() - RATE_WINDOW_MINUTES * 60000).toISOString();

  const recent = await db.prepare(
    "SELECT COUNT(*) AS total, MAX(last_sent_at) AS last_sent_at FROM auth_otp_requests WHERE destination_type = ?1 AND destination_hash = ?2 AND created_at >= ?3"
  ).bind(destinationType, destinationHash, windowStart).first();

  if ((recent?.total ?? 0) >= RATE_MAX_REQUESTS) {
    throw httpError("Too many OTP requests. Please try again later.", 429);
  }

  if (recent?.last_sent_at) {
    const elapsed = currentTime.getTime() - new Date(recent.last_sent_at).getTime();
    if (elapsed < OTP_RESEND_SECONDS * 1000) {
      throw httpError("Please wait before requesting another OTP.", 429);
    }
  }

  const otp = generateOtp();
  const otpRequestId = crypto.randomUUID();
  const otpHash = await hashOtp(env.OTP_HASH_SECRET, "REGISTER", destinationHash, otp);
  const encryptedDestination = await encryptValue(env.ENCRYPTION_KEY, normalized);
  const expiresAt = plusSeconds(currentTime, OTP_LIFETIME_MINUTES * 60);

  await db.prepare(
    "UPDATE auth_otp_requests SET invalidated_at = ?1 WHERE destination_type = ?2 AND destination_hash = ?3 AND otp_purpose = 'REGISTER' AND consumed_at IS NULL AND invalidated_at IS NULL"
  ).bind(currentIso, destinationType, destinationHash).run();

  await db.prepare(
    "INSERT INTO auth_otp_requests (otp_request_id, otp_purpose, destination_type, destination_hash, destination_encrypted, destination_hash_key_version, otp_hash, otp_hash_key_version, expires_at, attempt_count, max_attempts, last_sent_at) VALUES (?1, 'REGISTER', ?2, ?3, ?4, 1, ?5, 1, ?6, 0, ?7, ?8)"
  ).bind(
    otpRequestId,
    destinationType,
    destinationHash,
    encryptedDestination,
    otpHash,
    expiresAt,
    OTP_MAX_ATTEMPTS,
    currentIso
  ).run();

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
      "UPDATE auth_otp_requests SET invalidated_at = ?1 WHERE otp_request_id = ?2 AND consumed_at IS NULL"
    ).bind(nowIso(), otpRequestId).run();
    throw httpError("OTP could not be delivered. Please try again later.", 503);
  }

  return {
    requestId: otpRequestId,
    destinationType,
    expiresAt,
    resendAfterSeconds: OTP_RESEND_SECONDS
  };
}

export async function verifyRegistrationOtp({ db, env, destinationType, destination, otp }) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }
  if (!/^\d{6}$/.test(String(otp ?? ""))) {
    throw httpError("A six-digit OTP is required.", 400);
  }

  const normalized = normalizeDestination(destinationType, destination);
  const destinationHash = await hashValue(env.HMAC_SECRET, `${destinationType}:${normalized}`);
  const row = await db.prepare(
    "SELECT otp_request_id, otp_hash, expires_at, attempt_count, max_attempts FROM auth_otp_requests WHERE destination_type = ?1 AND destination_hash = ?2 AND otp_purpose = 'REGISTER' AND consumed_at IS NULL AND invalidated_at IS NULL ORDER BY created_at DESC LIMIT 1"
  ).bind(destinationType, destinationHash).first();

  if (!row) throw httpError("OTP is invalid or expired.", 400);

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await db.prepare(
      "UPDATE auth_otp_requests SET invalidated_at = ?1 WHERE otp_request_id = ?2"
    ).bind(nowIso(), row.otp_request_id).run();
    throw httpError("OTP is invalid or expired.", 400);
  }

  if (row.attempt_count >= row.max_attempts) {
    throw httpError("OTP attempt limit reached.", 429);
  }

  const candidateHash = await hashOtp(env.OTP_HASH_SECRET, "REGISTER", destinationHash, String(otp));
  if (!constantTimeEqual(candidateHash, row.otp_hash)) {
    const nextAttempt = row.attempt_count + 1;
    await db.prepare(
      "UPDATE auth_otp_requests SET attempt_count = ?1, invalidated_at = CASE WHEN ?1 >= max_attempts THEN ?2 ELSE invalidated_at END WHERE otp_request_id = ?3"
    ).bind(nextAttempt, nowIso(), row.otp_request_id).run();

    throw httpError(
      "OTP is invalid or expired.",
      nextAttempt >= row.max_attempts ? 429 : 400
    );
  }

  const result = await db.prepare(
    "UPDATE auth_otp_requests SET consumed_at = ?1 WHERE otp_request_id = ?2 AND consumed_at IS NULL AND invalidated_at IS NULL"
  ).bind(nowIso(), row.otp_request_id).run();

  if (result?.meta?.changes === 0) {
    throw httpError("OTP is invalid or expired.", 400);
  }

  return { verified: true, destinationType };
}


import { hashValue } from "./crypto.js";

const SETUP_TOKEN_LIFETIME_MINUTES = 15;
const SETUP_TOKEN_LIFETIME_SECONDS = 15 * 60;
const SETUP_RATE_WINDOW_MINUTES = 15;
const SETUP_RATE_MAX_REQUESTS = 3;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function plusSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

function encodeBase64Url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function generateSetupToken() {
  return encodeBase64Url(
    crypto.getRandomValues(new Uint8Array(32))
  );
}

function validateSetupToken(token) {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(token)
  );
}

const ELIGIBILITY_SQL = `
  EXISTS (
    SELECT 1
    FROM users u
    INNER JOIN user_registration_reviews r
      ON r.user_id = u.user_id
    WHERE u.user_id = ?1
      AND u.account_status = 'DISABLED'
      AND u.email IS NOT NULL
      AND r.registration_status = 'PENDING_REVIEW'
      AND r.reviewed_by IS NULL
      AND r.reviewed_at IS NULL
  )
  AND EXISTS (
    SELECT 1
    FROM user_auth_identities i
    WHERE i.user_id = ?1
      AND i.identity_type = 'EMAIL'
      AND i.identity_scope = 'GLOBAL'
      AND i.verification_status = 'VERIFIED'
      AND i.verified_at IS NOT NULL
      AND i.expires_at IS NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM user_credentials c
    WHERE c.user_id = ?1
      AND c.credential_type = 'PASSWORD'
      AND c.revoked_at IS NULL
  )
`;

export async function issueActivationToken({
  db,
  env,
  userId
}) {
  if (!env.HMAC_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (
    !env.ACTIVATION_DELIVERY ||
    typeof env.ACTIVATION_DELIVERY.send !== "function"
  ) {
    throw httpError(
      "Password setup delivery provider is not configured.",
      503
    );
  }

  if (typeof userId !== "string" || !userId.trim()) {
    throw httpError("A valid user ID is required.", 400);
  }

  const normalizedUserId = userId.trim();

  const user = await db.prepare(
    `SELECT u.user_id, u.email
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.user_id = ?1
       AND u.account_status = 'DISABLED'
       AND u.email IS NOT NULL
       AND r.registration_status = 'PENDING_REVIEW'
       AND r.reviewed_by IS NULL
       AND r.reviewed_at IS NULL
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.user_id = u.user_id
           AND i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.verification_status = 'VERIFIED'
           AND i.verified_at IS NOT NULL
           AND i.expires_at IS NULL
       )
       AND NOT EXISTS (
         SELECT 1
         FROM user_credentials c
         WHERE c.user_id = u.user_id
           AND c.credential_type = 'PASSWORD'
           AND c.revoked_at IS NULL
       )
     LIMIT 1`
  ).bind(normalizedUserId).first();

  if (!user) {
    throw httpError("Registration is not eligible for password setup.", 409);
  }

  const currentTime = new Date();
  const currentIso = currentTime.toISOString();

  const windowStart = new Date(
    currentTime.getTime() -
    SETUP_RATE_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const token = generateSetupToken();

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `account-activation:v1:${token}`
  );

  const tokenId = crypto.randomUUID();

  const expiresAt = plusSeconds(
    currentTime,
    SETUP_TOKEN_LIFETIME_SECONDS
  );

  const eligibility = ELIGIBILITY_SQL;

  const results = await db.batch([
    // Invalidate an earlier unused setup token only
    // when this new request is eligible and rate-limited.
    db.prepare(
      `UPDATE user_activation_tokens
       SET invalidated_at = ?2
       WHERE user_id = ?1
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND (
           SELECT COUNT(*)
           FROM user_activation_tokens
           WHERE user_id = ?1
             AND created_at >= ?3
         ) < ?4
         AND ${eligibility}`
    ).bind(
      normalizedUserId,
      currentIso,
      windowStart,
      SETUP_RATE_MAX_REQUESTS
    ),

    // Issue a new one-time password setup token.
    db.prepare(
      `INSERT INTO user_activation_tokens (
         activation_token_id,
         user_id,
         token_hash,
         hash_key_version,
         expires_at,
         created_at
       )
       SELECT ?1, ?2, ?3, 1, ?4, ?5
       WHERE (
         SELECT COUNT(*)
         FROM user_activation_tokens
         WHERE user_id = ?2
           AND created_at >= ?6
       ) < ?7
       AND ${ELIGIBILITY_SQL.replaceAll("?1", "?2")}`
    ).bind(
      tokenId,
      normalizedUserId,
      tokenHash,
      expiresAt,
      currentIso,
      windowStart,
      SETUP_RATE_MAX_REQUESTS
    )
  ]);

  const inserted = results?.[1]?.meta?.changes ?? 0;

  if (inserted !== 1) {
    const recentRequests = await db.prepare(
      `SELECT COUNT(*) AS total
       FROM user_activation_tokens
       WHERE user_id = ?1
         AND created_at >= ?2`
    ).bind(normalizedUserId, windowStart).first();

    if (
      (recentRequests?.total ?? 0) >=
      SETUP_RATE_MAX_REQUESTS
    ) {
      throw httpError(
        "Too many password setup requests. Please try again later.",
        429
      );
    }

    throw httpError(
      "Registration state changed. Password setup token was not issued.",
      409
    );
  }

  try {
    await env.ACTIVATION_DELIVERY.send({
      destinationType: "EMAIL",
      destination: user.email,
      purpose: "PASSWORD_SETUP",
      activationToken: token,
      expiresInMinutes: SETUP_TOKEN_LIFETIME_MINUTES
    });
  } catch {
    await db.prepare(
      `UPDATE user_activation_tokens
       SET invalidated_at = ?1
       WHERE activation_token_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(nowIso(), tokenId).run();

    throw httpError(
      "Password setup email could not be delivered. Please try again later.",
      503
    );
  }

  return {
    issued: true,
    expiresAt,
    expiresInMinutes: SETUP_TOKEN_LIFETIME_MINUTES,
    delivery: "EMAIL",
    purpose: "PASSWORD_SETUP"
  };
}

export async function findValidActivationToken({
  db,
  env,
  token
}) {
  if (!env.HMAC_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (!validateSetupToken(token)) {
    throw httpError("Password setup token is invalid or expired.", 400);
  }

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `account-activation:v1:${token}`
  );

  const currentTime = nowIso();

  const row = await db.prepare(
    `SELECT
       t.activation_token_id,
       t.user_id,
       t.expires_at
     FROM user_activation_tokens t
     WHERE t.token_hash = ?1
       AND t.consumed_at IS NULL
       AND t.invalidated_at IS NULL
       AND t.expires_at > ?2
       AND ${ELIGIBILITY_SQL.replaceAll("?1", "t.user_id")}
     LIMIT 1`
  ).bind(tokenHash, currentTime).first();

  if (!row) {
    throw httpError("Password setup token is invalid or expired.", 400);
  }

  return {
    activationTokenId: row.activation_token_id,
    userId: row.user_id,
    expiresAt: row.expires_at
  };
}

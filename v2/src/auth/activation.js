
import { hashValue } from "./crypto.js";

const ACTIVATION_TOKEN_LIFETIME_MINUTES = 15;
const ACTIVATION_TOKEN_LIFETIME_SECONDS = 15 * 60;
const ACTIVATION_RATE_WINDOW_MINUTES = 15;
const ACTIVATION_RATE_MAX_REQUESTS = 3;

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

function generateActivationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return encodeBase64Url(bytes);
}

function validateActivationToken(token) {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(token)
  );
}

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
      "Account activation delivery provider is not configured.",
      503
    );
  }

  if (typeof userId !== "string" || !userId.trim()) {
    throw httpError("A valid user ID is required.", 400);
  }

  const normalizedUserId = userId.trim();

  const user = await db.prepare(
    `SELECT user_id, email, account_status
     FROM users
     WHERE user_id = ?1
     LIMIT 1`
  ).bind(normalizedUserId).first();

  if (!user) {
    throw httpError("Registration account was not found.", 404);
  }

  if (user.account_status !== "DISABLED" || !user.email) {
    throw httpError("Account is not eligible for activation.", 409);
  }

  const identityState = await db.prepare(
    `SELECT
       SUM(CASE WHEN identity_type = 'NATIONAL_ID'
         THEN 1 ELSE 0 END) AS national_id_total,
       SUM(CASE WHEN identity_type = 'EMAIL'
         THEN 1 ELSE 0 END) AS email_total,
       SUM(CASE WHEN identity_type = 'WHATSAPP'
         THEN 1 ELSE 0 END) AS whatsapp_total
     FROM user_auth_identities
     WHERE user_id = ?1
       AND verification_status = 'VERIFIED'
       AND identity_type IN ('NATIONAL_ID', 'EMAIL', 'WHATSAPP')`
  ).bind(normalizedUserId).first();

  if (
    (identityState?.national_id_total ?? 0) < 1 ||
    (identityState?.email_total ?? 0) < 1 ||
    (identityState?.whatsapp_total ?? 0) < 1
  ) {
    throw httpError(
      "All required identities must be verified before activation.",
      409
    );
  }

  const existingCredential = await db.prepare(
    `SELECT credential_id
     FROM user_credentials
     WHERE user_id = ?1
       AND credential_type = 'PASSWORD'
       AND revoked_at IS NULL
     LIMIT 1`
  ).bind(normalizedUserId).first();

  if (existingCredential) {
    throw httpError(
      "An active password credential already exists.",
      409
    );
  }

  const currentTime = new Date();
  const currentIso = currentTime.toISOString();

  const windowStart = new Date(
    currentTime.getTime() -
    ACTIVATION_RATE_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const token = generateActivationToken();

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `account-activation:v1:${token}`
  );

  const tokenId = crypto.randomUUID();

  const expiresAt = plusSeconds(
    currentTime,
    ACTIVATION_TOKEN_LIFETIME_SECONDS
  );

  // Both statements apply the same rate-limit and eligibility
  // conditions inside one D1 transaction.
  //
  // If the limit is reached, neither the old token nor the
  // account's existing activation state is modified.
  const results = await db.batch([
    db.prepare(
      `UPDATE user_activation_tokens
       SET invalidated_at = ?1
       WHERE user_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND (
           SELECT COUNT(*)
           FROM user_activation_tokens
           WHERE user_id = ?2
             AND created_at >= ?3
         ) < ?4
         AND EXISTS (
           SELECT 1
           FROM users
           WHERE user_id = ?2
             AND account_status = 'DISABLED'
             AND email = ?5
         )
         AND EXISTS (
           SELECT 1
           FROM user_auth_identities
           WHERE user_id = ?2
             AND identity_type = 'NATIONAL_ID'
             AND verification_status = 'VERIFIED'
         )
         AND EXISTS (
           SELECT 1
           FROM user_auth_identities
           WHERE user_id = ?2
             AND identity_type = 'EMAIL'
             AND verification_status = 'VERIFIED'
         )
         AND EXISTS (
           SELECT 1
           FROM user_auth_identities
           WHERE user_id = ?2
             AND identity_type = 'WHATSAPP'
             AND verification_status = 'VERIFIED'
         )
         AND NOT EXISTS (
           SELECT 1
           FROM user_credentials
           WHERE user_id = ?2
             AND credential_type = 'PASSWORD'
             AND revoked_at IS NULL
         )`
    ).bind(
      currentIso,
      normalizedUserId,
      windowStart,
      ACTIVATION_RATE_MAX_REQUESTS,
      user.email
    ),

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
       AND EXISTS (
         SELECT 1
         FROM users
         WHERE user_id = ?2
           AND account_status = 'DISABLED'
           AND email = ?8
       )
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities
         WHERE user_id = ?2
           AND identity_type = 'NATIONAL_ID'
           AND verification_status = 'VERIFIED'
       )
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities
         WHERE user_id = ?2
           AND identity_type = 'EMAIL'
           AND verification_status = 'VERIFIED'
       )
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities
         WHERE user_id = ?2
           AND identity_type = 'WHATSAPP'
           AND verification_status = 'VERIFIED'
       )
       AND NOT EXISTS (
         SELECT 1
         FROM user_credentials
         WHERE user_id = ?2
           AND credential_type = 'PASSWORD'
           AND revoked_at IS NULL
       )`
    ).bind(
      tokenId,
      normalizedUserId,
      tokenHash,
      expiresAt,
      currentIso,
      windowStart,
      ACTIVATION_RATE_MAX_REQUESTS,
      user.email
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
      ACTIVATION_RATE_MAX_REQUESTS
    ) {
      throw httpError(
        "Too many activation requests. Please try again later.",
        429
      );
    }

    throw httpError(
      "Account verification state changed. Activation token was not issued.",
      409
    );
  }

  try {
    await env.ACTIVATION_DELIVERY.send({
      destinationType: "EMAIL",
      destination: user.email,
      purpose: "ACCOUNT_ACTIVATION",
      activationToken: token,
      expiresInMinutes: ACTIVATION_TOKEN_LIFETIME_MINUTES
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
      "Activation email could not be delivered. Please try again later.",
      503
    );
  }

  return {
    issued: true,
    expiresAt,
    expiresInMinutes: ACTIVATION_TOKEN_LIFETIME_MINUTES,
    delivery: "EMAIL"
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

  if (!validateActivationToken(token)) {
    throw httpError("Activation token is invalid or expired.", 400);
  }

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `account-activation:v1:${token}`
  );

  const currentTime = nowIso();

  const row = await db.prepare(
    `SELECT
       activation_token_id,
       user_id,
       expires_at
     FROM user_activation_tokens
     WHERE token_hash = ?1
       AND consumed_at IS NULL
       AND invalidated_at IS NULL
       AND expires_at > ?2
       AND EXISTS (
         SELECT 1
         FROM users
         WHERE users.user_id = user_activation_tokens.user_id
           AND users.account_status = 'DISABLED'
           AND users.email IS NOT NULL
       )
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities
         WHERE user_id = user_activation_tokens.user_id
           AND identity_type = 'NATIONAL_ID'
           AND verification_status = 'VERIFIED'
       )
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities
         WHERE user_id = user_activation_tokens.user_id
           AND identity_type = 'EMAIL'
           AND verification_status = 'VERIFIED'
       )
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities
         WHERE user_id = user_activation_tokens.user_id
           AND identity_type = 'WHATSAPP'
           AND verification_status = 'VERIFIED'
       )
     LIMIT 1`
  ).bind(tokenHash, currentTime).first();

  if (!row) {
    throw httpError("Activation token is invalid or expired.", 400);
  }

  return {
    activationTokenId: row.activation_token_id,
    userId: row.user_id,
    expiresAt: row.expires_at
  };
}

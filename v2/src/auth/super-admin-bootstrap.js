import { hashValue } from "./crypto.js";

const TARGET_USER_ID = "6b3b4088-7e19-4efc-a942-387c7880460c";
const TARGET_EMAIL = "al.masri.ent@gmail.com";
const TARGET_NAME = "JUHUD MANAGER";
const TOKEN_LIFETIME_MINUTES = 15;
const TOKEN_LIFETIME_SECONDS = 15 * 60;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function addSeconds(date, seconds) {
  return new Date(
    date.getTime() + seconds * 1000
  ).toISOString();
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

function generateBootstrapToken() {
  return encodeBase64Url(
    crypto.getRandomValues(new Uint8Array(32))
  );
}

function validateBootstrapToken(token) {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(token)
  );
}

function requireBootstrapConfiguration(env) {
  if (!env?.HMAC_SECRET) {
    throw new Error(
      "Authentication security secret is not configured."
    );
  }

  if (
    !env?.ACTIVATION_DELIVERY ||
    typeof env.ACTIVATION_DELIVERY.send !== "function"
  ) {
    throw httpError(
      "Password setup delivery provider is not configured.",
      503
    );
  }
}

export async function issueSuperAdminBootstrapToken({
  db,
  env
}) {
  requireBootstrapConfiguration(env);

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
       AND EXISTS (
         SELECT 1
         FROM user_auth_identities i
         WHERE i.user_id = u.user_id
           AND i.identity_type = 'EMAIL'
           AND i.identity_scope = 'GLOBAL'
           AND i.identity_hash = ?4
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
       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         WHERE ur.user_id = u.user_id
       )
       AND NOT EXISTS (
         SELECT 1
         FROM user_roles
         WHERE role_id = 'role-super-admin'
       )
     LIMIT 1`
  ).bind(
    TARGET_USER_ID,
    TARGET_NAME,
    TARGET_EMAIL,
    await hashValue(
      env.HMAC_SECRET,
      `EMAIL:GLOBAL:${TARGET_EMAIL}`
    )
  ).first();

  if (!target) {
    throw httpError(
      "The designated account is not eligible for Super Admin bootstrap.",
      409
    );
  }

  const token = generateBootstrapToken();

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `super-admin-bootstrap:v1:${token}`
  );

  const tokenId = crypto.randomUUID();
  const currentTime = new Date();
  const currentIso = currentTime.toISOString();

  const expiresAt = addSeconds(
    currentTime,
    TOKEN_LIFETIME_SECONDS
  );

  const results = await db.batch([
    db.prepare(
      `UPDATE super_admin_bootstrap_tokens
       SET invalidated_at = ?1
       WHERE user_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      currentIso,
      TARGET_USER_ID
    ),

    db.prepare(
      `INSERT INTO super_admin_bootstrap_tokens (
         bootstrap_token_id,
         user_id,
         token_hash,
         hash_key_version,
         expires_at,
         created_at
       )
       SELECT
         ?1,
         ?2,
         ?3,
         1,
         ?4,
         ?5
       WHERE EXISTS (
         SELECT 1
         FROM super_admin_bootstrap_state s
         INNER JOIN users u
           ON u.user_id = s.user_id
         WHERE s.bootstrap_id = 1
           AND s.user_id = ?2
           AND s.bootstrap_status = 'PENDING'
           AND u.full_name = ?6
           AND lower(u.email) = ?7
           AND u.account_status = 'DISABLED'
       )
       AND NOT EXISTS (
         SELECT 1
         FROM user_roles
         WHERE role_id = 'role-super-admin'
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
      TARGET_USER_ID,
      tokenHash,
      expiresAt,
      currentIso,
      TARGET_NAME,
      TARGET_EMAIL
    )
  ]);

  if ((results?.[1]?.meta?.changes ?? 0) !== 1) {
    throw httpError(
      "Super Admin bootstrap token could not be issued.",
      409
    );
  }

  try {
    await env.ACTIVATION_DELIVERY.send({
      destinationType: "EMAIL",
      destination: target.email,
      purpose: "PASSWORD_SETUP",
      activationToken: token,
      expiresInMinutes: TOKEN_LIFETIME_MINUTES
    });
  } catch {
    await db.prepare(
      `UPDATE super_admin_bootstrap_tokens
       SET invalidated_at = ?1
       WHERE bootstrap_token_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(
      nowIso(),
      tokenId
    ).run();

    throw httpError(
      "Super Admin password setup email could not be delivered.",
      503
    );
  }

  return {
    issued: true,
    expiresAt,
    expiresInMinutes: TOKEN_LIFETIME_MINUTES,
    delivery: "EMAIL"
  };
}

export async function findValidSuperAdminBootstrapToken({
  db,
  env,
  token
}) {
  if (!env?.HMAC_SECRET) {
    throw new Error(
      "Authentication security secret is not configured."
    );
  }

  if (!validateBootstrapToken(token)) {
    throw httpError(
      "Password setup token is invalid or expired.",
      400
    );
  }

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `super-admin-bootstrap:v1:${token}`
  );

  const currentTime = nowIso();

  const row = await db.prepare(
    `SELECT
       t.bootstrap_token_id,
       t.user_id,
       t.expires_at
     FROM super_admin_bootstrap_tokens t
     INNER JOIN super_admin_bootstrap_state s
       ON s.user_id = t.user_id
     INNER JOIN users u
       ON u.user_id = t.user_id
     WHERE t.token_hash = ?1
       AND t.consumed_at IS NULL
       AND t.invalidated_at IS NULL
       AND t.expires_at > ?2
       AND s.bootstrap_id = 1
       AND s.bootstrap_status = 'PENDING'
       AND u.user_id = ?3
       AND u.full_name = ?4
       AND lower(u.email) = ?5
       AND u.account_status = 'DISABLED'
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
       AND NOT EXISTS (
         SELECT 1
         FROM user_roles
         WHERE role_id = 'role-super-admin'
       )
     LIMIT 1`
  ).bind(
    tokenHash,
    currentTime,
    TARGET_USER_ID,
    TARGET_NAME,
    TARGET_EMAIL
  ).first();

  if (!row) {
    throw httpError(
      "Password setup token is invalid or expired.",
      400
    );
  }

  return {
    bootstrapTokenId: row.bootstrap_token_id,
    userId: row.user_id,
    expiresAt: row.expires_at
  };
}

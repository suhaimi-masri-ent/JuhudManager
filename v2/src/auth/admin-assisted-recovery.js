
import { hashValue } from "./crypto.js";

const TOKEN_LIFETIME_MINUTES = 15;
const TOKEN_LIFETIME_SECONDS = 15 * 60;
const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_ISSUES = 3;

const ALLOWED_VERIFICATION_METHODS = new Set([
  "ORIGINAL_DOCUMENT_CHECK",
  "DIRECT_CONTACT",
  "OTHER"
]);

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function addSeconds(date, seconds) {
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

function generateRecoveryToken() {
  return encodeBase64Url(
    crypto.getRandomValues(new Uint8Array(32))
  );
}

function validateRecoveryToken(token) {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(token)
  );
}

function validateApprovalInput({
  ownerVerified,
  verificationMethod,
  reason
}) {
  if (ownerVerified !== true) {
    throw httpError(
      "Admin must confirm independent verification of the account owner.",
      400
    );
  }

  if (!ALLOWED_VERIFICATION_METHODS.has(verificationMethod)) {
    throw httpError(
      "A valid owner-verification method is required.",
      400
    );
  }

  if (
    typeof reason !== "string" ||
    reason.trim().length < 10 ||
    reason.trim().length > 1000
  ) {
    throw httpError(
      "A recovery reason of 10 to 1000 characters is required.",
      400
    );
  }
}

function eligibleRecoverySql(userPlaceholder) {
  return `
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE u.user_id = ${userPlaceholder}
        AND u.account_status = 'DISABLED'
        AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
        AND r.admin_assisted_recovery_at IS NOT NULL
        AND r.admin_assisted_recovery_by IS NOT NULL
        AND r.admin_assisted_recovery_method IS NOT NULL
    )

    AND EXISTS (
      SELECT 1
      FROM user_auth_identities e
      WHERE e.user_id = ${userPlaceholder}
        AND e.identity_type = 'EMAIL'
        AND e.identity_scope = 'GLOBAL'
        AND e.verification_status = 'PENDING'
        AND e.verified_at IS NULL
    )

    AND (
      SELECT COUNT(*)
      FROM user_registration_identity_details n
      WHERE n.user_id = ${userPlaceholder}
        AND n.identity_type = 'NATIONAL_ID'
        AND n.identity_status = 'UNVERIFIED'
    ) = 1

    AND (
      SELECT COUNT(*)
      FROM user_registration_identity_details w
      WHERE w.user_id = ${userPlaceholder}
        AND w.identity_type = 'WHATSAPP'
        AND w.identity_status = 'UNVERIFIED'
    ) = 1

    AND NOT EXISTS (
      SELECT 1
      FROM user_credentials c
      WHERE c.user_id = ${userPlaceholder}
        AND c.credential_type = 'PASSWORD'
        AND c.revoked_at IS NULL
    )
  `;
}

/**
 * Record SUPER_ADMIN approval for assisted recovery.
 *
 * This does not verify email, activate the account,
 * or create a password.
 */
export async function approveAdminAssistedRecovery({
  db,
  userId,
  adminId,
  ownerVerified,
  verificationMethod,
  reason
}) {
  validateApprovalInput({
    ownerVerified,
    verificationMethod,
    reason
  });

  if (!userId || !adminId) {
    throw httpError("User and administrator IDs are required.", 400);
  }

  const now = nowIso();

  const eligibility = `
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE u.user_id = ?4
        AND u.account_status = 'DISABLED'
        AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
        AND r.admin_assisted_recovery_at IS NULL
    )

    AND EXISTS (
      SELECT 1
      FROM user_auth_identities e
      WHERE e.user_id = ?4
        AND e.identity_type = 'EMAIL'
        AND e.identity_scope = 'GLOBAL'
        AND e.verification_status = 'PENDING'
        AND e.verified_at IS NULL
    )

    AND (
      SELECT COUNT(*)
      FROM user_registration_identity_details n
      WHERE n.user_id = ?4
        AND n.identity_type = 'NATIONAL_ID'
        AND n.identity_status = 'UNVERIFIED'
    ) = 1

    AND (
      SELECT COUNT(*)
      FROM user_registration_identity_details w
      WHERE w.user_id = ?4
        AND w.identity_type = 'WHATSAPP'
        AND w.identity_status = 'UNVERIFIED'
    ) = 1

    AND NOT EXISTS (
      SELECT 1
      FROM user_credentials c
      WHERE c.user_id = ?4
        AND c.credential_type = 'PASSWORD'
        AND c.revoked_at IS NULL
    )
  `;

  const results = await db.batch([
    db.prepare(
      `UPDATE user_registration_reviews
       SET
         admin_assisted_recovery_at = ?1,
         admin_assisted_recovery_by = ?2,
         admin_assisted_recovery_method = ?3,
         admin_assisted_recovery_reason = ?5,
         updated_at = ?1
       WHERE user_id = ?4
         AND ${eligibility}`
    ).bind(
      now,
      adminId,
      verificationMethod,
      userId,
      reason.trim()
    ),

    db.prepare(
      `INSERT INTO audit_logs (
         audit_id,
         actor_user_id,
         action,
         entity_type,
         entity_id,
         before_json,
         after_json,
         reason,
         created_at
       )
       SELECT
         ?1,
         ?2,
         'ADMIN_ASSISTED_RECOVERY_APPROVED',
         'USER_REGISTRATION',
         ?3,
         ?4,
         ?5,
         ?6,
         ?7
       WHERE EXISTS (
         SELECT 1
         FROM user_registration_reviews r
         WHERE r.user_id = ?3
           AND r.admin_assisted_recovery_at = ?7
           AND r.admin_assisted_recovery_by = ?2
       )`
    ).bind(
      crypto.randomUUID(),
      adminId,
      userId,
      JSON.stringify({
        adminAssistedRecovery: false
      }),
      JSON.stringify({
        adminAssistedRecovery: true,
        verificationMethod
      }),
      reason.trim(),
      now
    )
  ]);

  const updated = results?.[0]?.meta?.changes ?? 0;
  const audited = results?.[1]?.meta?.changes ?? 0;

  if (updated !== 1 || audited !== 1) {
    throw httpError(
      "Account is not eligible for assisted recovery, or recovery has already been approved.",
      409
    );
  }

  return {
    userId,
    approved: true,
    approvedAt: now,
    verificationMethod
  };
}

/**
 * Issue a short-lived, single-use password setup token.
 *
 * The raw token is returned once to the authenticated Admin route.
 * It must never be stored or written to logs.
 */
export async function issueAdminAssistedRecoveryToken({
  db,
  env,
  userId,
  adminId
}) {
  if (!env?.HMAC_SECRET) {
    throw new Error("Authentication security secret is not configured.");
  }

  if (!userId || !adminId) {
    throw httpError("User and administrator IDs are required.", 400);
  }

  const currentTime = new Date();
  const now = currentTime.toISOString();

  const windowStart = new Date(
    currentTime.getTime() - RATE_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const token = generateRecoveryToken();

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `admin-assisted-recovery:v1:${token}`
  );

  const tokenId = crypto.randomUUID();

  const expiresAt = addSeconds(
    currentTime,
    TOKEN_LIFETIME_SECONDS
  );

  const eligibility = eligibleRecoverySql("?2");

  const results = await db.batch([
    // Invalidate the previous unused token only when
    // the account remains eligible and rate limit permits.
    db.prepare(
      `UPDATE admin_assisted_recovery_tokens
       SET invalidated_at = ?1
       WHERE user_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND (
           SELECT COUNT(*)
           FROM admin_assisted_recovery_tokens
           WHERE user_id = ?2
             AND created_at >= ?3
         ) < ?4
         AND ${eligibility}`
    ).bind(
      now,
      userId,
      windowStart,
      RATE_MAX_ISSUES
    ),

    // Insert the new token only if all eligibility
    // conditions and rate limits still pass.
    db.prepare(
      `INSERT INTO admin_assisted_recovery_tokens (
         recovery_token_id,
         user_id,
         token_hash,
         hash_key_version,
         expires_at,
         created_by,
         created_at
       )
       SELECT
         ?1, ?2, ?3, 1, ?4, ?5, ?6
       WHERE (
         SELECT COUNT(*)
         FROM admin_assisted_recovery_tokens
         WHERE user_id = ?2
           AND created_at >= ?7
       ) < ?8
       AND ${eligibleRecoverySql("?2")}`
    ).bind(
      tokenId,
      userId,
      tokenHash,
      expiresAt,
      adminId,
      now,
      windowStart,
      RATE_MAX_ISSUES
    ),

    // Audit only token metadata, never the raw token or hash.
    db.prepare(
      `INSERT INTO audit_logs (
         audit_id,
         actor_user_id,
         action,
         entity_type,
         entity_id,
         before_json,
         after_json,
         reason,
         created_at
       )
       SELECT
         ?1,
         ?2,
         'ADMIN_ASSISTED_RECOVERY_TOKEN_ISSUED',
         'USER_REGISTRATION',
         ?3,
         NULL,
         ?4,
         'One-time password setup token issued.',
         ?5
       WHERE EXISTS (
         SELECT 1
         FROM admin_assisted_recovery_tokens t
         WHERE t.recovery_token_id = ?6
           AND t.user_id = ?3
           AND t.created_by = ?2
       )`
    ).bind(
      crypto.randomUUID(),
      adminId,
      userId,
      JSON.stringify({
        tokenType: "ADMIN_ASSISTED_RECOVERY",
        expiresAt,
        lifetimeMinutes: TOKEN_LIFETIME_MINUTES
      }),
      now,
      tokenId
    )
  ]);

  const inserted = results?.[1]?.meta?.changes ?? 0;
  const audited = results?.[2]?.meta?.changes ?? 0;

  if (inserted !== 1 || audited !== 1) {
    const recent = await db.prepare(
      `SELECT COUNT(*) AS total
       FROM admin_assisted_recovery_tokens
       WHERE user_id = ?1
         AND created_at >= ?2`
    ).bind(userId, windowStart).first();

    if ((recent?.total ?? 0) >= RATE_MAX_ISSUES) {
      throw httpError(
        "Too many recovery token requests. Please try again later.",
        429
      );
    }

    throw httpError(
      "Account is not eligible for a recovery token, or its state has changed.",
      409
    );
  }

  return {
    issued: true,
    token,
    expiresAt,
    expiresInMinutes: TOKEN_LIFETIME_MINUTES,
    delivery: "ADMIN_DIRECT_HANDOVER",
    purpose: "ADMIN_ASSISTED_PASSWORD_SETUP"
  };
}

/**
 * Validate a recovery token without consuming it.
 *
 * Consumption happens together with password creation in
 * the credential setup transaction.
 */
export async function findValidAdminAssistedRecoveryToken({
  db,
  env,
  token
}) {
  if (!env?.HMAC_SECRET) {
    throw new Error("Authentication security secret is not configured.");
  }

  if (!validateRecoveryToken(token)) {
    throw httpError(
      "Password setup token is invalid or expired.",
      400
    );
  }

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `admin-assisted-recovery:v1:${token}`
  );

  const now = nowIso();

  const row = await db.prepare(
    `SELECT
       t.recovery_token_id,
       t.user_id,
       t.expires_at
     FROM admin_assisted_recovery_tokens t
     WHERE t.token_hash = ?1
       AND t.consumed_at IS NULL
       AND t.invalidated_at IS NULL
       AND t.expires_at > ?2
       AND ${eligibleRecoverySql("t.user_id")}
     LIMIT 1`
  ).bind(
    tokenHash,
    now
  ).first();

  if (!row) {
    throw httpError(
      "Password setup token is invalid or expired.",
      400
    );
  }

  return {
    recoveryTokenId: row.recovery_token_id,
    userId: row.user_id,
    expiresAt: row.expires_at
  };
}

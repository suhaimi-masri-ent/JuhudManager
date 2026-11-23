
import {
  hashValue
} from "./crypto.js";

import {
  verifyPassword,
  isAcceptablePasswordHash,
  PASSWORD_POLICY
} from "./password.js";

const encoder = new TextEncoder();

let dummyPasswordHashPromise = null;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(email) {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    email.trim().length > 254
  ) {
    throw httpError("A valid email address is required.", 400);
  }

  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw httpError("A valid email address is required.", 400);
  }

  return normalized;
}

function requireLoginSecrets(env) {
  if (!env.HMAC_SECRET) {
    throw new Error("Authentication security secret is not configured.");
  }
}

function getRequestMetadata(request) {
  return {
    ipAddress: request?.headers?.get("CF-Connecting-IP") || null,
    userAgent: request?.headers?.get("User-Agent") || null
  };
}

async function getDummyPasswordHash() {
  if (!dummyPasswordHashPromise) {
    const { hashPassword } = await import("./password.js");

    dummyPasswordHashPromise = hashPassword(
      "JuhudManager-Invalid-Login-Check-2026"
    );
  }

  return dummyPasswordHashPromise;
}

async function performDummyVerification(password) {
  const dummyHash = await getDummyPasswordHash();
  await verifyPassword(password, dummyHash);
}

async function recordPasswordLoginEvent({
  db,
  userId,
  eventStatus,
  request
}) {
  const metadata = getRequestMetadata(request);

  await db.prepare(
    `INSERT INTO auth_events (
       event_id,
       user_id,
       session_id,
       event_type,
       event_status,
       ip_address,
       user_agent,
       event_details,
       created_at
     )
     VALUES (
       ?1, ?2, NULL, 'PASSWORD_LOGIN', ?3, ?4, ?5, ?6, ?7
     )`
  ).bind(
    crypto.randomUUID(),
    userId || null,
    eventStatus,
    metadata.ipAddress,
    metadata.userAgent,
    JSON.stringify({
      loginMethod: "EMAIL_PASSWORD"
    }),
    new Date().toISOString()
  ).run();
}

/**
 * Authenticate with verified email and password.
 *
 * Special exception:
 * SUPER_ADMIN-approved assisted recovery may log in
 * while email remains PENDING, with LIMITED access only.
 */
export async function authenticatePasswordLogin({
  db,
  env,
  email,
  password,
  request
}) {
  const normalizedEmail = normalizeEmail(email);

  if (
    typeof password !== "string" ||
    encoder.encode(password).length >
      PASSWORD_POLICY.maximumUtf8Bytes
  ) {
    throw httpError("Invalid login credentials.", 401);
  }

  requireLoginSecrets(env);

  const emailHash = await hashValue(
    env.HMAC_SECRET,
    `EMAIL:GLOBAL:${normalizedEmail}`
  );

  const account = await db.prepare(
    `SELECT
       u.user_id,
       u.account_status,
       r.registration_status,
       r.admin_assisted_recovery_at,
       r.admin_assisted_recovery_by,
       r.admin_assisted_recovery_method,
       c.password_hash,
       s.bootstrap_status,
       CASE
         WHEN EXISTS (
           SELECT 1
           FROM user_roles ur
           WHERE ur.user_id = u.user_id
             AND ur.role_id = 'role-super-admin'
         )
         THEN 1
         ELSE 0
       END AS is_super_admin,
       CASE
         WHEN i.verification_status = 'PENDING'
          AND i.verified_at IS NULL
          AND u.account_status = 'DISABLED'
          AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
          AND r.admin_assisted_recovery_at IS NOT NULL
          AND r.admin_assisted_recovery_by IS NOT NULL
          AND r.admin_assisted_recovery_method IS NOT NULL
          AND c.password_hash IS NOT NULL
          AND (
            SELECT COUNT(*)
            FROM user_registration_identity_details n
            WHERE n.user_id = u.user_id
              AND n.identity_type = 'NATIONAL_ID'
              AND n.identity_status = 'UNVERIFIED'
          ) = 1
          AND (
            SELECT COUNT(*)
            FROM user_registration_identity_details w
            WHERE w.user_id = u.user_id
              AND w.identity_type = 'WHATSAPP'
              AND w.identity_status = 'UNVERIFIED'
          ) = 1
         THEN 1
         ELSE 0
       END AS is_assisted_recovery
     FROM user_auth_identities i
     INNER JOIN users u
       ON u.user_id = i.user_id
     LEFT JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     LEFT JOIN super_admin_bootstrap_state s
       ON s.user_id = u.user_id
     LEFT JOIN user_credentials c
       ON c.user_id = u.user_id
       AND c.credential_type = 'PASSWORD'
       AND c.revoked_at IS NULL
     WHERE i.identity_type = 'EMAIL'
       AND i.identity_scope = 'GLOBAL'
       AND i.identity_hash = ?1
       AND (
         (
           i.verification_status = 'VERIFIED'
           AND i.verified_at IS NOT NULL
           AND i.expires_at IS NULL
         )
         OR
         (
           i.verification_status = 'PENDING'
           AND i.verified_at IS NULL
           AND u.account_status = 'DISABLED'
           AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
           AND r.admin_assisted_recovery_at IS NOT NULL
           AND r.admin_assisted_recovery_by IS NOT NULL
           AND r.admin_assisted_recovery_method IS NOT NULL
           AND c.password_hash IS NOT NULL
           AND (
             SELECT COUNT(*)
             FROM user_registration_identity_details n
             WHERE n.user_id = u.user_id
               AND n.identity_type = 'NATIONAL_ID'
               AND n.identity_status = 'UNVERIFIED'
           ) = 1
           AND (
             SELECT COUNT(*)
             FROM user_registration_identity_details w
             WHERE w.user_id = u.user_id
               AND w.identity_type = 'WHATSAPP'
               AND w.identity_status = 'UNVERIFIED'
           ) = 1
         )
       )
     LIMIT 1`
  ).bind(emailHash).first();

  const bootstrapLoginAllowed = Boolean(
    account &&
    account.bootstrap_status === "COMPLETE" &&
    account.account_status === "ACTIVE" &&
    account.is_super_admin === 1
  );

  const assistedRecoveryLoginAllowed = Boolean(
    account &&
    account.is_assisted_recovery === 1
  );

  const registrationLoginAllowed = Boolean(
    account &&
    (
      (
        account.registration_status === "PENDING_REVIEW" &&
        account.account_status === "DISABLED"
      ) ||
      (
        account.registration_status === "APPROVED" &&
        account.account_status === "ACTIVE"
      ) ||
      assistedRecoveryLoginAllowed
    )
  );

  const loginAllowed =
    bootstrapLoginAllowed || registrationLoginAllowed;

  let authenticated = false;

  if (
    loginAllowed &&
    isAcceptablePasswordHash(account.password_hash)
  ) {
    authenticated = await verifyPassword(
      password,
      account.password_hash
    );
  } else {
    await performDummyVerification(password);
  }

  if (!authenticated) {
    await recordPasswordLoginEvent({
      db,
      userId: account?.user_id || null,
      eventStatus: "FAILED",
      request
    });

    throw httpError("Invalid login credentials.", 401);
  }

  await recordPasswordLoginEvent({
    db,
    userId: account.user_id,
    eventStatus: "SUCCESS",
    request
  });

  return {
    userId: account.user_id,
    registrationStatus: bootstrapLoginAllowed
      ? null
      : account.registration_status,
    accountStatus: account.account_status,
    accessLevel:
      bootstrapLoginAllowed ||
      account.registration_status === "APPROVED"
        ? "FULL"
        : "LIMITED"
  };
}

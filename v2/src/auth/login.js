
import {
  hashValue
} from "./crypto.js";

import {
  hashPassword,
  verifyPassword,
  isAcceptablePasswordHash,
  PASSWORD_POLICY
} from "./password.js";

const LOGIN_IDENTITY_TYPES = new Set([
  "NATIONAL_ID",
  "PASSPORT"
]);

const encoder = new TextEncoder();

let dummyPasswordHashPromise = null;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeLoginIdentity({
  identityType,
  identityValue,
  countryCode
}) {
  if (!LOGIN_IDENTITY_TYPES.has(identityType)) {
    throw httpError(
      "Unsupported login identity type.",
      400
    );
  }

  if (
    typeof identityValue !== "string" ||
    !identityValue.trim() ||
    identityValue.trim().length > 100
  ) {
    throw httpError(
      "A valid identity value is required.",
      400
    );
  }

  if (
    typeof countryCode !== "string" ||
    !/^[A-Za-z]{2}$/.test(countryCode.trim())
  ) {
    throw httpError(
      "A valid two-letter issuing country code is required.",
      400
    );
  }

  return {
    identityType,
    identityValue: identityValue.trim().toUpperCase(),
    countryCode: countryCode.trim().toUpperCase()
  };
}

function requireLoginSecrets(env) {
  if (!env.HMAC_SECRET) {
    throw new Error(
      "Authentication security secret is not configured."
    );
  }
}

function getRequestMetadata(request) {
  return {
    ipAddress:
      request?.headers?.get("CF-Connecting-IP") || null,

    userAgent:
      request?.headers?.get("User-Agent") || null
  };
}

async function getDummyPasswordHash() {
  if (!dummyPasswordHashPromise) {
    dummyPasswordHashPromise = hashPassword(
      "JuhudManager-Invalid-Login-Check-2026"
    );
  }

  return dummyPasswordHashPromise;
}

/**
 * Perform a dummy Argon2id verification when no usable
 * account credential is available.
 *
 * This reduces the timing difference between an unknown
 * identity and an existing account with an invalid password.
 */
async function performDummyVerification(password) {
  const dummyHash = await getDummyPasswordHash();

  await verifyPassword(password, dummyHash);
}

/**
 * Record a password login attempt.
 *
 * No identity value, password or password hash is stored
 * in the event details.
 */
async function recordPasswordLoginEvent({
  db,
  userId,
  eventStatus,
  request,
  identityType
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
       event_details
     )
     VALUES (
       ?1, ?2, NULL, 'PASSWORD_LOGIN', ?3, ?4, ?5, ?6
     )`
  ).bind(
    crypto.randomUUID(),
    userId || null,
    eventStatus,
    metadata.ipAddress,
    metadata.userAgent,
    JSON.stringify({
      identityType
    })
  ).run();
}

/**
 * Authenticate a user using a verified National ID or
 * Passport and their password.
 *
 * Requirements:
 * - Identity must be VERIFIED.
 * - Identity must match its issuing country.
 * - Account must be ACTIVE.
 * - An active PASSWORD credential must exist.
 *
 * Returns:
 * {
 *   userId
 * }
 *
 * Throws:
 * - 400 for invalid request input.
 * - 401 for any authentication failure.
 *
 * This function does not create a session.
 * The route must create a session only after this function
 * succeeds.
 */
export async function authenticatePasswordLogin({
  db,
  env,
  identityType,
  identityValue,
  countryCode,
  password,
  request
}) {
  const identity = normalizeLoginIdentity({
    identityType,
    identityValue,
    countryCode
  });

  if (
    typeof password !== "string" ||
    encoder.encode(password).length >
      PASSWORD_POLICY.maximumUtf8Bytes
  ) {
    throw httpError(
      "Invalid login credentials.",
      401
    );
  }

  requireLoginSecrets(env);

  const identityScope = identity.countryCode;

  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `${identity.identityType}:${identityScope}:${identity.identityValue}`
  );

  const account = await db.prepare(
    `SELECT
       u.user_id,
       u.account_status,
       c.password_hash
     FROM user_auth_identities i
     INNER JOIN users u
       ON u.user_id = i.user_id
     LEFT JOIN user_credentials c
       ON c.user_id = u.user_id
       AND c.credential_type = 'PASSWORD'
       AND c.revoked_at IS NULL
     WHERE i.identity_type = ?1
       AND i.identity_scope = ?2
       AND i.country_code = ?2
       AND i.identity_hash = ?3
       AND i.verification_status = 'VERIFIED'
     LIMIT 1`
  ).bind(
    identity.identityType,
    identityScope,
    identityHash
  ).first();

  let authenticated = false;

  if (
    account &&
    account.account_status === "ACTIVE" &&
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
      request,
      identityType: identity.identityType
    });

    throw httpError(
      "Invalid login credentials.",
      401
    );
  }

  await recordPasswordLoginEvent({
    db,
    userId: account.user_id,
    eventStatus: "SUCCESS",
    request,
    identityType: identity.identityType
  });

  return {
    userId: account.user_id
  };
}

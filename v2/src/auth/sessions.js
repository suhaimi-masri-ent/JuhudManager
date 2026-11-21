
import { hashValue } from "./crypto.js";

const SESSION_INACTIVITY_DAYS = 30;
const SESSION_TOKEN_BYTES = 32;

const ALLOWED_DEVICE_TYPES = [
  "MOBILE",
  "TABLET",
  "DESKTOP",
  "OTHER"
];

const ALLOWED_REVOCATION_REASONS = [
  "LOGOUT",
  "LOGOUT_ALL",
  "PASSWORD_CHANGED",
  "PASSWORD_RESET",
  "ACCOUNT_SUSPENDED",
  "USER_REVOKED",
  "ADMIN_REVOKED",
  "SESSION_EXPIRED",
  "SECURITY_ACTION"
];

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function addSessionDays(date) {
  const result = new Date(date);
  result.setUTCDate(
    result.getUTCDate() + SESSION_INACTIVITY_DAYS
  );
  return result.toISOString();
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

function generateSessionToken() {
  const bytes = crypto.getRandomValues(
    new Uint8Array(SESSION_TOKEN_BYTES)
  );

  return encodeBase64Url(bytes);
}

function normalizeOptionalText(value, maximumLength) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maximumLength);
}

function getRequestMetadata(request) {
  if (!request) {
    return {
      ipAddress: null,
      userAgent: null
    };
  }

  return {
    ipAddress: normalizeOptionalText(
      request.headers.get("CF-Connecting-IP"),
      64
    ),
    userAgent: normalizeOptionalText(
      request.headers.get("User-Agent"),
      500
    )
  };
}

/**
 * A user may create a session only when:
 *
 * PENDING_REVIEW + DISABLED
 *   Limited access.
 *
 * APPROVED + ACTIVE
 *   Full access.
 *
 * All other combinations are denied.
 */
const SESSION_ELIGIBILITY_SQL = `
  SELECT
    u.user_id,
    u.account_status,
    r.registration_status
  FROM users u
  INNER JOIN user_registration_reviews r
    ON r.user_id = u.user_id
  WHERE u.user_id = ?1
    AND (
      (
        r.registration_status = 'PENDING_REVIEW'
        AND u.account_status = 'DISABLED'
      )
      OR
      (
        r.registration_status = 'APPROVED'
        AND u.account_status = 'ACTIVE'
      )
    )
  LIMIT 1
`;

/**
 * Create a new authenticated session.
 *
 * The raw token is returned once.
 * Only its HMAC hash is stored in D1.
 */
export async function createSession({
  db,
  env,
  userId,
  request,
  deviceName,
  deviceType = "OTHER"
}) {
  if (!env?.HMAC_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }

  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw httpError("A valid user ID is required.", 400);
  }

  if (!ALLOWED_DEVICE_TYPES.includes(deviceType)) {
    throw httpError("Invalid device type.", 400);
  }

  const normalizedUserId = userId.trim();

  const account = await db.prepare(
    SESSION_ELIGIBILITY_SQL
  ).bind(normalizedUserId).first();

  if (!account) {
    throw httpError("Account is not available.", 403);
  }

  const sessionId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const token = generateSessionToken();

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `session:v1:${token}`
  );

  const now = nowIso();
  const expiresAt = addSessionDays(now);
  const metadata = getRequestMetadata(request);

  const normalizedDeviceName = normalizeOptionalText(
    deviceName,
    100
  );

  const results = await db.batch([
    db.prepare(
      `INSERT INTO user_sessions (
         session_id,
         user_id,
         token_hash,
         device_name,
         device_type,
         ip_address,
         user_agent,
         created_at,
         last_activity_at,
         expires_at
       )
       SELECT
         ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8, ?9
       WHERE EXISTS (
         ${SESSION_ELIGIBILITY_SQL}
       )`
    ).bind(
      sessionId,
      normalizedUserId,
      tokenHash,
      normalizedDeviceName,
      deviceType,
      metadata.ipAddress,
      metadata.userAgent,
      now,
      expiresAt,
      normalizedUserId
    ),

    db.prepare(
      `INSERT INTO auth_events (
         event_id,
         user_id,
         session_id,
         event_type,
         event_status,
         event_details,
         created_at
       )
       SELECT
         ?1,
         ?2,
         ?3,
         'SESSION_CREATED',
         'SUCCESS',
         ?4,
         ?5
       WHERE EXISTS (
         SELECT 1
         FROM user_sessions
         WHERE session_id = ?3
           AND user_id = ?2
       )`
    ).bind(
      eventId,
      normalizedUserId,
      sessionId,
      JSON.stringify({
        deviceType,
        deviceName: normalizedDeviceName,
        registrationStatus: account.registration_status
      }),
      now
    )
  ]);

  const sessionChanges =
    results?.[0]?.meta?.changes ?? 0;

  const eventChanges =
    results?.[1]?.meta?.changes ?? 0;

  if (
    sessionChanges !== 1 ||
    eventChanges !== 1
  ) {
    throw httpError(
      "Session could not be created.",
      409
    );
  }

  return {
    sessionId,
    userId: normalizedUserId,
    token,
    tokenType: "Bearer",
    expiresAt,
    inactivityDays: SESSION_INACTIVITY_DAYS,
    registrationStatus: account.registration_status,
    accountStatus: account.account_status,
    accessLevel:
      account.registration_status === "APPROVED"
        ? "FULL"
        : "LIMITED"
  };
}

/**
 * Authenticate a session and extend inactivity expiry.
 *
 * Account eligibility is checked on every request.
 * A rejected, cancelled, suspended or otherwise
 * ineligible account cannot continue using its session.
 */
export async function authenticateSession({
  db,
  env,
  token
}) {
  if (!env?.HMAC_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }

  if (
    typeof token !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(token)
  ) {
    return null;
  }

  const tokenHash = await hashValue(
    env.HMAC_SECRET,
    `session:v1:${token}`
  );

  const now = nowIso();
  const expiresAt = addSessionDays(now);

  const result = await db.prepare(
    `UPDATE user_sessions
     SET
       last_activity_at = ?1,
       expires_at = ?2
     WHERE token_hash = ?3
       AND revoked_at IS NULL
       AND expires_at > ?1
       AND EXISTS (
         SELECT 1
         FROM users u
         INNER JOIN user_registration_reviews r
           ON r.user_id = u.user_id
         WHERE u.user_id = user_sessions.user_id
           AND (
             (
               r.registration_status = 'PENDING_REVIEW'
               AND u.account_status = 'DISABLED'
             )
             OR
             (
               r.registration_status = 'APPROVED'
               AND u.account_status = 'ACTIVE'
             )
           )
       )
     RETURNING
       session_id,
       user_id,
       device_name,
       device_type,
       expires_at`
  ).bind(
    now,
    expiresAt,
    tokenHash
  ).first();

  if (!result) {
    return null;
  }

  // Read the current access status after validating the session.
  const account = await db.prepare(
    `SELECT
       u.account_status,
       r.registration_status
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(result.user_id).first();

  if (!account) {
    return null;
  }

  const isLimited =
    account.registration_status === "PENDING_REVIEW" &&
    account.account_status === "DISABLED";

  const isFull =
    account.registration_status === "APPROVED" &&
    account.account_status === "ACTIVE";

  if (!isLimited && !isFull) {
    return null;
  }

  return {
    authenticated: true,
    sessionId: result.session_id,
    userId: result.user_id,
    deviceName: result.device_name,
    deviceType: result.device_type,
    expiresAt: result.expires_at,
    registrationStatus: account.registration_status,
    accountStatus: account.account_status,
    accessLevel: isFull ? "FULL" : "LIMITED"
  };
}

/**
 * Revoke one session.
 */
export async function revokeSession({
  db,
  sessionId,
  userId,
  reason = "LOGOUT"
}) {
  if (
    typeof sessionId !== "string" ||
    !sessionId.trim() ||
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw httpError(
      "Session ID and user ID are required.",
      400
    );
  }

  if (!ALLOWED_REVOCATION_REASONS.includes(reason)) {
    throw httpError(
      "Invalid session revocation reason.",
      400
    );
  }

  const now = nowIso();
  const eventId = crypto.randomUUID();

  const results = await db.batch([
    db.prepare(
      `UPDATE user_sessions
       SET
         revoked_at = ?1,
         revocation_reason = ?2
       WHERE session_id = ?3
         AND user_id = ?4
         AND revoked_at IS NULL`
    ).bind(
      now,
      reason,
      sessionId,
      userId
    ),

    db.prepare(
      `INSERT INTO auth_events (
         event_id,
         user_id,
         session_id,
         event_type,
         event_status,
         event_details,
         created_at
       )
       SELECT
         ?1,
         ?2,
         ?3,
         'SESSION_REVOKED',
         'SUCCESS',
         ?4,
         ?5
       WHERE EXISTS (
         SELECT 1
         FROM user_sessions
         WHERE session_id = ?3
           AND user_id = ?2
           AND revoked_at = ?5
           AND revocation_reason = ?6
       )`
    ).bind(
      eventId,
      userId,
      sessionId,
      JSON.stringify({ reason }),
      now,
      reason
    )
  ]);

  const revoked =
    results?.[0]?.meta?.changes ?? 0;

  if (revoked === 0) {
    return {
      revoked: false
    };
  }

  const eventChanges =
    results?.[1]?.meta?.changes ?? 0;

  if (eventChanges !== 1) {
    throw new Error(
      "Session revocation audit event could not be recorded."
    );
  }

  return {
    revoked: true,
    sessionId,
    reason,
    revokedAt: now
  };
}

/**
 * Revoke all active sessions belonging to a user.
 */
export async function revokeAllSessions({
  db,
  userId,
  exceptSessionId = null,
  reason = "LOGOUT_ALL"
}) {
  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw httpError("A valid user ID is required.", 400);
  }

  if (!ALLOWED_REVOCATION_REASONS.includes(reason)) {
    throw httpError(
      "Invalid session revocation reason.",
      400
    );
  }

  const now = nowIso();

  const result = await db.prepare(
    `UPDATE user_sessions
     SET
       revoked_at = ?1,
       revocation_reason = ?2
     WHERE user_id = ?3
       AND revoked_at IS NULL
       AND (?4 IS NULL OR session_id != ?4)`
  ).bind(
    now,
    reason,
    userId.trim(),
    exceptSessionId
  ).run();

  return {
    revokedCount: result?.meta?.changes ?? 0,
    reason,
    revokedAt: now
  };
}

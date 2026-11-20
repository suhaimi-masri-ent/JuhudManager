
import { hashValue } from "../auth/crypto.js";

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getClientIp(request) {
  const ip = request.headers.get("CF-Connecting-IP");

  if (!ip || !ip.trim()) {
    throw httpError(
      "Client network identity is unavailable.",
      503
    );
  }

  return ip.trim();
}

function getWindow(now, windowSeconds) {
  const nowMilliseconds = now.getTime();
  const windowMilliseconds = windowSeconds * 1000;

  const windowStartMilliseconds =
    Math.floor(nowMilliseconds / windowMilliseconds) *
    windowMilliseconds;

  const windowEndMilliseconds =
    windowStartMilliseconds + windowMilliseconds;

  return {
    startedAt: new Date(windowStartMilliseconds).toISOString(),
    expiresAt: new Date(windowEndMilliseconds).toISOString(),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((windowEndMilliseconds - nowMilliseconds) / 1000)
    )
  };
}

function validateOptions({ scope, limit, windowSeconds, key }) {
  if (
    typeof scope !== "string" ||
    !/^[A-Z0-9_]{2,50}$/.test(scope)
  ) {
    throw new TypeError("Invalid rate-limit scope.");
  }

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 10000
  ) {
    throw new TypeError("Invalid rate-limit request limit.");
  }

  if (
    !Number.isSafeInteger(windowSeconds) ||
    windowSeconds < 1 ||
    windowSeconds > 86400
  ) {
    throw new TypeError("Invalid rate-limit window.");
  }

  if (
    key !== undefined &&
    (
      typeof key !== "string" ||
      !key.trim() ||
      key.length > 512
    )
  ) {
    throw new TypeError("Invalid rate-limit key.");
  }
}

function validateDependencies({ db, env }) {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }

  if (!env?.HMAC_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }
}

function getIdentifier(request, key) {
  // A supplied logical key is used for account-level limits.
  // Otherwise, use the request IP for network-level limits.
  return key === undefined
    ? `ip:${getClientIp(request)}`
    : `key:${key}`;
}

async function getRateLimitContext({
  db,
  env,
  request,
  scope,
  limit,
  windowSeconds,
  key
}) {
  validateOptions({
    scope,
    limit,
    windowSeconds,
    key
  });

  validateDependencies({ db, env });

  const identifier = getIdentifier(request, key);

  const rateLimitId = await hashValue(
    env.HMAC_SECRET,
    `rate-limit:v1:${scope}:${identifier}`
  );

  const now = new Date();
  const window = getWindow(now, windowSeconds);

  return {
    rateLimitId,
    window,
    nowIso: now.toISOString()
  };
}

/**
 * Check the current fixed-window counter without incrementing it.
 *
 * Use this before authentication when the counter represents
 * failed attempts only. A successful request must not increase
 * that counter.
 */
export async function checkRateLimit({
  db,
  env,
  request,
  scope,
  limit,
  windowSeconds,
  key
}) {
  const context = await getRateLimitContext({
    db,
    env,
    request,
    scope,
    limit,
    windowSeconds,
    key
  });

  const result = await db.prepare(
    `SELECT request_count
     FROM auth_rate_limits
     WHERE rate_limit_scope = ?1
       AND rate_limit_id = ?2
       AND window_started_at = ?3
     LIMIT 1`
  ).bind(
    scope,
    context.rateLimitId,
    context.window.startedAt
  ).first();

  const requestCount = result?.request_count ?? 0;
  const allowed = requestCount < limit;

  return {
    allowed,
    scope,
    limit,
    remaining: Math.max(0, limit - requestCount),
    retryAfterSeconds: allowed
      ? 0
      : context.window.retryAfterSeconds
  };
}

/**
 * Increment a fixed-window counter atomically.
 *
 * Use for requests that should always count, such as IP-level
 * login request limits, or after a failed authentication when
 * recording a failed-attempt counter.
 */
export async function enforceRateLimit({
  db,
  env,
  request,
  scope,
  limit,
  windowSeconds,
  key
}) {
  const context = await getRateLimitContext({
    db,
    env,
    request,
    scope,
    limit,
    windowSeconds,
    key
  });

  // Atomic fixed-window counter.
  const result = await db.prepare(
    `INSERT INTO auth_rate_limits (
       rate_limit_scope,
       rate_limit_id,
       window_started_at,
       request_count,
       expires_at,
       created_at,
       updated_at
     )
     VALUES (?1, ?2, ?3, 1, ?4, ?5, ?5)
     ON CONFLICT (
       rate_limit_scope,
       rate_limit_id,
       window_started_at
     )
     DO UPDATE SET
       request_count = auth_rate_limits.request_count + 1,
       updated_at = excluded.updated_at
     WHERE auth_rate_limits.request_count < ?6
     RETURNING request_count`
  ).bind(
    scope,
    context.rateLimitId,
    context.window.startedAt,
    context.window.expiresAt,
    context.nowIso,
    limit
  ).first();

  if (!result) {
    return {
      allowed: false,
      scope,
      limit,
      remaining: 0,
      retryAfterSeconds: context.window.retryAfterSeconds
    };
  }

  return {
    allowed: true,
    scope,
    limit,
    remaining: Math.max(
      0,
      limit - result.request_count
    ),
    retryAfterSeconds: 0
  };
}

export async function cleanupExpiredRateLimits({
  db,
  now = new Date().toISOString(),
  batchSize = 500
}) {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }

  if (
    !Number.isSafeInteger(batchSize) ||
    batchSize < 1 ||
    batchSize > 5000
  ) {
    throw new TypeError("Invalid cleanup batch size.");
  }

  const result = await db.prepare(
    `DELETE FROM auth_rate_limits
     WHERE rowid IN (
       SELECT rowid
       FROM auth_rate_limits
       WHERE expires_at <= ?1
       LIMIT ?2
     )`
  ).bind(now, batchSize).run();

  return {
    deleted: result?.meta?.changes ?? 0
  };
}

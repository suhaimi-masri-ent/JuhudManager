
import { json } from "../lib/http.js";
import {
  checkRateLimit as checkRateLimitCounter,
  enforceRateLimit
} from "../lib/rate-limit.js";

import {
  authenticatePasswordLogin
} from "../auth/login.js";

import {
  createSession
} from "../auth/sessions.js";

const MAX_REQUEST_BODY_BYTES = 16 * 1024;

const IP_RATE_LIMIT = {
  scope: "PASSWORD_LOGIN",
  limit: 10,
  windowSeconds: 900
};

const IDENTITY_RATE_LIMIT = {
  scope: "PASSWORD_LOGIN_IDENTITY",
  limit: 5,
  windowSeconds: 900
};

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  return json({
    error: status === 500
      ? "Authentication service unavailable."
      : error.message
  }, status);
}

function tooManyAttemptsResponse(retryAfterSeconds) {
  return new Response(JSON.stringify({
    error: "Too many login attempts. Please try again later.",
    retryAfterSeconds
  }), {
    status: 429,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": String(retryAfterSeconds)
    }
  });
}

async function enforceRequestLimit(request, env, options) {
  try {
    const result = await enforceRateLimit({
      db: env.DB,
      env,
      request,
      ...options
    });

    return result.allowed
      ? null
      : tooManyAttemptsResponse(result.retryAfterSeconds);
  } catch (error) {
    return errorResponse(error);
  }
}

async function checkIdentityLimit(request, env, options) {
  try {
    const result = await checkRateLimitCounter({
      db: env.DB,
      env,
      request,
      ...options
    });

    return result.allowed
      ? null
      : tooManyAttemptsResponse(result.retryAfterSeconds);
  } catch (error) {
    return errorResponse(error);
  }
}

async function readJson(request) {
  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_REQUEST_BODY_BYTES
    ) {
      throw httpError("Request body is too large.", 413);
    }
  }

  if (!request.body) {
    return null;
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel();
        throw httpError("Request body is too large.", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", {
      fatal: true
    }).decode(bytes);

    return JSON.parse(text);
  } catch {
    return null;
  }
}

function validateLoginBody(body) {
  return Boolean(
    body &&
    ["NATIONAL_ID", "PASSPORT"].includes(body.identityType) &&
    typeof body.identityValue === "string" &&
    body.identityValue.trim() &&
    body.identityValue.trim().length <= 100 &&
    typeof body.countryCode === "string" &&
    /^[A-Za-z]{2}$/.test(body.countryCode.trim()) &&
    typeof body.password === "string"
  );
}

function getIdentityRateLimitKey(body) {
  const identityType = body.identityType;
  const countryCode = body.countryCode.trim().toUpperCase();
  const identityValue = body.identityValue.trim().toUpperCase();

  return `${identityType}:${countryCode}:${identityValue}`;
}

/**
 * Handle password login requests.
 *
 * POST /auth/login/password
 *
 * Request:
 * {
 *   identityType: "NATIONAL_ID" | "PASSPORT",
 *   identityValue: "...",
 *   countryCode: "MY",
 *   password: "...",
 *   deviceName: "...",
 *   deviceType: "MOBILE" | "TABLET" | "DESKTOP" | "OTHER"
 * }
 */
export async function handleLoginRequest(request, env, url) {
  if (
    url.pathname !== "/auth/login/password" ||
    request.method !== "POST"
  ) {
    return null;
  }

  // Layer 1: every request counts towards the IP limit.
  const ipLimited = await enforceRequestLimit(
    request,
    env,
    IP_RATE_LIMIT
  );

  if (ipLimited) {
    return ipLimited;
  }

  let body;

  try {
    body = await readJson(request);
  } catch (error) {
    return errorResponse(error);
  }

  if (!validateLoginBody(body)) {
    return json({
      error: "A valid identityType, identityValue, countryCode and password are required."
    }, 400);
  }

  const identityLimitOptions = {
    ...IDENTITY_RATE_LIMIT,
    key: getIdentityRateLimitKey(body)
  };

  // Layer 2: check the failed-attempt counter without incrementing.
  const identityLimited = await checkIdentityLimit(
    request,
    env,
    identityLimitOptions
  );

  if (identityLimited) {
    return identityLimited;
  }

  let authentication;

  try {
    authentication = await authenticatePasswordLogin({
      db: env.DB,
      env,
      identityType: body.identityType,
      identityValue: body.identityValue,
      countryCode: body.countryCode,
      password: body.password,
      request
    });
  } catch (error) {
    // Only failed authentication increments the identity counter.
    if (error?.status === 401) {
      const failedAttempt = await enforceRequestLimit(
        request,
        env,
        identityLimitOptions
      );

      if (failedAttempt) {
        return failedAttempt;
      }
    }

    return errorResponse(error);
  }

  // Successful authentication does not increase the identity counter.
  try {
    const session = await createSession({
      db: env.DB,
      env,
      userId: authentication.userId,
      request,
      deviceName: body.deviceName,
      deviceType: body.deviceType || "OTHER"
    });

    return json({
      ok: true,
      userId: session.userId,
      sessionId: session.sessionId,
      accessToken: session.token,
      tokenType: session.tokenType,
      expiresAt: session.expiresAt,
      inactivityDays: session.inactivityDays
    });
  } catch (error) {
    return errorResponse(error);
  }
}

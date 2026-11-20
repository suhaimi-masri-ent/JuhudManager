
import { json } from "../lib/http.js";
import { enforceRateLimit } from "../lib/rate-limit.js";

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

async function checkRateLimit(request, env, options) {
  try {
    const result = await enforceRateLimit({
      db: env.DB,
      env,
      request,
      ...options
    });

    if (!result.allowed) {
      return new Response(JSON.stringify({
        error: "Too many login attempts. Please try again later.",
        retryAfterSeconds: result.retryAfterSeconds
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": String(result.retryAfterSeconds)
        }
      });
    }

    return null;
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

  // Layer 1: limit requests from the same IP.
  const ipLimited = await checkRateLimit(
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

  // Layer 2: limit attempts against the same identity.
  // The key is HMAC-hashed inside enforceRateLimit.
  const identityLimited = await checkRateLimit(
    request,
    env,
    {
      ...IDENTITY_RATE_LIMIT,
      key: getIdentityRateLimitKey(body)
    }
  );

  if (identityLimited) {
    return identityLimited;
  }

  try {
    const authentication = await authenticatePasswordLogin({
      db: env.DB,
      env,
      identityType: body.identityType,
      identityValue: body.identityValue,
      countryCode: body.countryCode,
      password: body.password,
      request
    });

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

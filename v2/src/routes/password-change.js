
import { json } from "../lib/http.js";
import { enforceRateLimit } from "../lib/rate-limit.js";

import {
  authenticateSession
} from "../auth/sessions.js";

import {
  changePassword
} from "../auth/password-change.js";

const MAX_REQUEST_BODY_BYTES = 16 * 1024;

const RATE_LIMIT = {
  scope: "PASSWORD_CHANGE",
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

function getBearerToken(request) {
  const authorization =
    request.headers.get("Authorization");

  if (typeof authorization !== "string") {
    return null;
  }

  const match = authorization.match(
    /^Bearer ([A-Za-z0-9_-]{43})$/
  );

  return match ? match[1] : null;
}

async function checkRateLimit(request, env) {
  try {
    const result = await enforceRateLimit({
      db: env.DB,
      env,
      request,
      ...RATE_LIMIT
    });

    if (!result.allowed) {
      return new Response(JSON.stringify({
        error: "Too many password change attempts. Please try again later.",
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
  const contentLength =
    request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_REQUEST_BODY_BYTES
    ) {
      throw httpError(
        "Request body is too large.",
        413
      );
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

        throw httpError(
          "Request body is too large.",
          413
        );
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

function validateBody(body) {
  return Boolean(
    body &&
    typeof body.currentPassword === "string" &&
    typeof body.newPassword === "string"
  );
}

/**
 * Handle authenticated password changes.
 *
 * POST /auth/password/change
 *
 * Header:
 * Authorization: Bearer <accessToken>
 *
 * Request:
 * {
 *   "currentPassword": "...",
 *   "newPassword": "..."
 * }
 */
export async function handlePasswordChangeRequest(
  request,
  env,
  url
) {
  if (
    url.pathname !== "/auth/password/change" ||
    request.method !== "POST"
  ) {
    return null;
  }

  const limited = await checkRateLimit(request, env);

  if (limited) {
    return limited;
  }

  try {
    const token = getBearerToken(request);

    if (!token) {
      return json({
        error: "A valid Bearer token is required."
      }, 401);
    }

    const session = await authenticateSession({
      db: env.DB,
      env,
      token
    });

    if (!session) {
      return json({
        error: "Invalid or expired session."
      }, 401);
    }

    const body = await readJson(request);

    if (!validateBody(body)) {
      return json({
        error: "Current password and new password are required."
      }, 400);
    }

    const result = await changePassword({
      db: env.DB,
      userId: session.userId,
      currentSessionId: session.sessionId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      request
    });

    return json({
      ok: true,
      message: "Password changed successfully.",
      changedAt: result.changedAt,
      currentSessionPreserved:
        result.currentSessionPreserved,
      revokedSessionCount:
        result.revokedSessionCount
    });
  } catch (error) {
    return errorResponse(error);
  }
}

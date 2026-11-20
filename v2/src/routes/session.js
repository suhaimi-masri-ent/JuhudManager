
import { json } from "../lib/http.js";

import {
  authenticateSession,
  revokeSession
} from "../auth/sessions.js";

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization");

  if (typeof authorization !== "string") {
    return null;
  }

  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{43})$/);

  return match ? match[1] : null;
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

/**
 * Handle authenticated session actions.
 *
 * POST /auth/logout
 *
 * Header:
 * Authorization: Bearer <accessToken>
 */
export async function handleSessionRequest(request, env, url) {
  if (
    url.pathname !== "/auth/logout" ||
    request.method !== "POST"
  ) {
    return null;
  }

  const token = getBearerToken(request);

  if (!token) {
    return json({
      error: "A valid Bearer token is required."
    }, 401);
  }

  try {
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

    const result = await revokeSession({
      db: env.DB,
      sessionId: session.sessionId,
      userId: session.userId,
      reason: "LOGOUT"
    });

    if (!result.revoked) {
      return json({
        error: "Session is no longer active."
      }, 401);
    }

    return json({
      ok: true,
      message: "You have been logged out."
    });
  } catch (error) {
    return errorResponse(error);
  }
}

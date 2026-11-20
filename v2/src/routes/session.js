
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

async function requireSession(request, env) {
  const token = getBearerToken(request);

  if (!token) {
    return {
      error: json({
        error: "A valid Bearer token is required."
      }, 401)
    };
  }

  const session = await authenticateSession({
    db: env.DB,
    env,
    token
  });

  if (!session) {
    return {
      error: json({
        error: "Invalid or expired session."
      }, 401)
    };
  }

  return { session };
}

/**
 * Handle authenticated session actions.
 *
 * GET /auth/me
 * POST /auth/logout
 *
 * Header:
 * Authorization: Bearer <accessToken>
 */
export async function handleSessionRequest(request, env, url) {
  const isMeRequest =
    url.pathname === "/auth/me" &&
    request.method === "GET";

  const isLogoutRequest =
    url.pathname === "/auth/logout" &&
    request.method === "POST";

  if (!isMeRequest && !isLogoutRequest) {
    return null;
  }

  try {
    const result = await requireSession(request, env);

    if (result.error) {
      return result.error;
    }

    const session = result.session;

    if (isMeRequest) {
      return json({
        ok: true,
        user: {
          userId: session.userId
        },
        session: {
          sessionId: session.sessionId,
          deviceName: session.deviceName,
          deviceType: session.deviceType,
          expiresAt: session.expiresAt
        }
      });
    }

    const revoked = await revokeSession({
      db: env.DB,
      sessionId: session.sessionId,
      userId: session.userId,
      reason: "LOGOUT"
    });

    if (!revoked.revoked) {
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

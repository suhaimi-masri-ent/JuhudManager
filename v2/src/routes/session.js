
import { json } from "../lib/http.js";

import {
  authenticateSession,
  revokeSession,
  revokeAllSessions
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
 * GET  /auth/me
 * POST /auth/logout
 * POST /auth/logout-all
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

  const isLogoutAllRequest =
    url.pathname === "/auth/logout-all" &&
    request.method === "POST";

  if (
    !isMeRequest &&
    !isLogoutRequest &&
    !isLogoutAllRequest
  ) {
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

    if (isLogoutRequest) {
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
    }

    const revoked = await revokeAllSessions({
      db: env.DB,
      userId: session.userId,
      reason: "LOGOUT_ALL"
    });

    const eventId = crypto.randomUUID();

    await env.DB.prepare(
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
         ?1, ?2, ?3,
         'SESSION_REVOKED_ALL',
         'SUCCESS',
         ?4, ?5, ?6, ?7
       )`
    ).bind(
      eventId,
      session.userId,
      session.sessionId,
      request.headers.get("CF-Connecting-IP"),
      request.headers.get("User-Agent"),
      JSON.stringify({
        reason: "LOGOUT_ALL",
        revokedCount: revoked.revokedCount
      }),
      revoked.revokedAt
    ).run();

    return json({
      ok: true,
      message: "All sessions have been logged out.",
      revokedCount: revoked.revokedCount
    });
  } catch (error) {
    return errorResponse(error);
  }
}

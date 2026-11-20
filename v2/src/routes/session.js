
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

    // Revoke all active sessions and record the audit event
    // in one D1 batch.
    const now = new Date().toISOString();
    const eventId = crypto.randomUUID();

    const results = await env.DB.batch([
      env.DB.prepare(
        `UPDATE user_sessions
         SET
           revoked_at = ?1,
           revocation_reason = 'LOGOUT_ALL'
         WHERE user_id = ?2
           AND revoked_at IS NULL`
      ).bind(
        now,
        session.userId
      ),

      env.DB.prepare(
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
         SELECT
           ?1,
           ?2,
           ?3,
           'SESSION_REVOKED_ALL',
           'SUCCESS',
           ?4,
           ?5,
           ?6,
           ?7
         WHERE EXISTS (
           SELECT 1
           FROM user_sessions
           WHERE session_id = ?3
             AND user_id = ?2
             AND revoked_at = ?7
             AND revocation_reason = 'LOGOUT_ALL'
         )`
      ).bind(
        eventId,
        session.userId,
        session.sessionId,
        request.headers.get("CF-Connecting-IP"),
        request.headers.get("User-Agent"),
        JSON.stringify({
          reason: "LOGOUT_ALL"
        }),
        now
      )
    ]);

    const revokedCount =
      results?.[0]?.meta?.changes ?? 0;

    const auditChanges =
      results?.[1]?.meta?.changes ?? 0;

    if (auditChanges !== 1) {
      throw new Error(
        "Logout-all audit event could not be recorded."
      );
    }

    return json({
      ok: true,
      message: "All sessions have been logged out.",
      revokedCount
    });
  } catch (error) {
    return errorResponse(error);
  }
}

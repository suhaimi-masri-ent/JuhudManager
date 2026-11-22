
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

async function getUserAccessContext(db, userId) {
  const [roleResult, assignmentResult] = await Promise.all([
    db.prepare(
      `SELECT
         r.role_code,
         r.role_name
       FROM user_roles ur
       INNER JOIN roles r
         ON r.role_id = ur.role_id
       WHERE ur.user_id = ?1
       ORDER BY r.role_code`
    ).bind(userId).all(),

    db.prepare(
      `SELECT
         uca.assignment_id,
         uca.country_id,
         c.country_code,
         c.country_name,
         c.country_status,
         uca.assignment_role_code,
         uca.assigned_at
       FROM user_country_assignments uca
       INNER JOIN countries c
         ON c.country_id = uca.country_id
       WHERE uca.user_id = ?1
         AND uca.assignment_status = 'ACTIVE'
       ORDER BY c.country_name`
    ).bind(userId).all()
  ]);

  return {
    roles: (roleResult?.results ?? []).map((row) => ({
      roleCode: row.role_code,
      roleName: row.role_name
    })),

    activeCountryAssignments:
      (assignmentResult?.results ?? []).map((row) => ({
        assignmentId: row.assignment_id,
        countryId: row.country_id,
        countryCode: row.country_code,
        countryName: row.country_name,
        countryStatus: row.country_status,
        assignmentRoleCode: row.assignment_role_code,
        assignedAt: row.assigned_at
      }))
  };
}

/**
 * Handle authenticated session actions.
 *
 * GET  /auth/me
 * POST /auth/logout
 * POST /auth/logout-all
 * GET  /auth/sessions
 * POST /auth/sessions/:sessionId/revoke
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

  const isListSessionsRequest =
    url.pathname === "/auth/sessions" &&
    request.method === "GET";

  const revokeMatch = url.pathname.match(
    /^\/auth\/sessions\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/revoke$/i
  );

  const isRevokeSelectedRequest =
    Boolean(revokeMatch) &&
    request.method === "POST";

  if (
    !isMeRequest &&
    !isLogoutRequest &&
    !isLogoutAllRequest &&
    !isListSessionsRequest &&
    !isRevokeSelectedRequest
  ) {
    return null;
  }

  try {
    const result = await requireSession(request, env);

    if (result.error) {
      return result.error;
    }

    const session = result.session;

    // GET /auth/me
    if (isMeRequest) {
      const accessContext = await getUserAccessContext(
        env.DB,
        session.userId
      );

      return json({
        ok: true,
        user: {
          userId: session.userId,
          registrationStatus: session.registrationStatus,
          accountStatus: session.accountStatus,
          accessLevel: session.accessLevel,
          roles: accessContext.roles,
          activeCountryAssignments:
            accessContext.activeCountryAssignments
        },
        session: {
          sessionId: session.sessionId,
          deviceName: session.deviceName,
          deviceType: session.deviceType,
          expiresAt: session.expiresAt
        }
      });
    }

    // POST /auth/logout
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

    // POST /auth/logout-all
    if (isLogoutAllRequest) {
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
    }

    // GET /auth/sessions
    if (isListSessionsRequest) {
      const now = new Date().toISOString();

      const result = await env.DB.prepare(
        `SELECT
           session_id,
           device_name,
           device_type,
           created_at,
           last_activity_at,
           expires_at
         FROM user_sessions
         WHERE user_id = ?1
           AND revoked_at IS NULL
           AND expires_at > ?2
         ORDER BY last_activity_at DESC
         LIMIT 50`
      ).bind(
        session.userId,
        now
      ).all();

      const rows = result?.results ?? [];

      const sessions = rows.map((item) => ({
        sessionId: item.session_id,
        deviceName: item.device_name,
        deviceType: item.device_type,
        createdAt: item.created_at,
        lastActivityAt: item.last_activity_at,
        expiresAt: item.expires_at,
        isCurrent: item.session_id === session.sessionId
      }));

      return json({
        ok: true,
        sessions,
        count: sessions.length
      });
    }

    // POST /auth/sessions/:sessionId/revoke
    if (isRevokeSelectedRequest) {
      const targetSessionId = revokeMatch[1];

      const revoked = await revokeSession({
        db: env.DB,
        sessionId: targetSessionId,
        userId: session.userId,
        reason: "USER_REVOKED"
      });

      if (!revoked.revoked) {
        return json({
          error: "Session not found or is no longer active."
        }, 404);
      }

      return json({
        ok: true,
        message: "Selected session has been revoked.",
        sessionId: targetSessionId,
        currentSessionRevoked:
          targetSessionId === session.sessionId
      });
    }

    return null;
  } catch (error) {
    return errorResponse(error);
  }
}

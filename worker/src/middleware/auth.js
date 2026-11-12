import { getSession } from "../services/sessions.js";
import { writeAudit } from "../services/audit.js";
import { getUserRoles } from "../services/users.js";
import { jsonResponse } from "../core/response.js";

export async function requireAuth(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return {
      error: jsonResponse(
        { error: "Unauthorized" },
        401
      )
    };
  }

  const session = await getSession(env, token);

  if (!session || session.revoked_at) {
    return {
      error: jsonResponse(
        { error: "Invalid session" },
        401
      )
    };
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    // Audit expired session only once.
    const auditCheck = await env.DB.prepare(`
      SELECT expired_audit_at
      FROM user_sessions
      WHERE session_id = ?
      LIMIT 1
    `).bind(session.session_id).first();

    if (!auditCheck?.expired_audit_at) {
      await writeAudit(
        env,
        session.user_id,
        "SESSION_EXPIRED",
        {
          session_id: session.session_id
        },
        session.user_id,
        request
      );

      await env.DB.prepare(`
        UPDATE user_sessions
        SET expired_audit_at = datetime('now')
        WHERE session_id = ?
          AND expired_audit_at IS NULL
      `).bind(session.session_id).run();
    }

    return {
      error: jsonResponse(
        { error: "Session expired" },
        401
      )
    };
  }

  const roles = await getUserRoles(env, session.user_id);

  return {
    user: {
      user_id: session.user_id,
      roles
    },
    token,
    session
  };
}

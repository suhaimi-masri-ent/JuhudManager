
import { getSession } from "../services/sessions.js";
import { writeAudit } from "../services/audit.js";
import { getUserRoles } from "../services/users.js";
import { jsonResponse } from "../core/response.js";

export async function requireAuth(request, env) {
  const authorization = request.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return {
      error: jsonResponse({ error: "Unauthorized" }, 401)
    };
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return {
      error: jsonResponse({ error: "Unauthorized" }, 401)
    };
  }

  const session = await getSession(env, token);

  if (!session) {
    return {
      error: jsonResponse({ error: "Invalid session" }, 401)
    };
  }

  if (session.revoked_at) {
    return {
      error: jsonResponse({ error: "Invalid session" }, 401)
    };
  }

  const now = new Date().toISOString();

  // CHECK EXPIRED SESSION
  if (session.expires_at <= now) {
    const expiredSession = await env.DB.prepare(`
      UPDATE user_sessions
      SET expired_audit_at = ?
      WHERE session_id = ?
        AND expired_audit_at IS NULL
        AND revoked_at IS NULL
        AND expires_at <= ?
      RETURNING session_id
    `).bind(
      now,
      session.session_id,
      now
    ).first();

    // WRITE AUDIT ONLY ONCE
    if (expiredSession) {
      await writeAudit(
        env,
        session.user_id,
        "SESSION_EXPIRED",
        { session_id: session.session_id },
        session.user_id,
        request
      );
    }

    return {
      error: jsonResponse({ error: "Session expired" }, 401)
    };
  }

  // CHECK ACCOUNT STATUS
  const account = await env.DB.prepare(`
    SELECT account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(session.user_id).first();

  if (!account || account.account_status !== "ACTIVE") {
    return {
      error: jsonResponse({
        error: "Account is inactive"
      }, 403)
    };
  }

  // UPDATE LAST SEEN
  await env.DB.prepare(`
    UPDATE user_sessions
    SET last_seen_at = ?
    WHERE session_id = ?
  `).bind(
    now,
    session.session_id
  ).run();

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

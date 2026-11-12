import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

export async function adminAuditLogsHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  // CHECK ADMIN ROLE
  const roleCheck = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(auth.user.user_id).first();

  if (!roleCheck) {
    return jsonResponse({
      error: "Forbidden"
    }, 403);
  }

  // GET LATEST 100 AUDIT LOGS
  const result = await env.DB.prepare(`
    SELECT
      al.audit_id,
      al.actor_user_id,
      actor.full_name AS actor_name,
      al.action,
      al.target_type,
      al.target_id,
      target.full_name AS target_name,
      al.details_json,
      al.created_at
    FROM audit_logs al
    LEFT JOIN user_accounts actor
      ON actor.user_id = al.actor_user_id
    LEFT JOIN user_accounts target
      ON target.user_id = al.target_id
    ORDER BY al.created_at DESC
    LIMIT 100
  `).all();

  return jsonResponse({
    audit_logs: result.results || []
  });
}

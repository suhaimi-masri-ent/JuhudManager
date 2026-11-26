
import { jsonResponse } from "../utils/response.js";
import { requireAuth } from "../middleware/auth.js";
import { getUserRoles } from "../services/userService.js";

export async function meHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse(
      { error: "Unauthenticated or session expired" },
      401
    );
  }

  const user = await env.DB.prepare(`
    SELECT
      user_id,
      full_name,
      account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(session.user_id).first();

  if (!user || user.account_status !== "ACTIVE") {
    return jsonResponse(
      { error: "Account is not active" },
      403
    );
  }

  const roles = await getUserRoles(env, user.user_id);

  return jsonResponse({
    success: true,
    user,
    roles,
    session: {
      expires_at: session.expires_at
    }
  });
}

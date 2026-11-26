
import { jsonResponse } from "../utils/response.js";
import { requireAuth } from "../middleware/auth.js";
import { revokeSession } from "../services/sessionService.js";

export async function logoutHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse(
      { error: "Unauthenticated or session expired" },
      401
    );
  }

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.slice(7).trim();

  await revokeSession(env, token);

  await env.DB.prepare(`
    UPDATE user_accounts
    SET last_logout_at = ?
    WHERE user_id = ?
  `).bind(
    new Date().toISOString(),
    session.user_id
  ).run();

  return jsonResponse({
    success: true,
    message: "Successfully logged out"
  });
}


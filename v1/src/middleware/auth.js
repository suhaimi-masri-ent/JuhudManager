
import { getSession } from "../services/sessionService.js";

export async function requireAuth(request, env) {
  const authorization = request.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return null;
  }

  const session = await getSession(env, token);

  if (!session) {
    return null;
  }

  await env.DB.prepare(`
    UPDATE user_sessions
    SET last_seen_at = ?
    WHERE session_id = ?
  `).bind(
    new Date().toISOString(),
    session.session_id
  ).run();

  return session;
}


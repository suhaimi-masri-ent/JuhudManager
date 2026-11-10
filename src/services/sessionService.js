
import { sha256 } from "../utils/crypto.js";

export async function createSession(env, userId, token, request) {
  const sessionId = crypto.randomUUID();
  const tokenHash = await sha256(token);

  const expiresAt = new Date(
    Date.now() + Number(env.SESSION_DAYS || 0.5) * 86400000
  ).toISOString();

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = ip ? await sha256(ip) : null;

  const userAgent =
    request.headers.get("User-Agent") || null;

  await env.DB.prepare(`
    INSERT INTO user_sessions (
      session_id,
      user_id,
      token_hash,
      expires_at,
      ip_hash,
      user_agent
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    sessionId,
    userId,
    tokenHash,
    expiresAt,
    ipHash,
    userAgent
  ).run();

  return {
    sessionId,
    expiresAt
  };
}

export async function getSession(env, token) {
  if (!token) return null;

  const tokenHash = await sha256(token);

  return await env.DB.prepare(`
    SELECT
      session_id,
      user_id,
      expires_at
    FROM user_sessions
    WHERE token_hash = ?
      AND revoked_at IS NULL
      AND expires_at > ?
    LIMIT 1
  `).bind(
    tokenHash,
    new Date().toISOString()
  ).first();
}

export async function revokeSession(env, token) {
  if (!token) return false;

  const tokenHash = await sha256(token);

  await env.DB.prepare(`
    UPDATE user_sessions
    SET revoked_at = ?
    WHERE token_hash = ?
      AND revoked_at IS NULL
  `).bind(
    new Date().toISOString(),
    tokenHash
  ).run();

  return true;
}

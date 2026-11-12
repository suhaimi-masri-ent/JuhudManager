import {
  verifyPassword,
  generateSessionToken
} from "../utils/crypto.js";

import { getUserByEmail, getUserRoles } from "../services/users.js";
import { createSession, revokeSession } from "../services/sessions.js";
import { writeAudit } from "../services/audit.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

export async function loginHandler(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request" }, 400);
  }

  const email = body.email;
  const password = body.password;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    email.length > 254 ||
    password.length > 1024
  ) {
    return jsonResponse({
      error: "Email and password are required"
    }, 400);
  }

  const user = await getUserByEmail(env, email);

  if (!user) {
    await writeAudit(
      env,
      null,
      "LOGIN_FAILED_UNKNOWN_USER",
      { reason: "Unknown account" },
      null,
      request
    );

    return jsonResponse({
      error: "Invalid email or password"
    }, 401);
  }

  if (user.account_status !== "ACTIVE") {
    await writeAudit(
      env,
      user.user_id,
      "LOGIN_BLOCKED_INACTIVE",
      { reason: "Account inactive" },
      user.user_id,
      request
    );

    return jsonResponse({
      error: "Account is inactive"
    }, 403);
  }

  const now = new Date();

  if (
    user.locked_until &&
    new Date(user.locked_until).getTime() > now.getTime()
  ) {
    await writeAudit(
      env,
      user.user_id,
      "LOGIN_BLOCKED_LOCKED",
      { reason: "Account locked" },
      user.user_id,
      request
    );

    return jsonResponse({
      error: "Account temporarily locked. Please try again later."
    }, 423);
  }

  const validPassword = await verifyPassword(
    password,
    user.password_salt,
    user.password_hash
  );

  if (!validPassword) {
    const attempts = (user.failed_login_attempts || 0) + 1;

    const lockedUntil = attempts >= 5
      ? new Date(now.getTime() + 15 * 60 * 1000).toISOString()
      : null;

    await env.DB.prepare(`
      UPDATE user_accounts
      SET
        failed_login_attempts = ?,
        locked_until = ?,
        updated_at = ?
      WHERE user_id = ?
    `).bind(
      attempts,
      lockedUntil,
      now.toISOString(),
      user.user_id
    ).run();

    await writeAudit(
      env,
      user.user_id,
      "LOGIN_FAILED",
      { reason: "Invalid password", attempts },
      user.user_id,
      request
    );

    return jsonResponse({
      error: "Invalid email or password",
      attempts_remaining: Math.max(0, 5 - attempts)
    }, 401);
  }

  const token = generateSessionToken();

  const session = await createSession(
    env,
    user.user_id,
    token,
    request
  );

  const roles = await getUserRoles(env, user.user_id);

  await env.DB.prepare(`
    UPDATE user_accounts
    SET
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = ?,
      last_access_at = ?,
      updated_at = ?
    WHERE user_id = ?
  `).bind(
    now.toISOString(),
    now.toISOString(),
    now.toISOString(),
    user.user_id
  ).run();

  await writeAudit(
    env,
    user.user_id,
    "LOGIN_SUCCESS",
    { session_id: session.sessionId },
    user.user_id,
    request
  );

  return jsonResponse({
    success: true,
    message: "Login successful",
    token,
    token_type: "Bearer",
    expires_at: session.expiresAt,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      account_status: user.account_status
    },
    roles
  });
}

export async function meHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  const user = await env.DB.prepare(`
    SELECT user_id, full_name, account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(auth.user.user_id).first();

  if (!user || user.account_status !== "ACTIVE") {
    return jsonResponse({
      error: "Account is not active"
    }, 403);
  }

  return jsonResponse({
    success: true,
    user,
    roles: auth.user.roles,
    session: {
      expires_at: auth.session.expires_at
    }
  });
}

export async function logoutHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  await revokeSession(env, auth.token);

  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE user_accounts
    SET last_logout_at = ?, updated_at = ?
    WHERE user_id = ?
  `).bind(
    now,
    now,
    auth.user.user_id
  ).run();

  await writeAudit(
    env,
    auth.user.user_id,
    "LOGOUT",
    { session_id: auth.session.session_id },
    auth.user.user_id,
    request
  );

  return jsonResponse({
    success: true,
    message: "Successfully logged out"
  });
}

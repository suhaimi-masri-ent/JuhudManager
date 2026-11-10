
import { jsonResponse } from "../utils/response.js";
import {
  verifyPassword,
  generateSessionToken
} from "../utils/crypto.js";

import {
  getUserByEmail,
  getUserRoles
} from "../services/userService.js";

import { createSession } from "../services/sessionService.js";

async function writeAudit(
  env,
  userId,
  action,
  details = {}
) {
  await env.DB.prepare(`
    INSERT INTO audit_logs (
      audit_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      details_json
    )
    VALUES (?, ?, ?, 'USER', ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    action,
    userId,
    JSON.stringify(details)
  ).run();
}

export async function loginHandler(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { error: "Invalid JSON request" },
      400
    );
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
    return jsonResponse(
      { error: "Email and password are required" },
      400
    );
  }

  const user = await getUserByEmail(env, email);

  if (!user) {
    return jsonResponse(
      { error: "Invalid email or password" },
      401
    );
  }

  if (user.account_status !== "ACTIVE") {
    return jsonResponse(
      { error: "Account is not active" },
      403
    );
  }

  const now = new Date();

  if (
    user.locked_until &&
    new Date(user.locked_until).getTime() > now.getTime()
  ) {
    return jsonResponse(
      { error: "Account temporarily locked. Please try again later." },
      423
    );
  }

  const validPassword = await verifyPassword(
    password,
    user.password_salt,
    user.password_hash
  );

  if (!validPassword) {
    const attempts =
      (user.failed_login_attempts || 0) + 1;

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
      {
        reason: "Invalid password",
        attempts
      }
    );

    return jsonResponse(
      {
        error: "Invalid email or password",
        attempts_remaining: Math.max(0, 5 - attempts)
      },
      401
    );
  }

  const token = generateSessionToken();

  const session = await createSession(
    env,
    user.user_id,
    token,
    request
  );

  const roles = await getUserRoles(
    env,
    user.user_id
  );

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
    {
      session_id: session.sessionId
    }
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

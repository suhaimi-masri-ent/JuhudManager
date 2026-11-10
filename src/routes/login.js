
import { jsonResponse } from "../utils/response.js";
import { verifyPassword, generateSessionToken } from "../utils/crypto.js";
import { getUserByEmail, getUserRoles } from "../services/userService.js";
import { createSession } from "../services/sessionService.js";

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
    return jsonResponse({ error: "Email and password are required" }, 400);
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

  if (
    user.locked_until &&
    new Date(user.locked_until).getTime() > Date.now()
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
    const nextAttempts = user.failed_login_attempts + 1;
    const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      UPDATE user_accounts
      SET
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE
          WHEN failed_login_attempts + 1 >= 5 THEN ?
          ELSE locked_until
        END
      WHERE user_id = ?
    `).bind(lockUntil, user.user_id).run();

    return jsonResponse(
      { error: "Invalid email or password" },
      401
    );
  }

  const token = generateSessionToken();
  const session = await createSession(env, user.user_id, token, request);
  const roles = await getUserRoles(env, user.user_id);

  await env.DB.prepare(`
    UPDATE user_accounts
    SET
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = ?,
      last_access_at = ?
    WHERE user_id = ?
  `).bind(
    new Date().toISOString(),
    new Date().toISOString(),
    user.user_id
  ).run();

  return jsonResponse({
    success: true,
    token,
    expires_at: session.expiresAt,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      account_status: user.account_status
    },
    roles
  });
}


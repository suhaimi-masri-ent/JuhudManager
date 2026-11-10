
export async function getUserByEmail(env, email) {
  return await env.DB.prepare(`
    SELECT
      ua.user_id,
      ua.username,
      ua.password_hash,
      ua.password_salt,
      ua.account_status,
      ua.failed_login_attempts,
      ua.locked_until
    FROM user_accounts ua
    INNER JOIN user_identifiers ui
      ON ui.user_id = ua.user_id
    WHERE lower(ui.email_hash) = lower(?)
    LIMIT 1
  `).bind(email).first();
}

export async function getUserRoles(env, userId) {
  const result = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    INNER JOIN roles r
      ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
  `).bind(userId).all();

  return result.results.map(row => row.role_name);
}


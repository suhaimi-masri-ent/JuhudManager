
import {
  hashPassword,
  verifyPassword,
  isAcceptablePasswordHash,
  validatePassword
} from "./password.js";

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getRequestMetadata(request) {
  return {
    ipAddress:
      request?.headers?.get("CF-Connecting-IP") || null,
    userAgent:
      request?.headers?.get("User-Agent") || null
  };
}

async function recordPasswordChangeFailure({
  db,
  userId,
  sessionId,
  request
}) {
  const metadata = getRequestMetadata(request);

  await db.prepare(
    `INSERT INTO auth_events (
       event_id,
       user_id,
       session_id,
       event_type,
       event_status,
       ip_address,
       user_agent,
       event_details
     )
     VALUES (
       ?1, ?2, ?3, 'PASSWORD_CHANGED', 'FAILED', ?4, ?5, ?6
     )`
  ).bind(
    crypto.randomUUID(),
    userId,
    sessionId,
    metadata.ipAddress,
    metadata.userAgent,
    JSON.stringify({
      reason: "CURRENT_PASSWORD_INVALID"
    })
  ).run();
}

/**
 * Change the password for an authenticated user.
 *
 * Requirements:
 * - Current password must be verified.
 * - New password must satisfy PASSWORD_POLICY.
 * - New password cannot be the same as current password.
 * - Current authenticated session remains active.
 * - All other active sessions are revoked.
 *
 * Password hash update, other-session revocation and
 * successful audit event are committed in one D1 batch.
 */
export async function changePassword({
  db,
  userId,
  currentSessionId,
  currentPassword,
  newPassword,
  request
}) {
  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    typeof currentSessionId !== "string" ||
    !currentSessionId.trim()
  ) {
    throw httpError(
      "An authenticated user session is required.",
      401
    );
  }

  if (typeof currentPassword !== "string") {
    throw httpError(
      "Current password is required.",
      400
    );
  }

  validatePassword(newPassword);

  const normalizedUserId = userId.trim();
  const normalizedSessionId = currentSessionId.trim();

  const credential = await db.prepare(
    `SELECT
       c.credential_id,
       c.password_hash
     FROM user_credentials c
     INNER JOIN users u
       ON u.user_id = c.user_id
     WHERE c.user_id = ?1
       AND c.credential_type = 'PASSWORD'
       AND c.revoked_at IS NULL
       AND u.account_status = 'ACTIVE'
     LIMIT 1`
  ).bind(normalizedUserId).first();

  const currentPasswordValid =
    Boolean(
      credential &&
      isAcceptablePasswordHash(credential.password_hash) &&
      await verifyPassword(
        currentPassword,
        credential.password_hash
      )
    );

  if (!currentPasswordValid) {
    await recordPasswordChangeFailure({
      db,
      userId: normalizedUserId,
      sessionId: normalizedSessionId,
      request
    });

    throw httpError(
      "Current password is incorrect.",
      401
    );
  }

  // Prevent changing the password to its existing value.
  const samePassword = await verifyPassword(
    newPassword,
    credential.password_hash
  );

  if (samePassword) {
    throw httpError(
      "New password must be different from the current password.",
      400
    );
  }

  const newPasswordHash = await hashPassword(newPassword);

  const now = new Date().toISOString();
  const eventId = crypto.randomUUID();
  const metadata = getRequestMetadata(request);

  const results = await db.batch([
    // 1. Replace the active password credential.
    // Require the current session to remain valid at commit time.
    // The old hash prevents overwriting a concurrent password change.
    db.prepare(
      `UPDATE user_credentials
       SET
         password_hash = ?1,
         changed_at = ?2,
         updated_at = ?2
       WHERE credential_id = ?3
         AND user_id = ?4
         AND credential_type = 'PASSWORD'
         AND password_hash = ?5
         AND revoked_at IS NULL
         AND EXISTS (
           SELECT 1
           FROM users
           WHERE user_id = ?4
             AND account_status = 'ACTIVE'
         )
         AND EXISTS (
           SELECT 1
           FROM user_sessions
           WHERE session_id = ?6
             AND user_id = ?4
             AND revoked_at IS NULL
             AND expires_at > ?2
         )`
    ).bind(
      newPasswordHash,
      now,
      credential.credential_id,
      normalizedUserId,
      credential.password_hash,
      normalizedSessionId
    ),

    // 2. Revoke every other active session.
    // Keep the session currently performing this action.
    // This only runs if the credential update succeeded.
    db.prepare(
      `UPDATE user_sessions
       SET
         revoked_at = ?1,
         revocation_reason = 'PASSWORD_CHANGED'
       WHERE user_id = ?2
         AND session_id != ?3
         AND revoked_at IS NULL
         AND EXISTS (
           SELECT 1
           FROM user_credentials
           WHERE credential_id = ?4
             AND user_id = ?2
             AND password_hash = ?5
             AND changed_at = ?1
             AND revoked_at IS NULL
         )`
    ).bind(
      now,
      normalizedUserId,
      normalizedSessionId,
      credential.credential_id,
      newPasswordHash
    ),

    // 3. Record the successful password change.
    // Confirm the current session is still valid and unexpired.
    db.prepare(
      `INSERT INTO auth_events (
         event_id,
         user_id,
         session_id,
         event_type,
         event_status,
         ip_address,
         user_agent,
         event_details,
         created_at
       )
       SELECT
         ?1,
         ?2,
         ?3,
         'PASSWORD_CHANGED',
         'SUCCESS',
         ?4,
         ?5,
         ?6,
         ?7
       WHERE EXISTS (
         SELECT 1
         FROM user_credentials
         WHERE credential_id = ?8
           AND user_id = ?2
           AND password_hash = ?9
           AND changed_at = ?7
           AND revoked_at IS NULL
       )
       AND EXISTS (
         SELECT 1
         FROM user_sessions
         WHERE session_id = ?3
           AND user_id = ?2
           AND revoked_at IS NULL
           AND expires_at > ?7
       )`
    ).bind(
      eventId,
      normalizedUserId,
      normalizedSessionId,
      metadata.ipAddress,
      metadata.userAgent,
      JSON.stringify({
        credentialType: "PASSWORD",
        otherSessionsRevoked: true
      }),
      now,
      credential.credential_id,
      newPasswordHash
    )
  ]);

  const credentialChanges =
    results?.[0]?.meta?.changes ?? 0;

  const revokedSessionCount =
    results?.[1]?.meta?.changes ?? 0;

  const auditChanges =
    results?.[2]?.meta?.changes ?? 0;

  if (
    credentialChanges !== 1 ||
    auditChanges !== 1
  ) {
    throw httpError(
      "Password change could not be completed. Please try again.",
      409
    );
  }

  return {
    changed: true,
    changedAt: now,
    currentSessionPreserved: true,
    revokedSessionCount
  };
}

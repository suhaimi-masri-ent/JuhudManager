
import {
  hashPassword,
  validatePassword
} from "./password.js";

import {
  findValidActivationToken
} from "./activation.js";

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isUniqueConstraintError(error) {
  return /unique constraint|SQLITE_CONSTRAINT_UNIQUE/i.test(
    error?.message || ""
  );
}

/**
 * Set the initial password and activate a registered account.
 *
 * Requires a valid, unused activation token.
 *
 * The following operations are committed together:
 * 1. Consume activation token.
 * 2. Create password credential.
 * 3. Activate user account.
 * 4. Record successful activation event.
 */
export async function setInitialPassword({
  db,
  env,
  activationToken,
  password
}) {
  validatePassword(password);

  // Validate token before performing expensive password hashing.
  // The token is not consumed at this stage.
  const activation = await findValidActivationToken({
    db,
    env,
    token: activationToken
  });

  const passwordHash = await hashPassword(password);

  const credentialId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const results = await db.batch([
      // 1. Consume the activation token.
      // All account prerequisites are checked again inside
      // the transaction to prevent stale validation.
      db.prepare(
        `UPDATE user_activation_tokens
         SET consumed_at = ?1
         WHERE activation_token_id = ?2
           AND user_id = ?3
           AND consumed_at IS NULL
           AND invalidated_at IS NULL
           AND expires_at > ?1
           AND EXISTS (
             SELECT 1
             FROM users
             WHERE user_id = ?3
               AND account_status = 'DISABLED'
               AND email IS NOT NULL
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?3
               AND identity_type = 'NATIONAL_ID'
               AND verification_status = 'VERIFIED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?3
               AND identity_type = 'EMAIL'
               AND verification_status = 'VERIFIED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?3
               AND identity_type = 'WHATSAPP'
               AND verification_status = 'VERIFIED'
           )
           AND NOT EXISTS (
             SELECT 1
             FROM user_credentials
             WHERE user_id = ?3
               AND credential_type = 'PASSWORD'
               AND revoked_at IS NULL
           )`
      ).bind(
        now,
        activation.activationTokenId,
        activation.userId
      ),

      // 2. Create the initial password credential.
      // This only succeeds when the activation token was
      // consumed successfully in the preceding statement.
      db.prepare(
        `INSERT INTO user_credentials (
           credential_id,
           user_id,
           credential_type,
           password_hash,
           created_at,
           updated_at
         )
         SELECT
           ?1,
           ?2,
           'PASSWORD',
           ?3,
           ?4,
           ?4
         WHERE EXISTS (
           SELECT 1
           FROM user_activation_tokens
           WHERE activation_token_id = ?5
             AND user_id = ?2
             AND consumed_at = ?4
             AND invalidated_at IS NULL
         )
         AND EXISTS (
           SELECT 1
           FROM users
           WHERE user_id = ?2
             AND account_status = 'DISABLED'
             AND email IS NOT NULL
         )
         AND NOT EXISTS (
           SELECT 1
           FROM user_credentials
           WHERE user_id = ?2
             AND credential_type = 'PASSWORD'
             AND revoked_at IS NULL
         )`
      ).bind(
        credentialId,
        activation.userId,
        passwordHash,
        now,
        activation.activationTokenId
      ),

      // 3. Activate the account only after the credential exists.
      db.prepare(
        `UPDATE users
         SET
           account_status = 'ACTIVE',
           updated_at = ?1
         WHERE user_id = ?2
           AND account_status = 'DISABLED'
           AND EXISTS (
             SELECT 1
             FROM user_credentials
             WHERE user_id = ?2
               AND credential_id = ?3
               AND credential_type = 'PASSWORD'
               AND revoked_at IS NULL
           )
           AND EXISTS (
             SELECT 1
             FROM user_activation_tokens
             WHERE activation_token_id = ?4
               AND user_id = ?2
               AND consumed_at = ?1
               AND invalidated_at IS NULL
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?2
               AND identity_type = 'NATIONAL_ID'
               AND verification_status = 'VERIFIED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?2
               AND identity_type = 'EMAIL'
               AND verification_status = 'VERIFIED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?2
               AND identity_type = 'WHATSAPP'
               AND verification_status = 'VERIFIED'
           )`
      ).bind(
        now,
        activation.userId,
        credentialId,
        activation.activationTokenId
      ),

      // 4. Record account activation in the authentication audit log.
      db.prepare(
        `INSERT INTO auth_events (
           event_id,
           user_id,
           session_id,
           event_type,
           event_status,
           event_details,
           created_at
         )
         SELECT
           ?1,
           ?2,
           NULL,
           'ACCOUNT_ACTIVATED',
           'SUCCESS',
           ?3,
           ?4
         WHERE EXISTS (
           SELECT 1
           FROM users
           WHERE user_id = ?2
             AND account_status = 'ACTIVE'
         )
         AND EXISTS (
           SELECT 1
           FROM user_credentials
           WHERE credential_id = ?5
             AND user_id = ?2
             AND credential_type = 'PASSWORD'
             AND revoked_at IS NULL
         )`
      ).bind(
        eventId,
        activation.userId,
        JSON.stringify({
          activationMethod: "EMAIL_TOKEN",
          credentialType: "PASSWORD"
        }),
        now,
        credentialId
      )
    ]);

    const tokenChanges = results?.[0]?.meta?.changes ?? 0;
    const credentialChanges = results?.[1]?.meta?.changes ?? 0;
    const accountChanges = results?.[2]?.meta?.changes ?? 0;
    const auditChanges = results?.[3]?.meta?.changes ?? 0;

    if (
      tokenChanges !== 1 ||
      credentialChanges !== 1 ||
      accountChanges !== 1 ||
      auditChanges !== 1
    ) {
      throw httpError(
        "Account activation could not be completed.",
        409
      );
    }
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    if (isUniqueConstraintError(error)) {
      throw httpError(
        "Activation token is invalid, expired or already used.",
        409
      );
    }

    throw error;
  }

  return {
    activated: true,
    userId: activation.userId,
    credentialId,
    accountStatus: "ACTIVE",
    credentialType: "PASSWORD"
  };
}

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
 * Set the initial password after email verification.
 *
 * The supplied token is a short-lived registration password
 * setup grant. It does NOT activate the account.
 *
 * The following operations are committed together:
 * 1. Consume the password setup token.
 * 2. Create the initial Argon2id password credential.
 * 3. Record the successful password setup event.
 *
 * Account remains DISABLED until Admin approval.
 */
export async function setInitialPassword({
  db,
  env,
  setupToken,
  password
}) {
  validatePassword(password);

  // Validate the one-time setup token before expensive hashing.
  const setup = await findValidActivationToken({
    db,
    env,
    token: setupToken
  });

  const passwordHash = await hashPassword(password);

  const credentialId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const results = await db.batch([
      // 1. Consume the setup token.
      // Eligibility is checked again inside the transaction.
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
             FROM user_registration_reviews
             WHERE user_id = ?3
               AND registration_status = 'PENDING_REVIEW'
               AND reviewed_by IS NULL
               AND reviewed_at IS NULL
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?3
               AND identity_type = 'EMAIL'
               AND verification_status = 'VERIFIED'
               AND verified_at IS NOT NULL
               AND expires_at IS NULL
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
        setup.activationTokenId,
        setup.userId
      ),

      // 2. Create the password credential.
      //
      // If token consumption or eligibility failed, the
      // NULL password_hash deliberately violates NOT NULL.
      // This aborts the batch and rolls back all prior writes.
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
           CASE
             WHEN EXISTS (
               SELECT 1
               FROM user_activation_tokens
               WHERE activation_token_id = ?3
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
             AND EXISTS (
               SELECT 1
               FROM user_registration_reviews
               WHERE user_id = ?2
                 AND registration_status = 'PENDING_REVIEW'
                 AND reviewed_by IS NULL
                 AND reviewed_at IS NULL
             )
             AND EXISTS (
               SELECT 1
               FROM user_auth_identities
               WHERE user_id = ?2
                 AND identity_type = 'EMAIL'
                 AND verification_status = 'VERIFIED'
                 AND verified_at IS NOT NULL
                 AND expires_at IS NULL
             )
             AND NOT EXISTS (
               SELECT 1
               FROM user_credentials
               WHERE user_id = ?2
                 AND credential_type = 'PASSWORD'
                 AND revoked_at IS NULL
             )
             THEN ?5
             ELSE NULL
           END,
           ?4,
           ?4`
      ).bind(
        credentialId,
        setup.userId,
        setup.activationTokenId,
        now,
        passwordHash
      ),

      // 3. Record password setup.
      // The event is inserted only if the credential exists.
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
           'PASSWORD_SETUP',
           'SUCCESS',
           ?3,
           ?4
         WHERE EXISTS (
           SELECT 1
           FROM user_credentials
           WHERE credential_id = ?5
             AND user_id = ?2
             AND credential_type = 'PASSWORD'
             AND revoked_at IS NULL
         )
         AND EXISTS (
           SELECT 1
           FROM user_registration_reviews
           WHERE user_id = ?2
             AND registration_status = 'PENDING_REVIEW'
         )`
      ).bind(
        eventId,
        setup.userId,
        JSON.stringify({
          setupMethod: "EMAIL_VERIFICATION",
          credentialType: "PASSWORD",
          accountActivated: false
        }),
        now,
        credentialId
      )
    ]);

    const tokenChanges = results?.[0]?.meta?.changes ?? 0;
    const credentialChanges = results?.[1]?.meta?.changes ?? 0;
    const eventChanges = results?.[2]?.meta?.changes ?? 0;

    if (
      tokenChanges !== 1 ||
      credentialChanges !== 1 ||
      eventChanges !== 1
    ) {
      throw httpError(
        "Password setup could not be completed.",
        409
      );
    }
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    if (isUniqueConstraintError(error)) {
      throw httpError(
        "Password setup token is invalid, expired or already used.",
        409
      );
    }

    throw error;
  }

  return {
    passwordSet: true,
    userId: setup.userId,
    credentialId,
    credentialType: "PASSWORD",
    accountStatus: "DISABLED",
    registrationStatus: "PENDING_REVIEW",
    nextStep: "LOGIN_LIMITED_ACCESS"
  };
}

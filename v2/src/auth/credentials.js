
import {
  hashPassword,
  validatePassword
} from "./password.js";

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
 * All three required identity types must already be VERIFIED.
 * The account must still be DISABLED.
 *
 * Credential creation and account activation are committed
 * together using a D1 batch transaction.
 */
export async function setInitialPassword({
  db,
  userId,
  password
}) {
  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw httpError("A valid user ID is required.", 400);
  }

  validatePassword(password);

  const normalizedUserId = userId.trim();

  const user = await db.prepare(
    `SELECT
       user_id,
       account_status,
       email
     FROM users
     WHERE user_id = ?1
     LIMIT 1`
  ).bind(normalizedUserId).first();

  if (!user) {
    throw httpError("Registration account was not found.", 404);
  }

  if (user.account_status !== "DISABLED") {
    throw httpError("Account is not eligible for activation.", 409);
  }

  if (!user.email) {
    throw httpError("Verified email address is required.", 409);
  }

  const identitySummary = await db.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(
         CASE WHEN identity_type = 'NATIONAL_ID'
           THEN 1 ELSE 0 END
       ) AS national_id_total,
       SUM(
         CASE WHEN identity_type = 'EMAIL'
           THEN 1 ELSE 0 END
       ) AS email_total,
       SUM(
         CASE WHEN identity_type = 'WHATSAPP'
           THEN 1 ELSE 0 END
       ) AS whatsapp_total
     FROM user_auth_identities
     WHERE user_id = ?1
       AND verification_status = 'VERIFIED'
       AND identity_type IN (
         'NATIONAL_ID',
         'EMAIL',
         'WHATSAPP'
       )`
  ).bind(normalizedUserId).first();

  if (
    (identitySummary?.national_id_total ?? 0) < 1 ||
    (identitySummary?.email_total ?? 0) < 1 ||
    (identitySummary?.whatsapp_total ?? 0) < 1
  ) {
    throw httpError(
      "All required identities must be verified before password setup.",
      409
    );
  }

  const existingCredential = await db.prepare(
    `SELECT credential_id
     FROM user_credentials
     WHERE user_id = ?1
       AND credential_type = 'PASSWORD'
       AND revoked_at IS NULL
     LIMIT 1`
  ).bind(normalizedUserId).first();

  if (existingCredential) {
    throw httpError(
      "An active password credential already exists.",
      409
    );
  }

  // Perform expensive hashing before the final database transaction.
  const passwordHash = await hashPassword(password);

  const credentialId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const results = await db.batch([
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
           user_id,
           'PASSWORD',
           ?2,
           ?3,
           ?3
         FROM users
         WHERE user_id = ?4
           AND account_status = 'DISABLED'
           AND email IS NOT NULL
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?4
               AND identity_type = 'NATIONAL_ID'
               AND verification_status = 'VERIFIED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?4
               AND identity_type = 'EMAIL'
               AND verification_status = 'VERIFIED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?4
               AND identity_type = 'WHATSAPP'
               AND verification_status = 'VERIFIED'
           )
           AND NOT EXISTS (
             SELECT 1
             FROM user_credentials
             WHERE user_id = ?4
               AND credential_type = 'PASSWORD'
               AND revoked_at IS NULL
           )`
      ).bind(
        credentialId,
        passwordHash,
        now,
        normalizedUserId
      ),

      db.prepare(
        `UPDATE users
         SET
           account_status = 'ACTIVE',
           updated_at = ?1
         WHERE user_id = ?2
           AND account_status = 'DISABLED'
           AND email IS NOT NULL
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
        normalizedUserId,
        credentialId
      )
    ]);

    const credentialChanges = results?.[0]?.meta?.changes ?? 0;
    const accountChanges = results?.[1]?.meta?.changes ?? 0;

    if (
      credentialChanges !== 1 ||
      accountChanges !== 1
    ) {
      throw httpError(
        "Account verification state changed. Password setup was not completed.",
        409
      );
    }
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    if (isUniqueConstraintError(error)) {
      throw httpError(
        "An active password credential already exists.",
        409
      );
    }

    throw error;
  }

  return {
    activated: true,
    userId: normalizedUserId,
    credentialId,
    accountStatus: "ACTIVE",
    credentialType: "PASSWORD"
  };
}

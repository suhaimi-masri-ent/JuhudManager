import {
  hashPassword,
  validatePassword
} from "./password.js";

import {
  findValidActivationToken
} from "./activation.js";

import {
  findValidSuperAdminBootstrapToken
} from "./super-admin-bootstrap.js";

import {
  findValidAdminAssistedRecoveryToken
} from "./admin-assisted-recovery.js";

const BOOTSTRAP_USER_ID = "6b3b4088-7e19-4efc-a942-387c7880460c";
const BOOTSTRAP_USER_NAME = "JUHUD MANAGER";
const BOOTSTRAP_USER_EMAIL = "al.masri.ent@gmail.com";

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

async function completeSuperAdminBootstrap({
  db,
  env,
  setupToken,
  password
}) {
  const setup = await findValidSuperAdminBootstrapToken({
    db,
    env,
    token: setupToken
  });

  if (setup.userId !== BOOTSTRAP_USER_ID) {
    throw httpError(
      "Super Admin bootstrap is not available.",
      409
    );
  }

  const passwordHash = await hashPassword(password);

  const credentialId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const results = await db.batch([
      db.prepare(
        `UPDATE super_admin_bootstrap_tokens
         SET consumed_at = ?1
         WHERE bootstrap_token_id = ?2
           AND user_id = ?3
           AND consumed_at IS NULL
           AND invalidated_at IS NULL
           AND expires_at > ?1
           AND EXISTS (
             SELECT 1
             FROM super_admin_bootstrap_state
             WHERE bootstrap_id = 1
               AND user_id = ?3
               AND bootstrap_status = 'PENDING'
           )
           AND EXISTS (
             SELECT 1
             FROM users
             WHERE user_id = ?3
               AND full_name = ?4
               AND lower(email) = ?5
               AND account_status = 'DISABLED'
           )
           AND EXISTS (
             SELECT 1
             FROM user_auth_identities
             WHERE user_id = ?3
               AND identity_type = 'EMAIL'
               AND identity_scope = 'GLOBAL'
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
           )
           AND NOT EXISTS (
             SELECT 1
             FROM user_roles
             WHERE user_id = ?3
           )
           AND NOT EXISTS (
             SELECT 1
             FROM user_roles
             WHERE role_id = 'role-super-admin'
           )`
      ).bind(
        now,
        setup.bootstrapTokenId,
        BOOTSTRAP_USER_ID,
        BOOTSTRAP_USER_NAME,
        BOOTSTRAP_USER_EMAIL
      ),

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
               FROM super_admin_bootstrap_tokens
               WHERE bootstrap_token_id = ?3
                 AND user_id = ?2
                 AND consumed_at = ?4
                 AND invalidated_at IS NULL
             )
             AND EXISTS (
               SELECT 1
               FROM users
               WHERE user_id = ?2
                 AND account_status = 'DISABLED'
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
        BOOTSTRAP_USER_ID,
        setup.bootstrapTokenId,
        now,
        passwordHash
      ),

      db.prepare(
        `INSERT INTO user_roles (
           user_id,
           role_id,
           assigned_by,
           assigned_at
         )
         SELECT
           ?1,
           CASE
             WHEN EXISTS (
               SELECT 1
               FROM user_credentials
               WHERE credential_id = ?2
                 AND user_id = ?1
                 AND credential_type = 'PASSWORD'
                 AND revoked_at IS NULL
             )
             AND EXISTS (
               SELECT 1
               FROM super_admin_bootstrap_tokens
               WHERE bootstrap_token_id = ?3
                 AND user_id = ?1
                 AND consumed_at = ?4
                 AND invalidated_at IS NULL
             )
             AND NOT EXISTS (
               SELECT 1
               FROM user_roles
               WHERE role_id = 'role-super-admin'
             )
             THEN 'role-super-admin'
             ELSE NULL
           END,
           NULL,
           ?4
         WHERE EXISTS (
           SELECT 1
           FROM super_admin_bootstrap_state
           WHERE bootstrap_id = 1
             AND user_id = ?1
             AND bootstrap_status = 'PENDING'
         )`
      ).bind(
        BOOTSTRAP_USER_ID,
        credentialId,
        setup.bootstrapTokenId,
        now
      ),

      db.prepare(
        `UPDATE users
         SET account_status = 'ACTIVE',
             updated_at = ?1
         WHERE user_id = ?2
           AND full_name = ?3
           AND lower(email) = ?4
           AND account_status = 'DISABLED'
           AND EXISTS (
             SELECT 1
             FROM user_credentials
             WHERE user_id = ?2
               AND credential_id = ?5
               AND credential_type = 'PASSWORD'
               AND revoked_at IS NULL
           )
           AND EXISTS (
             SELECT 1
             FROM user_roles
             WHERE user_id = ?2
               AND role_id = 'role-super-admin'
           )
           AND EXISTS (
             SELECT 1
             FROM super_admin_bootstrap_tokens
             WHERE bootstrap_token_id = ?6
               AND user_id = ?2
               AND consumed_at = ?1
               AND invalidated_at IS NULL
           )`
      ).bind(
        now,
        BOOTSTRAP_USER_ID,
        BOOTSTRAP_USER_NAME,
        BOOTSTRAP_USER_EMAIL,
        credentialId,
        setup.bootstrapTokenId
      ),

      db.prepare(
        `INSERT INTO audit_logs (
           audit_id,
           actor_user_id,
           action,
           entity_type,
           entity_id,
           before_json,
           after_json,
           reason,
           created_at
         )
         SELECT
           ?1,
           ?2,
           'SUPER_ADMIN_BOOTSTRAP',
           'USER',
           ?2,
           ?3,
           ?4,
           ?5,
           ?6
         WHERE EXISTS (
           SELECT 1
           FROM users
           WHERE user_id = ?2
             AND account_status = 'ACTIVE'
         )
         AND EXISTS (
           SELECT 1
           FROM user_roles
           WHERE user_id = ?2
             AND role_id = 'role-super-admin'
         )
         AND EXISTS (
           SELECT 1
           FROM user_credentials
           WHERE user_id = ?2
             AND credential_id = ?7
             AND credential_type = 'PASSWORD'
             AND revoked_at IS NULL
         )
         AND EXISTS (
           SELECT 1
           FROM super_admin_bootstrap_tokens
           WHERE bootstrap_token_id = ?8
             AND user_id = ?2
             AND consumed_at = ?6
             AND invalidated_at IS NULL
         )`
      ).bind(
        crypto.randomUUID(),
        BOOTSTRAP_USER_ID,
        JSON.stringify({
          accountStatus: "DISABLED",
          role: null
        }),
        JSON.stringify({
          accountStatus: "ACTIVE",
          role: "SUPER_ADMIN"
        }),
        "Initial SUPER_ADMIN bootstrap completed.",
        now,
        credentialId,
        setup.bootstrapTokenId
      ),

      db.prepare(
        `UPDATE super_admin_bootstrap_state
         SET bootstrap_status = 'COMPLETE',
             completed_at = ?1,
             updated_at = ?1
         WHERE bootstrap_id = 1
           AND user_id = ?2
           AND bootstrap_status = 'PENDING'`
      ).bind(
        now,
        BOOTSTRAP_USER_ID
      )
    ]);

    const expectedChanges = [1, 1, 1, 1, 1, 1];

    for (let i = 0; i < expectedChanges.length; i++) {
      if ((results?.[i]?.meta?.changes ?? 0) !== expectedChanges[i]) {
        throw httpError(
          "Super Admin bootstrap could not be completed.",
          409
        );
      }
    }
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    if (isUniqueConstraintError(error)) {
      throw httpError(
        "Super Admin bootstrap token is invalid, expired or already used.",
        409
      );
    }

    throw error;
  }

  return {
    passwordSet: true,
    userId: BOOTSTRAP_USER_ID,
    credentialId,
    credentialType: "PASSWORD",
    accountStatus: "ACTIVE",
    registrationStatus: null,
    accessLevel: "FULL",
    nextStep: "LOGIN_FULL_ACCESS"
  };
}


async function completeAdminAssistedRecovery({
  db,
  env,
  setupToken,
  password
}) {
  const setup = await findValidAdminAssistedRecoveryToken({
    db,
    env,
    token: setupToken
  });

  const passwordHash = await hashPassword(password);
  const credentialId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();

  const eligible = `
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE u.user_id = ?3
        AND u.account_status = 'DISABLED'
        AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
        AND r.admin_assisted_recovery_at IS NOT NULL
        AND r.admin_assisted_recovery_by IS NOT NULL
        AND r.admin_assisted_recovery_method IS NOT NULL
    )
    AND EXISTS (
      SELECT 1
      FROM user_auth_identities i
      WHERE i.user_id = ?3
        AND i.identity_type = 'EMAIL'
        AND i.identity_scope = 'GLOBAL'
        AND i.verification_status = 'PENDING'
        AND i.verified_at IS NULL
    )
    AND (
      SELECT COUNT(*)
      FROM user_registration_identity_details
      WHERE user_id = ?3
        AND identity_type = 'NATIONAL_ID'
        AND identity_status = 'UNVERIFIED'
    ) = 1
    AND (
      SELECT COUNT(*)
      FROM user_registration_identity_details
      WHERE user_id = ?3
        AND identity_type = 'WHATSAPP'
        AND identity_status = 'UNVERIFIED'
    ) = 1
    AND NOT EXISTS (
      SELECT 1
      FROM user_credentials
      WHERE user_id = ?3
        AND credential_type = 'PASSWORD'
        AND revoked_at IS NULL
    )
  `;

  const results = await db.batch([
    db.prepare(
      `UPDATE admin_assisted_recovery_tokens
       SET consumed_at = ?1
       WHERE recovery_token_id = ?2
         AND user_id = ?3
         AND consumed_at IS NULL
         AND invalidated_at IS NULL
         AND expires_at > ?1
         AND ${eligible}`
    ).bind(
      now,
      setup.recoveryTokenId,
      setup.userId
    ),

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
         ?1, ?2, 'PASSWORD',
         CASE
           WHEN EXISTS (
             SELECT 1
             FROM admin_assisted_recovery_tokens
             WHERE recovery_token_id = ?3
               AND user_id = ?2
               AND consumed_at = ?4
               AND invalidated_at IS NULL
           )
           AND EXISTS (
             SELECT 1
             FROM users
             WHERE user_id = ?2
               AND account_status = 'DISABLED'
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
         ?4, ?4`
    ).bind(
      credentialId,
      setup.userId,
      setup.recoveryTokenId,
      now,
      passwordHash
    ),

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
         ?1, ?2, NULL,
         'PASSWORD_SETUP',
         'SUCCESS',
         ?3, ?4
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
         FROM admin_assisted_recovery_tokens
         WHERE recovery_token_id = ?6
           AND user_id = ?2
           AND consumed_at = ?4
       )`
    ).bind(
      eventId,
      setup.userId,
      JSON.stringify({
        setupMethod: "ADMIN_ASSISTED_RECOVERY",
        emailVerification: "PENDING",
        credentialType: "PASSWORD",
        accountActivated: false
      }),
      now,
      credentialId,
      setup.recoveryTokenId
    )
  ]);

  if (
    (results?.[0]?.meta?.changes ?? 0) !== 1 ||
    (results?.[1]?.meta?.changes ?? 0) !== 1 ||
    (results?.[2]?.meta?.changes ?? 0) !== 1
  ) {
    throw httpError(
      "Password setup could not be completed. The recovery token may be invalid, expired or already used.",
      409
    );
  }

  return {
    passwordSet: true,
    userId: setup.userId,
    credentialId,
    credentialType: "PASSWORD",
    accountStatus: "DISABLED",
    registrationStatus: "AWAITING_EMAIL_VERIFICATION",
    accessLevel: "LIMITED",
    nextStep: "LOGIN_LIMITED_ACCESS"
  };
}


/**
 * Set the initial password after email verification.
 *
 * Supports normal registration and the separate one-time
 * SUPER_ADMIN bootstrap lifecycle.
 */
export async function setInitialPassword({
  db,
  env,
  setupToken,
  password
}) {
  validatePassword(password);

  let bootstrapSetup = null;

  try {
    bootstrapSetup = await findValidSuperAdminBootstrapToken({
      db,
      env,
      token: setupToken
    });
  } catch (error) {
    if (error?.status !== 400) {
      throw error;
    }
  }

  if (bootstrapSetup) {
    return completeSuperAdminBootstrap({
      db,
      env,
      setupToken,
      password
    });
  }

    let recoverySetup = null;

  try {
    recoverySetup = await findValidAdminAssistedRecoveryToken({
      db,
      env,
      token: setupToken
    });
  } catch (error) {
    if (error?.status !== 400) {
      throw error;
    }
  }

  if (recoverySetup) {
    return completeAdminAssistedRecovery({
      db,
      env,
      setupToken,
      password
    });
  }

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

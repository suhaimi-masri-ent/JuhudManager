
/*
 * Existing profile write eligibility rules.
 *
 * FULL:
 * - Account must be ACTIVE.
 *
 * LIMITED:
 * - Account must be DISABLED.
 * - Registration must be awaiting email verification
 *   or pending review.
 * - Admin-assisted recovery metadata must exist.
 * - Email identity must match the relevant verification state.
 * - Active password credential must exist.
 * - Exactly one unverified National ID and WhatsApp
 *   identity detail must exist.
 *
 * Do not simplify these checks without a separate
 * security and business-rule review.
 */

export function getWriteEligibilitySql(
  userIdParameter,
  accessLevel
) {
  if (accessLevel === "FULL") {
    return `
      EXISTS (
        SELECT 1
        FROM users u
        WHERE u.user_id = ${userIdParameter}
          AND u.account_status = 'ACTIVE'
      )
    `;
  }

  return `
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE u.user_id = ${userIdParameter}
        AND u.account_status = 'DISABLED'
        AND r.registration_status IN (
          'AWAITING_EMAIL_VERIFICATION',
          'PENDING_REVIEW'
        )
        AND r.admin_assisted_recovery_at IS NOT NULL
        AND r.admin_assisted_recovery_by IS NOT NULL
        AND r.admin_assisted_recovery_method IS NOT NULL

        AND EXISTS (
          SELECT 1
          FROM user_auth_identities i
          WHERE i.user_id = u.user_id
            AND i.identity_type = 'EMAIL'
            AND i.identity_scope = 'GLOBAL'
            AND (
              (
                r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
                AND i.verification_status = 'PENDING'
                AND i.verified_at IS NULL
              )
              OR
              (
                r.registration_status = 'PENDING_REVIEW'
                AND i.verification_status = 'VERIFIED'
                AND i.verified_at IS NOT NULL
                AND i.expires_at IS NULL
              )
            )
        )

        AND EXISTS (
          SELECT 1
          FROM user_credentials c
          WHERE c.user_id = u.user_id
            AND c.credential_type = 'PASSWORD'
            AND c.revoked_at IS NULL
        )

        AND (
          SELECT COUNT(*)
          FROM user_registration_identity_details n
          WHERE n.user_id = u.user_id
            AND n.identity_type = 'NATIONAL_ID'
            AND n.identity_status = 'UNVERIFIED'
        ) = 1

        AND (
          SELECT COUNT(*)
          FROM user_registration_identity_details w
          WHERE w.user_id = u.user_id
            AND w.identity_type = 'WHATSAPP'
            AND w.identity_status = 'UNVERIFIED'
        ) = 1
    )
  `;
}


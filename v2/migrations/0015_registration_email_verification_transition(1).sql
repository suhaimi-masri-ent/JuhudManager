PRAGMA foreign_keys = ON;

DROP TRIGGER IF EXISTS trg_registration_review_transition_guard;

CREATE TRIGGER trg_registration_review_transition_guard
BEFORE UPDATE OF registration_status
ON user_registration_reviews
WHEN NEW.registration_status <> OLD.registration_status
BEGIN
  SELECT CASE
    WHEN OLD.registration_status = 'AWAITING_EMAIL_VERIFICATION'
      AND NEW.registration_status = 'PENDING_REVIEW'
      AND (
        NEW.reviewed_by IS NOT NULL
        OR NEW.reviewed_at IS NOT NULL
        OR NEW.rejection_reason IS NOT NULL
        OR NEW.cancellation_reason IS NOT NULL
        OR NOT EXISTS (
          SELECT 1
          FROM users u
          WHERE u.user_id = NEW.user_id
            AND u.account_status = 'DISABLED'
            AND u.email IS NOT NULL
        )
        OR NOT EXISTS (
          SELECT 1
          FROM user_auth_identities i
          WHERE i.user_id = NEW.user_id
            AND i.identity_type = 'EMAIL'
            AND i.identity_scope = 'GLOBAL'
            AND i.verification_status = 'VERIFIED'
            AND i.verified_at IS NOT NULL
            AND i.expires_at IS NULL
        )
      )
    THEN RAISE(
      ABORT,
      'Email verification must be completed before registration review.'
    )
  END;

  SELECT CASE
    WHEN OLD.registration_status = 'PENDING_REVIEW'
      AND NEW.registration_status IN ('APPROVED', 'REJECTED')
    THEN NULL
    WHEN OLD.registration_status = 'AWAITING_EMAIL_VERIFICATION'
      AND NEW.registration_status = 'PENDING_REVIEW'
    THEN NULL
    ELSE RAISE(
      ABORT,
      'Invalid registration status transition.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status IN ('APPROVED', 'REJECTED')
      AND (
        NEW.reviewed_by IS NULL
        OR NEW.reviewed_at IS NULL
      )
    THEN RAISE(
      ABORT,
      'Reviewer identity and review timestamp are required.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status IN ('APPROVED', 'REJECTED')
      AND NOT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r
          ON r.role_id = ur.role_id
        WHERE ur.user_id = NEW.reviewed_by
          AND r.role_code IN ('ADMIN', 'SUPER_ADMIN')
      )
    THEN RAISE(
      ABORT,
      'Only Admin or Super Admin can review registrations.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status IN ('APPROVED', 'REJECTED')
      AND NOT EXISTS (
        SELECT 1
        FROM users u
        WHERE u.user_id = NEW.user_id
          AND u.account_status = 'DISABLED'
      )
    THEN RAISE(
      ABORT,
      'Registration account must remain disabled before review.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'REJECTED'
      AND (
        NEW.rejection_reason IS NULL
        OR length(trim(NEW.rejection_reason)) = 0
      )
    THEN RAISE(
      ABORT,
      'Rejection reason is required.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'APPROVED'
      AND NEW.rejection_reason IS NOT NULL
    THEN RAISE(
      ABORT,
      'Approved registration cannot have a rejection reason.'
    )
  END;
END;


PRAGMA foreign_keys = ON;

DROP TRIGGER IF EXISTS trg_registration_review_transition_guard;

CREATE TRIGGER trg_registration_review_transition_guard
BEFORE UPDATE OF registration_status
ON user_registration_reviews
WHEN NEW.registration_status <> OLD.registration_status
BEGIN
  SELECT CASE
    WHEN NOT (
      (
        OLD.registration_status = 'PENDING_REVIEW'
        AND NEW.registration_status IN ('APPROVED', 'REJECTED')
      )
      OR
      (
        OLD.registration_status = 'AWAITING_EMAIL_VERIFICATION'
        AND NEW.registration_status = 'CANCELLED'
      )
    )
    THEN RAISE(ABORT, 'Invalid registration status transition.')
  END;

  SELECT CASE
    WHEN NEW.reviewed_by IS NULL OR NEW.reviewed_at IS NULL
    THEN RAISE(ABORT, 'Reviewer identity and timestamp are required.')
  END;

  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = NEW.reviewed_by
        AND r.role_code = 'SUPER_ADMIN'
    )
    THEN RAISE(ABORT, 'Only Super Admin can process registrations.')
  END;

  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM users u
      WHERE u.user_id = NEW.user_id
        AND u.account_status = 'DISABLED'
    )
    THEN RAISE(ABORT, 'Registration account must remain disabled.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'REJECTED'
      AND (
        NEW.rejection_reason IS NULL
        OR length(trim(NEW.rejection_reason)) = 0
      )
    THEN RAISE(ABORT, 'Rejection reason is required.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'APPROVED'
      AND NEW.rejection_reason IS NOT NULL
    THEN RAISE(ABORT, 'Approved registration cannot have a rejection reason.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND (
        NEW.cancellation_reason IS NULL
        OR length(trim(NEW.cancellation_reason)) = 0
      )
    THEN RAISE(ABORT, 'Cancellation reason is required.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM users u
        WHERE u.user_id = NEW.user_id
          AND u.email IS NOT NULL
          AND length(trim(u.email)) > 0
      )
    THEN RAISE(ABORT, 'Registration email must be empty.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM user_registration_identity_details
        WHERE user_id = NEW.user_id
      )
    THEN RAISE(ABORT, 'Registration identity records must be empty.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM user_auth_identities
        WHERE user_id = NEW.user_id
      )
    THEN RAISE(ABORT, 'Authentication identity records must be empty.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM auth_otp_requests
        WHERE user_id = NEW.user_id
      )
    THEN RAISE(ABORT, 'OTP records must be empty.')
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM user_credentials
        WHERE user_id = NEW.user_id
      )
    THEN RAISE(ABORT, 'Credential records must be empty.')
  END;
END;

CREATE TRIGGER trg_registration_cancellation_audit
AFTER UPDATE OF registration_status
ON user_registration_reviews
WHEN OLD.registration_status = 'AWAITING_EMAIL_VERIFICATION'
 AND NEW.registration_status = 'CANCELLED'
BEGIN
  INSERT INTO audit_logs (
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
  VALUES (
    lower(hex(randomblob(16))),
    NEW.reviewed_by,
    'REGISTRATION_CANCELLED',
    'USER_REGISTRATION',
    NEW.user_id,
    json_object(
      'registration_status', OLD.registration_status,
      'account_status', 'DISABLED'
    ),
    json_object(
      'registration_status', NEW.registration_status,
      'account_status', 'DISABLED',
      'cancelled_by', NEW.reviewed_by,
      'cancelled_at', NEW.reviewed_at
    ),
    NEW.cancellation_reason,
    NEW.reviewed_at
  );
END;

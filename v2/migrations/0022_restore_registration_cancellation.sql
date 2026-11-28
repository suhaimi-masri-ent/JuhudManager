
PRAGMA foreign_keys = ON;

DROP TRIGGER IF EXISTS trg_registration_review_transition_guard;

CREATE TRIGGER trg_registration_review_transition_guard
BEFORE UPDATE OF registration_status
ON user_registration_reviews
WHEN NEW.registration_status <> OLD.registration_status
BEGIN
  -- Email verification must precede registration review.
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

  -- Only the three established transitions are permitted.
  SELECT CASE
    WHEN OLD.registration_status = 'PENDING_REVIEW'
      AND NEW.registration_status IN ('APPROVED', 'REJECTED')
    THEN NULL

    WHEN OLD.registration_status = 'AWAITING_EMAIL_VERIFICATION'
      AND NEW.registration_status = 'PENDING_REVIEW'
    THEN NULL

    WHEN OLD.registration_status = 'AWAITING_EMAIL_VERIFICATION'
      AND NEW.registration_status = 'CANCELLED'
    THEN NULL

    ELSE RAISE(
      ABORT,
      'Invalid registration status transition.'
    )
  END;

  -- Approval and rejection rules.
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
        JOIN roles r ON r.role_id = ur.role_id
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

  -- Cancellation requires a Super Admin reviewer.
  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND (
        NEW.reviewed_by IS NULL
        OR NEW.reviewed_at IS NULL
      )
    THEN RAISE(
      ABORT,
      'Cancellation reviewer and timestamp are required.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND NOT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.role_id = ur.role_id
        WHERE ur.user_id = NEW.reviewed_by
          AND r.role_code = 'SUPER_ADMIN'
      )
    THEN RAISE(
      ABORT,
      'Only Super Admin can cancel registrations.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND (
        NEW.cancellation_reason IS NULL
        OR length(trim(NEW.cancellation_reason)) = 0
      )
    THEN RAISE(
      ABORT,
      'Cancellation reason is required.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND NOT EXISTS (
        SELECT 1
        FROM users u
        WHERE u.user_id = NEW.user_id
          AND u.account_status = 'DISABLED'
          AND (
            u.email IS NULL
            OR length(trim(u.email)) = 0
          )
      )
    THEN RAISE(
      ABORT,
      'Registration account must be disabled and email must be empty.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM user_registration_identity_details
        WHERE user_id = NEW.user_id
          AND identity_status IN ('UNVERIFIED', 'VERIFIED')
      )
    THEN RAISE(
      ABORT,
      'Active registration identity claims must be revoked first.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM user_auth_identities
        WHERE user_id = NEW.user_id
          AND verification_status IN ('PENDING', 'VERIFIED')
      )
    THEN RAISE(
      ABORT,
      'Pending or verified authentication identities must be resolved first.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM auth_otp_requests
        WHERE user_id = NEW.user_id
          AND consumed_at IS NULL
          AND invalidated_at IS NULL
      )
    THEN RAISE(
      ABORT,
      'Active OTP requests must be invalidated first.'
    )
  END;

  SELECT CASE
    WHEN NEW.registration_status = 'CANCELLED'
      AND EXISTS (
        SELECT 1
        FROM user_credentials
        WHERE user_id = NEW.user_id
      )
    THEN RAISE(
      ABORT,
      'Registration credentials must not exist.'
    )
  END;
END;

DROP TRIGGER IF EXISTS trg_registration_cancellation_audit;

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

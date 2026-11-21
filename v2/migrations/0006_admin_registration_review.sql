
-- JuhudManager V2
-- Migration: 0006_admin_registration_review.sql
-- Requires: 0001_foundation.sql through 0005_registration_review.sql
--
-- Purpose:
-- 1. Enforce Admin-only registration approval/rejection.
-- 2. Apply account status automatically after review.
-- 3. Record registration decisions in audit_logs.
--
-- Apply only to the dedicated JuhudManager V2 D1 database.
-- Apply AFTER 0005_registration_review.sql.

PRAGMA foreign_keys = ON;

-- =========================================================
-- 1. REGISTRATION REVIEW TRANSITION GUARD
-- =========================================================

CREATE TRIGGER trg_registration_review_transition_guard
BEFORE UPDATE OF registration_status
ON user_registration_reviews
WHEN OLD.registration_status = 'PENDING_REVIEW'
 AND NEW.registration_status <> OLD.registration_status
BEGIN
  SELECT CASE
    WHEN NEW.registration_status NOT IN ('APPROVED', 'REJECTED')
    THEN RAISE(
      ABORT,
      'Invalid registration review transition.'
    )
  END;

  SELECT CASE
    WHEN NEW.reviewed_by IS NULL
      OR NEW.reviewed_at IS NULL
    THEN RAISE(
      ABORT,
      'Reviewer identity and review timestamp are required.'
    )
  END;

  SELECT CASE
    WHEN NOT EXISTS (
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
    WHEN NOT EXISTS (
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


-- =========================================================
-- 2. APPLY ACCOUNT STATUS
-- =========================================================

CREATE TRIGGER trg_registration_review_apply_account_status
AFTER UPDATE OF registration_status
ON user_registration_reviews
WHEN OLD.registration_status = 'PENDING_REVIEW'
 AND NEW.registration_status IN ('APPROVED', 'REJECTED')
BEGIN
  UPDATE users
  SET
    account_status = CASE
      WHEN NEW.registration_status = 'APPROVED'
        THEN 'ACTIVE'
      ELSE 'DISABLED'
    END,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE user_id = NEW.user_id;
END;


-- =========================================================
-- 3. REGISTRATION REVIEW AUDIT LOG
-- =========================================================

CREATE TRIGGER trg_registration_review_audit
AFTER UPDATE OF registration_status
ON user_registration_reviews
WHEN OLD.registration_status = 'PENDING_REVIEW'
 AND NEW.registration_status IN ('APPROVED', 'REJECTED')
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

    CASE
      WHEN NEW.registration_status = 'APPROVED'
        THEN 'REGISTRATION_APPROVED'
      ELSE 'REGISTRATION_REJECTED'
    END,

    'USER_REGISTRATION',
    NEW.user_id,

    json_object(
      'registration_status', OLD.registration_status,
      'account_status', 'DISABLED'
    ),

    json_object(
      'registration_status', NEW.registration_status,
      'account_status',
        CASE
          WHEN NEW.registration_status = 'APPROVED'
            THEN 'ACTIVE'
          ELSE 'DISABLED'
        END,
      'reviewed_by', NEW.reviewed_by,
      'reviewed_at', NEW.reviewed_at
    ),

    CASE
      WHEN NEW.registration_status = 'REJECTED'
        THEN NEW.rejection_reason
      ELSE NULL
    END,

    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;


-- =========================================================
-- 4. MIGRATION COMPLETE
-- =========================================================

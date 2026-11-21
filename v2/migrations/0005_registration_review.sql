
-- JuhudManager V2
-- Migration: 0005_registration_review.sql
-- Requires: 0001_foundation.sql and 0002_authentication.sql
--
-- Purpose:
-- 1. Separate registration approval from account status.
-- 2. Allow email-verified users to remain pending Admin review.
-- 3. Store National ID and WhatsApp as durable identity claims.
-- 4. Preserve rejected registrations for audit.
-- 5. Enforce atomic completion of registration email verification.
--
-- IMPORTANT:
-- Apply only to the dedicated JuhudManager V2 D1 database.

PRAGMA foreign_keys = ON;

-- =========================================================
-- 1. REGISTRATION REVIEW LIFECYCLE
-- =========================================================

CREATE TABLE user_registration_reviews (
  user_id TEXT PRIMARY KEY
    REFERENCES users(user_id),

  registration_status TEXT NOT NULL DEFAULT 'AWAITING_EMAIL_VERIFICATION'
    CHECK (registration_status IN (
      'AWAITING_EMAIL_VERIFICATION',
      'PENDING_REVIEW',
      'APPROVED',
      'REJECTED',
      'CANCELLED'
    )),

  reviewed_by TEXT REFERENCES users(user_id),
  reviewed_at TEXT,

  rejection_reason TEXT,
  cancellation_reason TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    (
      registration_status IN (
        'AWAITING_EMAIL_VERIFICATION',
        'PENDING_REVIEW'
      )
      AND reviewed_by IS NULL
      AND reviewed_at IS NULL
    )
    OR
    (
      registration_status IN (
        'APPROVED',
        'REJECTED',
        'CANCELLED'
      )
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
    )
  ),

  CHECK (
    (
      registration_status = 'REJECTED'
      AND rejection_reason IS NOT NULL
      AND length(trim(rejection_reason)) > 0
    )
    OR
    (
      registration_status <> 'REJECTED'
      AND rejection_reason IS NULL
    )
  ),

  CHECK (
    (
      registration_status = 'CANCELLED'
      AND cancellation_reason IS NOT NULL
      AND length(trim(cancellation_reason)) > 0
    )
    OR
    (
      registration_status <> 'CANCELLED'
      AND cancellation_reason IS NULL
    )
  )
);

CREATE INDEX idx_registration_reviews_status
  ON user_registration_reviews(
    registration_status,
    created_at
  );

CREATE INDEX idx_registration_reviews_reviewer
  ON user_registration_reviews(
    reviewed_by,
    reviewed_at
  );


-- =========================================================
-- 2. DURABLE REGISTRATION IDENTITY DETAILS
-- =========================================================

CREATE TABLE user_registration_identity_details (
  detail_id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL REFERENCES users(user_id),

  identity_type TEXT NOT NULL
    CHECK (identity_type IN (
      'NATIONAL_ID',
      'WHATSAPP'
    )),

  country_code TEXT,
  identity_scope TEXT NOT NULL,

  identity_hash TEXT NOT NULL,
  hash_key_version INTEGER NOT NULL
    CHECK (hash_key_version > 0),

  encrypted_value TEXT NOT NULL,

  identity_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (identity_status IN (
      'UNVERIFIED',
      'VERIFIED',
      'REVOKED'
    )),

  released_at TEXT,
  released_by TEXT REFERENCES users(user_id),
  release_reason TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (length(trim(identity_hash)) > 0),
  CHECK (length(trim(encrypted_value)) > 0),
  CHECK (length(trim(identity_scope)) > 0),

  CHECK (
    (
      identity_type = 'NATIONAL_ID'
      AND country_code IS NOT NULL
      AND country_code GLOB '[A-Z][A-Z]'
      AND identity_scope = country_code
    )
    OR
    (
      identity_type = 'WHATSAPP'
      AND country_code IS NULL
      AND identity_scope = 'GLOBAL'
    )
  ),

  CHECK (
    (
      identity_status = 'REVOKED'
      AND released_at IS NOT NULL
      AND released_by IS NOT NULL
      AND release_reason IS NOT NULL
      AND length(trim(release_reason)) > 0
    )
    OR
    (
      identity_status <> 'REVOKED'
      AND released_at IS NULL
      AND released_by IS NULL
      AND release_reason IS NULL
    )
  ),

  UNIQUE (detail_id, user_id)
);

-- An identity remains uniquely reserved while UNVERIFIED
-- or VERIFIED. REVOKED identities can be claimed again.
--
-- Unlike user_auth_identities, this table has no expiry
-- mechanism. Release requires an authorized Admin action.

CREATE UNIQUE INDEX uq_registration_identity_claim
  ON user_registration_identity_details(
    identity_type,
    identity_scope,
    identity_hash
  )
  WHERE identity_status IN (
    'UNVERIFIED',
    'VERIFIED'
  );

CREATE INDEX idx_registration_identity_user
  ON user_registration_identity_details(
    user_id,
    identity_status
  );

CREATE INDEX idx_registration_identity_type
  ON user_registration_identity_details(
    identity_type,
    identity_scope,
    identity_status
  );


-- =========================================================
-- 3. ATOMIC EMAIL OTP VERIFICATION GUARD
-- =========================================================
--
-- Application execution order inside one db.batch():
--   1. Verify pending email identity.
--   2. Store verified email on users.
--   3. Move registration to PENDING_REVIEW.
--   4. Consume OTP LAST.
--
-- This trigger rejects step 4 unless steps 1-3 have
-- successfully established the required final state.
--
-- RAISE(ABORT) aborts the SQL statement and rolls back
-- the complete transaction, including earlier batch writes.
--
-- IMPORTANT:
-- The application must update the OTP last and must target
-- the selected OTP request even if an earlier guarded update
-- changed zero rows. Do not consume the OTP first.

CREATE TRIGGER trg_registration_otp_completion_guard
BEFORE UPDATE OF consumed_at ON auth_otp_requests
WHEN OLD.consumed_at IS NULL
 AND NEW.consumed_at IS NOT NULL
BEGIN
  SELECT CASE
    WHEN NOT (
      NEW.otp_purpose = 'REGISTER'
      AND NEW.destination_type = 'EMAIL'
      AND NEW.user_id IS NOT NULL
      AND NEW.identity_id IS NOT NULL
      AND NEW.invalidated_at IS NULL
      AND NEW.expires_at > NEW.consumed_at
      AND NEW.attempt_count < NEW.max_attempts
      AND EXISTS (
        SELECT 1
        FROM user_auth_identities i
        WHERE i.identity_id = NEW.identity_id
          AND i.user_id = NEW.user_id
          AND i.identity_type = 'EMAIL'
          AND i.identity_scope = 'GLOBAL'
          AND i.verification_status = 'VERIFIED'
          AND i.verified_at IS NOT NULL
          AND i.expires_at IS NULL
      )
      AND EXISTS (
        SELECT 1
        FROM users u
        WHERE u.user_id = NEW.user_id
          AND u.email IS NOT NULL
          AND u.account_status = 'DISABLED'
      )
      AND EXISTS (
        SELECT 1
        FROM user_registration_reviews r
        WHERE r.user_id = NEW.user_id
          AND r.registration_status = 'PENDING_REVIEW'
          AND r.reviewed_by IS NULL
          AND r.reviewed_at IS NULL
      )
    )
    THEN RAISE(
      ABORT,
      'Registration OTP completion state is incomplete.'
    )
  END;
END;


-- =========================================================
-- 4. MIGRATION COMPLETE
-- =========================================================

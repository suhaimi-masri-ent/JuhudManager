
-- =========================================================
-- JUHUDMANAGER V2
-- Migration 0018: Email Change Schema Correction
-- =========================================================
-- Purpose:
-- Correct the email-change request table schema.
--
-- Important:
-- - Preserve the existing OTP table.
-- - Preserve the OTP table foreign keys.
-- - Do not recreate OTP indexes.
-- - Admin approval does not verify or apply the new email.
-- - Email is applied only after successful OTP verification.
-- =========================================================

-- Step 1: Create corrected replacement table.
CREATE TABLE user_email_change_requests_new (
  request_id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL
    REFERENCES users(user_id),

  requested_email_hash TEXT NOT NULL
    CHECK (length(trim(requested_email_hash)) > 0),

  requested_email_encrypted TEXT NOT NULL
    CHECK (length(trim(requested_email_encrypted)) > 0),

  hash_key_version INTEGER NOT NULL
    CHECK (hash_key_version > 0),

  request_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (request_status IN (
      'PENDING',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
      'SUPERSEDED'
    )),

  identity_check_method TEXT NOT NULL
    DEFAULT 'PASSWORD_NATIONAL_ID_WHATSAPP'
    CHECK (
      identity_check_method = 'PASSWORD_NATIONAL_ID_WHATSAPP'
    ),

  submitted_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  reviewed_by TEXT REFERENCES users(user_id),
  reviewed_at TEXT,
  review_reason TEXT,

  email_verified_at TEXT,
  applied_at TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    (
      request_status = 'PENDING'
      AND reviewed_by IS NULL
      AND reviewed_at IS NULL
      AND review_reason IS NULL
      AND email_verified_at IS NULL
      AND applied_at IS NULL
    )
    OR
    (
      request_status = 'APPROVED'
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
      AND review_reason IS NOT NULL
      AND length(trim(review_reason)) > 0
    )
    OR
    (
      request_status IN ('REJECTED', 'CANCELLED', 'SUPERSEDED')
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
      AND review_reason IS NOT NULL
      AND length(trim(review_reason)) > 0
      AND email_verified_at IS NULL
      AND applied_at IS NULL
    )
  ),

  CHECK (
    applied_at IS NULL
    OR email_verified_at IS NOT NULL
  ),

  UNIQUE (request_id, user_id)
);

-- Step 2: Copy existing request records.
-- email_verified_at is initially NULL because the old
-- schema did not contain this column.
INSERT INTO user_email_change_requests_new (
  request_id,
  user_id,
  requested_email_hash,
  requested_email_encrypted,
  hash_key_version,
  request_status,
  identity_check_method,
  submitted_at,
  reviewed_by,
  reviewed_at,
  review_reason,
  email_verified_at,
  applied_at,
  created_at,
  updated_at
)
SELECT
  request_id,
  user_id,
  requested_email_hash,
  requested_email_encrypted,
  hash_key_version,
  request_status,
  identity_check_method,
  submitted_at,
  reviewed_by,
  reviewed_at,
  review_reason,
  NULL,
  applied_at,
  created_at,
  updated_at
FROM user_email_change_requests;

-- Step 3: Drop the old parent table.
-- The OTP table is empty, as verified before this migration.
-- Its foreign key continues to reference the original name.
DROP TABLE user_email_change_requests;

-- Step 4: Restore the original table name.
ALTER TABLE user_email_change_requests_new
RENAME TO user_email_change_requests;

-- Step 5: Recreate request-table indexes.
CREATE UNIQUE INDEX uq_user_email_change_pending
ON user_email_change_requests(user_id)
WHERE request_status = 'PENDING';

CREATE UNIQUE INDEX uq_user_email_change_pending_address
ON user_email_change_requests(requested_email_hash)
WHERE request_status = 'PENDING';

CREATE INDEX idx_user_email_change_status
ON user_email_change_requests(request_status, submitted_at);

CREATE INDEX idx_user_email_change_user
ON user_email_change_requests(user_id, submitted_at);

CREATE INDEX idx_user_email_change_reviewer
ON user_email_change_requests(reviewed_by, reviewed_at);

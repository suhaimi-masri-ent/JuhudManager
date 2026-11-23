
-- JuhudManager V2
-- Migration: 0013_admin_assisted_registration_recovery.sql
-- Purpose: SUPER_ADMIN-assisted recovery for incomplete registrations.
-- Requires migrations 0001-0012.
--
-- IMPORTANT:
-- Apply only to the dedicated JuhudManager V2 D1 database.
-- This migration does not modify any existing account.

PRAGMA foreign_keys = ON;

-- 1. Record the administrator-assisted recovery decision.
ALTER TABLE user_registration_reviews
ADD COLUMN admin_assisted_recovery_at TEXT;

ALTER TABLE user_registration_reviews
ADD COLUMN admin_assisted_recovery_by TEXT
REFERENCES users(user_id);

ALTER TABLE user_registration_reviews
ADD COLUMN admin_assisted_recovery_method TEXT
CHECK (
  admin_assisted_recovery_method IS NULL
  OR admin_assisted_recovery_method IN (
    'ORIGINAL_DOCUMENT_CHECK',
    'DIRECT_CONTACT',
    'OTHER'
  )
);

ALTER TABLE user_registration_reviews
ADD COLUMN admin_assisted_recovery_reason TEXT;

-- 2. Separate one-time recovery password setup tokens.
-- Raw tokens are never stored in this table.
CREATE TABLE admin_assisted_recovery_tokens (
  recovery_token_id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL
    REFERENCES users(user_id),

  token_hash TEXT NOT NULL
    CHECK (length(trim(token_hash)) > 0),

  hash_key_version INTEGER NOT NULL
    CHECK (hash_key_version > 0),

  expires_at TEXT NOT NULL,

  created_by TEXT NOT NULL
    REFERENCES users(user_id),

  consumed_at TEXT,
  invalidated_at TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    consumed_at IS NULL
    OR invalidated_at IS NULL
  )
);

-- Only one active recovery token per account.
CREATE UNIQUE INDEX uq_admin_recovery_token_active
ON admin_assisted_recovery_tokens(user_id)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

-- Token hashes must be unique.
CREATE UNIQUE INDEX uq_admin_recovery_token_hash
ON admin_assisted_recovery_tokens(token_hash);

CREATE INDEX idx_admin_recovery_token_expiry
ON admin_assisted_recovery_tokens(expires_at)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

CREATE INDEX idx_admin_recovery_token_user
ON admin_assisted_recovery_tokens(user_id, created_at);

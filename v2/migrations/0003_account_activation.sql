
-- JuhudManager V2 - Account Activation Tokens
-- Migration: 0003_account_activation.sql
-- Requires: 0001_foundation.sql and 0002_authentication.sql
-- Database: Dedicated JuhudManager V2 D1 only
--
-- Application responsibilities:
-- - Generate cryptographically secure activation tokens.
-- - Store only HMAC hashes of activation tokens.
-- - Enforce 15-minute token expiry in application logic.
-- - Consume each token once only.
-- - Invalidate previous unused tokens before issuing a replacement.
--
-- IMPORTANT:
-- Apply this migration to JuhudManager V2 D1 only.
-- Do not rerun migrations 0001 or 0002.

PRAGMA foreign_keys = ON;

CREATE TABLE user_activation_tokens (
  activation_token_id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL
    REFERENCES users(user_id),

  token_hash TEXT NOT NULL
    CHECK (length(trim(token_hash)) > 0),

  hash_key_version INTEGER NOT NULL
    CHECK (hash_key_version > 0),

  expires_at TEXT NOT NULL,

  consumed_at TEXT,
  invalidated_at TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    consumed_at IS NULL
    OR invalidated_at IS NULL
  )
);

-- Only one unused activation token per account.
CREATE UNIQUE INDEX uq_user_activation_token_active
  ON user_activation_tokens(user_id)
  WHERE consumed_at IS NULL
    AND invalidated_at IS NULL;

-- Token hash must never be duplicated.
CREATE UNIQUE INDEX uq_user_activation_token_hash
  ON user_activation_tokens(token_hash);

CREATE INDEX idx_user_activation_token_expiry
  ON user_activation_tokens(expires_at)
  WHERE consumed_at IS NULL
    AND invalidated_at IS NULL;

CREATE INDEX idx_user_activation_token_user
  ON user_activation_tokens(user_id, created_at);

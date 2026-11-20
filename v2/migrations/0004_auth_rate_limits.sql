
-- JuhudManager V2 - Authentication Rate Limits
-- Migration: 0004_auth_rate_limits.sql
-- Requires: 0001_foundation.sql, 0002_authentication.sql,
--           0003_account_activation.sql
-- Database: Dedicated JuhudManager V2 D1 only
--
-- Purpose:
-- - Store hashed client identifiers, never raw IP addresses.
-- - Support per-IP limits by endpoint scope and time window.
-- - Support atomic request counter updates in application logic.
-- - Allow expired rate-limit records to be cleaned up.
--
-- IMPORTANT:
-- Apply this migration to JuhudManager V2 D1 only.
-- Do not rerun migrations 0001, 0002 or 0003.

PRAGMA foreign_keys = ON;

-- =========================================================
-- 1. AUTH RATE LIMIT BUCKETS
-- =========================================================

CREATE TABLE auth_rate_limits (
  rate_limit_id TEXT PRIMARY KEY,

  rate_limit_scope TEXT NOT NULL
    CHECK (length(trim(rate_limit_scope)) > 0),

  window_started_at TEXT NOT NULL,

  request_count INTEGER NOT NULL DEFAULT 0
    CHECK (request_count >= 0),

  expires_at TEXT NOT NULL,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  UNIQUE (
    rate_limit_scope,
    rate_limit_id,
    window_started_at
  )
);

-- Find active rate-limit bucket for a client and scope.
CREATE INDEX idx_auth_rate_limits_lookup
  ON auth_rate_limits(
    rate_limit_scope,
    rate_limit_id,
    window_started_at
  );

-- Find expired buckets for periodic cleanup.
CREATE INDEX idx_auth_rate_limits_expiry
  ON auth_rate_limits(expires_at);

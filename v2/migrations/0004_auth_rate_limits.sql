
-- JuhudManager V2 - Authentication Rate Limits
-- Migration: 0004_auth_rate_limits.sql
-- Requires: 0001, 0002 and 0003
-- Database: Dedicated JuhudManager V2 D1 only

PRAGMA foreign_keys = ON;

CREATE TABLE auth_rate_limits (
  rate_limit_scope TEXT NOT NULL
    CHECK (length(trim(rate_limit_scope)) > 0),

  -- HMAC hash of the client identifier; never store raw IP.
  rate_limit_id TEXT NOT NULL
    CHECK (length(trim(rate_limit_id)) > 0),

  window_started_at TEXT NOT NULL,

  request_count INTEGER NOT NULL DEFAULT 0
    CHECK (request_count >= 0),

  expires_at TEXT NOT NULL,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  PRIMARY KEY (
    rate_limit_scope,
    rate_limit_id,
    window_started_at
  )
);

CREATE INDEX idx_auth_rate_limits_expiry
  ON auth_rate_limits(expires_at);

CREATE INDEX idx_auth_rate_limits_client
  ON auth_rate_limits(rate_limit_id, rate_limit_scope);

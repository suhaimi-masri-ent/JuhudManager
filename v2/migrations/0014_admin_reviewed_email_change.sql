-- JuhudManager V2
-- Migration: 0014_admin_reviewed_email_change.sql
-- Requires migrations 0001-0013.
--
-- Purpose:
-- 1. Store authenticated user requests to change their email address.
-- 2. Keep the requested address encrypted and searchable by HMAC hash.
-- 3. Require explicit SUPER_ADMIN approval before changing the primary email.
-- 4. Preserve decision metadata and prevent multiple pending requests per user.
--
-- IMPORTANT:
-- Apply only to the dedicated JuhudManager V2 D1 database.
-- This migration does NOT verify an email address through OTP.
-- Approval is recorded as ADMIN_MANUAL identity verification.

PRAGMA foreign_keys = ON;

CREATE TABLE user_email_change_requests (
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

  identity_check_method TEXT NOT NULL DEFAULT 'PASSWORD_NATIONAL_ID_WHATSAPP'
    CHECK (
      identity_check_method = 'PASSWORD_NATIONAL_ID_WHATSAPP'
    ),

  submitted_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  reviewed_by TEXT REFERENCES users(user_id),
  reviewed_at TEXT,
  review_reason TEXT,

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
      AND applied_at IS NULL
    )
    OR
    (
      request_status = 'APPROVED'
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
      AND review_reason IS NOT NULL
      AND length(trim(review_reason)) > 0
      AND applied_at IS NOT NULL
    )
    OR
    (
      request_status IN ('REJECTED', 'CANCELLED', 'SUPERSEDED')
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
      AND review_reason IS NOT NULL
      AND length(trim(review_reason)) > 0
      AND applied_at IS NULL
    )
  ),

  UNIQUE (request_id, user_id)
);

-- One pending email-change request per account.
CREATE UNIQUE INDEX uq_user_email_change_pending
  ON user_email_change_requests(user_id)
  WHERE request_status = 'PENDING';

-- Prevent two accounts from having pending requests for the same address.
CREATE UNIQUE INDEX uq_user_email_change_pending_address
  ON user_email_change_requests(requested_email_hash)
  WHERE request_status = 'PENDING';

CREATE INDEX idx_user_email_change_status
  ON user_email_change_requests(request_status, submitted_at);

CREATE INDEX idx_user_email_change_user
  ON user_email_change_requests(user_id, submitted_at);

CREATE INDEX idx_user_email_change_reviewer
  ON user_email_change_requests(reviewed_by, reviewed_at);

-- Migration complete.

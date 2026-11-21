
-- JuhudManager V2
-- Migration: 0005_registration_review.sql
-- Requires: 0001_foundation.sql and 0002_authentication.sql
--
-- Purpose:
-- 1. Separate registration approval from account status.
-- 2. Allow email-verified users to remain pending Admin review.
-- 3. Store National ID and WhatsApp as durable identity claims.
-- 4. Preserve rejected registrations for audit.
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
-- 3. MIGRATION COMPLETE
-- =========================================================


-- JuhudManager V2 - Authentication and User Registration
-- Migration: 0002_authentication.sql
-- Requires: 0001_foundation.sql
-- Database: Dedicated JuhudManager V2 D1 only
--
-- Application responsibilities:
-- - Expire PENDING identities after 15 minutes before reuse.
-- - Enforce OTP expiry, attempt limits, resend cooldown and replacement.
-- - Enforce password policy, Argon2id hashing and session timeouts.
-- - Keep auth_events append-only through normal application operations.
-- - Apply the 24-month auth event retention policy through a controlled process.

PRAGMA foreign_keys = ON;

-- =========================================================
-- 1. USER AUTH IDENTITIES
-- =========================================================

CREATE TABLE user_auth_identities (
  identity_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),

  identity_type TEXT NOT NULL
    CHECK (identity_type IN (
      'NATIONAL_ID',
      'EMAIL',
      'WHATSAPP',
      'PASSPORT'
    )),

  country_code TEXT,
  identity_scope TEXT NOT NULL,
  identity_hash TEXT NOT NULL,

  hash_key_version INTEGER NOT NULL
    CHECK (hash_key_version > 0),

  encrypted_value TEXT NOT NULL,

  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN (
      'PENDING',
      'VERIFIED',
      'EXPIRED',
      'REVOKED'
    )),

  expires_at TEXT,
  verified_at TEXT,
  revoked_at TEXT,
  revoked_by TEXT REFERENCES users(user_id),

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    (
      identity_type IN ('NATIONAL_ID','PASSPORT')
      AND country_code IS NOT NULL
      AND length(country_code) = 2
      AND identity_scope = country_code
    )
    OR
    (
      identity_type IN ('EMAIL','WHATSAPP')
      AND country_code IS NULL
      AND identity_scope = 'GLOBAL'
    )
  ),

  CHECK (
    verification_status <> 'PENDING'
    OR expires_at IS NOT NULL
  ),

  CHECK (
    verification_status <> 'VERIFIED'
    OR verified_at IS NOT NULL
  ),

  CHECK (
    verification_status <> 'REVOKED'
    OR revoked_at IS NOT NULL
  )
);

-- PENDING and VERIFIED identities are uniquely reserved.
-- API must mark expired PENDING rows as EXPIRED before reuse.
CREATE UNIQUE INDEX uq_auth_identity_active
  ON user_auth_identities(
    identity_type,
    identity_scope,
    identity_hash
  )
  WHERE verification_status IN ('PENDING','VERIFIED');

CREATE INDEX idx_auth_identity_user
  ON user_auth_identities(user_id, verification_status);

CREATE INDEX idx_auth_identity_expiry
  ON user_auth_identities(expires_at)
  WHERE verification_status = 'PENDING';


-- =========================================================
-- 2. USER CREDENTIALS
-- =========================================================

CREATE TABLE user_credentials (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),

  credential_type TEXT NOT NULL
    CHECK (credential_type = 'PASSWORD'),

  password_hash TEXT NOT NULL,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  updated_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  changed_at TEXT,
  revoked_at TEXT
);

-- One active password credential per user.
CREATE UNIQUE INDEX uq_user_active_password
  ON user_credentials(user_id, credential_type)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_user_credentials_user
  ON user_credentials(user_id);


-- =========================================================
-- 3. AUTH OTP REQUESTS
-- =========================================================

CREATE TABLE auth_otp_requests (
  otp_request_id TEXT PRIMARY KEY,

  user_id TEXT REFERENCES users(user_id),

  identity_id TEXT
    REFERENCES user_auth_identities(identity_id),

  otp_purpose TEXT NOT NULL
    CHECK (otp_purpose IN (
      'REGISTER',
      'LOGIN',
      'VERIFY_IDENTITY',
      'RESET_PASSWORD'
    )),

  destination_type TEXT NOT NULL
    CHECK (destination_type IN ('EMAIL','WHATSAPP')),

  destination_hash TEXT NOT NULL,
  destination_encrypted TEXT NOT NULL,

  destination_hash_key_version INTEGER NOT NULL
    CHECK (destination_hash_key_version > 0),

  otp_hash TEXT NOT NULL,

  otp_hash_key_version INTEGER NOT NULL
    CHECK (otp_hash_key_version > 0),

  expires_at TEXT NOT NULL,

  attempt_count INTEGER NOT NULL DEFAULT 0
    CHECK (attempt_count >= 0),

  max_attempts INTEGER NOT NULL DEFAULT 5
    CHECK (max_attempts > 0),

  last_sent_at TEXT NOT NULL,
  consumed_at TEXT,
  invalidated_at TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    identity_id IS NOT NULL
    OR otp_purpose = 'REGISTER'
  ),

  CHECK (attempt_count <= max_attempts)
);

CREATE INDEX idx_auth_otp_user
  ON auth_otp_requests(user_id, created_at);

CREATE INDEX idx_auth_otp_identity
  ON auth_otp_requests(identity_id, created_at);

CREATE INDEX idx_auth_otp_destination
  ON auth_otp_requests(destination_type, destination_hash);

CREATE INDEX idx_auth_otp_expiry
  ON auth_otp_requests(expires_at)
  WHERE consumed_at IS NULL
    AND invalidated_at IS NULL;


-- =========================================================
-- 4. USER SESSIONS
-- =========================================================

CREATE TABLE user_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),

  token_hash TEXT NOT NULL UNIQUE,

  device_name TEXT,

  device_type TEXT NOT NULL DEFAULT 'OTHER'
    CHECK (device_type IN (
      'MOBILE',
      'TABLET',
      'DESKTOP',
      'OTHER'
    )),

  ip_address TEXT,
  user_agent TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  last_activity_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  expires_at TEXT NOT NULL,
  revoked_at TEXT,

  revocation_reason TEXT
    CHECK (
      revocation_reason IS NULL
      OR revocation_reason IN (
        'LOGOUT',
        'LOGOUT_ALL',
        'PASSWORD_CHANGED',
        'PASSWORD_RESET',
        'ACCOUNT_SUSPENDED',
        'USER_REVOKED',
        'ADMIN_REVOKED',
        'SESSION_EXPIRED',
        'SECURITY_ACTION'
      )
    ),

  CHECK (
    revoked_at IS NOT NULL
    OR revocation_reason IS NULL
  )
);

CREATE INDEX idx_user_sessions_user
  ON user_sessions(user_id, created_at);

CREATE INDEX idx_user_sessions_active
  ON user_sessions(user_id, expires_at)
  WHERE revoked_at IS NULL;


-- =========================================================
-- 5. AUTH EVENTS
-- =========================================================

CREATE TABLE auth_events (
  event_id TEXT PRIMARY KEY,

  user_id TEXT REFERENCES users(user_id),

  session_id TEXT
    REFERENCES user_sessions(session_id),

  event_type TEXT NOT NULL,

  event_status TEXT NOT NULL
    CHECK (event_status IN ('SUCCESS','FAILED')),

  ip_address TEXT,
  user_agent TEXT,

  event_details TEXT
    CHECK (
      event_details IS NULL
      OR json_valid(event_details)
    ),

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX idx_auth_events_user
  ON auth_events(user_id, created_at);

CREATE INDEX idx_auth_events_type
  ON auth_events(event_type, created_at);

CREATE INDEX idx_auth_events_created
  ON auth_events(created_at);

CREATE INDEX idx_auth_events_session
  ON auth_events(session_id);

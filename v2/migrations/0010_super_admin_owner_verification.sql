
-- JuhudManager V2
-- Migration: 0010_super_admin_owner_verification.sql
-- Purpose: One-time email ownership verification for initial SUPER_ADMIN bootstrap.
-- Requires: 0001_foundation.sql, 0002_authentication.sql, 0009_super_admin_bootstrap.sql

PRAGMA foreign_keys = ON;

CREATE TABLE super_admin_owner_verification_otps (
    owner_otp_id TEXT PRIMARY KEY,

    bootstrap_id INTEGER NOT NULL DEFAULT 1
        CHECK (bootstrap_id = 1)
        REFERENCES super_admin_bootstrap_state(bootstrap_id),

    user_id TEXT NOT NULL
        REFERENCES users(user_id),

    destination_hash TEXT NOT NULL
        CHECK (length(trim(destination_hash)) > 0),

    identity_hash TEXT NOT NULL
        CHECK (length(trim(identity_hash)) > 0),

    destination_encrypted TEXT NOT NULL
        CHECK (length(trim(destination_encrypted)) > 0),

    destination_hash_key_version INTEGER NOT NULL DEFAULT 1
        CHECK (destination_hash_key_version > 0),

    otp_hash TEXT NOT NULL
        CHECK (length(trim(otp_hash)) > 0),

    otp_hash_key_version INTEGER NOT NULL DEFAULT 1
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
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CHECK (attempt_count <= max_attempts),

    CHECK (
        consumed_at IS NULL
        OR invalidated_at IS NULL
    )
);

CREATE UNIQUE INDEX uq_super_admin_owner_otp_active
ON super_admin_owner_verification_otps(bootstrap_id)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

CREATE INDEX idx_super_admin_owner_otp_expiry
ON super_admin_owner_verification_otps(expires_at)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

CREATE INDEX idx_super_admin_owner_otp_user
ON super_admin_owner_verification_otps(user_id, created_at);


-- Only the immutable bootstrap target may receive an owner OTP.
CREATE TRIGGER trg_super_admin_owner_otp_insert_guard
BEFORE INSERT ON super_admin_owner_verification_otps
BEGIN
    SELECT CASE
        WHEN NEW.user_id <> '6b3b4088-7e19-4efc-a942-387c7880460c'
        THEN RAISE(ABORT, 'Invalid bootstrap owner.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM super_admin_bootstrap_state s
            INNER JOIN users u
                ON u.user_id = s.user_id
            WHERE s.bootstrap_id = 1
              AND s.user_id = NEW.user_id
              AND s.bootstrap_status = 'PENDING'
              AND u.full_name = 'JUHUD MANAGER'
              AND lower(u.email) = 'al.masri.ent@gmail.com'
              AND u.account_status = 'DISABLED'
        )
        THEN RAISE(ABORT, 'Bootstrap owner is not eligible.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_roles
            WHERE role_id = 'role-super-admin'
        )
        THEN RAISE(ABORT, 'A SUPER_ADMIN already exists.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = NEW.user_id
        )
        THEN RAISE(ABORT, 'Bootstrap owner already has a role.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_credentials
            WHERE user_id = NEW.user_id
              AND credential_type = 'PASSWORD'
              AND revoked_at IS NULL
        )
        THEN RAISE(ABORT, 'Bootstrap owner already has a password.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_auth_identities
            WHERE user_id = NEW.user_id
              AND identity_type = 'EMAIL'
              AND identity_scope = 'GLOBAL'
              AND verification_status IN ('PENDING', 'VERIFIED')
        )
        THEN RAISE(ABORT, 'Bootstrap owner email identity already exists.')
    END;
END;


-- OTP identity and hash values cannot be replaced after creation.
CREATE TRIGGER trg_super_admin_owner_otp_immutable
BEFORE UPDATE OF
    owner_otp_id,
    bootstrap_id,
    user_id,
    destination_hash,
    identity_hash,
    destination_encrypted,
    destination_hash_key_version,
    otp_hash,
    otp_hash_key_version,
    expires_at,
    max_attempts,
    created_at
ON super_admin_owner_verification_otps
BEGIN
    SELECT RAISE(ABORT, 'Owner verification OTP identity is immutable.');
END;


-- A consumed or invalidated OTP can never be reactivated.
CREATE TRIGGER trg_super_admin_owner_otp_no_reactivation
BEFORE UPDATE ON super_admin_owner_verification_otps
WHEN (
    OLD.consumed_at IS NOT NULL
    AND NEW.consumed_at IS NULL
)
OR (
    OLD.invalidated_at IS NOT NULL
    AND NEW.invalidated_at IS NULL
)
BEGIN
    SELECT RAISE(ABORT, 'Owner verification OTP cannot be reactivated.');
END;

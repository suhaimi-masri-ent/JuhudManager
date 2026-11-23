
-- =========================================================
-- JUHUDMANAGER V2
-- Migration 0016: Identity Verification Method
-- =========================================================
-- Purpose:
-- Record whether an identity was verified through OTP
-- or manually approved by an Administrator.
--
-- Existing identity records remain unchanged.
-- ADMIN_MANUAL verification must identify the approving Admin.
-- =========================================================

ALTER TABLE user_auth_identities
ADD COLUMN verification_method TEXT
CHECK (
  verification_method IS NULL
  OR verification_method IN ('OTP', 'ADMIN_MANUAL')
);

ALTER TABLE user_auth_identities
ADD COLUMN verified_by TEXT
REFERENCES users(user_id);

-- Efficient lookup of manually verified identities.
CREATE INDEX idx_auth_identity_manual_verification
ON user_auth_identities(verification_method, verified_by)
WHERE verification_method = 'ADMIN_MANUAL';

-- Prevent invalid manual-verification records on INSERT.
CREATE TRIGGER trg_auth_identity_manual_verification_insert
BEFORE INSERT ON user_auth_identities
WHEN
  (
    NEW.verification_method = 'ADMIN_MANUAL'
    AND (
      NEW.verified_by IS NULL
      OR NEW.verification_status <> 'VERIFIED'
      OR NEW.verified_at IS NULL
    )
  )
  OR
  (
    NEW.verified_by IS NOT NULL
    AND (
      NEW.verification_method IS NULL
      OR NEW.verification_method <> 'ADMIN_MANUAL'
    )
  )
BEGIN
  SELECT RAISE(
    ABORT,
    'Invalid manual identity verification metadata.'
  );
END;

-- Prevent invalid manual-verification records on UPDATE.
CREATE TRIGGER trg_auth_identity_manual_verification_update
BEFORE UPDATE OF
  verification_method,
  verified_by,
  verification_status,
  verified_at
ON user_auth_identities
WHEN
  (
    NEW.verification_method = 'ADMIN_MANUAL'
    AND (
      NEW.verified_by IS NULL
      OR NEW.verification_status <> 'VERIFIED'
      OR NEW.verified_at IS NULL
    )
  )
  OR
  (
    NEW.verified_by IS NOT NULL
    AND (
      NEW.verification_method IS NULL
      OR NEW.verification_method <> 'ADMIN_MANUAL'
    )
  )
BEGIN
  SELECT RAISE(
    ABORT,
    'Invalid manual identity verification metadata.'
  );
END;

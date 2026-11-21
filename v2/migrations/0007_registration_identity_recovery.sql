-- JuhudManager V2
-- Migration: 0007_registration_identity_recovery.sql
-- Requires: 0001_foundation.sql through 0006_admin_registration_review.sql
--
-- Purpose:
-- 1. Enforce one current (UNVERIFIED or VERIFIED) identity of each type
--    per user, while retaining all revoked identity history.
-- 2. Support Admin-assisted replacement without overwriting old records.
--
-- Apply only to the dedicated JuhudManager V2 D1 database.
-- Apply AFTER migration 0006.

PRAGMA foreign_keys = ON;

CREATE UNIQUE INDEX IF NOT EXISTS uq_registration_identity_current_per_user
  ON user_registration_identity_details(
    user_id,
    identity_type
  )
  WHERE identity_status IN ('UNVERIFIED', 'VERIFIED');

-- The existing uq_registration_identity_claim index continues to prevent
-- two different users from claiming the same active identity.
-- The existing release columns preserve the previous identity record.
-- Application code records each correction in audit_logs in the same
-- D1 batch as the identity replacement.

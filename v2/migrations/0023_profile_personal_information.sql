-- =========================================================
-- JUHUDMANAGER V2
-- Migration 0023: Profile Personal Information
-- =========================================================
--
-- Adds optional personal profile information:
-- - Gender
-- - Marital Status
-- - Employment Status
--
-- Age is calculated from date_of_birth by the frontend.
-- Age is not stored as a separate database field.
--
-- Email and verified WhatsApp remain managed by their
-- respective identity verification workflows.
-- =========================================================

ALTER TABLE user_profiles
ADD COLUMN gender TEXT
CHECK (
  gender IS NULL
  OR gender IN (
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY'
  )
);

ALTER TABLE user_profiles
ADD COLUMN marital_status TEXT
CHECK (
  marital_status IS NULL
  OR marital_status IN (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED',
    'SEPARATED'
  )
);

ALTER TABLE user_profiles
ADD COLUMN employment_status TEXT
CHECK (
  employment_status IS NULL
  OR employment_status IN (
    'STUDENT',
    'EMPLOYED',
    'SELF_EMPLOYED',
    'UNEMPLOYED',
    'HOMEMAKER',
    'PENSIONER',
    'RETIRED',
    'OTHER'
  )
);

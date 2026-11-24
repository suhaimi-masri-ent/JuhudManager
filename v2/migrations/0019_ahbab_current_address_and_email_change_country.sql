-- =========================================================
-- JUHUDMANAGER V2
-- Migration 0019: Ahbab Current Residential Address
-- =========================================================
--
-- Current country is based on declared residential address.
-- Never derive it from:
-- - Nationality
-- - National ID
-- - IP address
-- - GPS
-- - Jemaah
--
-- user_country_assignments remains exclusively for Admin scope.
-- =========================================================

ALTER TABLE user_profiles
ADD COLUMN address_line1 TEXT;

ALTER TABLE user_profiles
ADD COLUMN address_line2 TEXT;

ALTER TABLE user_profiles
ADD COLUMN city TEXT;

ALTER TABLE user_profiles
ADD COLUMN state_region TEXT;

ALTER TABLE user_profiles
ADD COLUMN postal_code TEXT;

ALTER TABLE user_profiles
ADD COLUMN country_id TEXT REFERENCES countries(country_id);

CREATE TABLE user_profile_address_history (
  history_id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL
    REFERENCES users(user_id),

  changed_by TEXT NOT NULL
    REFERENCES users(user_id),

  previous_address_json TEXT,

  new_address_json TEXT NOT NULL,

  changed_at TEXT NOT NULL
    DEFAULT (
      strftime('%Y-%m-%dT%H:%M:%fZ','now')
    ),

  CHECK (
    previous_address_json IS NULL
    OR length(trim(previous_address_json)) > 0
  ),

  CHECK (
    length(trim(new_address_json)) > 0
  )
);

CREATE INDEX idx_user_profile_address_history_user
ON user_profile_address_history(user_id, changed_at);

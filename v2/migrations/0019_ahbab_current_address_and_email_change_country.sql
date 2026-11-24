
-- =========================================================
-- JUHUDMANAGER V2
-- Migration 0019: Ahbab Current Address and Email Change Country
-- =========================================================
-- Current country is based on declared residential address.
-- Never derive it from nationality, National ID, IP, GPS or Jemaah.
-- user_country_assignments remains exclusively for Admin scope.
--
-- Existing Email Change requests retain NULL country_id because
-- their original submission country cannot safely be inferred.
-- New requests must snapshot the profile country at submission.
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
  user_id TEXT NOT NULL REFERENCES users(user_id),
  changed_by TEXT NOT NULL REFERENCES users(user_id),
  previous_address_json TEXT,
  new_address_json TEXT NOT NULL,
  changed_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (
    previous_address_json IS NULL
    OR length(trim(previous_address_json)) > 0
  ),
  CHECK (length(trim(new_address_json)) > 0)
);

CREATE INDEX idx_user_profile_address_history_user
ON user_profile_address_history(user_id, changed_at);

ALTER TABLE user_email_change_requests
ADD COLUMN country_id TEXT REFERENCES countries(country_id);

CREATE INDEX idx_user_email_change_country_status
ON user_email_change_requests(country_id, request_status, submitted_at);

-- =========================================================
-- JUHUDMANAGER V2
-- Migration 0020: Email Change Country Snapshot
-- =========================================================
--
-- This migration belongs to Fasa 2.
--
-- Existing Email Change requests retain NULL country_id
-- because their original submission country cannot safely
-- be inferred.
--
-- New requests must snapshot the declared profile country
-- at the time of submission.
-- =========================================================

ALTER TABLE user_email_change_requests
ADD COLUMN country_id TEXT REFERENCES countries(country_id);

CREATE INDEX idx_user_email_change_country_status
ON user_email_change_requests(
  country_id,
  request_status,
  submitted_at
);

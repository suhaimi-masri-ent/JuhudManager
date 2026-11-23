
ALTER TABLE user_email_change_requests
RENAME TO user_email_change_requests_legacy;

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

  email_verified_at TEXT,
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
      AND email_verified_at IS NULL
      AND applied_at IS NULL
    )
    OR
    (
      request_status = 'APPROVED'
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
      AND review_reason IS NOT NULL
      AND length(trim(review_reason)) > 0
    )
    OR
    (
      request_status IN ('REJECTED', 'CANCELLED', 'SUPERSEDED')
      AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL
      AND review_reason IS NOT NULL
      AND length(trim(review_reason)) > 0
      AND email_verified_at IS NULL
      AND applied_at IS NULL
    )
  ),

  CHECK (
    applied_at IS NULL
    OR email_verified_at IS NOT NULL
  ),

  UNIQUE (request_id, user_id)
);

INSERT INTO user_email_change_requests (
  request_id,
  user_id,
  requested_email_hash,
  requested_email_encrypted,
  hash_key_version,
  request_status,
  identity_check_method,
  submitted_at,
  reviewed_by,
  reviewed_at,
  review_reason,
  applied_at,
  created_at,
  updated_at
)
SELECT
  request_id,
  user_id,
  requested_email_hash,
  requested_email_encrypted,
  hash_key_version,
  request_status,
  identity_check_method,
  submitted_at,
  reviewed_by,
  reviewed_at,
  review_reason,
  applied_at,
  created_at,
  updated_at
FROM user_email_change_requests_legacy;

DROP TABLE user_email_change_requests_legacy;

CREATE UNIQUE INDEX uq_user_email_change_pending
ON user_email_change_requests(user_id)
WHERE request_status = 'PENDING';

CREATE UNIQUE INDEX uq_user_email_change_pending_address
ON user_email_change_requests(requested_email_hash)
WHERE request_status = 'PENDING';

CREATE INDEX idx_user_email_change_status
ON user_email_change_requests(request_status, submitted_at);

CREATE INDEX idx_user_email_change_user
ON user_email_change_requests(user_id, submitted_at);

CREATE INDEX idx_user_email_change_reviewer
ON user_email_change_requests(reviewed_by, reviewed_at);

CREATE TABLE user_email_change_otp_requests (
  otp_id TEXT PRIMARY KEY,

  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  destination_hash TEXT NOT NULL
    CHECK (length(trim(destination_hash)) > 0),

  destination_encrypted TEXT NOT NULL
    CHECK (length(trim(destination_encrypted)) > 0),

  destination_hash_key_version INTEGER NOT NULL
    CHECK (destination_hash_key_version > 0),

  otp_hash TEXT NOT NULL
    CHECK (length(trim(otp_hash)) > 0),

  otp_hash_key_version INTEGER NOT NULL
    CHECK (otp_hash_key_version > 0),

  delivery_method TEXT NOT NULL
    CHECK (delivery_method IN ('AUTOMATIC', 'ADMIN_ASSISTED')),

  issued_by TEXT REFERENCES users(user_id),

  issued_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,

  attempt_count INTEGER NOT NULL DEFAULT 0
    CHECK (attempt_count >= 0),

  max_attempts INTEGER NOT NULL DEFAULT 5
    CHECK (max_attempts > 0),

  delivered_at TEXT,
  consumed_at TEXT,
  invalidated_at TEXT,

  created_at TEXT NOT NULL
    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK (attempt_count <= max_attempts),

  CHECK (
    (
      delivery_method = 'ADMIN_ASSISTED'
      AND issued_by IS NOT NULL
    )
    OR
    (
      delivery_method = 'AUTOMATIC'
      AND issued_by IS NULL
    )
  ),

  CHECK (
    consumed_at IS NULL
    OR invalidated_at IS NULL
  ),

  FOREIGN KEY (request_id, user_id)
    REFERENCES user_email_change_requests(request_id, user_id)
);

CREATE INDEX idx_email_change_otp_request
ON user_email_change_otp_requests(request_id, created_at);

CREATE INDEX idx_email_change_otp_expiry
ON user_email_change_otp_requests(expires_at)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

CREATE UNIQUE INDEX uq_email_change_otp_active_request
ON user_email_change_otp_requests(request_id)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

CREATE UNIQUE INDEX uq_email_change_otp_active_destination
ON user_email_change_otp_requests(destination_hash)
WHERE consumed_at IS NULL
  AND invalidated_at IS NULL;

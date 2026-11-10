PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_accounts (
  user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (account_status IN ('ACTIVE','SUSPENDED','DISABLED')),
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_login_at TEXT,
  last_logout_at TEXT,
  last_access_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  suspended_at TEXT,
  suspended_by TEXT,
  suspension_reason TEXT
);

CREATE TABLE IF NOT EXISTS user_identifiers (
  identifier_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('NRIC','PASSPORT','EMAIL','WHATSAPP')),
  lookup_hash TEXT NOT NULL UNIQUE,
  encrypted_value TEXT NOT NULL,
  masked_value TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_identifiers_user ON user_identifiers(user_id);
CREATE INDEX IF NOT EXISTS idx_identifiers_type ON user_identifiers(identifier_type);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  date_of_birth TEXT,
  gender TEXT CHECK (gender IS NULL OR gender IN ('MALE','FEMALE','OTHER','UNDISCLOSED')),
  marital_status TEXT CHECK (marital_status IS NULL OR marital_status IN ('SINGLE','MARRIED','DIVORCED','WIDOWED','UNDISCLOSED')),
  nationality TEXT,
  country TEXT,
  state_province TEXT,
  city_district TEXT,
  postcode TEXT,
  street_address TEXT,
  building_number TEXT,
  building_name TEXT,
  address_line_2 TEXT,
  profile_photo_key TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS roles (
  role_id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  description TEXT
);

INSERT OR IGNORE INTO roles(role_id, role_name, description) VALUES
('role_super_admin','SUPER_ADMIN','Full system administration'),
('role_admin','ADMIN','Manage users, activities and reports'),
('role_supervisor','SUPERVISOR','Review assigned user submissions'),
('role_user','USER','Manage own profile and activities');

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(role_id),
  assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  revoked_at TEXT,
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON user_sessions(expires_at);

CREATE TABLE IF NOT EXISTS activity_types (
  activity_type_id TEXT PRIMARY KEY,
  activity_name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('DAILY','WEEKLY','MONTHLY','YEARLY','AD_HOC')),
  requires_update INTEGER NOT NULL DEFAULT 1 CHECK (requires_update IN (0,1)),
  requires_attachment INTEGER NOT NULL DEFAULT 0 CHECK (requires_attachment IN (0,1)),
  start_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_by TEXT REFERENCES user_accounts(user_id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS activity_assignments (
  assignment_id TEXT PRIMARY KEY,
  activity_type_id TEXT NOT NULL REFERENCES activity_types(activity_type_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES user_accounts(user_id),
  assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_assignments_user ON activity_assignments(user_id);

CREATE TABLE IF NOT EXISTS activity_records (
  record_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(user_id),
  activity_type_id TEXT NOT NULL REFERENCES activity_types(activity_type_id),
  activity_date TEXT NOT NULL,
  period_start TEXT,
  period_end TEXT,
  description TEXT NOT NULL,
  progress_status TEXT NOT NULL DEFAULT 'COMPLETED'
    CHECK (progress_status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  attachment_key TEXT,
  review_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (review_status IN ('PENDING','APPROVED','REJECTED','NEEDS_REVISION')),
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_by TEXT REFERENCES user_accounts(user_id),
  reviewed_at TEXT,
  reviewer_remarks TEXT
);

CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_records(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_review ON activity_records(review_status);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES user_accounts(user_id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id);

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT OR IGNORE INTO system_settings(setting_key, setting_value) VALUES
('system_name','JuhudManager'),
('default_language','en'),
('supported_languages','en,my'),
('password_min_length','12');

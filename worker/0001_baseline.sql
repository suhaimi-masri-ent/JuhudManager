-- JuhudManager database baseline
-- Purpose:
--   Recreate the current application schema in a NEW / EMPTY D1 database.
--
-- IMPORTANT:
--   1. This is a schema baseline, NOT a production migration.
--   2. Do NOT execute this file against the existing live database.
--   3. Do NOT place this file in worker/migrations/ while the legacy migration
--      history remains there. It is intentionally stored separately.
--   4. No live user, session, audit, activity, category, Takaza, or sequence
--      records are copied into this baseline.
--   5. The five role records below are application bootstrap reference data.
--
-- Snapshot source: live D1 schema supplied for the Issue #2 audit, 2026-11-18.
-- Cloudflare-managed tables such as _cf_KV are intentionally excluded.

-- ---------------------------------------------------------------------------
-- 1. Access control reference table
-- ---------------------------------------------------------------------------

CREATE TABLE roles (
    role_id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- ---------------------------------------------------------------------------
-- 2. User account and identity tables
-- ---------------------------------------------------------------------------

CREATE TABLE user_accounts (
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

CREATE TABLE user_identifiers (
    identifier_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    identifier_type TEXT NOT NULL
        CHECK (identifier_type IN ('NRIC','PASSPORT','EMAIL','WHATSAPP')),
    lookup_hash TEXT NOT NULL UNIQUE,
    encrypted_value TEXT NOT NULL,
    masked_value TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE user_profiles (
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
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    employment_status TEXT,
    employment_type TEXT,
    employment_sector TEXT,
    occupation TEXT,
    employer_company TEXT,
    department TEXT,
    position_designation TEXT,
    work_location TEXT
);

CREATE TABLE user_roles (
    user_id TEXT NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(role_id),
    assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY(user_id, role_id)
);

CREATE TABLE user_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    expires_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    revoked_at TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    expired_audit_at TEXT
);

-- ---------------------------------------------------------------------------
-- 3. Audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE audit_logs (
    audit_id TEXT PRIMARY KEY,
    actor_user_id TEXT REFERENCES user_accounts(user_id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details_json TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ---------------------------------------------------------------------------
-- 4. Takaza registration tables
-- ---------------------------------------------------------------------------

CREATE TABLE takaza_categories (
    category_id TEXT PRIMARY KEY,
    category_code TEXT NOT NULL COLLATE NOCASE UNIQUE,
    category_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE takaza_code_sequences (
    category_code TEXT NOT NULL COLLATE NOCASE,
    sequence_month TEXT NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (category_code, sequence_month)
);

CREATE TABLE takazas (
    takaza_id TEXT PRIMARY KEY,
    takaza_code TEXT NOT NULL COLLATE NOCASE UNIQUE,
    category_id TEXT NOT NULL,
    takaza_name TEXT NOT NULL,
    description TEXT,
    parent_takaza_id TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT'
        CHECK (
            status IN (
                'DRAFT',
                'PENDING_ENDORSEMENT',
                'ACTIVE',
                'ON_HOLD',
                'COMPLETED',
                'CANCELLED',
                'ARCHIVED'
            )
        ),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (category_id) REFERENCES takaza_categories(category_id),
    FOREIGN KEY (parent_takaza_id) REFERENCES takazas(takaza_id)
);

-- ---------------------------------------------------------------------------
-- 5. Activity management tables
-- ---------------------------------------------------------------------------

CREATE TABLE activity_types (
    activity_type_id TEXT PRIMARY KEY,
    activity_name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL
        CHECK (frequency IN ('DAILY','WEEKLY','MONTHLY','YEARLY','AD_HOC')),
    requires_update INTEGER NOT NULL DEFAULT 1 CHECK (requires_update IN (0,1)),
    requires_attachment INTEGER NOT NULL DEFAULT 0 CHECK (requires_attachment IN (0,1)),
    start_date TEXT,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_by TEXT REFERENCES user_accounts(user_id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE activity_records (
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
    reviewer_remarks TEXT,
    start_time TEXT,
    end_date TEXT,
    end_time TEXT
);

CREATE TABLE activity_assignments (
    assignment_id TEXT PRIMARY KEY,
    activity_type_id TEXT NOT NULL REFERENCES activity_types(activity_type_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    assigned_by TEXT REFERENCES user_accounts(user_id),
    assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED'))
);

-- ---------------------------------------------------------------------------
-- 6. System configuration
-- ---------------------------------------------------------------------------

CREATE TABLE system_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ---------------------------------------------------------------------------
-- 7. Application indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_activity_review
ON activity_records(review_status);

CREATE INDEX idx_activity_user_date
ON activity_records(user_id, activity_date);

CREATE INDEX idx_assignments_user
ON activity_assignments(user_id);

CREATE INDEX idx_audit_actor
ON audit_logs(actor_user_id);

CREATE INDEX idx_audit_created
ON audit_logs(created_at);

CREATE INDEX idx_identifiers_type
ON user_identifiers(identifier_type);

CREATE INDEX idx_identifiers_user
ON user_identifiers(user_id);

CREATE INDEX idx_sessions_expiry
ON user_sessions(expires_at);

CREATE INDEX idx_sessions_user
ON user_sessions(user_id);

CREATE INDEX idx_takaza_categories_status
ON takaza_categories(status);

CREATE INDEX idx_takazas_category
ON takazas(category_id);

CREATE INDEX idx_takazas_parent
ON takazas(parent_takaza_id);

CREATE INDEX idx_takazas_status
ON takazas(status);

-- ---------------------------------------------------------------------------
-- 8. Bootstrap reference data
-- ---------------------------------------------------------------------------
-- These are role definitions only. No user accounts or role assignments
-- are created by this baseline.

INSERT INTO roles (role_id, role_name, description) VALUES
    ('role_admin', 'ADMIN', 'Manage users, activities and reports'),
    ('ROLE_EMPLOYEE', 'EMPLOYEE', 'Standard employee access'),
    ('role_supervisor', 'SUPERVISOR', 'Review assigned user submissions'),
    ('role_super_admin', 'SUPER_ADMIN', 'Full system administration'),
    ('role_user', 'USER', 'Manage own profile and activities');

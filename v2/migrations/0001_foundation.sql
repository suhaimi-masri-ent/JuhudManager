-- JuhudManager V2 - Foundation schema
-- Independent from V1. Apply only to a dedicated V2 D1 database.

PRAGMA foreign_keys = ON;

CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT COLLATE NOCASE UNIQUE,
  account_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (account_status IN ('ACTIVE','SUSPENDED','DISABLED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE roles (
  role_id TEXT PRIMARY KEY,
  role_code TEXT NOT NULL UNIQUE,
  role_name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(user_id),
  role_id TEXT NOT NULL REFERENCES roles(role_id),
  assigned_by TEXT REFERENCES users(user_id),
  assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE jemaah (
  jemaah_id TEXT PRIMARY KEY,
  jemaah_code TEXT NOT NULL UNIQUE,
  jemaah_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by TEXT NOT NULL REFERENCES users(user_id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE jemaah_memberships (
  membership_id TEXT PRIMARY KEY,
  jemaah_id TEXT NOT NULL REFERENCES jemaah(jemaah_id),
  user_id TEXT NOT NULL REFERENCES users(user_id),
  membership_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (membership_status IN ('ACTIVE','ENDED','REMOVED')),
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ended_at TEXT,
  ended_by TEXT REFERENCES users(user_id),
  end_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX uq_jemaah_active_membership
  ON jemaah_memberships(jemaah_id, user_id)
  WHERE membership_status = 'ACTIVE';

CREATE TABLE takazas (
  takaza_id TEXT PRIMARY KEY,
  takaza_code TEXT NOT NULL UNIQUE,
  jemaah_id TEXT NOT NULL REFERENCES jemaah(jemaah_id),
  parent_takaza_id TEXT REFERENCES takazas(takaza_id),
  takaza_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','RELEASED','ACTIVE','ON_HOLD','COMPLETED','CANCELLED')),
  proposed_start_date TEXT,
  official_start_date TEXT,
  start_date_locked_at TEXT,
  end_date TEXT,
  created_by TEXT NOT NULL REFERENCES users(user_id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE takaza_participations (
  participation_id TEXT PRIMARY KEY,
  takaza_id TEXT NOT NULL REFERENCES takazas(takaza_id),
  user_id TEXT NOT NULL REFERENCES users(user_id),
  participation_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (participation_status IN ('PENDING','ACTIVE','ENDED','WITHDRAWN','REMOVED')),
  participation_source TEXT NOT NULL DEFAULT 'VOLUNTARY'
    CHECK (participation_source IN ('VOLUNTARY','ADMIN_NOMINATED','ADMIN_ASSIGNED')),
  accepted_at TEXT,
  started_at TEXT,
  ended_at TEXT,
  ended_by TEXT REFERENCES users(user_id),
  end_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX uq_takaza_active_participation
  ON takaza_participations(takaza_id, user_id)
  WHERE participation_status IN ('PENDING','ACTIVE');

-- Amer is an appointment attached to an existing participant record.
-- Detailed Kawaif/Tafakut eligibility integration remains a later slice.
CREATE TABLE amer_appointments (
  appointment_id TEXT PRIMARY KEY,
  takaza_id TEXT NOT NULL REFERENCES takazas(takaza_id),
  participation_id TEXT NOT NULL REFERENCES takaza_participations(participation_id),
  appointee_user_id TEXT NOT NULL REFERENCES users(user_id),
  eligibility_status TEXT NOT NULL
    CHECK (eligibility_status IN ('ELIGIBLE','PENDING','INELIGIBLE')),
  eligibility_reference TEXT,
  appointed_by TEXT NOT NULL REFERENCES users(user_id),
  appointed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  effective_at TEXT NOT NULL,
  ended_at TEXT,
  ended_by TEXT REFERENCES users(user_id),
  change_reason TEXT,
  former_access_policy TEXT NOT NULL DEFAULT 'ADMIN_CONTROLLED'
    CHECK (former_access_policy IN ('ADMIN_CONTROLLED','READ_ONLY','NO_ACCESS')),
  CHECK (eligibility_status <> 'ELIGIBLE' OR
         (eligibility_reference IS NOT NULL AND length(trim(eligibility_reference)) > 0))
);

CREATE UNIQUE INDEX uq_takaza_current_amer
  ON amer_appointments(takaza_id)
  WHERE ended_at IS NULL;

CREATE TABLE audit_logs (
  audit_id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(user_id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX idx_jemaah_memberships_user ON jemaah_memberships(user_id, membership_status);
CREATE INDEX idx_takaza_participations_user ON takaza_participations(user_id, participation_status);
CREATE INDEX idx_amer_appointments_takaza ON amer_appointments(takaza_id, appointed_at);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at);

INSERT INTO roles(role_id, role_code, role_name, description) VALUES
  ('role-super-admin','SUPER_ADMIN','Super Admin','Full system administration'),
  ('role-admin','ADMIN','Admin','Operational administration'),
  ('role-ahbab','AHBAB','Ahbab','Jemaah and Takaza participant');

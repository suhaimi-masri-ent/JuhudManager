
PRAGMA foreign_keys = ON;

CREATE TABLE countries (
  country_id TEXT PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  country_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (country_status IN ('ACTIVE', 'INACTIVE')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  CHECK (country_code GLOB '[A-Z][A-Z]'),
  CHECK (country_id = country_code),
  CHECK (length(trim(country_name)) > 0)
);

INSERT INTO countries (
  country_id,
  country_code,
  country_name
)
VALUES (
  'MY',
  'MY',
  'Malaysia'
);

CREATE TABLE user_country_assignments (
  assignment_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  country_id TEXT NOT NULL REFERENCES countries(country_id),

  assignment_role_code TEXT NOT NULL DEFAULT 'ADMIN'
    CHECK (assignment_role_code = 'ADMIN'),

  assignment_status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (assignment_status IN ('ACTIVE', 'REVOKED')),

  assigned_by TEXT REFERENCES users(user_id),
  assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  revoked_by TEXT REFERENCES users(user_id),
  revoked_at TEXT,
  revocation_reason TEXT,

  CHECK (
    (
      assignment_status = 'ACTIVE'
      AND revoked_by IS NULL
      AND revoked_at IS NULL
      AND revocation_reason IS NULL
    )
    OR
    (
      assignment_status = 'REVOKED'
      AND revoked_by IS NOT NULL
      AND revoked_at IS NOT NULL
      AND revocation_reason IS NOT NULL
      AND length(trim(revocation_reason)) > 0
    )
  )
);

CREATE UNIQUE INDEX uq_user_country_active_assignment
ON user_country_assignments (
  user_id,
  country_id,
  assignment_role_code
)
WHERE assignment_status = 'ACTIVE';

CREATE INDEX idx_country_assignments_user
ON user_country_assignments (
  user_id,
  assignment_status
);

CREATE INDEX idx_country_assignments_country
ON user_country_assignments (
  country_id,
  assignment_status
);

CREATE TRIGGER trg_country_assignment_admin_role_insert
BEFORE INSERT ON user_country_assignments
WHEN NEW.assignment_status = 'ACTIVE'
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = NEW.user_id
        AND r.role_code = 'ADMIN'
    )
    THEN RAISE(ABORT, 'Country Admin must have ADMIN role.')
  END;

  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM countries c
      WHERE c.country_id = NEW.country_id
        AND c.country_status = 'ACTIVE'
    )
    THEN RAISE(ABORT, 'Country is not active.')
  END;
END;

CREATE TRIGGER trg_country_assignment_admin_role_update
BEFORE UPDATE OF user_id, country_id, assignment_role_code, assignment_status
ON user_country_assignments
WHEN NEW.assignment_status = 'ACTIVE'
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = NEW.user_id
        AND r.role_code = 'ADMIN'
    )
    THEN RAISE(ABORT, 'Country Admin must have ADMIN role.')
  END;

  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM countries c
      WHERE c.country_id = NEW.country_id
        AND c.country_status = 'ACTIVE'
    )
    THEN RAISE(ABORT, 'Country is not active.')
  END;
END;

ALTER TABLE jemaah
ADD COLUMN country_id TEXT REFERENCES countries(country_id);

CREATE TRIGGER trg_jemaah_country_required_insert
BEFORE INSERT ON jemaah
WHEN NEW.country_id IS NULL
BEGIN
  SELECT RAISE(ABORT, 'Jemaah country is required.');
END;

CREATE TRIGGER trg_jemaah_country_required_update
BEFORE UPDATE OF country_id ON jemaah
WHEN NEW.country_id IS NULL
BEGIN
  SELECT RAISE(ABORT, 'Jemaah country is required.');
END;

CREATE TRIGGER trg_jemaah_country_immutable
BEFORE UPDATE OF country_id ON jemaah
WHEN OLD.country_id IS NOT NEW.country_id
BEGIN
  SELECT RAISE(ABORT, 'Jemaah country cannot be changed.');
END;

ALTER TABLE audit_logs
ADD COLUMN country_id TEXT REFERENCES countries(country_id);

CREATE INDEX idx_jemaah_country
ON jemaah(country_id, status);

CREATE INDEX idx_audit_country
ON audit_logs(country_id, created_at);

PRAGMA foreign_keys = ON;

CREATE TABLE super_admin_bootstrap_state (
    bootstrap_id INTEGER PRIMARY KEY CHECK (bootstrap_id = 1),
    user_id TEXT NOT NULL UNIQUE REFERENCES users(user_id),
    bootstrap_status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (bootstrap_status IN ('PENDING', 'COMPLETE')),
    completed_at TEXT,
    created_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (
        (bootstrap_status = 'PENDING' AND completed_at IS NULL)
        OR
        (bootstrap_status = 'COMPLETE' AND completed_at IS NOT NULL)
    )
);

CREATE TABLE super_admin_bootstrap_tokens (
    bootstrap_token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL
        REFERENCES super_admin_bootstrap_state(user_id),
    token_hash TEXT NOT NULL UNIQUE,
    hash_key_version INTEGER NOT NULL DEFAULT 1
        CHECK (hash_key_version > 0),
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    invalidated_at TEXT,
    created_at TEXT NOT NULL
        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (
        consumed_at IS NULL
        OR invalidated_at IS NULL
    )
);

CREATE UNIQUE INDEX uq_super_admin_active_bootstrap_token
ON super_admin_bootstrap_tokens(user_id)
WHERE consumed_at IS NULL
AND invalidated_at IS NULL;

CREATE INDEX idx_super_admin_bootstrap_token_expiry
ON super_admin_bootstrap_tokens(expires_at)
WHERE consumed_at IS NULL
AND invalidated_at IS NULL;

CREATE UNIQUE INDEX uq_single_super_admin_role
ON user_roles(role_id)
WHERE role_id = 'role-super-admin';

INSERT INTO super_admin_bootstrap_state (
    bootstrap_id,
    user_id,
    bootstrap_status
)
VALUES (
    1,
    '6b3b4088-7e19-4efc-a942-387c7880460c',
    'PENDING'
);

CREATE TRIGGER trg_super_admin_bootstrap_state_immutable
BEFORE UPDATE OF user_id, bootstrap_id
ON super_admin_bootstrap_state
BEGIN
    SELECT RAISE(ABORT, 'Bootstrap target is immutable.');
END;

CREATE TRIGGER trg_super_admin_bootstrap_state_complete_guard
BEFORE UPDATE OF bootstrap_status
ON super_admin_bootstrap_state
WHEN NEW.bootstrap_status = 'COMPLETE'
BEGIN
    SELECT CASE
        WHEN OLD.bootstrap_status <> 'PENDING'
        THEN RAISE(ABORT, 'Bootstrap is already completed.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM users u
            INNER JOIN user_roles ur
                ON ur.user_id = u.user_id
                AND ur.role_id = 'role-super-admin'
            INNER JOIN user_credentials c
                ON c.user_id = u.user_id
                AND c.credential_type = 'PASSWORD'
                AND c.revoked_at IS NULL
            WHERE u.user_id = NEW.user_id
              AND u.account_status = 'ACTIVE'
        )
        THEN RAISE(ABORT, 'Bootstrap prerequisites are incomplete.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM super_admin_bootstrap_tokens t
            WHERE t.user_id = NEW.user_id
              AND t.consumed_at IS NOT NULL
              AND t.invalidated_at IS NULL
        )
        THEN RAISE(ABORT, 'Bootstrap token has not been consumed.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM audit_logs a
            WHERE a.actor_user_id = NEW.user_id
              AND a.action = 'SUPER_ADMIN_BOOTSTRAP'
              AND a.entity_type = 'USER'
              AND a.entity_id = NEW.user_id
        )
        THEN RAISE(ABORT, 'Bootstrap audit record is missing.')
    END;
END;

CREATE TRIGGER trg_super_admin_bootstrap_state_no_delete
BEFORE DELETE ON super_admin_bootstrap_state
BEGIN
    SELECT RAISE(ABORT, 'Bootstrap state cannot be deleted.');
END;

CREATE TRIGGER trg_super_admin_bootstrap_token_insert_guard
BEFORE INSERT ON super_admin_bootstrap_tokens
BEGIN
    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM super_admin_bootstrap_state s
            WHERE s.user_id = NEW.user_id
              AND s.bootstrap_status = 'PENDING'
        )
        THEN RAISE(ABORT, 'Bootstrap is not available.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_roles
            WHERE role_id = 'role-super-admin'
        )
        THEN RAISE(ABORT, 'A SUPER_ADMIN already exists.')
    END;
END;

CREATE TRIGGER trg_super_admin_bootstrap_token_immutable
BEFORE UPDATE OF bootstrap_token_id, user_id, token_hash
ON super_admin_bootstrap_tokens
BEGIN
    SELECT RAISE(ABORT, 'Bootstrap token identity is immutable.');
END;

CREATE TRIGGER trg_super_admin_bootstrap_token_no_reactivation
BEFORE UPDATE ON super_admin_bootstrap_tokens
WHEN (
    OLD.consumed_at IS NOT NULL
    AND NEW.consumed_at IS NULL
)
OR (
    OLD.invalidated_at IS NOT NULL
    AND NEW.invalidated_at IS NULL
)
BEGIN
    SELECT RAISE(ABORT, 'Bootstrap token cannot be reactivated.');
END;

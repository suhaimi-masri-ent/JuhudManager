CREATE TABLE user_account_archives (
    archive_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    previous_account_status TEXT NOT NULL
        CHECK (previous_account_status IN ('ACTIVE', 'DISABLED')),
    archived_by TEXT NOT NULL REFERENCES users(user_id),
    archive_reason TEXT NOT NULL
        CHECK (length(trim(archive_reason)) BETWEEN 10 AND 1000),
    archived_at TEXT NOT NULL,
    restored_by TEXT REFERENCES users(user_id),
    restored_at TEXT,
    restore_reason TEXT,
    CHECK (
        (
            restored_by IS NULL
            AND restored_at IS NULL
            AND restore_reason IS NULL
        )
        OR
        (
            restored_by IS NOT NULL
            AND restored_at IS NOT NULL
            AND restore_reason IS NOT NULL
            AND length(trim(restore_reason)) BETWEEN 10 AND 1000
        )
    )
);

CREATE UNIQUE INDEX uq_user_account_archives_active
ON user_account_archives(user_id)
WHERE restored_at IS NULL;

CREATE INDEX idx_user_account_archives_history
ON user_account_archives(user_id, archived_at DESC);

CREATE TRIGGER trg_user_account_archive_validate
BEFORE INSERT ON user_account_archives
BEGIN
    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM users
            WHERE user_id = NEW.user_id
              AND account_status = NEW.previous_account_status
        )
        THEN RAISE(ABORT, 'Account status changed or account not found.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = NEW.user_id
              AND role_id = 'role-super-admin'
        )
        THEN RAISE(ABORT, 'SUPER_ADMIN account cannot be archived.')
    END;

    SELECT CASE
        WHEN NEW.user_id = NEW.archived_by
        THEN RAISE(ABORT, 'Self-archiving is not permitted.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM user_roles ur
            INNER JOIN users u
                ON u.user_id = ur.user_id
            WHERE ur.user_id = NEW.archived_by
              AND ur.role_id = 'role-super-admin'
              AND u.account_status = 'ACTIVE'
        )
        THEN RAISE(ABORT, 'Active SUPER_ADMIN authorization required.')
    END;

    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM user_country_assignments
            WHERE user_id = NEW.user_id
              AND assignment_status = 'ACTIVE'
        )
        THEN RAISE(ABORT, 'Revoke active country assignments before archiving.')
    END;
END;

CREATE TRIGGER trg_user_account_archive_apply
AFTER INSERT ON user_account_archives
BEGIN
    UPDATE users
    SET
        account_status = 'SUSPENDED',
        updated_at = NEW.archived_at
    WHERE user_id = NEW.user_id;

    INSERT INTO audit_logs (
        audit_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        before_json,
        after_json,
        reason,
        created_at
    )
    VALUES (
        lower(hex(randomblob(16))),
        NEW.archived_by,
        'USER_ACCOUNT_ARCHIVED',
        'USER_ACCOUNT',
        NEW.user_id,
        json_object(
            'account_status', NEW.previous_account_status
        ),
        json_object(
            'account_status', 'SUSPENDED',
            'archive_id', NEW.archive_id,
            'archived_at', NEW.archived_at
        ),
        NEW.archive_reason,
        NEW.archived_at
    );
END;

CREATE TRIGGER trg_user_account_archive_restore_validate
BEFORE UPDATE OF restored_by, restored_at, restore_reason
ON user_account_archives
BEGIN
    SELECT CASE
        WHEN OLD.restored_at IS NOT NULL
        THEN RAISE(ABORT, 'Archive record has already been restored.')
    END;

    SELECT CASE
        WHEN NEW.restored_at IS NULL
          OR NEW.restored_by IS NULL
          OR NEW.restore_reason IS NULL
          OR length(trim(NEW.restore_reason)) NOT BETWEEN 10 AND 1000
        THEN RAISE(ABORT, 'Valid restoration details are required.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM user_roles ur
            INNER JOIN users u
                ON u.user_id = ur.user_id
            WHERE ur.user_id = NEW.restored_by
              AND ur.role_id = 'role-super-admin'
              AND u.account_status = 'ACTIVE'
        )
        THEN RAISE(ABORT, 'Active SUPER_ADMIN authorization required.')
    END;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM users
            WHERE user_id = NEW.user_id
              AND account_status = 'SUSPENDED'
        )
        THEN RAISE(ABORT, 'Archived account status is invalid.')
    END;
END;

CREATE TRIGGER trg_user_account_archive_apply_restore
AFTER UPDATE OF restored_at ON user_account_archives
WHEN OLD.restored_at IS NULL
 AND NEW.restored_at IS NOT NULL
BEGIN
    UPDATE users
    SET
        account_status = NEW.previous_account_status,
        updated_at = NEW.restored_at
    WHERE user_id = NEW.user_id;

    INSERT INTO audit_logs (
        audit_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        before_json,
        after_json,
        reason,
        created_at
    )
    VALUES (
        lower(hex(randomblob(16))),
        NEW.restored_by,
        'USER_ACCOUNT_RESTORED',
        'USER_ACCOUNT',
        NEW.user_id,
        json_object(
            'account_status', 'SUSPENDED',
            'archive_id', NEW.archive_id
        ),
        json_object(
            'account_status', NEW.previous_account_status,
            'restored_at', NEW.restored_at
        ),
        NEW.restore_reason,
        NEW.restored_at
    );
END;

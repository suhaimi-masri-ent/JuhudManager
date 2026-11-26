
CREATE TABLE IF NOT EXISTS takaza_categories (
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

CREATE INDEX IF NOT EXISTS idx_takaza_categories_status
ON takaza_categories(status);


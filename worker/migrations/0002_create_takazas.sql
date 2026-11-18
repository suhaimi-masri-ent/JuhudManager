
CREATE TABLE IF NOT EXISTS takazas (
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
                'CANCELLED'
            )
        ),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    ),
    updated_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    ),

    FOREIGN KEY (category_id)
        REFERENCES takaza_categories(category_id),

    FOREIGN KEY (parent_takaza_id)
        REFERENCES takazas(takaza_id)
);

CREATE INDEX IF NOT EXISTS idx_takazas_category
ON takazas(category_id);

CREATE INDEX IF NOT EXISTS idx_takazas_status
ON takazas(status);

CREATE INDEX IF NOT EXISTS idx_takazas_parent
ON takazas(parent_takaza_id);

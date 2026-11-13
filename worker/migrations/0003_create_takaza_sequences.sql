CREATE TABLE IF NOT EXISTS takaza_code_sequences (
    category_code TEXT NOT NULL COLLATE NOCASE,
    sequence_month TEXT NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    ),

    PRIMARY KEY (category_code, sequence_month)
);

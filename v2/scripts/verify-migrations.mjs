
import { DatabaseSync } from "node:sqlite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync
} from "node:fs";
import { resolve, join } from "node:path";

const MIGRATIONS_DIR = resolve("migrations");

const BOOTSTRAP_USER = {
  userId: "6b3b4088-7e19-4efc-a942-387c7880460c",
  fullName: "JUHUD MANAGER",
  email: "al.masri.ent@gmail.com"
};

if (!existsSync(MIGRATIONS_DIR)) {
  throw new Error("Migration directory not found: " + MIGRATIONS_DIR);
}

const files = readdirSync(MIGRATIONS_DIR)
  .filter(name => /^\d+_.+\.sql$/i.test(name))
  .sort((a, b) => {
    const numberA = Number(a.match(/^\d+/)[0]);
    const numberB = Number(b.match(/^\d+/)[0]);
    return numberA - numberB;
  });

if (files.length !== 20) {
  throw new Error(
    `Expected 20 migration files, found ${files.length}.`
  );
}

const db = new DatabaseSync(":memory:");

try {
  db.exec("PRAGMA foreign_keys = ON;");

  console.log("Starting isolated in-memory SQLite test.");
  console.log("Production D1 is NOT connected.");

  for (const file of files) {
    const migrationNumber = Number(file.match(/^\d+/)[0]);

    // Migration 0009 references a designated bootstrap user.
    // Create a local fixture immediately before applying it.
    if (migrationNumber === 9) {
      db.prepare(`
        INSERT INTO users (
          user_id,
          full_name,
          email,
          account_status
        )
        VALUES (?, ?, ?, 'DISABLED')
      `).run(
        BOOTSTRAP_USER.userId,
        BOOTSTRAP_USER.fullName,
        BOOTSTRAP_USER.email
      );

      console.log("Prepared local bootstrap fixture.");
    }

    const sql = readFileSync(
      join(MIGRATIONS_DIR, file),
      "utf8"
    );

    try {
      db.exec("BEGIN;");
      db.exec(sql);
      db.exec("COMMIT;");

      console.log("PASS:", file);
    } catch (error) {
      try {
        db.exec("ROLLBACK;");
      } catch {
        // Preserve the original migration error.
      }

      throw new Error(
        `Migration failed: ${file}\n${error.message}`
      );
    }
  }

  const integrity = db.prepare(
    "PRAGMA integrity_check;"
  ).all();

  const foreignKeys = db.prepare(
    "PRAGMA foreign_key_check;"
  ).all();

  const profileColumns = db.prepare(
    "PRAGMA table_info(user_profiles);"
  ).all().map(row => row.name);

  const requiredProfileColumns = [
    "user_id",
    "full_name",
    "date_of_birth",
    "address_line1",
    "address_line2",
    "city",
    "state_region",
    "postal_code",
    "country_id"
  ];

  const missingColumns = requiredProfileColumns.filter(
    column => !profileColumns.includes(column)
  );

  const addressHistory = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'user_profile_address_history'
  `).get();

  const bootstrapState = db.prepare(`
    SELECT bootstrap_status
    FROM super_admin_bootstrap_state
    WHERE bootstrap_id = 1
  `).get();

  console.log("\n--- Verification ---");
  console.log("Integrity:", integrity);
  console.log("Foreign key violations:", foreignKeys);
  console.log("Missing Profile columns:", missingColumns);
  console.log("Address history table:", Boolean(addressHistory));
  console.log("Bootstrap state:", bootstrapState);

  if (
    integrity.length !== 1 ||
    integrity[0].integrity_check !== "ok"
  ) {
    throw new Error("SQLite integrity check failed.");
  }

  if (foreignKeys.length > 0) {
    throw new Error("Foreign key check failed.");
  }

  if (missingColumns.length > 0) {
    throw new Error("Required Profile columns are missing.");
  }

  if (!addressHistory) {
    throw new Error("Address history table is missing.");
  }

  if (bootstrapState?.bootstrap_status !== "PENDING") {
    throw new Error("Bootstrap state is invalid.");
  }

  console.log("\nSUCCESS: All 20 migrations passed.");
} finally {
  db.close();
}

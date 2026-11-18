# JuhudManager database baseline

`0001_baseline.sql` describes the application schema observed in the live D1
database on 18 November 2026.

## Purpose

Use this file only to initialise a **new, empty database** for controlled
rebuild/testing. It creates the 14 application tables, 13 application indexes,
and the five standard role definitions.

## Important safeguards

- Do not execute this file against the existing live D1 database.
- Do not place this file in `worker/migrations/` while the legacy migration
  files remain there. It is deliberately separate from Wrangler's migration
  directory.
- Do not delete or rewrite the existing migration files.
- No live user, profile, identifier, role assignment, session, audit log,
  activity, Takaza category, Takaza, or sequence records are included.
- Cloudflare-managed tables (for example `_cf_KV`) are excluded.
- `activity_types`, `takaza_categories`, `system_settings`, and
  `takaza_code_sequences` are created empty. Their live values are not copied.
- The five rows in `roles` are bootstrap reference data required by the
  application's role-based access checks and default USER assignment.

## Current limitations

This is a schema snapshot based on the D1 `sqlite_master` output and source
inspection. It is not yet approved for deployment. Before using it, validate
it against a disposable empty D1 database and compare the resulting tables,
columns, constraints, foreign keys, and indexes with the live schema.

The existing live database has no `d1_migrations` table according to the
audit query. The deployment/migration tracking method must be established
separately before deciding how future incremental migrations should be
managed.

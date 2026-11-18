# JuhudManager D1 Read-only Web Console

## 1. Purpose

The JuhudManager D1 Read-only Web Console is a small Cloudflare Worker application for inspecting the structure and selected records of the JuhudManager D1 database.

It is intended to support development, schema inspection, and controlled read-only diagnostics. It is **not** an MCP server and does not provide direct ChatGPT-to-D1 connectivity.

## 2. Deployment and database configuration

| Item | Configuration |
|---|---|
| Cloudflare Worker | `juhudmanager-d1-readonly` |
| D1 binding variable | `DB` |
| Bound database | `juhudmanager-schema-test` |
| Authentication secret | `API_TOKEN` |
| Interface | Worker route `/` |
| Health endpoint | `/health` |

**Safety requirement:** keep this Worker connected to the disposable `juhudmanager-schema-test` database while it is being developed and tested. Do not change the binding to the live `juhudmanager-db` database without a separate review and explicit approval.

The API token is configured as a Cloudflare Worker Secret named `API_TOKEN`. Do not place its value in source code, documentation, URLs, screenshots, or chat messages.

## 3. Web Console features

The page served at `/` provides:

- API token entry
- Connect and load table list
- Select a database table
- View table structure
- View foreign keys
- View indexes and indexed columns
- Count records
- View up to 50 records for approved tables
- Copy the displayed JSON result

The browser sends GET requests to the Worker API and supplies the token in the `Authorization: Bearer ...` request header.

## 4. API endpoints

| Endpoint | Authentication | Purpose |
|---|---|---|
| `GET /` | Public | Serves the HTML console |
| `GET /health` | Public | Runs `SELECT 1` and reports database connectivity |
| `GET /api/tables` | Bearer token | Lists application tables, excluding SQLite internal tables and `_cf_KV` |
| `GET /api/schema?table=...` | Bearer token | Returns `PRAGMA table_info` for a validated table |
| `GET /api/foreign-keys?table=...` | Bearer token | Returns `PRAGMA foreign_key_list` |
| `GET /api/indexes?table=...` | Bearer token | Returns `PRAGMA index_list` and each index's columns |
| `GET /api/count?table=...` | Bearer token | Returns the row count for a validated table |
| `GET /api/records?table=...` | Bearer token | Returns up to 50 rows for an allowlisted table, excluding columns matched by the sensitive-column filter |

All non-GET methods are rejected with HTTP 405. Unsupported API paths return HTTP 404.

## 5. Record-view allowlist

The current `RECORD_TABLES` allowlist contains six tables:

- `takazas`
- `takaza_categories`
- `takaza_code_sequences`
- `roles`
- `activity_types`
- `activity_assignments`

The allowlist applies specifically to record viewing. Schema, foreign-key, index, and count endpoints can inspect other existing tables when a valid API token is supplied, except `_cf_KV`.

Do not add tables containing personal, authentication, session, or audit data to the record-view allowlist without a separate privacy and security review. In particular, avoid enabling record viewing for `user_accounts`, `user_identifiers`, `user_profiles`, `user_roles`, `user_sessions`, and `audit_logs`.

## 6. Sensitive-column filtering

The current `SENSITIVE_COLUMN` regular expression excludes column names containing terms such as:

- `password`, `salt`, `hash`, `token`, `secret`, `encrypted`
- `identifier`, `email`, `phone`, `address`, `ip`, `user_agent`
- `details`, `attachment`, `description`, `remarks`
- `created_by`, `assigned_by`, `reviewed_by`, `user_id`

This is a defence-in-depth filter for the record-view endpoint. It is not a substitute for reviewing each table before adding it to the allowlist.

## 7. Security review of the supplied Worker source

The source reviewed for this document has the following properties:

1. It accepts GET requests only.
2. It requires an exact `Authorization: Bearer <API_TOKEN>` match for `/api/...` endpoints.
3. It does not accept arbitrary SQL text from the caller. The caller supplies a table name only.
4. It verifies the requested table exists in `sqlite_master` before using the identifier.
5. It quotes dynamic SQL identifiers using `quoteName()`.
6. Its database statements are `SELECT` queries and read-only `PRAGMA` inspection statements.
7. Record viewing is restricted to the six-table allowlist and limited to 50 rows.
8. Sensitive-looking columns are filtered from record results.
9. API responses use `Cache-Control: no-store`.
10. Database exceptions are returned as a generic error rather than exposing internal database details.

### Security limitations and operational cautions

- The read-only property is enforced by the Worker code's available endpoints and SQL statements. The supplied source does not itself demonstrate a separate Cloudflare-level read-only permission on the D1 binding.
- The public `/health` endpoint reveals only whether the database connection can execute `SELECT 1`; it does not require the API token.
- The token remains in the page's JavaScript variable and password input while the page is open. It is not written to `localStorage` or placed in the URL by the supplied page code.
- No rate-limiting mechanism is present in the supplied source.
- The code review is based on the source pasted for review. Before relying on it operationally, compare it with the currently deployed Worker source and confirm the deployed D1 binding and secret configuration in Cloudflare.
- Keep the Worker bound to the disposable test database. Do not expose live operational data through this console without a new security review.

## 8. Test results

The Web Console was tested against `juhudmanager-schema-test`.

| Table | Count result | Record-view result | Outcome |
|---|---:|---|---|
| `activity_assignments` | 0 | Successful; 0 rows | Pass |
| `activity_types` | 0 | Successful; 0 rows | Pass |
| `takazas` | 0 | Successful; 0 rows | Pass |
| `takaza_categories` | 0 | Successful; 0 rows | Pass |
| `roles` | 5 | Successful; 5 rows | Pass |

The five returned role records were:

| role_id | role_name |
|---|---|
| `role_admin` | `ADMIN` |
| `ROLE_EMPLOYEE` | `EMPLOYEE` |
| `role_supervisor` | `SUPERVISOR` |
| `role_super_admin` | `SUPER_ADMIN` |
| `role_user` | `USER` |

All five allowlisted tables passed both Count Records and View Records tests. The four operational tables returned zero records in this test database. The `roles` table returned the five expected bootstrap role records.

## 9. Operating procedure

1. Open the Cloudflare Worker `juhudmanager-d1-readonly`.
2. Confirm its D1 binding is `DB` → `juhudmanager-schema-test`.
3. Open the Worker URL and enter the API token in the password field.
4. Select a table and use the required inspection function.
5. Do not share the API token or screenshots containing it.
6. Treat the console as a diagnostic tool; do not use it to make database changes.
7. If the Worker code, allowlist, sensitive-column filter, secret, or D1 binding changes, repeat the relevant security and functional tests.

## 10. Scope and future integration

This Worker is currently a read-only HTTP API with a browser-based console. It is not an MCP server and is not currently connected directly to ChatGPT as a database tool. Any future MCP integration should be designed and reviewed separately, retaining least-privilege access and the test-database-first approach.

---

Document status: based on the Worker source supplied for review and the console test results recorded on 18 November 2026.

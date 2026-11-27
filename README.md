# JuhudManager

**JuhudManager** is maintained as two separate application versions: **V1** and **V2**. Both versions are kept in this repository, but their application code, Cloudflare Workers, Wrangler configurations, and databases must remain strictly separate.

---

## Project Structure

| Path | Purpose |
| :--- | :--- |
| `v1/` | JuhudManager V1 application and its version-specific documentation |
| `v2/` | JuhudManager V2 application, Worker, web frontend, D1 migrations, and documentation |
| `docs/` | Shared project-level documentation |
| `.github/workflows/` | Build, test, Pages deployment, Worker deployment, and database migration workflows |

---

## Version Architecture

### Version 1 (V1)

V1 is preserved under `v1/` and retains its own Cloudflare Worker configuration and D1 database.

| Component | Location |
| :--- | :--- |
| **Frontend** | `v1/public/` |
| **Application Source** | `v1/src/` |
| **Cloudflare Worker** | `v1/worker/` |
| **Wrangler Configuration** | `v1/wrangler.jsonc` |
| **Version-Specific README** | `v1/README.md` |

> **Important:** V1 must remain operationally and technically separate from V2. Changes to V2 must not unintentionally modify V1 application behaviour, database resources, or deployment configuration.

### Version 2 (V2)

V2 is maintained under `v2/` and uses its own Cloudflare Worker configuration and D1 database.

| Component | Location |
| :--- | :--- |
| **Cloudflare Worker Source** | `v2/src/` |
| **Web Frontend** | `v2/web/` |
| **D1 Migrations** | `v2/migrations/` |
| **Wrangler Configuration** | `v2/wrangler.jsonc` |
| **Version-Specific Documentation** | `v2/docs/` |

> **Note:** Database changes must be managed through reviewed migration files. Production migrations are performed separately from Worker deployment through the dedicated migration workflow.

---

## Documentation Structure

### V2 Documentation (`v2/docs/`)

Version-specific design and implementation documents are maintained in `v2/docs/`:

* `Auth.md` — Authentication, account security, and password recovery requirements.
* `UAC_MATRIX.md` — User Access Control and authorization rules.
* `DASHBOARD_NAVIGATION_SPEC_V2.md` — Dashboard and navigation specification.
* `JMV2001-Ahbab-Profile-Account-Management.md` — Ahbab profile and account management.
* `JMV2002-Organization-Structure-Governance.md` — Organization structure and governance.
* `JMV2003-Syukbah-Management.md` — Syukbah management.
* `JMV2004-Takaza-Management.md` — Takaza management and operational processes.
* `V2_DESIGN_CHECKPOINT.md` — Consolidated design decisions and outstanding decisions.
* `V2_IMPLEMENTATION_STATUS.md` — Implementation progress and verification status.

> **Disclaimer:** A documented requirement does not necessarily mean that the feature has already been implemented. Refer to `V2_IMPLEMENTATION_STATUS.md` and verify the actual code before treating a feature as available.

### Shared Project Documentation (`docs/`)

Project-wide documentation belongs in the root `docs/` directory. This includes development roadmaps, system-level design references, database guidance, and historical project records. Version-specific implementation details should remain in the corresponding version directory.

---

## CI/CD & Deployment

### GitHub Actions Workflows

All workflows are located in `.github/workflows/`:

| Workflow | Purpose | Trigger |
| :--- | :--- | :--- |
| `build-test.yml` | Runs V2 tests and build checks | Push to integration branch, PR to `develop` or `main`, or manual |
| `deploy.yml` | Publishes V1 and V2 frontends to GitHub Pages | Manual |
| `deploy-v1-worker.yml` | Deploys the V1 Cloudflare Worker | Manual |
| `deploy-v2-worker.yml` | Deploys the V2 Cloudflare Worker | Manual |
| `migrate-v2-d1.yml` | Applies V2 production D1 migrations | Manual with explicit confirmation |

### GitHub Pages

The Pages workflow (`deploy.yml`) must be started manually through GitHub Actions and prepares a combined site:

* **V1 frontend** is published at the Pages root (`/`).
* **V2 frontend** is published under `/v2/web/`.

### Cloudflare Workers

V1 and V2 Worker deployments are independent operations:

* **V1 deployment** uses the configuration under `v1/`.
* **V2 deployment** uses the configuration under `v2/`.

*(A Worker deployment does not automatically apply database migrations.)*

### V2 Database Migrations

The V2 migration workflow (`migrate-v2-d1.yml`) requires the confirmation value `APPLY` before it proceeds.

**Checklist before applying production migrations:**

1. Review the migration files.
2. Confirm the target database and Wrangler configuration.
3. Confirm that the migration is appropriate for the current production schema.
4. Start the migration workflow deliberately.
5. Review the workflow result.

> **Warning:** Never run V2 migrations against the V1 database.

---

## Important Separation Rules

1. Keep V1 and V2 application source code separate.
2. Keep their Wrangler configurations, Cloudflare Workers, and D1 databases separate.
3. Never point one version's Worker at the other version's database.
4. Never apply V2 migrations to the V1 database.
5. Do not combine V1 and V2 deployment operations into an unintended shared deployment.
6. Do not deploy production resources or apply database migrations as a side effect of repository restructuring.
7. Keep local dependencies such as `node_modules/` out of Git.
8. Preserve historical documentation and migration records unless there is an explicit decision to archive or remove them.

---

## Development & Verification

### Pre-Change Checklist

Before making changes:

* Identify whether the change belongs to V1, V2, or shared project documentation.
* Review the relevant version-specific documentation.
* Check the applicable database schema and migration history before changing data structures.
* Review authorization and account-security requirements before changing authentication or access-control behaviour.

### V2 Build & Test Workflow

For V2 development, use `build-test.yml` to verify changes. It currently performs:

1. Dependency installation using the lockfile.
2. Unit tests using `npm test`.
3. Wrangler build dry-run using `npm run build`.

> **Note:** A successful build or test run does not by itself establish that production deployment, database migration, bootstrap setup, or every documented feature has been verified.

---

## Deployment Safety

Production deployment and database migration are deliberate operations. Do not assume that a successful GitHub Actions build means the application has been deployed.

* **Post-Deployment:** Verify the relevant application endpoint, Worker health, and database connectivity. For database changes, verify the migration result separately.
* **Status Tracking:** Keep deployment records and implementation status documentation accurate by clearly distinguishing between:
  * `Implemented`
  * `Partially implemented`
  * `Not implemented`
  * `Needs verification`
  * `Deployed`
  * `Reported test result`

---

## Project Direction

JuhudManager **V1** is preserved as a separate, stable application version. JuhudManager **V2** is developed as the next-generation application with its own architecture, authorization model, database migrations, frontend, and operational workflows. This separation protects the existing V1 application while allowing V2 to evolve independently.

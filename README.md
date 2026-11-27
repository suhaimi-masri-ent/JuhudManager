
# JuhudManager

JuhudManager is maintained as two separate application versions: V1 and V2.

Both versions are preserved in this repository. Their application code, Cloudflare Workers, Wrangler configurations, databases and deployment workflows must remain strictly separated.

---

## 1. Project Structure

| Path | Purpose |
|---|---|
| `v1/` | JuhudManager V1 application |
| `v2/` | JuhudManager V2 application, Worker, frontend, migrations and documentation |
| `docs/` | Shared project-level documentation |
| `.github/workflows/` | Build, test, deployment and database migration workflows |

### V1 Structure

| Component | Location |
|---|---|
| Frontend | `v1/public/` |
| Application Source | `v1/src/` |
| Cloudflare Worker | `v1/worker/` |
| Wrangler Configuration | `v1/wrangler.jsonc` |
| Version README | `v1/README.md` |

### V2 Structure

| Component | Location |
|---|---|
| Cloudflare Worker Source | `v2/src/` |
| Web Frontend | `v2/web/` |
| D1 Migrations | `v2/migrations/` |
| Wrangler Configuration | `v2/wrangler.jsonc` |
| V2 Documentation | `v2/docs/` |
| Authentication Package Notes | `v2/README_AUTH_PACKAGE.md` |

---

## 2. Version Architecture and Separation

### 2.1 JuhudManager V1

V1 is preserved under `v1/`.

Its existing application, Worker configuration and D1 database must remain independent from V2.

V1 infrastructure:

| Component | Configuration |
|---|---|
| Worker | `juhudmanager-api-test` |
| Wrangler Configuration | `v1/wrangler.jsonc` |
| Main Entry | `worker/src/index.js` |
| D1 Database | `juhudmanager-db` |
| D1 Database ID | `7846a32c-60b4-41a3-9c85-41fbabe544d9` |

V1 must not be modified unintentionally by V2 development, migrations or deployment.

### 2.2 JuhudManager V2

V2 is maintained under `v2/` with independent infrastructure.

V2 infrastructure:

| Component | Configuration |
|---|---|
| Worker | `juhudmanager-v2-api` |
| Main Entry | `src/index.js` |
| Wrangler Configuration | `v2/wrangler.jsonc` |
| D1 Binding | `DB` |
| D1 Database | `juhudmanager-v2-db` |
| D1 Database ID | `4a4e736b-83ee-4889-bfbb-7fe189f92b5f` |

V2 must not use the V1 production database.

### 2.3 Non-Negotiable Separation Rules

1. Keep V1 and V2 source code separate.
2. Keep their Wrangler configurations separate.
3. Keep their Cloudflare Workers separate.
4. Keep their D1 databases separate.
5. Never point one version's Worker to the other version's database.
6. Never apply V2 migrations to the V1 database.
7. Keep deployment workflows version-specific.
8. Do not combine V1 and V2 application code.
9. Preserve historical records and migration history.
10. Do not perform production deployment or migration as an unintended side effect of repository restructuring.

---

## 3. V2 Documentation Structure

The authoritative V2 documentation is maintained in `v2/docs/`.

### 3.1 Project Governance and Requirements

| Document | Purpose |
|---|---|
| `MASTER_DECISION_REGISTER.md` | Authoritative record of approved project and design decisions |
| `OPEN_DECISIONS_REGISTER.md` | Consolidated register of unresolved decisions |
| `MODULE_REQUIREMENTS.md` | Consolidated functional and module requirements |
| `REPOSITORY_DISPOSITION.md` | Repository structure, document disposition and archival guidance |

### 3.2 Authentication and Authorization

| Document | Purpose |
|---|---|
| `AUTH.md` | Authentication, account security, OTP and password recovery requirements |
| `UAC_MATRIX.md` | User Access Control, roles, appointments, scope and authorization rules |
| `DASHBOARD_NAVIGATION_SPEC_V2.md` | Dashboard categories, navigation and access-related presentation |

Supporting technical documentation:

- `v2/README_AUTH_PACKAGE.md`

### 3.3 Module Specifications

| Document | Purpose |
|---|---|
| `JMV2001-Ahbab-Profile-Account-Management.md` | Ahbab profile and account management |
| `JMV2002-Organization-Structure-Governance.md` | Organization structure and governance |
| `JMV2003-Syukbah-Management.md` | Syukbah management |
| `JMV2004-Takaza-Management.md` | Takaza management and operational processes |

### 3.4 Design and Implementation Tracking

| Document | Purpose |
|---|---|
| `V2_DESIGN_CHECKPOINT.md` | Consolidated design direction, checkpoints and outstanding matters |
| `V2_IMPLEMENTATION_STATUS.md` | Implementation status, technical verification, blockers and development roadmap |

### 3.5 Document Authority

The documents have distinct responsibilities:

- `MASTER_DECISION_REGISTER.md` records approved decisions.
- `OPEN_DECISIONS_REGISTER.md` tracks unresolved decisions.
- `MODULE_REQUIREMENTS.md` consolidates functional requirements.
- Individual module specifications define detailed module behaviour.
- `AUTH.md` defines authentication and account-security requirements.
- `UAC_MATRIX.md` defines authorization requirements.
- `V2_IMPLEMENTATION_STATUS.md` is the primary source of truth for implementation progress and roadmap.
- `README_AUTH_PACKAGE.md` provides supporting authentication technical notes.

A documented requirement or approved design does not prove that a feature has been implemented.

Implementation claims must be supported by appropriate code, test or deployment evidence.

### 3.6 Historical Documentation

Historical documents may be retained for review and traceability.

The former singular document `OPEN_DECISION_REGISTER.md` has been removed. The official current document is:

`OPEN_DECISIONS_REGISTER.md`

The older `IMPLEMENTATION_STATUS_AND_ROADMAP.md` is not the current authoritative implementation-status document. Its historical content must not override `V2_IMPLEMENTATION_STATUS.md`.

Do not recreate duplicate authoritative documents.

---

## 4. Shared Project Documentation

Project-wide documentation belongs in the root `docs/` directory.

Examples include:

- Development roadmaps.
- System-level design references.
- Database guidance.
- Shared technical documentation.
- Historical project records.

Version-specific implementation details should remain within their respective version directories.

---

## 5. GitHub Actions and CI/CD

All GitHub Actions workflows are maintained in:

`.github/workflows/`

### 5.1 Workflow Inventory

| Workflow | Purpose | Trigger |
|---|---|---|
| `build-test.yml` | V2 unit tests and build verification | Push to integration branch, PR to `develop` or `main`, or manual |
| `deploy.yml` | Publishes V1 and V2 frontends to GitHub Pages | Manual |
| `deploy-v1-worker.yml` | Deploys V1 Cloudflare Worker | Manual |
| `deploy-v2-worker.yml` | Deploys V2 Cloudflare Worker | Manual |
| `migrate-v2-d1.yml` | Applies V2 production D1 migrations | Manual with explicit confirmation |

### 5.2 Build and Test

The current `build-test.yml` workflow:

1. Checks out the repository.
2. Sets up Node.js 24.
3. Installs locked dependencies using `npm ci`.
4. Runs `npm test`.
5. Runs the Wrangler build dry-run using `npm run build`.

The workflow uses the V2 working directory:

`v2/`

The current integration branch trigger is:

`integration/v1-v2-separation-develop`

Pull requests targeting `develop` and `main` are also configured to run the workflow.

A successful build and test run does not prove that production deployment, database migration, bootstrap setup or every business workflow has been verified.

### 5.3 GitHub Pages Deployment

The Pages workflow is:

`.github/workflows/deploy.yml`

It is manually triggered.

The workflow prepares a combined site:

| Published Content | Source |
|---|---|
| V1 frontend | `v1/public/` |
| V2 frontend | `v2/web/` |

Published layout:

- V1 frontend is placed at the Pages site root.
- V2 frontend is placed under `v2/web/`.

For a GitHub project site, the application URL includes the repository's Pages base path.

The Pages workflow does not deploy either Cloudflare Worker.

### 5.4 Cloudflare Worker Deployment

V1 and V2 Worker deployments are independent.

V1 deployment:

- Workflow: `deploy-v1-worker.yml`
- Working directory: `v1/`
- Configuration: `wrangler.jsonc`
- Worker: `juhudmanager-api-test`

V2 deployment:

- Workflow: `deploy-v2-worker.yml`
- Working directory: `v2/`
- Configuration: `wrangler.jsonc`
- Worker: `juhudmanager-v2-api`

Both workflows are manually triggered.

Worker deployment does not automatically apply database migrations.

### 5.5 V2 Database Migration

The migration workflow is:

`migrate-v2-d1.yml`

It operates on the dedicated V2 database:

`juhudmanager-v2-db`

The workflow requires the confirmation value:

`APPLY`

The default selection is `NO`.

The migration workflow is separate from Worker deployment.

Before applying a production migration:

1. Review the migration files.
2. Confirm the intended V2 database.
3. Check the remote migration history.
4. Confirm that the migration has not already been applied.
5. Review the schema and data impact.
6. Obtain explicit authorization.
7. Start the workflow deliberately.
8. Review the workflow result.
9. Verify the remote database state.

Never run V2 migrations against the V1 database.

---

## 6. Development and Verification

### 6.1 Before Making Changes

Before changing the repository:

- Identify whether the change belongs to V1, V2 or shared documentation.
- Review the relevant version-specific documentation.
- Check the applicable database schema and migration history.
- Review authentication and authorization requirements before changing access-control behaviour.
- Check the Master Decision Register and Open Decisions Register before changing business rules.
- Preserve existing data and historical records.
- Update implementation status when implementation or verification status changes.

### 6.2 V2 Development Environment

V2 dependencies and build configuration are maintained under:

`v2/`

The lockfile must be preserved.

GitHub Actions is the intended build and test verification path.

Android Termux may encounter platform compatibility limitations when executing `workerd` locally. Such a platform issue must not automatically be interpreted as a failure of the GitHub Actions build.

### 6.3 Testing Evidence

Previous reported results include:

- `npm test`: 94/94 tests passed.
- GitHub Actions build and test: success.
- Worker build and health checks: previously reported successful.

These are historical reported results, not a guarantee of current production health.

The current implementation status and verification scope must be recorded in:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

### 6.4 Implementation Status Definitions

Use precise implementation status:

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | Implementation verified for the stated scope |
| `PARTIALLY IMPLEMENTED` | Only part of the required functionality is available |
| `IN PROGRESS` | Implementation is ongoing |
| `NOT IMPLEMENTED` | Functionality has not been implemented |
| `NEEDS VERIFICATION` | Requires code, test or environment verification |
| `ON HOLD` | Work is temporarily suspended |
| `REPORTED PASS` | A passing result was reported but has not been freshly verified |
| `DEPLOYED` | Deployment was verified in the stated environment |
| `BLOCKED` | Work cannot safely proceed until the blocker is resolved |
| `PENDING DECISION` | Requires an approved design decision |

Do not promote a reported test result to verified production status without appropriate evidence.

---

## 7. Deployment Safety

Production deployment and database migration are deliberate operations.

A successful build does not mean that an application has been deployed.

A successful Worker deployment does not mean that all application workflows are operational.

A successful database migration does not mean that all related business functions have been implemented.

### 7.1 Pre-Deployment Checklist

Before deployment:

- Confirm the intended version.
- Confirm the intended branch.
- Review the complete change set.
- Confirm the correct Wrangler configuration.
- Confirm the Worker name.
- Confirm the D1 database binding and ID.
- Verify environment variables and secrets.
- Review database migration requirements.
- Obtain explicit deployment approval.

### 7.2 Post-Deployment Verification

After deployment:

- Verify the relevant application endpoint.
- Verify Worker health.
- Verify database connectivity.
- Verify migration results separately.
- Verify the intended Pages routes.
- Verify V1 and V2 remain isolated.
- Run relevant smoke tests.
- Record the actual verification scope and evidence.

Update `V2_IMPLEMENTATION_STATUS.md` when implementation or deployment status changes.

---

## 8. Security and Data Protection

The following requirements apply throughout V2 development:

1. Never commit secrets or credentials.
2. Protect National ID, Passport and other sensitive identity information.
3. Enforce authorization on the backend.
4. Do not rely on frontend visibility as a security control.
5. Preserve audit and historical records.
6. Enforce account status and session validity.
7. Revoke sessions and tokens when required by security policy.
8. Keep identity verification separate from ordinary profile editing.
9. Do not bypass bootstrap owner verification.
10. Do not introduce unapproved administrative privileges.
11. Keep production configuration separate from development configuration.
12. Do not expose sensitive information in logs or error messages.

Authentication and authorization requirements must follow the authoritative V2 specifications.

---

## 9. Project Direction

JuhudManager V1 is preserved as a separate application version.

JuhudManager V2 is developed independently with its own:

- Application architecture.
- Cloudflare Worker.
- D1 database.
- Database migrations.
- Web frontend.
- Authentication and authorization model.
- Organization and business workflows.
- Documentation and implementation roadmap.

The long-term objective is to maintain a secure, auditable, modular and independently deployable V2 system without compromising the preserved V1 application.

---

## 10. Maintenance

This README describes repository structure, version separation, documentation authority and development workflows.

It must be updated when:

- Repository structure changes.
- A workflow is added, removed or renamed.
- Deployment paths change.
- Worker or database configuration changes.
- Documentation authority changes.
- Version separation rules change.

Detailed implementation status belongs in:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

Approved design decisions belong in:

`v2/docs/MASTER_DECISION_REGISTER.md`

Unresolved decisions belong in:

`v2/docs/OPEN_DECISIONS_REGISTER.md`

---

**Document:** JuhudManager Repository README  
**Scope:** V1 and V2 Repository Overview  
**Status:** Repository Documentation Baseline

**End of Document.**

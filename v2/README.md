
# JUHUDMANAGER V2

**Document ID:** JMV2-README  
**Version:** 1.1 — Consolidated Project Guide  
**Status:** PROJECT DOCUMENTATION — MAINTENANCE BASELINE  
**Scope:** JuhudManager V2 Project  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/README.md`

---

## 1. Project Overview

JuhudManager V2 is the next-generation implementation of JuhudManager.

V2 is developed independently from the legacy V1 application, with its own:

- Cloudflare Worker.
- D1 database.
- Frontend application.
- Database migrations.
- Authentication and session management.
- Authorization framework.
- Business modules.
- Automated tests.
- Deployment workflows.

All V2 application files are maintained under the `v2/` directory unless an explicitly approved project decision authorizes a shared repository-level change.

This README provides the project overview and directs developers to the authoritative requirements, design and implementation documents.

It does not replace detailed technical specifications or module requirements.

## 2. Project Principles

The following principles govern V2 development:

1. V1 and V2 must remain technically and operationally separate.
2. V2 must use its own Worker and dedicated D1 database.
3. Database changes must use reviewed migration files.
4. Authentication, authorization, account status and registration status must remain separate concerns.
5. Approved requirements must not be confused with implemented functionality.
6. Unresolved decisions must remain open until formally resolved.
7. Security, auditability and data integrity are mandatory.
8. Backend authorization is the final authority for protected operations.
9. Historical records and audit evidence must be preserved.
10. Implementation status must be supported by actual verification evidence.
11. Production deployment and database migration are separate controlled operations.
12. No unresolved business rule may be implemented through assumption.

## 3. Directory Structure

The main V2 directory structure is:

```text
v2/
├── README.md
├── README_AUTH_PACKAGE.md
├── src/
├── web/
├── migrations/
├── test/
├── docs/
├── package.json
├── package-lock.json
└── wrangler.jsonc
```

The structure may expand as development progresses.

### 3.1 Main Locations

| Component | Repository Location |
|---|---|
| Worker source | `v2/src/` |
| Web frontend | `v2/web/` |
| D1 migrations | `v2/migrations/` |
| Automated tests | `v2/test/` |
| Documentation | `v2/docs/` |
| Wrangler configuration | `v2/wrangler.jsonc` |
| Package configuration | `v2/package.json` |
| Dependency lock | `v2/package-lock.json` |

## 4. Infrastructure

### 4.1 Cloudflare Worker

| Item | Configuration |
|---|---|
| Worker | `juhudmanager-v2-api` |
| Entry point | `src/index.js` |
| Configuration | `v2/wrangler.jsonc` |
| D1 binding | `DB` |
| Environment | Production |

The V2 Worker foundation has previously been deployed.

A previous health endpoint result reported:

- Status: `ok`.
- Service: `juhudmanager-v2-api`.
- Environment: Production.
- Database: Connected.

This is historical verification evidence. It does not establish that every API, business module or production workflow is currently operational.

### 4.2 D1 Database

| Item | Value |
|---|---|
| Database | `juhudmanager-v2-db` |
| Database ID | `4a4e736b-83ee-4889-bfbb-7fe189f92b5f` |
| Binding | `DB` |
| Migration directory | `v2/migrations/` |

The repository contains migrations numbered `0001` through `0021`.

Migration `0021_super_admin_owner_verification.sql` was reported successfully applied to the remote V2 database on 26 November 2026.

The reported table count after that migration was 33.

These migration and table-count details are historical records and must be checked against the current remote database before being treated as freshly verified.

### 4.3 Infrastructure Separation

- V1 uses its own Worker and D1 database.
- V2 uses its own Worker and D1 database.
- V2 migrations must never be applied to the V1 database.
- Worker deployment and database migration are separate operations.
- A successful deployment of one environment does not establish the readiness of the other.

## 5. Implementation Status

The authoritative implementation status and development roadmap are maintained in:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

This document is the single source of truth for:

- Implementation progress.
- Completed functionality.
- Outstanding work.
- Blockers.
- Verification evidence.
- Development phases.
- Implementation priorities.

The older `IMPLEMENTATION_STATUS_AND_ROADMAP.md` is retained for historical reference and is not an authoritative implementation-status source.

### 5.1 Status Definitions

| Status | Meaning |
|---|---|
| IMPLEMENTED | Implementation verified for the stated scope |
| PARTIALLY IMPLEMENTED | Only part of the required functionality is available |
| IN PROGRESS | Implementation is ongoing |
| NOT IMPLEMENTED | Functionality has not been implemented |
| NEEDS VERIFICATION | Further inspection or testing is required |
| ON HOLD | Work is deliberately paused |
| REPORTED PASS | A successful result was reported but not independently rerun |
| DEPLOYED | Deployment verified in the stated environment |

A database table, API route, frontend page or approved specification alone does not prove that a complete workflow is implemented.

## 6. Authentication and Account Security

The authentication foundation includes implementation of several core capabilities:

- Registration draft creation.
- Email OTP verification.
- Identity reservation.
- Initial password setup using Argon2id.
- Password login.
- Session creation and validation.
- Logout and logout-all.
- Session listing and revocation.
- Authentication event recording.
- Rate limiting.

### 6.1 Current Security Policies

| Requirement | Policy |
|---|---|
| OTP | 6 digits |
| OTP validity | 5 minutes |
| Maximum OTP attempts | 5 |
| Resend cooldown | 60 seconds |
| Identity reservation | 15 minutes |
| Minimum password length | 12 characters |
| Session idle timeout | 30 minutes |
| Maximum session lifetime | 12 hours |

The authenticated email sender is:

`noreply@m.juhud.run.place`

Production email delivery and end-to-end authentication testing remain subject to verification.

### 6.2 Password Reset

<text> </text>

**Status:** NOT IMPLEMENTED — REQUIRED

Password Reset must:

1. Use the registered and verified email address.
2. Follow the existing OTP policy.
3. Allow the user to set a new password after successful verification.
4. Revoke all existing sessions and related tokens.
5. Record an audit event.
6. Send a security notification.

Admin-Assisted Account Recovery is a separate process for users who no longer have access to their verified email.

Password Reset must not reactivate a DISABLED or SUSPENDED account.

### 6.3 Bootstrap SUPER_ADMIN

**Status:** NEEDS VERIFICATION — BLOCKING FOR INITIAL ADMIN SETUP

The initial Super Admin bootstrap process previously encountered eligibility and owner-verification errors.

The current bootstrap state must be checked and resolved before treating initial administration, Country ADMIN creation or subsequent administrative tests as ready.

Duplicate bootstrap owners must not be created, and owner verification or authorization controls must not be bypassed.

### 6.4 Other Authentication Features

The following must not be represented as available without implementation and verification:

- WhatsApp OTP verification.
- Two-factor authentication.
- Admin-Assisted Account Recovery.
- Passport login.

Refer to `v2/docs/AUTH.md` for the full authentication and account-security requirements.

## 7. Authorization and Access Control

The approved core roles are:

- `SUPER_ADMIN`
- `ADMIN`
- `AHBAB`

Functional appointments are separate from core roles.

Examples include:

- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.
- Deputy.
- Amer.
- Supervisor.
- Moderator.
- TAFAKUT Assessor.

Authorization must consider:

1. Account status.
2. Registration status, where relevant.
3. Access level.
4. Core role.
5. Functional appointment and effective dates.
6. Delegation and its scope.
7. Administrative scope.
8. Relationship to the requested resource.
9. Resource-level permission.

Frontend visibility is not authorization.

Every protected action must be validated by the backend.

Refer to:

- `v2/docs/UAC_MATRIX.md`
- `v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md`

## 8. Business Modules

Detailed functional requirements are maintained in individual module specifications.

| Module | Specification |
|---|---|
| Ahbab Profile and Account Management | `JMV2001-Ahbab-Profile-Account-Management.md` |
| Organization Structure and Governance | `JMV2002-Organization-Structure-Governance.md` |
| Syukbah Management | `JMV2003-Syukbah-Management.md` |
| Takaza Management | `JMV2004-Takaza-Management.md` |

### 8.1 Jemaah and Takaza

Important design rules:

- Jemaah Membership and Takaza Participation are separate records.
- V2 must not introduce a separate Project Member entity.
- Main Takaza and Sub Takaza have a maximum of two levels.
- Main and Sub Takaza have independent lifecycles.
- Participation requires the applicable confirmation process.
- `WITHDRAWN` and `REMOVED` are distinct outcomes.
- Historical participation records must be preserved.
- Rejoining creates a new linked participation record rather than silently reactivating an old record.

Takaza lifecycle statuses:

`DRAFT`, `RELEASED`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`

### 8.2 Amer and Supervisor

An Amer must already be a confirmed participant in the same Takaza before the appointment becomes effective.

The appointment may be made before the official Takaza start date, subject to the required consent and authorization.

The complete Amer workflow is not established merely by the existence of initial appointment-domain validation.

The full Amer report is mandatory before Takaza completion. An overdue Amer report prevents Takaza completion.

Supervisor authority and scope remain subject to unresolved design decisions. No additional Supervisor powers may be assumed.

### 8.3 KAWAIF and TAFAKUT

KAWAIF and TAFAKUT are separate processes.

The approved TAFAKUT baseline requires:

- Two independent assessors for a normal assessment round.
- A third assessor when the first two decisions disagree.
- Two new assessors for an additional round, where required.
- Preservation of submitted assessments and historical versions.
- A separate Managing Admin final decision.

Full implementation and workflow verification remain outstanding unless confirmed by the implementation-status document.

### 8.4 Reporting and Archive

The following are distinct functional areas:

- Takaza operational reports.
- Percha and Kharguzari.
- Amer completion report.
- Annual Archive and Annual Summary.
- Juhud Reports publication module.

These must not be merged into one generic reporting function without an approved data model.

Full reporting, archive and publication workflows remain subject to implementation and verification.

### 8.5 Case Management

**Status:** ON HOLD

The complete Case Management workflow has not been approved for implementation.

A Requires Attention record or related trigger does not establish that the full Case Management process is available.

## 9. Database and Migration Rules

1. Use V2 migration files for V2 schema changes.
2. Never modify an already-applied migration as a substitute for a new migration.
3. Create a new migration for each approved schema change.
4. Review migration order and database target before execution.
5. Keep migration history intact.
6. Verify the remote database separately from repository migration files.
7. Never expose database credentials or application secrets in source files.
8. Do not execute production migrations merely because a code change has been prepared.
9. Do not apply V2 migrations to the V1 database.
10. Record migration execution and verification evidence.

Production migrations are performed through the dedicated migration workflow and require explicit confirmation.

## 10. Testing and Build

Automated tests are maintained under:

`v2/test/`

Previous reported results:

- `npm test`: 94/94 tests passed.
- GitHub Actions build and test: success.

These are historical reported results, not a fresh test run performed by this document.

Testing must continue to cover:

- Authentication and OTP flows.
- Bootstrap SUPER_ADMIN.
- Account status and session revocation.
- Server-side authorization.
- Country and organization scope.
- Profile updates and protected identity fields.
- Takaza participation.
- Amer appointment and reporting.
- TAFAKUT and KAWAIF.
- Audit history.
- Frontend/API integration.
- Database migration consistency.
- V1/V2 deployment separation.

Android Termux previously encountered a `workerd` platform compatibility issue during local build.

GitHub Actions is the established build and test path for this project.

## 11. Deployment

V2 deployment is separate from V1 deployment.

The repository has dedicated workflows:

| Workflow | Purpose |
|---|---|
| `build-test.yml` | V2 tests and build verification |
| `deploy-v2-worker.yml` | V2 Worker deployment |
| `deploy.yml` | GitHub Pages deployment |
| `migrate-v2-d1.yml` | V2 D1 production migrations |

The Pages workflow publishes:

- V1 frontend at the Pages root.
- V2 frontend under `/v2/web/`.

Worker deployment does not automatically apply database migrations.

Production deployment and migration must be deliberate operations.

A successful build does not establish successful production deployment.

### 11.1 Post-Deployment Verification

After deployment, verify:

- Worker health.
- Database connectivity.
- Relevant API endpoints.
- Frontend routes and assets.
- Migration results.
- V1/V2 resource separation.
- Authentication and authorization behaviour relevant to the deployment.

Record the actual verification result in the implementation-status document.

## 12. Documentation Authority

The main V2 documentation is maintained in:

`v2/docs/`

The following documents are the primary references.

| Document | Authority |
|---|---|
| `MASTER_DECISION_REGISTER.md` | Approved project and design decisions |
| `OPEN_DECISIONS_REGISTER.md` | Unresolved decisions |
| `MODULE_REQUIREMENTS.md` | Consolidated functional requirements |
| `REPOSITORY_DISPOSITION.md` | Documentation organization and maintenance |
| `AUTH.md` | Authentication and account security |
| `UAC_MATRIX.md` | Authorization requirements |
| `DASHBOARD_NAVIGATION_SPEC_V2.md` | Dashboard and navigation |
| `JMV2001-Ahbab-Profile-Account-Management.md` | Ahbab profile and account requirements |
| `JMV2002-Organization-Structure-Governance.md` | Organization governance |
| `JMV2003-Syukbah-Management.md` | Syukbah requirements |
| `JMV2004-Takaza-Management.md` | Takaza requirements and workflows |
| `V2_DESIGN_CHECKPOINT.md` | Design direction and checkpoints |
| `V2_IMPLEMENTATION_STATUS.md` | Implementation status and roadmap |

### 12.1 Historical Documents

The following documents are retained temporarily for historical review:

- `OPEN_DECISION_REGISTER.md`
- `IMPLEMENTATION_STATUS_AND_ROADMAP.md`

They are not authoritative sources for their respective purposes.

The official open-decision document is `OPEN_DECISIONS_REGISTER.md`.

The authoritative implementation-status document is `V2_IMPLEMENTATION_STATUS.md`.

Historical documents must not silently replace or override the current authoritative documents.

Any future archival or deletion must follow the repository disposition decision.

## 13. Development Workflow

For each development change:

1. Review applicable approved requirements and decisions.
2. Inspect the current implementation.
3. Identify affected source, test and migration files.
4. Prepare complete replacement files where required.
5. Review imports, dependencies, paths and compatibility.
6. Run available tests and build checks.
7. Review the complete change set.
8. Obtain explicit approval before production deployment or migration.
9. Verify uploaded changes against the target GitHub branch.
10. Update implementation status with actual evidence.

All V2 changes must remain inside `v2/` unless an explicit project decision authorizes a shared change.

Documentation changes must also be checked for:

- Correct filenames and paths.
- Consistent terminology.
- Alignment with the Master Decision Register.
- Alignment with the Open Decisions Register.
- Alignment with the UAC Matrix.
- Accurate implementation status.
- Preservation of unresolved decisions.

## 14. Non-Negotiable Separation Rules

1. V1 and V2 must retain separate application source.
2. V1 and V2 must retain separate Worker configurations.
3. V1 and V2 must retain separate D1 databases.
4. Never run V2 migrations against the V1 database.
5. Never deploy V2 through the V1 Worker workflow.
6. Never treat a successful build as proof of production readiness.
7. Never treat an approved requirement as proof of implementation.
8. Never silently change approved business rules.
9. Preserve historical records and audit evidence.
10. Keep unresolved decisions open until formally resolved.
11. Keep V2 secrets and credentials out of source control.
12. Verify the target branch and deployment environment before executing production operations.

## 15. Project Baseline Summary

JuhudManager V2 is an independent application that must preserve technical and operational separation from V1.

Its development is governed by:

- Approved project decisions.
- Consolidated functional requirements.
- Authentication and account-security requirements.
- The UAC authorization matrix.
- Dashboard and navigation requirements.
- Individual module specifications.
- Open decisions and documented constraints.
- Evidence-based implementation status.

The existence of a specification, database table, API endpoint or frontend page does not prove that a complete business workflow is available.

Implementation, testing and deployment status must be verified separately.

**Project Rule:** JuhudManager V2 must evolve independently while preserving the operational and technical separation of V1. Security, authorization, auditability and evidence-based implementation status take precedence over assumptions or convenience.

---

**Document Status:** PROJECT DOCUMENTATION — MAINTENANCE BASELINE  
**Version:** 1.1  
**Last Updated:** 28 November 2026  
**Next Review:** Documentation consistency, implementation-status evidence and repository disposition.

**End of Document.**

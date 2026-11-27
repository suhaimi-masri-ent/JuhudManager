# JuhudManager V2

JuhudManager V2 is the next-generation implementation of JuhudManager. It is developed independently from the legacy V1 application, with its own Cloudflare Worker, D1 database, frontend, migrations, authentication, authorization and business modules.

All V2 application files are maintained under "v2/".

## 1. Project Principles

- V1 and V2 must remain technically and operationally separate.
- V2 must use its own Worker and dedicated D1 database.
- V2 database changes must use reviewed migration files.
- Authentication, authorization and account status must remain separate concerns.
- Approved requirements must not be confused with implemented functionality.
- Unresolved decisions must remain open until formally resolved.
- Security, auditability, data integrity and server-side authorization are mandatory.

## 2. Directory Structure

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

The directory structure may expand as implementation progresses.

Main locations

Component| Location
Worker source| "v2/src/"
Web frontend| "v2/web/"
D1 migrations| "v2/migrations/"
Automated tests| "v2/test/"
Documentation| "v2/docs/"
Wrangler configuration| "v2/wrangler.jsonc"

3. Infrastructure

Cloudflare Worker

Item| Configuration
Worker| "juhudmanager-v2-api"
Entry point| "src/index.js"
Configuration| "v2/wrangler.jsonc"
D1 binding| "DB"
Environment| Production

The V2 Worker foundation has been deployed previously. Its health endpoint previously returned "status: ok" and confirmed database connectivity.

This historical health result does not establish that every API, business module or production workflow is operational.

D1 Database

Item| Value
Database| "juhudmanager-v2-db"
Database ID| "4a4e736b-83ee-4889-bfbb-7fe189f92b5f"
Binding| "DB"
Migration directory| "v2/migrations/"

The repository contains migrations "0001" through "0021".

Migration "0021_super_admin_owner_verification.sql" was reported successfully applied to the remote V2 database on 26 November 2026. The reported database table count after that migration was 33.

These migration and table-count details must be checked against the current remote database before being treated as a fresh verification.

Infrastructure separation

- V1 uses its own Worker and D1 database.
- V2 uses its own Worker and D1 database.
- Never apply V2 migrations to the V1 database.
- Worker deployment and database migration are separate operations.

4. Implementation Status

The authoritative implementation status and development roadmap are maintained in:

"v2/docs/V2_IMPLEMENTATION_STATUS.md"

That document is the single source of truth for implementation progress, blockers, verification evidence and development phases.

The following status distinctions must be preserved:

Status| Meaning
IMPLEMENTED| Implementation verified for the stated scope
PARTIALLY IMPLEMENTED| Only part of the required functionality is available
IN PROGRESS| Implementation is ongoing
NOT IMPLEMENTED| Functionality has not been implemented
NEEDS VERIFICATION| Further inspection or testing is required
ON HOLD| Work is deliberately paused
REPORTED PASS| A successful result was reported but not independently rerun
DEPLOYED| Deployment verified in the stated environment

A database table, API route, UI page or approved specification alone does not prove that a complete workflow is implemented.

5. Authentication and Account Security

The authentication foundation includes implementation of several core capabilities, including:

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

Current security policies

Requirement| Policy
OTP| 6 digits
OTP validity| 5 minutes
Maximum OTP attempts| 5
Resend cooldown| 60 seconds
Identity reservation| 15 minutes
Minimum password length| 12 characters
Session idle timeout| 30 minutes
Maximum session lifetime| 12 hours

The authenticated email sender is:

"noreply@m.juhud.run.place"

Production delivery and end-to-end authentication testing remain subject to verification.

Password Reset

Status: NOT IMPLEMENTED — REQUIRED

Password Reset must:

- Use the registered and verified email address.
- Follow the existing OTP policy.
- Allow the user to set a new password after successful verification.
- Revoke all existing sessions and related tokens.
- Record an audit event.
- Send a security notification.

Admin-Assisted Account Recovery is a separate process for users who no longer have access to their verified email.

Password Reset must not reactivate DISABLED or SUSPENDED accounts.

Bootstrap SUPER_ADMIN

Status: NEEDS VERIFICATION — BLOCKING FOR INITIAL ADMIN SETUP

The initial Super Admin bootstrap process previously encountered eligibility and owner-verification errors.

The current bootstrap state must be checked and resolved before treating initial administration, Country ADMIN creation or subsequent administrative tests as ready.

Do not create duplicate bootstrap owners or bypass owner verification and authorization controls.

Other authentication features

The following must not be represented as available without implementation and verification:

- WhatsApp OTP verification.
- Two-factor authentication.
- Admin-Assisted Account Recovery.
- Passport login, pending its implementation and verification.

Refer to "v2/docs/Auth.md" for the full authentication requirements.

6. Authorization and Access Control

The approved core roles are:

- "SUPER_ADMIN"
- "ADMIN"
- "AHBAB"

Functional appointments are separate from core roles. Examples include:

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
2. Access level.
3. Core role.
4. Functional appointment and effective dates.
5. Administrative scope.
6. Relationship to the requested resource.
7. Resource-level permission.

Frontend visibility is not authorization. Every protected action must be validated by the backend.

Refer to "v2/docs/UAC_MATRIX.md" and "v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md".

7. Business Modules

The detailed functional requirements are maintained in the individual module specifications.

Module| Specification
Ahbab Profile and Account Management| "JMV2001-Ahbab-Profile-Account-Management.md"
Organization Structure and Governance| "JMV2002-Organization-Structure-Governance.md"
Syukbah Management| "JMV2003-Syukbah-Management.md"
Takaza Management| "JMV2004-Takaza-Management.md"

Jemaah and Takaza

Important design rules:

- Jemaah Membership and Takaza Participation are separate records.
- V2 must not introduce a separate Project Member entity.
- Main and Sub Takaza have a maximum of two levels.
- Main and Sub Takaza have independent lifecycles.
- Participation requires the applicable confirmation process.
- "WITHDRAWN" and "REMOVED" are distinct outcomes.
- Historical participation records must be preserved.

Takaza lifecycle statuses:

"DRAFT", "RELEASED", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"

Amer and Supervisor

An Amer must already be a confirmed participant in the same Takaza before the appointment becomes effective.

The appointment may be made before the official Takaza start date, subject to the required consent and authorization.

The complete Amer workflow is not established merely by the existence of initial appointment-domain validation.

Supervisor authority and scope remain subject to unresolved design decisions. No additional Supervisor powers may be assumed.

KAWAIF and TAFAKUT

KAWAIF and TAFAKUT are separate processes.

The approved TAFAKUT baseline requires two independent assessors, with a third assessor when their decisions disagree. Assessment submissions and historical versions must be preserved.

Full implementation and workflow verification remain outstanding.

Reporting and archive

The following are distinct functional areas:

- Takaza operational reports.
- Percha and Kharguzari.
- Amer completion report.
- Annual Archive and Annual Summary.
- Juhud Reports publication module.

The Amer report is required before a Takaza can be completed under the approved requirements.

Full reporting, archive and publication workflows remain subject to implementation and verification.

Case Management

Status: ON HOLD

The complete Case Management workflow has not been approved for implementation. A Requires Attention record or related trigger does not establish that the full case-management process is available.

8. Database and Migration Rules

1. Use V2 migration files for V2 schema changes.
2. Never modify an already-applied migration as a substitute for a new migration.
3. Create a new migration for each approved schema change.
4. Review migration order and database target before execution.
5. Keep migration history intact.
6. Verify the remote database separately from repository migration files.
7. Never expose database credentials or application secrets in source files.
8. Do not execute production migrations merely because a code change has been prepared.

Production migrations are performed through the dedicated migration workflow and require explicit confirmation.

9. Testing and Build

Automated tests are maintained under:

"v2/test/"

A previous user-reported test result was:

- "npm test": 94/94 tests passed.
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
- Amer appointment.
- TAFAKUT and KAWAIF.
- Audit history.
- Frontend/API integration.
- Database migration consistency.
- V1/V2 deployment separation.

Android Termux previously encountered a "workerd" platform compatibility issue during local build. GitHub Actions is the established build and test path for this project.

10. Deployment

V2 deployment is separate from V1 deployment.

The repository has dedicated workflows:

Workflow| Purpose
"build-test.yml"| V2 tests and build verification
"deploy-v2-worker.yml"| V2 Worker deployment
"deploy.yml"| GitHub Pages deployment
"migrate-v2-d1.yml"| V2 D1 production migrations

The Pages workflow publishes:

- V1 frontend at the Pages root.
- V2 frontend under "/v2/web/".

Worker deployment does not automatically apply database migrations.

Production deployment and migration must be deliberate operations. A successful build does not establish successful production deployment.

After deployment, verify:

- Worker health.
- Database connectivity.
- Relevant API endpoints.
- Frontend routes and assets.
- Migration results.
- V1/V2 resource separation.

11. Documentation Authority

The main V2 documentation is maintained in "v2/docs/".

Document| Authority
"MASTER_DECISION_REGISTER.md"| Approved project and design decisions
"OPEN_DECISIONS_REGISTER.md"| Unresolved decisions
"MODULE_REQUIREMENTS.md"| Consolidated functional requirements
"REPOSITORY_DISPOSITION.md"| Documentation organization and maintenance
"Auth.md"| Authentication and account security
"UAC_MATRIX.md"| Authorization requirements
"DASHBOARD_NAVIGATION_SPEC_V2.md"| Dashboard and navigation
"JMV2001-Ahbab-Profile-Account-Management.md"| Ahbab profile and account requirements
"JMV2002-Organization-Structure-Governance.md"| Organization governance
"JMV2003-Syukbah-Management.md"| Syukbah requirements
"JMV2004-Takaza-Management.md"| Takaza requirements and workflows
"V2_DESIGN_CHECKPOINT.md"| Design direction and checkpoints
"V2_IMPLEMENTATION_STATUS.md"| Implementation status and roadmap

The older "OPEN_DECISION_REGISTER.md" and "IMPLEMENTATION_STATUS_AND_ROADMAP.md" are retained temporarily for historical review. They are not authoritative sources for their respective purposes.

12. Development Workflow

For each development change:

1. Review the applicable approved requirements and decisions.
2. Inspect the current implementation.
3. Identify the affected source, test and migration files.
4. Prepare complete replacement files where required.
5. Review imports, dependencies, paths and compatibility.
6. Run the available tests and build checks.
7. Review the complete change set.
8. Obtain explicit approval before production deployment or migration.
9. Verify uploaded changes against the target GitHub branch.
10. Update implementation status with the actual evidence.

All V2 changes must remain inside "v2/" unless an explicit project decision authorizes a shared change.

13. Non-Negotiable Separation Rules

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

---

Project rule: JuhudManager V2 must evolve independently while preserving the operational and technical separation of V1. Security, authorization, auditability and evidence-based implementation status take precedence over assumptions or convenience.

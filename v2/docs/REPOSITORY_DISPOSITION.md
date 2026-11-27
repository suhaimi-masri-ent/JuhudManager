JuhudManager V2 — Repository Documentation Disposition

Document ID: JMV2-DOC-INV-001
Version: 1.0
Date: 27 November 2026
Status: Repository Documentation Working Baseline

---

1. Purpose

This document defines how JuhudManager V2 documentation should be organized, maintained and reconciled within the repository.

It identifies:

- New documentation to add.
- Existing documents to retain.
- Existing documents requiring updates.
- Historical documents to preserve.
- Duplicate packages requiring later review.
- Safe documentation maintenance procedures.

This document does not authorize deletion, migration, deployment or production changes.

2. Repository Context

Repository:

"suhaimi-masri-ent/JuhudManager"

Development branch context:

"integration/v1-v2-separation-develop"

Application structure:

Path| Purpose
"v1/"| Legacy V1 application
"v2/"| V2 application
"v2/src/"| V2 backend
"v2/web/"| V2 frontend
"v2/migrations/"| V2 database migrations
"v2/docs/"| V2 documentation

3. Documentation Organization Principle

The V2 documentation convention is a flat directory:

"v2/docs/"

Do not create additional documentation subdirectories for the new baseline documents.

Existing "archive/" and "packages/" directories must remain intact.

Documentation must be easy to locate and must not be duplicated unnecessarily.

4. New Documents to Add

The following documents are part of the consolidated documentation set.

File| Purpose
"MASTER_DECISION_REGISTER.md"| Central register of approved and provisional decisions
"OPEN_DECISIONS_REGISTER.md"| Unresolved decisions and required outcomes
"MODULE_REQUIREMENTS.md"| Consolidated functional requirements
"IMPLEMENTATION_STATUS_AND_ROADMAP.md"| Implementation tracking and development roadmap
"REPOSITORY_DISPOSITION.md"| Documentation inventory and maintenance rules

These files should be added to "v2/docs/".

5. Existing V2 Documents to Retain

The following existing documents must be preserved.

Existing file| Required treatment
"Auth.md"| Retain and reconcile with current authentication requirements
"JMV2001-Ahbab-Profile-Account-Management.md"| Retain and reconcile with current profile and account decisions
"JMV2002-Organization-Structure-Governance.md"| Retain and reconcile with current governance decisions
"JMV2003-Syukbah-Management.md"| Retain and reconcile with current Syukbah decisions
"JMV2004-Takaza-Management.md"| Retain and reconcile with current Takaza decisions
"UAC_MATRIX.md"| Retain and reconcile with the latest permission baseline
"DASHBOARD_NAVIGATION_SPEC_V2.md"| Retain and reconcile with UAC and module behavior
"V2_DESIGN_CHECKPOINT.md"| Update with current repository and design status
"V2_IMPLEMENTATION_STATUS.md"| Reconcile with the consolidated implementation status
"JMV2-AUDIT-HANDOVER-2026-11-24.md"| Preserve as historical handover

Do not blindly overwrite the existing module specifications.

Preserve useful details, document IDs and history while reconciling conflicts.

6. Existing Root-Level Documentation

The root "docs/" directory contains project-level documentation.

6.1 Master Development Roadmap

File:

"docs/DEVELOPMENT_ROADMAP.md"

Treatment:

- Retain as the master development roadmap covering V1 and V2.
- Reconcile its V2 section with the current V2 decisions.
- Keep V1-specific requirements within their historical or V1 scope.
- Correct references that incorrectly describe V2 Project Member as a separate entity.
- Reflect the current migration and implementation evidence carefully.

Do not replace the project-level roadmap with a V2-only document.

6.2 Pre-Master Roadmap

File:

"docs/DEVELOPMENT_ROADMAP_PRE-MASTER_2026-11-27.md"

Treatment:

- Retain as historical.
- Do not treat it as the latest master roadmap.
- Do not delete it during documentation cleanup.

6.3 System Realignment Design

File:

"docs/SYSTEM_REALIGNMENT_DESIGN.md"

Treatment:

- Retain at the repository root.
- Treat as a project-level design reference.
- Preserve historical design context.
- Reconcile conflicting concepts against the latest approved V2 decisions.
- Correct the Percha spelling where required.
- Make clear that design documentation does not authorize database migrations or production changes.

This file must not be moved or duplicated automatically into "v2/docs/".

6.4 D1 Read-Only Console Guide

File:

"docs/D1_READONLY_WEB_CONSOLE.md"

Treatment:

- Retain.
- Keep its operational guidance separate from functional requirements.
- Ensure read-only database guidance remains clear.

6.5 Root and Application READMEs

Preserve:

- "README.md"
- "v1/README.md"
- "v2/README.md"

Reconcile links and descriptions where necessary.

Do not describe unimplemented V2 features as available.

7. Historical Documents and Archives

7.1 Historical Audit Handover

File:

"v2/docs/JMV2-AUDIT-HANDOVER-2026-11-24.md"

Treatment:

- Preserve as a historical snapshot.
- Retain its original date and findings.
- Do not use it as the current migration status without reconciliation.
- Add a later status reference where appropriate.

The document predates the reported remote application of migration 0021.

7.2 Existing Archive Directory

Path:

"v2/docs/archive/"

Existing historical packages:

- "V2_IMPLEMENTATION_STATUS_PACKAGE_2026-11-19.md"
- "V2_IMPLEMENTATION_STATUS_PACKAGE_ROOT_2026-11-19.md"

Treatment:

- Preserve.
- Do not delete or overwrite.
- Use for historical comparison only.

7.3 Existing Packages Directory

Path:

"v2/docs/packages/"

Existing packages:

- "JuhudManager_V2_Auth_Package.zip"
- "JuhudManager_V2_Foundation_Package.zip"

Treatment:

- Preserve both packages.
- Treat them as historical snapshots until their contents are fully compared with the current source.
- Do not assume they contain the latest implementation.
- Do not use them as current deployment instructions without verification.

8. Duplicate Root-Level ZIP Packages

The repository also contains root-level copies of:

- "docs/JuhudManager_V2_Auth_Package.zip"
- "docs/JuhudManager_V2_Foundation_Package.zip"

The recorded file hashes indicate that these match their respective copies under "v2/docs/packages/".

Recommended future treatment:

- Keep the canonical V2 package copies under "v2/docs/packages/".
- Consider removing root-level duplicates only after explicit approval.
- Do not delete either copy as part of this documentation update without confirmation.

9. V2 README Reconciliation

File:

"v2/README.md"

Required updates:

1. Confirm the migration list includes migrations 0001 through 0021 where applicable.
2. Verify migration files against the actual repository.
3. Record migration 0021 remote application as reported until independently checked.
4. Do not claim Password Reset is available.
5. State that Password Reset is required but not yet implemented.
6. Keep WhatsApp OTP marked as not implemented.
7. Keep two-factor authentication marked as not implemented.
8. Keep Passport login pending.
9. Describe Amer appointment foundation separately from the complete Amer workflow.
10. Identify the bootstrap SUPER_ADMIN issue as a blocker requiring verification.
11. Preserve the V1/V2 deployment separation.

10. Authentication Documentation Reconciliation

File:

"v2/docs/Auth.md"

Required updates:

- Keep authentication separate from authorization.
- Preserve identity and account-status distinctions.
- Document the existing OTP policy.
- Document session timeout requirements.
- Add Password Reset as a required but unimplemented feature.
- Include session and token revocation after successful Password Reset.
- Include audit and security notification.
- Keep Admin-assisted recovery separate from Password Reset.
- Preserve WhatsApp OTP and two-factor authentication as unimplemented.
- Preserve Passport login as pending.

11. Module Specification Reconciliation

11.1 JMV2001 — Ahbab Profile and Account Management

Reconcile:

- Account statuses.
- Access levels.
- Registration status.
- Protected identity fields.
- Profile verification.
- Password Reset.
- Disablement.
- Reactivation.
- Appeal.

Correct any statement that implies Password Reset is already available.

11.2 JMV2002 — Organization Structure and Governance

Reconcile:

- SUPER_ADMIN and Country ADMIN scope.
- Chief Admin and Deputy structure.
- Faisalah title.
- Markaz Negara supervisory relationship.
- Separate country records.
- Cross-organization support.
- Pending governance alternatives.

Do not treat both Markaz Negara governance alternatives as simultaneously approved.

11.3 JMV2003 — Syukbah Management

Reconcile:

- Syukbah separation from organization hierarchy.
- Global Baseline Syukbah.
- Country Syukbah.
- Admin Syukbah.
- Deputy and acting delegation.
- Moderator permissions.
- Discussion and CMS separation.
- Cross-scope authority.

11.4 JMV2004 — Takaza Management

Reconcile:

- Jemaah membership and Takaza participation.
- Main and Sub Takaza.
- Four participation methods.
- Automatic inclusion confirmation.
- Amer eligibility and consent.
- Supervisor pending authority.
- KAWAIF and TAFAKUT.
- Withdrawal, removal, appeal and transfer.
- Events and attendance.
- Percha and Kharguzari.
- Amer report and completion.
- Cancellation and Requires Attention.
- Annual Archive and Annual Summary.

V2 must not create a separate Project Member entity.

12. UAC and Dashboard Reconciliation

12.1 UAC Matrix

Ensure:

- Administrative roles remain distinct.
- Scope is explicit.
- Backend authorization is mandatory.
- DISABLED cannot be overridden by LIMITED access.
- Admin Markaz, Admin Syukbah and Admin Takaza permissions are separate.
- Pending decisions are not represented as approved permissions.

12.2 Dashboard and Navigation

Ensure:

- Menu visibility follows authorization.
- Dashboard display does not grant permission.
- Unauthorized actions are blocked by the backend.
- Pending modules are not presented as fully functional.
- Navigation remains consistent with module availability.

13. Design Checkpoint Reconciliation

File:

"v2/docs/V2_DESIGN_CHECKPOINT.md"

Required updates:

- Record the current V1/V2 repository separation.
- Remove stale statements that V1 relocation has not started where the current branch confirms the directory structure.
- Distinguish repository separation from production deployment verification.
- Update migration and implementation references.
- Preserve unresolved design decisions.
- Retain the checkpoint's historical purpose.

The Design Checkpoint is a living progress record, not a replacement for detailed module specifications.

14. Implementation Status Reconciliation

File:

"v2/docs/V2_IMPLEMENTATION_STATUS.md"

Required updates:

- Align with the consolidated implementation status.
- Record the bootstrap SUPER_ADMIN blocker.
- Record Password Reset as required but not implemented.
- Distinguish reported tests from independently verified results.
- Record Amer implementation as partial until the complete workflow is tested.
- Identify Supervisor, KAWAIF and TAFAKUT status accurately.
- Record reporting and archive work as outstanding where applicable.
- Keep Case Management ON HOLD.

15. Project-Level System Design Precedence

"docs/SYSTEM_REALIGNMENT_DESIGN.md" is a project-level design reference.

When it conflicts with a later explicitly approved V2 requirement:

1. Identify the conflicting statements.
2. Record the current approved decision.
3. Update the affected V2 specification.
4. Update the project-level reference where appropriate.
5. Preserve historical context.
6. Record any migration or implementation impact separately.

No design document alone authorizes database or production changes.

16. Recommended Documentation Application Order

Apply the documentation changes in this order:

1. Preserve a backup or Git commit of the current documentation.
2. Add the five new consolidated documents.
3. Reconcile "Auth.md".
4. Reconcile JMV2001.
5. Reconcile JMV2002.
6. Reconcile JMV2003.
7. Reconcile JMV2004.
8. Reconcile UAC Matrix.
9. Reconcile Dashboard and Navigation.
10. Update V2 Implementation Status.
11. Update V2 Design Checkpoint.
12. Reconcile the root Master Development Roadmap.
13. Update "v2/README.md".
14. Update documentation links.
15. Review the complete diff.
16. Commit only after review and explicit user approval.

No deployment is required merely to publish documentation changes.

17. Documentation Quality Checks

Before committing, confirm:

- No conflicting account status definitions.
- No conflict between LIMITED and DISABLED.
- Password Reset is consistently marked required but not implemented.
- Amer eligibility is consistent across all documents.
- No separate V2 Project Member entity is introduced.
- Main and Sub Takaza lifecycle is independent.
- WITHDRAWN and REMOVED remain distinct.
- Supervisor authority remains pending.
- TAFAKUT assessor rules are consistent.
- Amer report remains mandatory for completion.
- Case Management remains ON HOLD.
- Historical documents remain preserved.
- README links point to existing files.
- No feature is described as implemented without evidence.

18. Change Control

Any future documentation change must:

- Preserve relevant history.
- Identify the affected document.
- Update version and date.
- Record the reason for change.
- Reconcile dependent documents.
- Review authorization impact.
- Review implementation impact.

Do not silently remove approved requirements.

---

End of Document

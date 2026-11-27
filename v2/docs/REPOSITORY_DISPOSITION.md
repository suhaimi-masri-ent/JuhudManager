
# JuhudManager V2 — Repository Documentation Disposition

**Document ID:** JMV2-DOC-INV-001  
**Version:** 1.2  
**Date:** 28 November 2026  
**Status:** Current Documentation Baseline  
**Repository:** `suhaimi-masri-ent/JuhudManager`  
**Branch Context:** `integration/v1-v2-separation-develop`

---

## 1. Purpose

This document defines how JuhudManager documentation is organized, maintained and reconciled within the repository.

It establishes:

- Documentation authority.
- Current documentation locations.
- Documents to retain.
- Superseded and historical documents.
- Archive and package handling.
- README responsibilities.
- Documentation maintenance and change-control procedures.

This document does not authorize application changes, file deletion, database migration, deployment or production changes.

## 2. Repository Context

The repository maintains two separate application versions.

| Path | Purpose |
|---|---|
| `v1/` | Legacy V1 application |
| `v2/` | V2 application |
| `v2/src/` | V2 backend and Worker source |
| `v2/web/` | V2 frontend |
| `v2/migrations/` | V2 D1 database migrations |
| `v2/docs/` | V2 documentation |
| `docs/` | Shared project-level documentation |
| `.github/workflows/` | Build, test, deployment and migration workflows |

V1 and V2 must remain technically and operationally separate.

Their application code, Worker configurations, databases and deployment processes must not be mixed.

## 3. Documentation Organization

### 3.1 V2 Documentation Location

The authoritative V2 documentation is maintained in:

`v2/docs/`

The current baseline documents remain directly in this directory.

Existing directories must be preserved:

- `v2/docs/archive/`
- `v2/docs/packages/`

Do not create duplicate authoritative documents or move existing historical records without review.

### 3.2 Documentation Authority

| Subject | Authoritative document |
|---|---|
| Approved design decisions | `MASTER_DECISION_REGISTER.md` |
| Unresolved decisions | `OPEN_DECISIONS_REGISTER.md` |
| Consolidated functional requirements | `MODULE_REQUIREMENTS.md` |
| Authentication | `AUTH.md` |
| Authorization | `UAC_MATRIX.md` |
| Dashboard and navigation | `DASHBOARD_NAVIGATION_SPEC_V2.md` |
| Ahbab profile and account | `JMV2001-Ahbab-Profile-Account-Management.md` |
| Organization governance | `JMV2002-Organization-Structure-Governance.md` |
| Syukbah | `JMV2003-Syukbah-Management.md` |
| Takaza | `JMV2004-Takaza-Management.md` |
| Design checkpoint | `V2_DESIGN_CHECKPOINT.md` |
| Implementation status and roadmap | `V2_IMPLEMENTATION_STATUS.md` |
| Repository documentation organization | `REPOSITORY_DISPOSITION.md` |

The implementation status document does not override approved design decisions or functional requirements.

An approved requirement does not prove that the corresponding feature has been implemented.

### 3.3 Current Consolidated Documentation Set

The following files form the current V2 documentation baseline:

| File | Required treatment |
|---|---|
| `MASTER_DECISION_REGISTER.md` | Maintain as the approved-decision register |
| `OPEN_DECISIONS_REGISTER.md` | Maintain as the unresolved-decision register |
| `MODULE_REQUIREMENTS.md` | Maintain as consolidated functional requirements |
| `REPOSITORY_DISPOSITION.md` | Maintain repository documentation rules |
| `AUTH.md` | Maintain authentication requirements |
| `UAC_MATRIX.md` | Maintain authorization requirements |
| `DASHBOARD_NAVIGATION_SPEC_V2.md` | Maintain dashboard and navigation baseline |
| `JMV2001-Ahbab-Profile-Account-Management.md` | Maintain Ahbab profile and account specification |
| `JMV2002-Organization-Structure-Governance.md` | Maintain organization specification |
| `JMV2003-Syukbah-Management.md` | Maintain Syukbah specification |
| `JMV2004-Takaza-Management.md` | Maintain Takaza specification |
| `V2_DESIGN_CHECKPOINT.md` | Maintain design and project checkpoint |
| `V2_IMPLEMENTATION_STATUS.md` | Maintain the single implementation status and roadmap source |

Preserve useful details, document IDs, approved decisions and historical context when updating these documents.

Do not blindly overwrite module specifications.

## 4. Superseded Documentation

### 4.1 Singular Open Decision Register

Historical filename:

`v2/docs/OPEN_DECISION_REGISTER.md`

Current treatment:

- Superseded by `v2/docs/OPEN_DECISIONS_REGISTER.md`.
- The singular file has been removed from the current repository baseline.
- It is not an authoritative source for current unresolved decisions.
- Do not recreate the singular file.
- Use the plural filename for all current references.
- Preserve historical information only where it exists in an approved archive or other retained historical record.

The official current register is:

`v2/docs/OPEN_DECISIONS_REGISTER.md`

### 4.2 Previous Implementation Status and Roadmap

Historical filename:

`v2/docs/IMPLEMENTATION_STATUS_AND_ROADMAP.md`

Treatment:

- Its functional purpose has been consolidated into `V2_IMPLEMENTATION_STATUS.md`.
- It is not the authoritative implementation status or roadmap.
- Preserve it if it exists as a historical document.
- Do not independently update its implementation status.
- Review before archival or removal.
- Do not delete without explicit approval.

### 4.3 Current Implementation Source of Truth

The sole authoritative implementation status and roadmap document is:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

It records:

- Implementation progress.
- Verification evidence.
- Blockers.
- Development phases.
- Release gates.
- Outstanding implementation work.

No other document should maintain a competing implementation roadmap.

## 5. Root-Level Shared Documentation

The root `docs/` directory contains project-level documentation shared across V1 and V2.

### 5.1 Master Development Roadmap

File:

`docs/DEVELOPMENT_ROADMAP.md`

Treatment:

- Retain as the master development roadmap covering V1 and V2.
- Reconcile its V2 section with current approved decisions.
- Keep V1-specific requirements within their historical or V1 scope.
- Correct references that incorrectly describe V2 Project Member as a separate entity.
- Reflect migration and implementation evidence carefully.
- Do not replace this project-level roadmap with a V2-only document.

### 5.2 Pre-Master Roadmap

File:

`docs/DEVELOPMENT_ROADMAP_PRE-MASTER_2026-11-27.md`

Treatment:

- Retain as a historical roadmap.
- Do not treat it as the latest master roadmap.
- Do not delete it during routine documentation cleanup.

### 5.3 System Realignment Design

File:

`docs/SYSTEM_REALIGNMENT_DESIGN.md`

Treatment:

- Retain at the repository root.
- Treat as a project-level design reference.
- Preserve historical design context.
- Reconcile conflicting concepts against later approved V2 decisions.
- Correct Percha spelling where required.
- Make clear that design documentation does not authorize database migrations or production changes.
- Do not move or duplicate it automatically into `v2/docs/`.

### 5.4 D1 Read-Only Console Guide

File:

`docs/D1_READONLY_WEB_CONSOLE.md`

Treatment:

- Retain.
- Keep operational guidance separate from functional requirements.
- Ensure read-only database guidance remains clear.
- Do not introduce write or destructive operations into read-only instructions.

### 5.5 Root and Application READMEs

Preserve all three README files:

- `README.md`
- `v1/README.md`
- `v2/README.md`

Their responsibilities are different:

| File | Responsibility |
|---|---|
| Root `README.md` | Repository structure, V1/V2 separation and shared workflows |
| `v1/README.md` | V1 application status and documentation |
| `v2/README.md` | V2 architecture, infrastructure, development and documentation references |

The root README and V2 README have been reconciled with the current repository documentation structure on the integration branch.

The V1 README currently identifies V1 as undergoing restructuring and pending revalidation.

Future updates must preserve the separate responsibilities of these files.

Do not describe unimplemented V2 features as available.

## 6. Historical Documents and Archives

### 6.1 Historical Audit Handover

File:

`v2/docs/JMV2-AUDIT-HANDOVER-2026-11-24.md`

Treatment:

- Preserve as a historical snapshot.
- Retain its original date and findings.
- Do not treat it as the current implementation status.
- Use it for historical comparison only.
- Remember that it predates the reported remote application of migration 0021.

### 6.2 Existing Archive Directory

Path:

`v2/docs/archive/`

Known historical documents:

- `V2_IMPLEMENTATION_STATUS_PACKAGE_2026-11-19.md`
- `V2_IMPLEMENTATION_STATUS_PACKAGE_ROOT_2026-11-19.md`

Treatment:

- Preserve historical records.
- Do not delete or overwrite them during routine documentation maintenance.
- Use them for historical comparison only.
- Do not treat archived implementation status as current implementation evidence.

### 6.3 Existing Packages Directory

Path:

`v2/docs/packages/`

Known packages:

- `JuhudManager_V2_Auth_Package.zip`
- `JuhudManager_V2_Foundation_Package.zip`

Treatment:

- Preserve both packages.
- Treat them as historical snapshots until their contents are fully compared with current source.
- Do not assume they contain the latest implementation.
- Do not use them as current deployment instructions without verification.

## 7. Duplicate Root-Level ZIP Packages

The repository also contains historical package copies under:

- `docs/JuhudManager_V2_Auth_Package.zip`
- `docs/JuhudManager_V2_Foundation_Package.zip`

The recorded file hashes indicate that these match their respective copies under `v2/docs/packages/`.

Recommended treatment:

- Keep `v2/docs/packages/` as the canonical location for V2-specific historical packages.
- Consider removing root-level duplicates only after explicit approval.
- Do not delete either copy as part of routine documentation maintenance.
- Verify file hashes again before any future removal.

No duplicate package is authorized for deletion by this document.

## 8. README Reconciliation

### 8.1 Root README

File:

`README.md`

Current responsibility:

- Describe V1/V2 repository separation.
- Identify major application directories.
- List principal V2 documentation.
- Identify authoritative decision and implementation status documents.
- Describe actual deployment workflows.
- Document Pages paths and migration safeguards.

Future changes must keep the repository description consistent with actual workflow files and directory structure.

### 8.2 V1 README

File:

`v1/README.md`

Current responsibility:

- Describe V1 application status.
- Identify V1 application and configuration boundaries.
- Distinguish retained source from verified functionality.
- Record outstanding V1 revalidation work.

Do not claim that V1 deployment or functional testing is complete without evidence.

### 8.3 V2 README

File:

`v2/README.md`

Current responsibility:

- Describe V2 architecture and infrastructure.
- Identify V2 Worker and D1 database.
- Reference migrations 0001 through 0021.
- Distinguish historical migration and health-check reports from fresh verification.
- Identify Password Reset as required but not implemented.
- Identify the bootstrap SUPER_ADMIN issue as requiring verification.
- Document authorization and module boundaries.
- Describe separate V1/V2 deployment.
- Identify authoritative V2 documentation.

The V2 README is an orientation document. It does not replace detailed specifications or the implementation status document.

### 8.4 README Maintenance Rule

Any change affecting the following must be checked against actual repository files before updating a README:

- Repository structure.
- Worker configuration.
- Database configuration.
- Migration range.
- Deployment workflow.
- Documentation authority.
- Feature availability.

## 9. Authentication Documentation Reconciliation

File:

`v2/docs/AUTH.md`

Required baseline:

- Keep authentication separate from authorization.
- Preserve identity and account-status distinctions.
- Document the existing OTP policy.
- Document session timeout requirements.
- Include Password Reset as required but not implemented.
- Include session and token revocation after successful Password Reset.
- Include audit and security notification.
- Keep Admin-Assisted Account Recovery separate from Password Reset.
- Preserve WhatsApp OTP and two-factor authentication as unimplemented.
- Preserve Passport login as pending until implemented and verified.
- Do not imply that password recovery is already available.

The correct filename is uppercase `AUTH.md`.

All current documentation references must use this exact filename and casing.

## 10. Module Specification Reconciliation

### 10.1 JMV2001 — Ahbab Profile and Account Management

File:

`v2/docs/JMV2001-Ahbab-Profile-Account-Management.md`

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

### 10.2 JMV2002 — Organization Structure and Governance

File:

`v2/docs/JMV2002-Organization-Structure-Governance.md`

Reconcile:

- SUPER_ADMIN and Country ADMIN scope.
- Chief Admin and Deputy structure.
- Faisalah title.
- Markaz Negara supervisory relationship.
- Separate country records.
- Cross-organization support.
- Pending governance alternatives.

Do not treat both Markaz Negara governance alternatives as simultaneously approved.

### 10.3 JMV2003 — Syukbah Management

File:

`v2/docs/JMV2003-Syukbah-Management.md`

Reconcile:

- Syukbah separation from organization hierarchy.
- Global Baseline Syukbah.
- Country Syukbah.
- Admin Syukbah.
- Deputy and acting delegation.
- Moderator permissions.
- Discussion and CMS separation.
- Cross-scope authority.

### 10.4 JMV2004 — Takaza Management

File:

`v2/docs/JMV2004-Takaza-Management.md`

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

## 11. UAC and Dashboard Reconciliation

### 11.1 UAC Matrix

File:

`v2/docs/UAC_MATRIX.md`

Ensure:

- Administrative roles remain distinct.
- Scope is explicit.
- Backend authorization is mandatory.
- DISABLED cannot be overridden by LIMITED access.
- Admin Markaz, Admin Syukbah and Admin Takaza permissions are separate.
- Pending decisions are not represented as approved permissions.
- Functional appointments are not treated as global core roles.

### 11.2 Dashboard and Navigation

File:

`v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md`

Ensure:

- Menu visibility follows authorization.
- Dashboard display does not grant permission.
- Unauthorized actions are blocked by the backend.
- Pending modules are not presented as fully functional.
- Navigation remains consistent with module availability.
- Resource-level permission is enforced by the backend.

## 12. Design Checkpoint Reconciliation

File:

`v2/docs/V2_DESIGN_CHECKPOINT.md`

Required treatment:

- Record the current V1/V2 repository separation.
- Remove stale statements that V1 relocation has not started where the current branch confirms the directory structure.
- Distinguish repository separation from production deployment verification.
- Update migration and implementation references.
- Preserve unresolved design decisions.
- Retain the checkpoint's historical purpose.

The Design Checkpoint is a living progress record, not a replacement for detailed module specifications.

## 13. Implementation Status Reconciliation

File:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

This is the sole authoritative implementation status and roadmap document.

It must:

- Record repository and infrastructure status.
- Record Worker and D1 status.
- Track migration evidence.
- Record authentication and authorization status.
- Record the bootstrap SUPER_ADMIN blocker.
- Record Password Reset as required but not implemented.
- Distinguish reported tests from independently verified results.
- Record Amer implementation as partial until the complete workflow is tested.
- Identify Supervisor, KAWAIF and TAFAKUT status accurately.
- Record reporting and archive work as outstanding where applicable.
- Keep Case Management ON HOLD.
- Maintain development phases and release gates.
- Preserve the distinction between design approval, implementation and deployment.

No other document should independently maintain a competing implementation roadmap.

## 14. Project-Level System Design Precedence

`docs/SYSTEM_REALIGNMENT_DESIGN.md` is a project-level design reference.

When it conflicts with a later explicitly approved V2 requirement:

1. Identify the conflicting statements.
2. Check the Master Decision Register.
3. Record the current approved decision.
4. Update the affected V2 specification.
5. Update the project-level reference where appropriate.
6. Preserve historical context.
7. Record migration or implementation impact separately.

No design document alone authorizes database or production changes.

## 15. Workflow and Deployment Documentation

The current workflows are maintained in `.github/workflows/`.

| Workflow | Purpose | Trigger |
|---|---|---|
| `build-test.yml` | V2 tests and build verification | Integration branch push, PR to `develop` or `main`, or manual |
| `deploy.yml` | GitHub Pages deployment | Manual |
| `deploy-v1-worker.yml` | V1 Worker deployment | Manual |
| `deploy-v2-worker.yml` | V2 Worker deployment | Manual |
| `migrate-v2-d1.yml` | V2 production D1 migrations | Manual with `APPLY` confirmation |

Workflow maintenance rules:

- V1 and V2 Worker deployments must remain separate.
- Pages deployment must preserve the V1 root and V2 frontend paths.
- V2 database migrations must target only the V2 database.
- Production migrations require explicit confirmation.
- Worker deployment must not be assumed to apply database migrations.
- Workflow descriptions must match the actual workflow files.
- Do not describe a workflow as successful without execution evidence.

## 16. Documentation Maintenance Order

For future documentation reconciliation, follow this order:

1. Preserve a backup or Git commit of the current documentation.
2. Review the Master Decision Register.
3. Review the Open Decisions Register.
4. Review Module Requirements.
5. Reconcile AUTH.
6. Reconcile JMV2001.
7. Reconcile JMV2002.
8. Reconcile JMV2003.
9. Reconcile JMV2004.
10. Reconcile UAC Matrix.
11. Reconcile Dashboard and Navigation.
12. Update V2 Implementation Status.
13. Update V2 Design Checkpoint.
14. Reconcile the root Master Development Roadmap where required.
15. Reconcile root, V1 and V2 READMEs where required.
16. Review documentation links and references.
17. Review the complete diff.
18. Commit only after review and explicit user approval.

No deployment is required merely to publish documentation changes.

## 17. Documentation Quality Checks

Before treating a documentation set as reconciled, confirm:

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
- README references point to existing files.
- Authentication references use the exact filename `AUTH.md`.
- The deleted singular Open Decision Register is not referenced as a current file.
- No feature is described as implemented without evidence.
- Implementation status is maintained only in `V2_IMPLEMENTATION_STATUS.md`.
- Superseded documents are not accidentally treated as authoritative.
- V1 and V2 remain separate in documentation and deployment instructions.

## 18. Change Control

Any future documentation change must:

- Preserve relevant history.
- Identify the affected document.
- Update version and date where applicable.
- Record the reason for change.
- Reconcile dependent documents.
- Review authorization impact.
- Review implementation impact.
- Preserve unresolved decisions until formally resolved.
- Avoid silently removing approved requirements.

### 18.1 Archival and Deletion Controls

Archiving and deletion are separate actions from documentation reconciliation.

No file should be deleted solely because:

- It is older.
- It is duplicated.
- Another document has replaced its function.
- It appears unused.
- It contains historical implementation status.

Before archival or deletion:

1. Identify the file and its current purpose.
2. Compare its contents with the authoritative document.
3. Preserve unique historical information.
4. Confirm whether the file is referenced by another document or workflow.
5. Obtain explicit approval.
6. Record the action.

The historical removal of the singular Open Decision Register is recorded in Section 4.1. Its absence must not be treated as authorization to remove other historical documents.

---

**Document Status:** CURRENT DOCUMENTATION BASELINE  
**Version:** 1.2  
**Last Updated:** 28 November 2026

**Repository rule:** Preserve history, maintain a single source of truth for each subject, and never confuse documented requirements with verified implementation.

**End of Document.**

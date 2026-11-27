JuhudManager V2 — Repository Documentation Disposition

Document ID: JMV2-DOC-INV-001
Version: 1.1
Date: 28 November 2026
Status: Current Documentation Baseline
Repository: "suhaimi-masri-ent/JuhudManager"
Branch Context: "integration/v1-v2-separation-develop"

---

1. Purpose

This document defines how JuhudManager V2 documentation is organized, maintained and reconciled within the repository.

It identifies:

- Authoritative documentation.
- Existing documents to retain.
- Documents requiring reconciliation.
- Superseded documents.
- Historical documents and archives.
- Duplicate documentation packages.
- Safe documentation maintenance procedures.

This document does not authorize deletion, migration, deployment or production changes.

2. Repository Context

The repository maintains two separate application versions.

Path| Purpose
"v1/"| Legacy V1 application
"v2/"| V2 application
"v2/src/"| V2 backend
"v2/web/"| V2 frontend
"v2/migrations/"| V2 database migrations
"v2/docs/"| V2 documentation
"docs/"| Shared project-level documentation
".github/workflows/"| Build, test and deployment workflows

V1 and V2 must remain technically and operationally separate.

3. Documentation Organization Principle

The V2 documentation convention is a flat directory:

"v2/docs/"

Do not create additional documentation subdirectories for the current authoritative baseline documents.

Existing directories must be preserved:

- "v2/docs/archive/"
- "v2/docs/packages/"

Documentation must have clearly defined authority. Multiple documents must not independently claim to be the source of truth for the same subject.

3.1 Documentation authority hierarchy

Subject| Authoritative document
Approved design decisions| "MASTER_DECISION_REGISTER.md"
Unresolved decisions| "OPEN_DECISIONS_REGISTER.md"
Consolidated functional requirements| "MODULE_REQUIREMENTS.md"
Authentication| "Auth.md"
Authorization| "UAC_MATRIX.md"
Dashboard and navigation| "DASHBOARD_NAVIGATION_SPEC_V2.md"
Ahbab profile and account| "JMV2001-Ahbab-Profile-Account-Management.md"
Organization governance| "JMV2002-Organization-Structure-Governance.md"
Syukbah| "JMV2003-Syukbah-Management.md"
Takaza| "JMV2004-Takaza-Management.md"
Design checkpoint| "V2_DESIGN_CHECKPOINT.md"
Implementation status and roadmap| "V2_IMPLEMENTATION_STATUS.md"
Repository documentation organization| "REPOSITORY_DISPOSITION.md"

The implementation status document does not override approved design decisions or functional requirements.

4. Consolidated Documentation Set

The following documents form the current V2 documentation baseline.

File| Required treatment
"MASTER_DECISION_REGISTER.md"| Retain as authoritative approved-decision register
"OPEN_DECISIONS_REGISTER.md"| Retain as authoritative unresolved-decision register
"MODULE_REQUIREMENTS.md"| Retain as consolidated requirements
"REPOSITORY_DISPOSITION.md"| Maintain repository documentation rules
"Auth.md"| Retain and reconcile with current authentication requirements
"UAC_MATRIX.md"| Retain as authorization baseline
"DASHBOARD_NAVIGATION_SPEC_V2.md"| Retain and reconcile with UAC and module behaviour
"JMV2001-Ahbab-Profile-Account-Management.md"| Retain as profile and account specification
"JMV2002-Organization-Structure-Governance.md"| Retain as organization specification
"JMV2003-Syukbah-Management.md"| Retain as Syukbah specification
"JMV2004-Takaza-Management.md"| Retain as Takaza specification
"V2_DESIGN_CHECKPOINT.md"| Maintain as design and project checkpoint
"V2_IMPLEMENTATION_STATUS.md"| Maintain as the single implementation status and roadmap source

These documents must remain consistent with each other.

Do not blindly overwrite module specifications. Preserve useful details, document IDs, decisions and historical context.

5. Superseded Documentation

5.1 Singular Open Decision Register

File:

"v2/docs/OPEN_DECISION_REGISTER.md"

Treatment:

- Superseded by "OPEN_DECISIONS_REGISTER.md".
- Not an authoritative source for current unresolved decisions.
- Preserve temporarily for historical comparison.
- Review before any archival or removal.
- Do not delete without explicit approval.

5.2 Previous Implementation Status and Roadmap

File:

"v2/docs/IMPLEMENTATION_STATUS_AND_ROADMAP.md"

Treatment:

- Its functional purpose has been consolidated into "V2_IMPLEMENTATION_STATUS.md".
- It is no longer the authoritative implementation status or roadmap.
- Preserve temporarily for historical comparison.
- Do not independently update its implementation status.
- Review before archival or removal.
- Do not delete without explicit approval.

5.3 Current source of truth

The sole authoritative implementation status and roadmap document is:

"v2/docs/V2_IMPLEMENTATION_STATUS.md"

All implementation progress, blockers, verification evidence, development phases and release gates must be maintained there.

6. Existing Root-Level Documentation

The root "docs/" directory contains project-level documentation shared across V1 and V2.

6.1 Master Development Roadmap

File:

"docs/DEVELOPMENT_ROADMAP.md"

Treatment:

- Retain as the master development roadmap covering V1 and V2.
- Reconcile its V2 section with current V2 decisions.
- Keep V1-specific requirements within their historical or V1 scope.
- Correct references that incorrectly describe V2 Project Member as a separate entity.
- Reflect current migration and implementation evidence carefully.
- Do not replace this project-level roadmap with a V2-only document.

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
- Correct Percha spelling where required.
- Make clear that design documentation does not authorize database migrations or production changes.
- Do not move or duplicate it automatically into "v2/docs/".

6.4 D1 Read-Only Console Guide

File:

"docs/D1_READONLY_WEB_CONSOLE.md"

Treatment:

- Retain.
- Keep operational guidance separate from functional requirements.
- Ensure read-only database guidance remains clear.

6.5 Root and Application READMEs

Preserve all three:

- "README.md"
- "v1/README.md"
- "v2/README.md"

Their responsibilities are different:

File| Responsibility
Root "README.md"| Repository structure, V1/V2 separation and shared workflows
"v1/README.md"| V1 application documentation
"v2/README.md"| V2 architecture, infrastructure, development and documentation references

The root README and V2 README have been reconciled with the current repository documentation structure on the integration branch.

Future updates must preserve their separate purposes.

Do not describe unimplemented V2 features as available.

7. Historical Documents and Archives

7.1 Historical Audit Handover

File:

"v2/docs/JMV2-AUDIT-HANDOVER-2026-11-24.md"

Treatment:

- Preserve as a historical snapshot.
- Retain its original date and findings.
- Do not treat it as the current implementation status.
- Use it for historical comparison only.
- The document predates the reported remote application of migration 0021.

7.2 Existing Archive Directory

Path:

"v2/docs/archive/"

Known historical documents:

- "V2_IMPLEMENTATION_STATUS_PACKAGE_2026-11-19.md"
- "V2_IMPLEMENTATION_STATUS_PACKAGE_ROOT_2026-11-19.md"

Treatment:

- Preserve.
- Do not delete or overwrite.
- Use for historical comparison only.
- Do not treat archived status as current implementation evidence.

7.3 Existing Packages Directory

Path:

"v2/docs/packages/"

Known packages:

- "JuhudManager_V2_Auth_Package.zip"
- "JuhudManager_V2_Foundation_Package.zip"

Treatment:

- Preserve both packages.
- Treat them as historical snapshots until their contents are fully compared with the current source.
- Do not assume they contain the latest implementation.
- Do not use them as current deployment instructions without verification.

8. Duplicate Root-Level ZIP Packages

The repository also contains:

- "docs/JuhudManager_V2_Auth_Package.zip"
- "docs/JuhudManager_V2_Foundation_Package.zip"

The recorded file hashes indicate that these match their respective copies under "v2/docs/packages/".

Recommended future treatment:

- Keep "v2/docs/packages/" as the canonical location for V2-specific historical packages.
- Consider removing root-level duplicates only after explicit approval.
- Do not delete either copy as part of routine documentation maintenance.
- Verify file hashes again before any future removal.

No duplicate package is authorized for deletion by this document.

9. README Reconciliation

9.1 Root README

File:

"README.md"

Current treatment:

- Describes the V1/V2 repository separation.
- Identifies the major application directories.
- Lists the principal V2 documentation.
- Identifies the authoritative decision and implementation status documents.
- Describes the separate deployment workflows.
- Documents the Pages paths and migration safeguards.

Future changes must keep the repository description consistent with actual workflow files and directory structure.

9.2 V2 README

File:

"v2/README.md"

Current treatment:

- Describes the V2 architecture and infrastructure.
- Identifies the V2 Worker and D1 database.
- References migrations 0001 through 0021.
- Distinguishes historical migration and health-check reports from fresh verification.
- Identifies Password Reset as required but not implemented.
- Identifies the bootstrap SUPER_ADMIN issue as requiring verification.
- Documents authorization and module boundaries.
- Describes separate V1/V2 deployment.
- Identifies the authoritative V2 documentation.

Future updates must preserve these distinctions.

The V2 README is an orientation document. It does not replace the detailed specifications or implementation status document.

9.3 README maintenance rule

Any change affecting:

- repository structure;
- Worker configuration;
- database configuration;
- migration range;
- deployment workflow;
- documentation authority;
- feature availability;

must be checked against the relevant repository files before updating a README.

10. Authentication Documentation Reconciliation

File:

"v2/docs/Auth.md"

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
- Functional appointments are not treated as global core roles.

12.2 Dashboard and Navigation

Ensure:

- Menu visibility follows authorization.
- Dashboard display does not grant permission.
- Unauthorized actions are blocked by the backend.
- Pending modules are not presented as fully functional.
- Navigation remains consistent with module availability.
- Resource-level permission is enforced by the backend.

13. Design Checkpoint Reconciliation

File:

"v2/docs/V2_DESIGN_CHECKPOINT.md"

Required treatment:

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
- Maintain the development phases and release gates.
- Preserve the distinction between design approval, implementation and deployment.

No other document should independently maintain a competing implementation roadmap.

15. Project-Level System Design Precedence

"docs/SYSTEM_REALIGNMENT_DESIGN.md" is a project-level design reference.

When it conflicts with a later explicitly approved V2 requirement:

1. Identify the conflicting statements.
2. Check the Master Decision Register.
3. Record the current approved decision.
4. Update the affected V2 specification.
5. Update the project-level reference where appropriate.
6. Preserve historical context.
7. Record migration or implementation impact separately.

No design document alone authorizes database or production changes.

16. Documentation Maintenance Order

For future documentation reconciliation, follow this order:

1. Preserve a backup or Git commit of the current documentation.
2. Review the Master Decision Register.
3. Review the Open Decisions Register.
4. Review Module Requirements.
5. Reconcile Auth.
6. Reconcile JMV2001.
7. Reconcile JMV2002.
8. Reconcile JMV2003.
9. Reconcile JMV2004.
10. Reconcile UAC Matrix.
11. Reconcile Dashboard and Navigation.
12. Update V2 Implementation Status.
13. Update V2 Design Checkpoint.
14. Reconcile the root Master Development Roadmap where required.
15. Reconcile root and V2 READMEs where required.
16. Review documentation links and references.
17. Review the complete diff.
18. Commit only after review and explicit user approval.

No deployment is required merely to publish documentation changes.

17. Documentation Quality Checks

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
- README links point to existing files.
- No feature is described as implemented without evidence.
- Implementation status is maintained only in "V2_IMPLEMENTATION_STATUS.md".
- Superseded documents are not accidentally treated as authoritative.
- V1 and V2 remain separate in documentation and deployment instructions.

18. Change Control

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

18.1 Archival and deletion controls

Archiving and deletion are separate actions from documentation reconciliation.

No file should be deleted solely because:

- it is older;
- it is duplicated;
- another document has replaced its function;
- it appears unused;
- it contains historical implementation status.

Before archival or deletion:

1. Identify the file and its current purpose.
2. Compare its contents with the authoritative document.
3. Preserve unique historical information.
4. Confirm whether the file is referenced by another document or workflow.
5. Obtain explicit approval.
6. Record the action.

---

Document Status: CURRENT DOCUMENTATION BASELINE
Version: 1.1
Last Updated: 28 November 2026

Repository rule: Preserve history, maintain a single source of truth for each subject, and never confuse documented requirements with verified implementation.

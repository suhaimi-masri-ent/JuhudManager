
# JuhudManager – Master Development Roadmap and Decision Log

**Document ID:** JMV2-PROJECT-ROADMAP-001  
**Version:** 2.0  
**Scope:** JuhudManager V1 and V2  
**Status:** Project Continuity Reference  
**Last Updated:** 28 November 2026  
**Repository Path:** `docs/DEVELOPMENT_ROADMAP.md`

---

## 1. Purpose and Scope

This document provides a shared project-level reference for the development direction, continuity, historical context and documentation governance of JuhudManager V1 and V2.

It is intended to:

- Preserve the distinction between V1 and V2.
- Maintain continuity across development sessions.
- Record the overall project direction.
- Identify the authoritative documentation for each version.
- Preserve relevant historical V1 decisions and implementation context.
- Prevent outdated proposals from being mistaken for current V2 requirements.
- Ensure implementation status is supported by appropriate evidence.
- Direct developers to the correct specification before changing code or business rules.

This document is not intended to duplicate every technical specification, business requirement or implementation record.

Detailed requirements and implementation evidence must remain in their respective version-specific documents.

## 2. Document Authority and Status Rules

### 2.1 Authority for V1

V1 requirements, historical decisions and implementation must be evaluated against:

- Existing V1 source code.
- V1-specific documentation.
- Historical V1 decisions retained in this repository.
- Verified V1 database and deployment configuration.

V1 requirements must not automatically become V2 requirements.

### 2.2 Authority for V2

The following documents are the principal V2 references:

| Document | Authority |
|---|---|
| `v2/docs/MASTER_DECISION_REGISTER.md` | Central V2 design and decision register |
| `v2/docs/OPEN_DECISIONS_REGISTER.md` | Unresolved V2 decisions |
| `v2/docs/MODULE_REQUIREMENTS.md` | Consolidated V2 functional requirements |
| `v2/docs/V2_IMPLEMENTATION_STATUS.md` | Sole authority for V2 implementation status and development roadmap |
| `v2/docs/AUTH.md` | Authentication and account-management requirements |
| `v2/docs/JMV2001-Ahbab-Profile-Account-Management.md` | Ahbab profile and account management |
| `v2/docs/JMV2002-Organization-Structure-Governance.md` | Organisation structure and governance |
| `v2/docs/JMV2003-Syukbah-Management.md` | Syukbah management |
| `v2/docs/JMV2004-Takaza-Management.md` | Takaza management and participation |

The relevant V2 specification must be consulted before implementing or changing its corresponding functionality.

Where documents conflict:

1. Identify the specific decision or requirement involved.
2. Check its status in the Master Decision Register.
3. Check the Open Decisions Register for unresolved matters.
4. Check the relevant module specification.
5. Reconcile the documents before implementation.
6. Record any approved change in the appropriate authoritative document.

A document's existence or publication date alone does not establish that every statement in it is approved.

### 2.3 Status Definitions

The following labels are used to describe project requirements and work.

| Status | Meaning |
|---|---|
| CONFIRMED | Explicitly approved decision or requirement |
| AGREED | Decision explicitly accepted at the stated scope |
| PROVISIONAL | Temporary agreed direction subject to stated limitations |
| IMPLEMENTED | Implementation has been verified at the stated scope |
| PARTIALLY IMPLEMENTED | Some required functionality exists but the complete requirement is not fulfilled |
| IN PROGRESS | Work has started but is incomplete |
| PROPOSED | Suggested direction requiring approval |
| PENDING | Requires clarification or a decision |
| FOR REVIEW | Documented baseline awaiting review or approval |
| ON HOLD | Deliberately deferred |
| NOT IMPLEMENTED | No confirmed implementation exists |
| NEEDS VERIFICATION | Existing code or functionality requires further verification |

Implementation status must always identify its scope.

The existence of backend code does not automatically mean that a complete user-facing workflow is operational.

A design requirement does not prove that the feature has been implemented.

A successful test does not prove that untested workflows are complete.

## 3. Overall Project Direction

### 3.1 V1 – Existing System

V1 is the existing system and must remain operationally and technically separate from V2.

Its purpose is to:

- Preserve existing functionality.
- Maintain historical business workflows.
- Provide a reference for existing operational requirements.
- Retain relevant development history and lessons learned.
- Support controlled maintenance where required.

V1 development should be incremental and controlled.

Existing V1 functionality must not be removed or replaced without an agreed reason and appropriate verification.

### 3.2 V2 – Forward Development Platform

V2 is the forward development platform for JuhudManager.

V2 has its own:

- Application source code.
- Worker and API.
- Database and migration history.
- Authentication and authorization.
- Frontend.
- Configuration.
- Tests.
- Deployment workflows.
- Technical and business specifications.

V2 development should follow the approved V2 requirements and implementation roadmap.

V1 code must not be assumed to be directly compatible with V2.

### 3.3 Overall Business Domains

The overall JuhudManager business domains include:

1. User identity and authentication.
2. Ahbab profile and account management.
3. Jemaah and membership management.
4. Organisation structure and governance.
5. Syukbah management.
6. Takaza and participation management.
7. KAWAIF profile qualification and experience records.
8. TAFAKUT assessment.
9. Amer and Supervisor appointments.
10. Activities and Rekod Amal.
11. Percha and Kharguzari.
12. Takaza reporting and completion.
13. Annual Archive and Annual Summary.
14. Notifications and audit history.
15. Juhud Reports and publication.

These domains must remain logically distinct even when they share information.

The system should support transparent and traceable decisions without replacing authorised human judgement.

## 4. V1 and V2 Repository Separation

### 4.1 Repository Structure

The repository is organised into the following principal areas:

| Location | Responsibility |
|---|---|
| `v1/` | V1 application, configuration and V1-specific resources |
| `v2/` | V2 application, configuration and V2-specific resources |
| `docs/` | Shared project documentation |
| `v2/docs/` | V2-specific requirements, decisions and implementation documentation |

The exact internal directory structure must follow the current repository.

### 4.2 Separation Requirements

V1 and V2 must retain separate:

- Application source code.
- Worker entry points.
- Worker configuration.
- Database resources.
- Database migration histories.
- Runtime dependencies where applicable.
- API endpoints.
- Deployment workflows.
- Environment variables and secrets.
- Release and rollback procedures.

A V1 deployment must not unintentionally affect V2.

A V2 deployment must not unintentionally affect V1.

A migration intended for one database must never be applied to the other database.

### 4.3 Deployment Safety

All deployment operations must identify:

- Target application.
- Target environment.
- Target Worker.
- Target database.
- Relevant branch and commit.
- Required configuration and secrets.
- Verification procedure.

Production deployment and remote database migration require explicit approval.

Successful local tests or build checks do not constitute deployment approval.

## 5. Historical V1 Business and Development Context

This section preserves V1 development context. It does not establish new V2 requirements.

### 5.1 V1 Takaza and Project Management

V1 uses Project and related terminology for its historical workflows.

The historical development scope included:

- Takaza categories.
- Takaza registration.
- Takaza endorsement.
- Project activities.
- Activity assignment.
- Activity submission.
- Activity review.
- Eligibility assessment.
- Project Member management.

V1 implementation and workflow decisions must be checked against the V1 code and documentation.

### 5.2 V1 Activities and Activity Records

V1 uses Activity and Activity Record terminology.

The historical workflow included:

1. Activity type configuration.
2. Activity assignment where applicable.
3. Activity submission.
4. Activity review.
5. Storage of approved and historical records.
6. Use of relevant records as evidence for assessment and reporting.

The existence of an API or frontend component does not establish that the entire workflow is operational.

### 5.3 Historical V1 Eligibility Assessment Direction

The V1 roadmap previously proposed an Eligibility Assessment Engine.

The historical proposal included:

- Common criteria.
- Takaza-specific criteria.
- Evidence from approved Activities.
- Relevant experience and capability.
- Potential contribution and readiness.
- Identification of missing or unverifiable information.
- Recommendations for authorised human review.

The proposal was intended to support consistent assessment and reduce manual oversight.

It was not intended to replace the final human decision.

### 5.4 Historical V1 Criterion Types

The following criterion types were proposed in the historical V1 direction:

| Type | Purpose |
|---|---|
| Mandatory | A requirement that must be satisfied |
| Evaluative | A factor used to assess suitability or readiness |
| Potential / Readiness | Evidence of potential, capability or future contribution |

These proposals must not be treated as universal V2 assessment rules.

### 5.5 Historical V1 Assessment Outcomes

The following outcomes were previously proposed:

| Outcome | Meaning |
|---|---|
| QUALIFIED | Candidate meets the applicable requirements |
| CONDITIONALLY_QUALIFIED | Candidate may proceed subject to recorded conditions |
| NOT_QUALIFIED | Available evidence does not support qualification |
| INSUFFICIENT_DATA | Available evidence is insufficient for a reliable assessment |

These are historical proposal outcomes, not automatically approved V2 TAFAKUT outcomes.

### 5.6 Human Decision and Audit Principle

The historical V1 assessment direction established the following principles:

- System recommendations and final human decisions must remain separate.
- An authorised human reviewer remains responsible for the final decision.
- Assessment evidence must be traceable.
- Decisions should record their rationale.
- Conditions and follow-up requirements should be recorded where applicable.
- Historical assessment records should be retained.

These principles may inform V2 design only where they are consistent with the current approved V2 requirements.

### 5.7 V1 Project Member Terminology

Project Member is a historical V1 concept.

For V2, the corresponding participation model is Takaza Participation.

V2 must not introduce a separate Project Member entity.

Relevant V1 Project Member records may be mapped to V2 Takaza Participation where appropriate during any future data migration or reconciliation exercise.

The historical V1 workflow remains within V1 scope.

## 6. V2 Business Requirements Overview

This section provides a high-level overview only. The authoritative details remain in the V2 documents listed in Section 2.2.

### 6.1 Identity, Account and Ahbab Profile

V2 must distinguish:

- User identity.
- Login credentials.
- Account status.
- Access level.
- User role.
- Ahbab profile.
- Jemaah membership.
- Takaza participation.

One concept must not automatically determine another.

Authentication and profile management are separate responsibilities.

The detailed requirements are maintained in:

- `v2/docs/AUTH.md`
- `v2/docs/JMV2001-Ahbab-Profile-Account-Management.md`

### 6.2 Authentication and Password Recovery

The V2 authentication baseline includes email-based OTP registration and verification.

The established OTP policy is:

| Item | Requirement |
|---|---|
| OTP length | 6 digits |
| OTP validity | 5 minutes |
| Maximum verification attempts | 5 |
| Resend cooldown | 60 seconds |
| Identity reservation | 15 minutes |
| Minimum password length | 12 characters |

Session requirements include:

- Idle timeout of 30 minutes.
- Maximum session lifetime of 12 hours.
- Appropriate session termination when an account is disabled.
- Revocation of sessions and tokens when required by security operations.

Password Reset is a required V2 feature but is NOT IMPLEMENTED.

The approved Password Reset baseline requires:

1. Use of the registered and verified email address.
2. Six-digit OTP.
3. Five-minute OTP validity.
4. Maximum five verification attempts.
5. Sixty-second resend cooldown.
6. OTP must be bound to the specific Password Reset transaction. OTP issued for registration or another purpose must not be accepted.
7. New password meeting the minimum twelve-character requirement.
8. Revocation of all existing sessions and tokens after successful reset.
9. Audit event recording.
10. Security notification.

Admin-Assisted Account Recovery is a separate process and must not be represented as ordinary Password Reset.

### 6.3 Roles and Access Control

V2 uses role-based and scope-based access control.

The principal roles include:

- SUPER_ADMIN.
- Country ADMIN.
- Other administrative roles defined by the approved governance model.
- Ahbab users.

SUPER_ADMIN has global authority.

Country ADMIN authority is scoped to the relevant country.

Administrative roles must not automatically inherit permissions that have not been explicitly granted.

The authoritative access rules are maintained in the V2 UAC and governance documents.

### 6.4 Organisation Structure and Governance

The V2 organisational design includes:

- Ahbab.
- Mohallah.
- Halqah.
- Kawasan or Zone.
- Daerah and Negeri structures where applicable.
- Markaz Negeri.
- Markaz Negara.

The final hierarchy and some governance arrangements remain subject to the Open Decisions Register.

The system must preserve:

- Administrative scope.
- Appointment history.
- Delegation records.
- Relevant approval records.
- Effective dates.
- Historical organisational relationships.

Detailed requirements are maintained in:

`v2/docs/JMV2002-Organization-Structure-Governance.md`

### 6.5 Syukbah Management

Syukbah is a work and administrative structure separate from the organisational hierarchy.

The V2 design includes:

- Global Baseline Syukbah.
- Additional country-specific Syukbah where approved.
- Syukbah activation and deactivation.
- Admin and Deputy Admin appointments.
- Task allocation.
- Cross-Syukbah assistance.
- Scope-based permissions.
- Appointment and operational history.

Detailed requirements are maintained in:

`v2/docs/JMV2003-Syukbah-Management.md`

### 6.6 Jemaah Membership and Takaza Participation

Jemaah Membership and Takaza Participation are separate concepts.

An Ahbab may be a Jemaah member without automatically becoming a participant in every Takaza associated with that Jemaah.

The V2 participation model must follow the current JMV2004 specification.

The principal participation requirements include:

- Participation methods.
- Candidate and application records.
- Ahbab consent where applicable.
- TAFAKUT where required.
- Admin confirmation.
- Participation status and lifecycle.
- Withdrawal.
- Removal.
- Appeal.
- Transfer.
- Rejoining.
- Historical participation records.

A successful TAFAKUT assessment does not automatically constitute final participation approval.

### 6.7 Main and Sub Takaza

V2 supports two Takaza levels:

1. Main Takaza.
2. Sub Takaza.

A Main Takaza may have Sub Takaza records.

A Sub Takaza cannot have another Sub Takaza beneath it.

Main and Sub Takaza have independent lifecycles.

The relationship between them establishes hierarchy only and does not create automatic status or date cascading.

The approved lifecycle statuses are:

- DRAFT.
- RELEASED.
- ACTIVE.
- ON_HOLD.
- COMPLETED.
- CANCELLED.

Detailed requirements are maintained in:

`v2/docs/JMV2004-Takaza-Management.md`

### 6.8 KAWAIF

KAWAIF is a separate Ahbab profile qualification and experience record.

It is not the same as TAFAKUT.

The documented V2 direction includes:

- Ahbab may submit or update KAWAIF information.
- Submitted changes may require Admin verification.
- Admin may maintain missing or outdated information.
- Source and basis for administrative changes must be recorded.
- Historical values must be preserved.
- KAWAIF may be used as reference information for relevant decisions.

KAWAIF must not automatically determine TAFAKUT outcomes.

### 6.9 TAFAKUT

TAFAKUT is the assessment process used for relevant Takaza participation or suitability decisions.

The current V2 baseline requires:

- Two independent Admin assessors per assessment round.
- PASS and PASS produce a PASS result.
- FAIL and FAIL produce a FAIL result.
- Disagreement requires another round with two new assessors.
- Completed assessor submissions must remain immutable.
- Assessment forms and versions must be traceable.
- Relevant evidence and decision history must be retained.

A FAIL result is not a permanent prohibition on future participation.

The detailed workflow, form types, assessor assignment and decision rules must follow the current V2 specifications.

### 6.10 Amer and Supervisor

Amer is appointed for a specific Takaza.

An Amer candidate must already be a confirmed participant in the same Takaza before the appointment becomes effective.

If the candidate is not yet a confirmed participant, the normal participation process must first be completed.

Amer appointment:

- Requires the applicable Admin and candidate consent.
- May take effect before the official Takaza start date.
- Must retain appointment history.
- Must follow the approved replacement and expiry rules.
- Does not automatically change Takaza lifecycle or participation status.

Supervisor authority and scope remain subject to the Open Decisions Register.

No additional Supervisor powers should be inferred before the relevant decision is approved.

### 6.11 Activities and Rekod Amal

Rekod Amal is the official V2 term for Activity Record.

It records participation, contribution and relevant progress.

Takaza events and attendance must remain separate from Takaza lifecycle status.

Existing V1 Activity records must not automatically be treated as identical to the V2 Rekod Amal model without reconciliation.

### 6.12 Percha and Kharguzari

Percha is generated after Bayan Hidayat according to the approved Takaza workflow.

Percha records relevant Takaza and journey information.

Amendments must preserve:

- Original values.
- Proposed values.
- Proposing Admin.
- Approving Admin.
- Reason.
- Date and time.
- Decision history.

Kharguzari and related reporting must follow the current JMV2004 requirements.

### 6.13 Takaza Reports and Completion

The Amer must submit the required full Takaza report before completion.

Where required end activities are complete but the Amer report is missing:

- The report remains overdue.
- The Takaza must not be automatically marked COMPLETED.
- The responsible Amer must be identified.
- Any extension must preserve the original due date and extension history.

### 6.14 Annual Archive and Annual Summary

Annual Archive and Annual Summary are separate from the live Takaza lifecycle.

The V2 design includes:

- Historical Takaza records.
- Participant and status information.
- Main and Sub Takaza statistics.
- Country and year filters.
- Scope-based Admin access.
- Ahbab access to relevant historical participation records.
- Annual Summary records.

Annual Summary may have DRAFT, INTERIM and FINAL statuses.

These statuses do not replace or change the Takaza lifecycle status.

The detailed requirements and unresolved matters must follow the V2 specifications and Open Decisions Register.

### 6.15 Juhud Reports

Juhud Reports is a separate publication module.

It must not be confused with:

- Takaza operational reports.
- Individual Kharguzari.
- Amer's full Takaza report.
- Annual Archive.
- Annual Summary.

## 7. V2 Technical Foundation and Implementation Governance

### 7.1 V2 Technical Resources

V2 technical resources are maintained under `v2/`.

Principal areas include:

| Path | Responsibility |
|---|---|
| `v2/src/` | Worker and API source |
| `v2/migrations/` | V2 database migrations |
| `v2/test/` | Automated tests |
| `v2/web/` | V2 frontend |
| `v2/docs/` | V2 specifications and status documents |
| `v2/package.json` | V2 scripts and dependencies |
| `v2/wrangler.jsonc` | V2 Worker configuration |

The exact current repository structure takes precedence if directories are reorganised through an approved change.

### 7.2 Database and Migration Governance

V1 and V2 databases are separate resources.

Every migration must identify its target database and version.

Migration requirements:

- Migration files must be versioned.
- Applied migration history must be retained.
- Migration order must be respected.
- Existing data must be protected.
- Foreign-key and integrity constraints must be checked.
- Remote migration must require explicit approval.
- Destructive operations must not be performed without explicit approval.
- Migration results must be verified after execution.

A migration file existing in the repository does not prove that it has been applied remotely.

A successful migration command does not by itself prove that all application workflows are operational.

### 7.3 Authentication and Security

Authentication and security requirements must follow `v2/docs/AUTH.md`.

Security-sensitive operations must have appropriate:

- Authorization checks.
- Identity validation.
- Session handling.
- Token handling.
- Audit records.
- Error handling.
- User notifications where required.

Backend authorization must not rely solely on frontend visibility or navigation restrictions.

### 7.4 API and Frontend Integration

A backend endpoint does not establish that its complete user-facing workflow is available.

Verification must consider:

- API request and response behaviour.
- Authentication requirements.
- Authorization and scope enforcement.
- Frontend integration.
- Validation and error handling.
- Loading and failure states.
- Audit records.
- Relevant end-to-end tests.

### 7.5 Automated Testing

Automated tests should cover the implemented scope.

Where applicable, testing should include:

- Unit tests.
- API tests.
- Database interaction tests.
- Authorization tests.
- Business-rule tests.
- Regression tests.
- Frontend integration tests.
- End-to-end workflows.

Test results must identify the tested branch, commit and scope where practical.

A passing test suite does not prove that every documented requirement has been implemented.

### 7.6 Build and Deployment

Build and deployment checks must be distinguished.

| Activity | What it establishes |
|---|---|
| Automated tests | Tested behaviour passed the stated tests |
| Frontend build | Frontend build completed |
| Worker build or dry-run | Worker build validation completed |
| Migration dry-run | Migration validation completed without necessarily applying it |
| Remote migration | Migration was applied to the identified remote database |
| Worker deployment | Worker was deployed to the identified environment |
| Post-deployment verification | Selected deployed endpoints and workflows were checked |

Production deployment requires explicit approval.

The current V2 implementation position must be read from:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

This root document must not maintain a competing V2 implementation status.

## 8. V2 Development Priority and Roadmap Ownership

### 8.1 Single Source of Implementation Status

`v2/docs/V2_IMPLEMENTATION_STATUS.md` is the sole authority for:

- Current implementation status.
- Verified implementation evidence.
- Known blockers.
- Development phases.
- Outstanding work.
- Release gates.
- Deployment verification.

This root roadmap provides project-level context only.

It must not duplicate detailed V2 implementation checklists or claim that a feature is complete without evidence from the implementation status document.

### 8.2 Development Sequence

V2 development should proceed according to the phases and dependencies recorded in `V2_IMPLEMENTATION_STATUS.md`.

At project level, the sequence should respect the following broad dependencies:

1. Stabilise the technical foundation.
2. Complete authentication and account-management requirements.
3. Complete Ahbab profile and account workflows.
4. Complete organisation structure and governance.
5. Complete Syukbah management.
6. Complete Jemaah membership workflows.
7. Complete Takaza and participation workflows.
8. Complete KAWAIF and TAFAKUT workflows.
9. Complete Amer and Supervisor workflows according to approved authority.
10. Complete activities, Rekod Amal and Percha workflows.
11. Complete reports and Takaza completion.
12. Complete Annual Archive and Annual Summary.
13. Complete frontend integration and user experience.
14. Complete end-to-end verification and release preparation.

The detailed ordering may be adjusted by the V2 implementation roadmap when dependencies, blockers or verified implementation progress require it.

### 8.3 Avoiding Duplicate Implementation

Before implementing a feature:

1. Inspect the existing source code.
2. Check the current database schema.
3. Review relevant migrations.
4. Review existing tests.
5. Check the implementation status.
6. Check the relevant design specification.
7. Identify existing domain logic that can be reused.
8. Confirm whether the work is new, incomplete or requires integration.

Existing functionality must not be duplicated merely because the user-facing workflow is incomplete.

For example, existing domain-level Amer appointment validation should be integrated into the complete Takaza workflow rather than reimplemented as a separate competing rule set.

## 9. Deferred Scope and Open Decisions

### 9.1 Case Management

Full Case Management remains ON HOLD.

A Takaza cancellation-related Requires Attention record does not mean that the complete Case Management module is implemented or approved for activation.

The minimal cancellation-related attention record and its relationship with affected participants must follow the current V2 design and decision documents.

Any future activation of full Case Management must establish:

- Purpose and scope.
- Data requirements.
- Access rules.
- Assignment and responsibility.
- Actions and resolution.
- Status transitions.
- Closure rules.
- Relationship with Takaza and participation records.

### 9.2 Open Decisions

Unresolved V2 matters must be maintained in:

`v2/docs/OPEN_DECISIONS_REGISTER.md`

The project must not silently turn pending decisions into confirmed requirements.

The current unresolved topics include, but are not limited to:

- Markaz Negara governance.
- Final organisational hierarchy.
- Additional Country Syukbah approval.
- Supervisor authority and scope.
- Direct Assignment consent and TAFAKUT requirements.
- Full Case Management workflow.
- Annual Archive correction policy.
- Exceptional post-completion changes.
- Chief Admin and Deputy appointment processes.
- Reactivation and rejoining edge cases.
- Syukbah delegation and acting arrangements.
- Admin Syukbah eligibility.
- Annual Archive Main Takaza filter.
- Takaza event templates.

The Open Decisions Register is the authoritative record of their current status.

## 10. Project Development Rules

The following rules apply to project development.

1. Do not mix V1 and V2 source code, configuration, databases or deployment resources.
2. Do not assume V1 business terminology is identical to V2 domain terminology.
3. Do not treat a design document as proof of implementation.
4. Do not treat backend code as proof of a complete user-facing workflow.
5. Do not invent or silently change business rules.
6. Do not promote PROPOSED, PENDING or FOR REVIEW requirements to CONFIRMED without approval.
7. Check the Master Decision Register before changing V2 design decisions.
8. Check the Open Decisions Register before implementing unresolved matters.
9. Use the relevant module specification for detailed business behaviour.
10. Use V2 Implementation Status as the sole V2 implementation and roadmap reference.
11. Inspect existing implementation before duplicating or replacing it.
12. Preserve important audit and historical records.
13. Use automated tests where practical.
14. Keep changes focused and reviewable.
15. Do not remove or relocate project documentation without an agreed reason.
16. Do not perform production deployment or remote migration without explicit approval.
17. Do not perform destructive database operations without explicit approval.
18. Report verification limitations honestly.
19. Record relevant implementation evidence.
20. Update the appropriate authoritative document when a decision or implementation status changes.

## 11. Verification and Development Continuity

Every significant development task should record:

- Objective and scope.
- Repository and branch.
- Commit or working-tree state.
- Files and modules affected.
- Existing implementation reviewed.
- Requirements and decisions used.
- Changes made.
- Tests performed.
- Test results.
- Outstanding issues.
- Verification limitations.
- Whether the work is local, committed, pushed or deployed.

### 11.1 Before Continuing After a Pause

Before continuing development after a pause, review:

1. Current repository and branch.
2. Current commit.
3. Working-tree status.
4. Latest relevant V2 decisions.
5. Open decisions affecting the task.
6. Current implementation status.
7. Relevant module specifications.
8. Outstanding verification limitations.
9. Database migration state where relevant.
10. Deployment state where relevant.

### 11.2 Verification Principles

The following distinctions must always be maintained:

- A successful local build does not prove that the remote environment is correct.
- A successful API test does not prove that the complete frontend workflow is correct.
- A successful migration dry-run does not mean that a remote migration has been applied.
- A migration record does not prove that every application feature is operational.
- A deployed Worker does not prove that all frontend and business workflows are complete.
- Design approval does not constitute implementation approval.
- Implementation evidence does not automatically constitute production release approval.

Repository synchronization should be verified before beginning a new development phase.

The local working copy and GitHub branch should be reconciled before significant implementation work.

## 12. Documentation Ownership and Maintenance

### 12.1 Shared Project Documentation

Shared project documentation is maintained under `docs/`.

| Document | Responsibility |
|---|---|
| `README.md` | Main project overview and repository guidance |
| `docs/DEVELOPMENT_ROADMAP.md` | Shared project continuity and development governance |
| `docs/SYSTEM_REALIGNMENT_DESIGN.md` | Consolidated system design and domain realignment |

### 12.2 V2 Documentation

V2-specific requirements, decisions and implementation documents are maintained under `v2/docs/`.

The principal references are:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `V2_DESIGN_CHECKPOINT.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `AUTH.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`

The repository may contain additional supporting documents.

The latest repository state must be checked before assuming that a document is missing or obsolete.

### 12.3 Documentation Maintenance Rules

When a V2 decision changes:

1. Update the Master Decision Register.
2. Update the Open Decisions Register if an unresolved item is resolved or changed.
3. Update the relevant module specification.
4. Update Module Requirements where necessary.
5. Update System Realignment Design where the overall design is affected.
6. Update V2 Implementation Status if implementation progress, blockers or roadmap priorities change.
7. Review this root roadmap for outdated or conflicting project-level statements.

When implementation changes:

1. Verify the source code and relevant tests.
2. Record the verified implementation scope.
3. Update V2 Implementation Status.
4. Do not mark a requirement implemented merely because a design or migration file exists.

Historical documents and backups should be preserved unless an explicit decision is made to archive, replace or remove them.

## 13. Final Governance Principles

JuhudManager development must follow these principles:

### 13.1 Separation

V1 and V2 remain separate systems.

Account identity, profile, role, membership and participation remain separate domain concepts.

Design requirements and implementation status remain separate records.

### 13.2 Traceability

Important decisions, administrative actions, participation changes and implementation changes must retain appropriate history.

### 13.3 Human Authority

The system may validate, organise information and support decisions.

It must not silently replace authorised human judgement where human approval is required.

### 13.4 Controlled Change

Business rules must not be changed implicitly.

Unresolved decisions must remain visible until approved.

Technical changes must be reviewed against the current architecture and requirements.

### 13.5 Honest Implementation Reporting

The project must distinguish clearly between:

- Designed.
- Approved.
- Implemented.
- Partially implemented.
- Tested.
- Verified.
- Deployed.
- Operational.

These are different states and must not be used interchangeably.

---

**Document Status:** Project Continuity Reference  
**V1 Authority:** Existing V1 source code and V1-specific documentation  
**V2 Decision Authority:** `v2/docs/MASTER_DECISION_REGISTER.md`  
**V2 Open Decisions:** `v2/docs/OPEN_DECISIONS_REGISTER.md`  
**V2 Requirements:** Relevant V2 module specifications and `v2/docs/MODULE_REQUIREMENTS.md`  
**V2 Implementation and Roadmap Authority:** `v2/docs/V2_IMPLEMENTATION_STATUS.md`

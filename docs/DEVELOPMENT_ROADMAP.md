JuhudManager – Master Development Roadmap & Decision Log

Document: Master Development Roadmap & Decision Log
Scope: JuhudManager V1 and V2
Status: Working Document
Last Updated: 27 November 2026

---

1. Purpose of This Document

This document is the central reference for the development direction, business requirements, implementation status, decisions and outstanding questions for JuhudManager V1 and V2.

It is intended to:

- Maintain continuity across development sessions.
- Record agreed business rules and technical decisions.
- Distinguish implemented features from proposed and pending work.
- Keep V1 maintenance and V2 development clearly separated.
- Prevent previously agreed requirements from being unintentionally changed.
- Provide a consistent reference for future development, testing and verification.

1.1 Decision and Status Labels

Label| Meaning
AGREED| Explicitly agreed business or technical decision.
IMPLEMENTED| Implementation exists and has been verified to the stated extent.
IN PROGRESS| Work has started but is not complete.
PROPOSED| Suggested direction requiring confirmation.
PENDING| Requires further discussion, clarification or decision.
ON HOLD| Deliberately deferred.
NOT IMPLEMENTED| No confirmed implementation exists.
NEEDS REVIEW| Code or functionality exists but requires verification or reconciliation.

Implementation status must always identify its scope. The existence of backend code does not automatically mean that a complete user-facing workflow is operational.

---

2. Overall Project Direction

2.1 V1 – Existing System

V1 is the existing system and must remain operationally and technically separate from V2.

Its role is to preserve existing functionality and provide a reference for business workflows, operational requirements and lessons learned.

V1 development should be controlled and incremental. Existing functionality must not be removed or replaced without an agreed reason and appropriate verification.

2.2 V2 – Forward Development

V2 is the forward development platform.

Its architecture, database, API, authentication and frontend are maintained separately from V1.

V2 should implement the agreed business requirements using a clearer domain structure, access-control model, audit history and maintainable workflows.

V1 code must not be assumed to be directly compatible with V2.

2.3 Main Business Workflow

The intended business workflow is:

1. Manage Jemaah and user accounts.
2. Register and manage Takaza.
3. Manage Activities and participant records.
4. Collect evidence of participation and contribution.
5. Assess eligibility for Takaza using agreed criteria.
6. Conduct human review and record the final decision.
7. Confirm and manage Project Members.
8. Maintain reports, comments and relevant history.

The system should support transparent and traceable decisions without replacing human judgement.

---

3. Business Workflow and Requirements

3.1 Takaza and Project Management

Takaza represents a project, initiative or organised effort that requires participation and contribution.

The system should support the management of:

- Takaza categories.
- Takaza registration and details.
- Takaza status and lifecycle.
- Participation and assignment.
- Amer appointment and replacement.
- Relevant reports, comments and history.

The complete Takaza lifecycle and user-facing workflow must be developed and verified progressively.

3.2 Activities and Participant Records

Activities provide records of participation, contribution and progress.

The intended workflow includes:

1. Activity type management.
2. Activity assignment.
3. Activity submission by participants.
4. Activity review and approval.
5. Storage of approved activity records.
6. Use of approved records as evidence for eligibility assessment.

Activity records should preserve sufficient information to support later review, including dates, descriptions, progress and review outcomes.

3.3 Eligibility Assessment

The Eligibility Assessment Engine is a proposed system capability for assisting the evaluation of candidates for Takaza participation or membership.

It must not independently replace the final human decision.

3.3.1 Assessment Criteria

Assessment may include:

- Common criteria applicable to all Takaza.
- Takaza-specific criteria.
- Evidence from approved Activities.
- Relevant experience, capability and potential contribution.

Criteria Category| Purpose
Common criteria| Requirements shared across Takaza.
Takaza-specific criteria| Requirements relevant to a particular Takaza.

Examples of possible Takaza-specific evidence include relevant experience, specialist knowledge, availability and demonstrated contribution.

These examples are not automatically mandatory criteria.

3.3.2 Criterion Types

The following criterion types are PROPOSED:

Type| Purpose
Mandatory| A requirement that must be satisfied.
Evaluative| A factor used to assess suitability or readiness.
Potential / Readiness| Evidence of potential, capability or future contribution.

The exact criteria and their application must be agreed before implementation.

3.3.3 Assessment Outcomes

The following outcomes are PROPOSED:

Outcome| Meaning
QUALIFIED| Candidate meets the applicable requirements.
CONDITIONALLY_QUALIFIED| Candidate may proceed subject to recorded conditions.
NOT_QUALIFIED| Available evidence does not support qualification.
INSUFFICIENT_DATA| There is insufficient evidence to make a reliable assessment.

These are proposed system recommendation outcomes, not automatic final membership decisions.

3.3.4 System Recommendation and Human Decision

AGREED: The system recommendation and the final human decision must be stored separately.

The system may identify gaps or recommend an outcome. An authorised human reviewer remains responsible for the final decision.

AGREED: A candidate may still be approved despite some gaps where the overall case, potential or expected contribution justifies approval, provided mandatory rules are respected and the rationale is recorded.

Where conditional approval is permitted, the decision should record:

- Justification for approval.
- Outstanding requirements.
- Conditions to be fulfilled.
- Responsible person, where applicable.
- Relevant deadline or review date.
- Follow-up status.

3.3.5 Transparency and Audit

The assessment process should preserve:

- Criteria and criteria version used.
- Evidence and Activity records considered.
- System recommendation and its rationale.
- Human reviewer and final decision.
- Reasons for approval, rejection or conditional approval.
- Conditions and follow-up records.
- Date and time of assessment and decision.

The system should clearly distinguish findings supported by verified records from findings requiring human verification.

3.4 Project Member Management

Project Member Management is intended to manage individuals who have been confirmed as members of a project or Takaza.

The workflow may include:

- Member confirmation.
- Membership status.
- Participation and responsibilities.
- Suspension or withdrawal.
- Removal where appropriate.
- Membership history and audit records.

The exact lifecycle, authority and transition rules remain subject to agreement.

---

4. V2 Architecture and Technical Foundation

4.1 V2 Directory Structure

V2 development is maintained under the "v2/" directory.

Relevant areas include:

Path| Responsibility
"v2/src/"| Worker/API source code.
"v2/migrations/"| V2 database migrations.
"v2/test/"| Automated tests.
"v2/web/"| V2 frontend.
"v2/docs/"| V2-specific documentation.
"v2/package.json"| V2 scripts and dependencies.
"v2/wrangler.jsonc"| V2 Worker configuration.

V1 is maintained under "v1/".

Shared project documentation is maintained under "docs/".

4.2 Core Domain Entities

The V2 domain includes or is expected to include the following areas:

- User and authentication.
- Jemaah.
- Organisation and organisational structure.
- Syukbah.
- Takaza.
- Amer appointment and assignment.
- Activities and participation.
- Eligibility assessment.
- Project membership.
- Reports and comments.

The detailed relationships and business constraints must follow the relevant V2 specifications and agreed decisions.

4.3 Amer Appointment Rules

The V2 foundation includes domain-level rules for Amer appointment, replacement and former Amer access.

The existence of these foundation rules does not mean the complete Takaza participant-management workflow is finished.

The user-facing workflow, administrative integration and end-to-end verification remain separate development responsibilities.

4.4 V1 and V2 Separation

V1 and V2 must retain separate:

- Application code.
- Worker configurations.
- Database resources.
- Migration histories.
- Deployment workflows.
- Runtime and API endpoints.

No V1 migration or deployment operation should unintentionally affect V2, and vice versa.

---

5. Current Implementation Position

Implementation statuses in this section are snapshots based on the available repository and documentation audits. They must be re-verified before being treated as current production status.

5.1 V1 Implementation Snapshot

Reference date: 16 November 2026

The following status reflects the historical V1 roadmap snapshot. It is not a claim that every item remains in the same state today.

Module| Historical Status| Notes
Takaza Categories| IMPLEMENTED| Category management exists; further workflow refinement may be required.
Takaza Registration| IN PROGRESS| Registration/listing, search/filtering, pagination and record actions have been worked on. Registration flow was still at draft stage.
Takaza Endorsement| NOT IMPLEMENTED| Submission, endorsement, return, rejection and cancellation workflow still required design and implementation.
Activity Types| IMPLEMENTED| Admin can maintain activity types. Frequency options and validation require reconciliation.
Activity Assignment| BACKEND EXISTS| Assignment API exists; complete user-facing workflow requires review.
Activity Submission| IMPLEMENTED| Users can submit activity records with date/time, description and progress information.
Activity Review| IMPLEMENTED / NEEDS REVIEW| Review API and UI code exist; active review interface and duplicate or unused implementations require clarification.
Eligibility Assessment Engine| PROPOSED| Discussed as a new design direction on 16 November 2026; not yet implemented in that snapshot.
Project Member Management| NOT YET ESTABLISHED| Complete membership confirmation and lifecycle workflow had not yet been established.

All V1 statuses above require current code verification before further V1 development decisions are made.

5.2 V1 Historical Development Sequence

The original V1 roadmap proposed the following sequence:

1. Complete essential Takaza Registration work while keeping the module usable without excessive polishing.
2. Review and consolidate the Activities workflow.
3. Define common Activity criteria.
4. Define Takaza-specific criteria.
5. Design the assessment data model and rules.
6. Implement the Eligibility Assessment Engine.
7. Implement human review and final decision.
8. Implement Project Member confirmation.
9. Extend member participation management.

The historical immediate focus was to review and progress the Activities workflow while limiting Takaza Registration to essential completion.

This is a historical V1 development direction. It must not automatically override the current V2 roadmap or priorities.

5.3 V2 Foundation and Authentication

Based on the available V2 implementation status and repository audit:

Area| Status| Notes
V2 project structure| IMPLEMENTED| V2 source, migrations, tests, web and configuration are maintained under "v2/".
Core domain foundation| IMPLEMENTED / IN PROGRESS| Initial foundation exists; complete business workflows require further development.
Amer appointment rules| IMPLEMENTED AT FOUNDATION LEVEL| Appointment validation, replacement rules and former Amer access have foundation-level implementation.
Authentication backend| IMPLEMENTED AT REPORTED SCOPE| Registration, email OTP, activation, login and session-related work are recorded in the V2 status.
Automated tests| EXISTS| Tests have been developed for the implemented scope.
Worker build / dry-run| VERIFIED AT REPORTED SCOPE| A Worker dry-run was recorded in the implementation status.

The status of each feature must be checked against the current code and test results before release.

5.4 V2 Business Modules

Module| Current Position
Jemaah Management| Requires continued implementation and verification against the approved specification.
Organisation Structure and Governance| Specification and domain requirements exist; complete workflow requires verification.
Syukbah Management| Specification exists; implementation scope requires verification.
Takaza Management| Foundation rules exist; complete registration, participation and administrative workflows require further work.
Activities| Requires business workflow design, implementation and integration with assessment.
Eligibility Assessment| Proposed; detailed criteria and decision rules remain pending.
Human Review| Requires agreed authority, workflow and audit requirements.
Project Member Management| Requires lifecycle and workflow definition.
Reports and Comments| Requires implementation and verification.

5.5 Verification Limitations

The following limitations must remain visible in project reporting:

- Remote D1 schema has been inspected in read-only scope.
- Remote migration history and complete schema consistency have not been fully verified.
- Full end-to-end integration has not been confirmed.
- No V2 production deployment is claimed.
- No remote V2 migration or production database change is claimed.
- WhatsApp OTP and production message-delivery integration are not confirmed as implemented.
- National ID / Passport workflow is not confirmed as implemented.
- Local tests and Worker dry-run results do not prove production readiness.

---

6. Development Phases and Priorities

The following phases describe the intended V2 development direction. Dependencies and implementation status should be reviewed before each phase begins.

Phase 1 – Foundation and Core Domain

- [x] Establish separate V1 and V2 project structures.
- [x] Establish V2 Worker and database configuration.
- [x] Establish V2 migration structure.
- [x] Establish initial core domain foundation.
- [x] Implement foundation-level Amer appointment and replacement rules.
- [ ] Complete domain validation and integration review.
- [ ] Verify database and migration consistency.

Phase 2 – Authentication and User Management

- [x] Implement initial authentication backend.
- [x] Implement registration and email OTP flow at the reported scope.
- [x] Implement activation and login at the reported scope.
- [x] Implement session-related backend functionality at the reported scope.
- [ ] Verify complete authentication flow end to end.
- [ ] Confirm production email delivery configuration.
- [ ] Design and implement any remaining identity-document requirements.
- [ ] Verify role and permission enforcement throughout the API.

Phase 3 – Jemaah Management

- [ ] Complete Jemaah profile and account workflows.
- [ ] Implement required profile management.
- [ ] Integrate Jemaah with organisation and Syukbah structures.
- [ ] Verify access control and data ownership.
- [ ] Verify relevant audit history.

Phase 4 – Takaza Management

- [ ] Complete Takaza registration workflow.
- [ ] Complete Takaza listing, search and filtering.
- [ ] Implement required submission and endorsement workflow.
- [ ] Implement return, rejection and cancellation where approved.
- [ ] Integrate Amer appointment foundation rules into the complete workflow.
- [ ] Implement participant management.
- [ ] Implement Amer replacement workflow and administrative integration.
- [ ] Define and implement former Amer access in the complete user-facing workflow.
- [ ] Verify Takaza lifecycle and audit history.

Important: Amer appointment validation, replacement rules and former Amer access already have foundation-level implementation. The remaining work is to integrate and verify these rules within the complete Takaza workflow, not to duplicate the existing domain logic.

Phase 5 – Activities and Eligibility

- [ ] Complete Activity Type management and validation.
- [ ] Complete Activity assignment workflow.
- [ ] Complete Activity submission workflow.
- [ ] Complete Activity review and approval workflow.
- [ ] Verify approved Activity records as assessment evidence.
- [ ] Define common assessment criteria.
- [ ] Define Takaza-specific assessment criteria.
- [ ] Agree criterion types and mandatory requirements.
- [ ] Agree assessment outcomes and recommendation rules.
- [ ] Design assessment data model and criteria versioning.
- [ ] Implement Eligibility Assessment Engine only after requirements are agreed.

Phase 6 – Human Review and Project Membership

- [ ] Define reviewer roles and decision authority.
- [ ] Define approval, rejection and conditional approval workflows.
- [ ] Implement separate system recommendation and human decision records.
- [ ] Record decision rationale and supporting evidence.
- [ ] Define Project Member confirmation workflow.
- [ ] Define membership status and lifecycle.
- [ ] Implement relevant suspension, withdrawal or removal processes.
- [ ] Verify audit history and decision traceability.

Phase 7 – Takaza Reports and Comments

- [ ] Define reporting requirements.
- [ ] Implement relevant Takaza reports.
- [ ] Implement comments and discussion records.
- [ ] Define permissions for report and comment access.
- [ ] Preserve relevant history and audit information.

Phase 8 – Frontend and User Experience

- [ ] Complete frontend workflows for implemented backend modules.
- [ ] Verify navigation and dashboard behaviour.
- [ ] Verify responsive layouts.
- [ ] Verify role-based visibility and actions.
- [ ] Verify validation and error handling.
- [ ] Ensure user-facing workflows reflect the agreed business rules.

Phase 9 – Verification and Deployment

- [ ] Run automated tests.
- [ ] Run build and Worker dry-run checks.
- [ ] Verify API and frontend integration.
- [ ] Verify database schema and migration history.
- [ ] Review security and access-control enforcement.
- [ ] Complete end-to-end testing.
- [ ] Confirm deployment configuration and environment.
- [ ] Obtain explicit deployment approval.
- [ ] Deploy only through the approved manual process.
- [ ] Verify the deployed environment after release.

No production deployment or remote migration should be inferred from successful local tests or build checks.

---

7. Deferred Scope

7.1 Case Management

Status: ON HOLD

Case Management is deliberately deferred.

It must not become an active development priority until the relevant core business workflows and dependencies have been established and agreed.

Any future proposal to activate Case Management must include its purpose, scope, data requirements, access rules and relationship with existing modules.

---

8. Decisions and Requirements Register

8.1 AGREED

1. V1 and V2 must remain separate in code, configuration, database and deployment.
2. V2 is the forward development platform.
3. Activities provide evidence for assessing Takaza candidate eligibility.
4. Assessment may use both common and Takaza-specific criteria.
5. The system recommendation must remain separate from the final human decision.
6. The system must not replace human judgement.
7. A candidate may be approved despite some gaps where the overall case or potential contribution justifies approval, provided mandatory rules are respected and the rationale is recorded.
8. Important decisions and membership changes must retain audit history.
9. Development should proceed incrementally, avoiding indefinite polishing of one module while dependent workflows remain untouched.
10. Implemented domain rules must be distinguished from complete user-facing workflows.
11. Production deployment and remote migration require explicit approval.

8.2 PROPOSED

1. A dedicated Eligibility Assessment Engine.
2. Criterion types: Mandatory, Evaluative and Potential / Readiness.
3. Assessment outcomes: QUALIFIED, CONDITIONALLY_QUALIFIED, NOT_QUALIFIED and INSUFFICIENT_DATA.
4. Criteria versioning.
5. Conditional approval with recorded conditions, deadlines and follow-up.
6. A structured assessment history linking evidence, recommendation and human decision.

These proposals require confirmation before they become implementation rules.

8.3 PENDING

1. Minimum number of approved Activities required for assessment.
2. Whether an assessment should consider a defined time window.
3. Mandatory versus evaluative criteria for each Takaza.
4. Numeric scoring, weighting or rule-based recommendations.
5. Reviewer authority and override permissions.
6. Conditions, deadlines and monitoring for conditional approval.
7. Complete Takaza lifecycle and endorsement rules.
8. Project Member confirmation, suspension, withdrawal and removal rules.
9. Detailed relationship between Takaza participation and Project Member status.
10. Final scope of identity-document requirements.
11. Complete production OTP and message-delivery requirements.
12. Reporting and comment permissions.

Any numeric threshold or example, such as five approved Activities within the previous six months, remains an example only. It is not an agreed business rule.

---

9. Development Rules

1. Do not mix V1 and V2 implementation or deployment resources.
2. Do not assume an existing backend API means the complete workflow is finished.
3. Do not invent or silently change business rules.
4. Record new decisions in this document or the appropriate version-specific specification.
5. Keep AGREED, PROPOSED and PENDING requirements distinct.
6. Do not implement assessment rules before the relevant criteria and decision authority are agreed.
7. Preserve audit history for important decisions and membership changes.
8. Use automated tests where practical.
9. Verify existing implementation before duplicating or replacing it.
10. Keep changes focused and reviewable.
11. Do not delete or relocate project documentation without an agreed reason.
12. Do not perform production deployment, remote migration or destructive database operations without explicit approval.
13. Report verification limitations honestly.

---

10. Verification and Development Continuity

Every significant development task should record:

- Objective and scope.
- Files or modules affected.
- Existing implementation reviewed.
- Changes made.
- Tests performed and their results.
- Outstanding issues.
- Whether the work is local, committed, pushed or deployed.

A successful local build does not prove that the remote environment is correct.

A successful API test does not prove that the complete frontend workflow is correct.

A successful migration dry-run does not mean that a remote migration has been applied.

Before continuing work after a pause, review:

1. Current branch and commit.
2. Working-tree status.
3. Relevant implementation status.
4. Latest agreed decisions.
5. Outstanding verification limitations.

---

11. Documentation Ownership

The documentation structure follows these rules:

Location| Responsibility
"README.md"| Main project overview and repository guidance.
"docs/"| Shared project documentation and master roadmap.
"v1/"| V1 source code and V1-specific documentation.
"v2/"| V2 source code and configuration.
"v2/docs/"| V2-specific design, implementation and module specifications.

The master roadmap is maintained at:

"docs/DEVELOPMENT_ROADMAP.md"

Version-specific technical and business specifications should remain with their respective version.

Historical documents and backups should be preserved unless an explicit decision is made to archive, replace or remove them.

---

Last reviewed: 27 November 2026
Document status: Working document – subject to continued verification and approved decisions.

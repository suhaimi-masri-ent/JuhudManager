JuhudManager – Master Development Roadmap & Decision Log

Document: Master Development Roadmap & Decision Log
Scope: JuhudManager V1 and V2
Status: Working Document
Last Updated: 28 November 2026

---

1. Purpose of This Document

This document is the central reference for the development direction, business requirements, implementation status, decisions and outstanding questions for JuhudManager V1 and V2.

It consolidates the project-level direction while retaining the distinction between:

- V1 existing application and its historical development decisions.
- V2 architecture, implementation and business requirements.
- Requirements that have been agreed.
- Requirements that remain proposals or require review.
- Features that have been implemented and features that still require verification.

It is intended to:

- Maintain continuity across development sessions.
- Record agreed business rules and technical decisions.
- Distinguish implemented features from proposed and pending work.
- Keep V1 maintenance and V2 development clearly separated.
- Prevent previously agreed requirements from being unintentionally changed.
- Provide a consistent reference for future development, testing and verification.
- Identify the appropriate version-specific specification for detailed requirements.

1.1 Decision and Status Labels

Label| Meaning
AGREED| Explicitly agreed business or technical decision.
IMPLEMENTED| Implementation exists and has been verified to the stated extent.
IN PROGRESS| Work has started but is not complete.
PROPOSED| Suggested direction requiring confirmation.
PENDING| Requires further discussion, clarification or decision.
FOR REVIEW| Documented requirement or design baseline awaiting review or approval.
ON HOLD| Deliberately deferred.
NOT IMPLEMENTED| No confirmed implementation exists.
NEEDS REVIEW| Code or functionality exists but requires verification or reconciliation.

Implementation status must always identify its scope.

The existence of backend code does not automatically mean that a complete user-facing workflow is operational.

A requirement recorded in a design document is not automatically an implemented feature.

---

2. Overall Project Direction

2.1 V1 – Existing System

V1 is the existing system and must remain operationally and technically separate from V2.

Its role is to preserve existing functionality and provide a reference for business workflows, operational requirements and lessons learned.

V1 development should be controlled and incremental.

Existing functionality must not be removed or replaced without an agreed reason and appropriate verification.

2.2 V2 – Forward Development

V2 is the forward development platform.

Its architecture, database, API, authentication and frontend are maintained separately from V1.

V2 should implement the agreed business requirements using:

- A clear domain structure.
- Defined account and identity management.
- Role-based access control.
- Organisational and administrative governance.
- Takaza and participation management.
- Rekod Amal and Tafakut workflows.
- Audit history and traceable decisions.
- Maintainable frontend and backend architecture.

V1 code must not be assumed to be directly compatible with V2.

2.3 Main Business Workflow

The intended overall business workflow includes:

1. Manage user accounts and Ahbab profiles.
2. Manage organisational structure and membership.
3. Manage Syukbah and administrative appointments.
4. Create and manage Main Takaza and Sub Takaza.
5. Manage Takaza participants, Amer and Supervisor.
6. Manage Rekod Amal and other relevant participation records.
7. Apply Kawaif and Tafakut requirements where relevant.
8. Conduct human review and record authorised decisions.
9. Manage participation, reports, comments and history.
10. Preserve audit records and relevant operational history.

The system should support transparent and traceable decisions without replacing authorised human judgement.

---

3. Business Workflow and Requirements

3.1 Takaza and Project Management

Takaza represents a project or organised effort that requires participation and contribution.

The V2 design supports two Takaza levels:

- Main Takaza.
- Sub Takaza.

A Main Takaza may have Sub Takaza records. A Sub Takaza cannot have another Sub Takaza beneath it.

The relationship between Main and Sub Takaza establishes hierarchy only. Their lifecycle, dates and status must not automatically cascade from one to the other.

The intended management scope includes:

- Takaza creation and administration.
- Takaza status and lifecycle.
- Main/Sub Takaza relationship.
- Jemaah association.
- Participant applications and nominations.
- Amer appointment and replacement.
- Supervisor appointment.
- Takaza events and attendance.
- Percha and related records.
- Reports, comments and audit history.

Detailed requirements are maintained in:

"v2/docs/JMV2004-Takaza-Management.md"

That document is a requirements baseline for review. Its requirements must not all be treated as final implementation decisions until their approval status is confirmed.

3.2 Activities and Rekod Amal

V1 uses Activity and Activity Record terminology.

In the V2 design, Rekod Amal is the official term for Activity Record.

Rekod Amal provides records of participation, contribution and progress.

The intended workflow includes:

1. Activity type or relevant activity configuration.
2. Activity assignment where applicable.
3. Rekod Amal submission by Ahbab.
4. Review and approval where required.
5. Storage of approved and historical records.
6. Use of relevant records as evidence for assessment and reporting.

Records should preserve sufficient information to support later review, including dates, descriptions, progress, source and review outcomes.

The relationship between existing V1 Activities and the V2 Rekod Amal model must be reconciled before assuming that the workflows are identical.

3.3 Kawaif and Tafakut

Kawaif and Tafakut are separate concepts in the V2 design.

They must not be treated as interchangeable.

3.3.1 Kawaif

Kawaif represents an Ahbab's eligibility-related profile or record.

The documented design direction includes:

- Kawaif is maintained in the Ahbab profile.
- Admin may verify or certify Kawaif.
- Admin may enter or update Kawaif when information is missing or outdated.
- Kawaif may assist in identifying suitable Ahbab for a Takaza.

The category structure, scoring and assessment method remain pending.

3.3.2 Tafakut

Tafakut is the criteria-selection and assessment process.

It has two conceptual layers:

- Common Tafakut.
- Takaza-specific Tafakut.

Tafakut may use relevant information from the Ahbab profile and Rekod Amal.

The detailed form, criteria, evaluation rules and decision process must follow the relevant V2 design and approved requirements.

3.3.3 Relationship Between Rekod Amal, Kawaif and Tafakut

Component| Purpose
Rekod Amal| Records participation, activities and contribution.
Kawaif| Maintains eligibility-related information in the Ahbab profile.
Tafakut| Evaluates the relevant criteria for a particular Takaza.

These components must remain logically distinct.

The detailed data relationships, selection rules and assessment workflow require verification and agreement before implementation.

3.4 Eligibility Assessment

The V1 roadmap proposed an Eligibility Assessment Engine to assist assessment of candidates for Takaza participation or membership.

The engine should help make assessments consistent and reduce manual oversight.

It must not independently replace the final human decision.

The V1 assessment direction includes:

- Common criteria.
- Takaza-specific criteria.
- Evidence from approved Activities.
- Relevant experience and capability.
- Potential contribution and readiness.
- Identification of missing or unverifiable information.
- A recommendation for authorised human review.

The V2 design uses Kawaif and Tafakut terminology and requirements.

The V1 assessment model must therefore be reconciled with the V2 model before a common engine or shared business rule is implemented.

3.4.1 Proposed Criterion Types

The following criterion types are PROPOSED:

Type| Purpose
Mandatory| A requirement that must be satisfied.
Evaluative| A factor used to assess suitability or readiness.
Potential / Readiness| Evidence of potential, capability or future contribution.

The exact criteria and their application must be agreed before implementation.

3.4.2 Proposed Assessment Outcomes

The following outcomes are PROPOSED:

Outcome| Meaning
"QUALIFIED"| Candidate meets the applicable requirements.
"CONDITIONALLY_QUALIFIED"| Candidate may proceed subject to recorded conditions.
"NOT_QUALIFIED"| Available evidence does not support qualification.
"INSUFFICIENT_DATA"| There is insufficient evidence to make a reliable assessment.

These are proposed system recommendation outcomes, not automatic final membership decisions.

3.4.3 System Recommendation and Human Decision

AGREED – V1 assessment principle

The system recommendation and the final human decision must be stored separately.

The system may identify gaps or recommend an outcome. An authorised human reviewer remains responsible for the final decision.

AGREED – V1 assessment principle

A candidate may still be approved despite some gaps where the overall case, potential or expected contribution justifies approval, provided mandatory rules are respected and the rationale is recorded.

Where conditional approval is permitted, the decision should record:

- Justification for approval.
- Outstanding requirements.
- Conditions to be fulfilled.
- Responsible person, where applicable.
- Relevant deadline or review date.
- Follow-up status.

V2 reconciliation requirement

The V1 principle must be reconciled with V2 Takaza-specific Tafakut requirements before being applied as a universal V2 rule.

The documented V2 Takaza design contains its own assessment and participation outcomes. These must not be silently overridden by the V1 assessment proposal.

3.4.4 Transparency and Audit

The assessment process should preserve:

- Criteria and criteria version used.
- Evidence and Rekod Amal records considered.
- Kawaif information considered, where applicable.
- System recommendation and its rationale.
- Human reviewer and final decision.
- Reasons for approval, rejection or conditional approval.
- Conditions and follow-up records.
- Date and time of assessment and decision.

The system should clearly distinguish findings supported by verified records from findings requiring human verification.

3.5 Project Member and Takaza Participation Management

Project Member Management was identified in the V1 roadmap as a required future workflow.

The V2 design uses Takaza participation and membership concepts.

The intended management scope includes:

- Participant application.
- Admin nomination.
- Ahbab consent.
- Tafakut assessment where applicable.
- Admin decision.
- Participant status and lifecycle.
- Withdrawal and removal.
- Participation history.
- Relevant commitments and records.

A successful assessment must not automatically be treated as final approval unless the relevant business rule explicitly permits it.

The exact relationship between Project Member terminology in V1 and Takaza participant terminology in V2 requires reconciliation.

---

4. V2 Architecture and Technical Foundation

4.1 V2 Directory Structure

V2 development is maintained under the "v2/" directory.

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

The V2 foundation and design documents cover or propose the following areas:

- Users and authentication.
- User authentication identities.
- User credentials and sessions.
- Ahbab profiles.
- Jemaah and Jemaah memberships.
- Organisational structure.
- Syukbah.
- Takaza and Takaza participation.
- Amer appointments.
- Audit logs.
- Rekod Amal.
- Kawaif and Tafakut.
- Reports and comments.

The detailed relationships and business constraints must follow the relevant V2 specifications and approved decisions.

4.3 Authentication and Account Management

The V2 authentication design distinguishes authentication from user profile management.

The documented requirements include:

- Self-registration.
- Admin-assisted registration.
- Multiple login identities associated with one user.
- Email OTP.
- WhatsApp OTP.
- Password authentication.
- National ID and Passport identity handling.
- Identity uniqueness.
- Account activation.
- Password recovery.
- Session management.
- Account disable and reactivation.
- Audit history for sensitive administrative actions.

The detailed authentication specification is maintained in:

"v2/docs/Auth.md"

That document is a draft design specification. Its presence does not establish that every method or security workflow has been implemented.

4.4 Organisational Structure and Governance

The V2 organisational design covers:

1. Ahbab.
2. Mohallah.
3. Halqah.
4. Zone.
5. Markaz Negeri.
6. Markaz Negara.

It also defines administrative authority, leadership appointments, temporary delegation and historical records.

Detailed requirements are maintained in:

"v2/docs/JMV2002-Organization-Structure-Governance.md"

4.5 Syukbah Management

Syukbah is a work and administrative structure separate from the organisational hierarchy.

The documented design includes:

- Global baseline Syukbah.
- Additional country-specific Syukbah.
- Syukbah activation and deactivation.
- Admin and Deputy Admin appointments.
- Task allocation.
- Cross-Syukbah assistance.
- Scope-based permissions.
- Appointment and operational history.

Detailed requirements are maintained in:

"v2/docs/JMV2003-Syukbah-Management.md"

4.6 Amer Appointment Rules

The V2 foundation includes domain-level rules for Amer appointment, replacement and former Amer access.

The documented foundation includes:

- Amer is appointed per Takaza, not as a permanent Jemaah role.
- Amer must be an eligible participant in the relevant Takaza.
- Appointment references the relevant participation record.
- Only one active Amer appointment is permitted for a Takaza at a time.
- Admin may replace the Amer.
- Replacement requires a reason and retains the previous appointment.
- Former Amer access is controlled by Admin.
- Ending an Amer appointment does not automatically end the individual's Takaza participation.

The existence of these foundation rules does not mean the complete Takaza participant-management workflow is finished.

The user-facing workflow, administrative integration and end-to-end verification remain separate development responsibilities.

4.7 V1 and V2 Separation

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

Implementation statuses in this section are snapshots based on the available repository and documentation audits.

They must be re-verified before being treated as current production status.

5.1 V1 Implementation Snapshot

Reference date: 16 November 2026

The following status reflects the historical V1 roadmap snapshot.

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

Reference document: "v2/docs/V2_IMPLEMENTATION_STATUS.md"
Status snapshot: 23 November 2026

Area| Status| Notes
V2 project structure| IMPLEMENTED| V2 source, migrations, tests, web and configuration are maintained under "v2/".
Initial V2 schema| IMPLEMENTED AT FOUNDATION SCOPE| Initial schema covers users, roles, Jemaah, Jemaah memberships, Takaza, Takaza participation, Amer appointments and audit logs.
Core domain foundation| IMPLEMENTED / IN PROGRESS| Initial foundation exists; complete business workflows require further development.
Amer appointment rules| IMPLEMENTED AT FOUNDATION LEVEL| Appointment validation, replacement rules and former Amer access have foundation-level implementation.
Authentication backend| IMPLEMENTED AT REPORTED SCOPE| Registration, email OTP, activation, login and sessions are recorded in the V2 status.
Account provisioning| IMPLEMENTED AT REPORTED SCOPE| Initial user account provisioning and registration review are recorded in the V2 design checkpoint and earlier roadmap. Current implementation scope requires verification.
Automated tests| EXISTS| Tests have been developed for the currently implemented domain and authentication flows.
Worker build / dry-run| VERIFIED AT REPORTED SCOPE| A Worker dry-run build was recorded in the implementation status.

The status of each feature must be checked against the current code and test results before release.

5.4 V2 Business Modules

Module| Current Position
Ahbab Profile and Account Management| Requirements baseline exists. Complete profile, address, account activity, disable/reactivate and appeal workflows require implementation verification.
Organisational Structure and Governance| Requirements baseline exists. Complete hierarchy, administrative appointments and governance workflows require implementation verification.
Syukbah Management| Requirements baseline exists. Complete Syukbah administration, appointments and task workflows require implementation verification.
Jemaah Management| Full Jemaah and membership APIs are not confirmed implemented in the 23 November V2 status.
Takaza Management| Foundation rules exist. Takaza creation/release and participation application APIs are not confirmed implemented in the 23 November V2 status.
Amer Management| Foundation appointment and replacement rules exist; complete workflow integration remains outstanding.
Supervisor Management| Requirements and authority require further design.
Rekod Amal| Requires implementation and verification as a complete workflow.
Kawaif| Category, scoring and assessment rules remain pending.
Tafakut| Actual eligibility calculation and complete assessment workflow are not confirmed implemented.
Reports and Comments| Not confirmed implemented in the 23 November V2 status.
Frontend| Complete V2 business screens are not confirmed implemented in the 23 November V2 status.

Requirements documents must not be treated as proof of implementation.

5.5 Verification Limitations

The following limitations must remain visible in project reporting:

- Remote D1 schema has been inspected in read-only scope.
- Remote migration history and complete schema consistency have not been fully verified.
- Full end-to-end integration has not been confirmed.
- No V2 production deployment is claimed.
- No remote V2 migration or production database change is claimed.
- WhatsApp OTP and production delivery integration are not confirmed as implemented.
- National ID / Passport verification workflow is not confirmed as implemented.
- Full Jemaah and membership APIs are not confirmed as implemented in the 23 November status.
- Takaza creation/release and participation application APIs are not confirmed as implemented in the 23 November status.
- Kawaif/Tafakut assessment engine is not confirmed as implemented.
- Reports, comments and version history are not confirmed as implemented.
- Local tests and Worker dry-run results do not prove production readiness.

---

6. Development Phases and Priorities

The following phases describe the intended V2 development direction.

Dependencies and implementation status should be reviewed before each phase begins.

Phase 1 – Foundation and Core Domain

- [x] Establish separate V1 and V2 project structures.
- [x] Establish V2 Worker and database configuration.
- [x] Establish V2 migration structure.
- [x] Establish initial V2 schema and core domain foundation.
- [x] Implement foundation-level Amer appointment validation.
- [x] Implement foundation-level Amer replacement rules.
- [x] Implement foundation-level former Amer access policy.
- [ ] Complete domain validation and integration review.
- [ ] Verify database and migration consistency.

Phase 2 – Authentication and User Management

- [x] Implement initial authentication backend at the reported scope.
- [x] Implement registration and email OTP flow at the reported scope.
- [x] Implement activation and login at the reported scope.
- [x] Implement session-related backend functionality at the reported scope.
- [ ] Verify complete authentication flow end to end.
- [ ] Complete email delivery and Worker/D1 integration testing.
- [ ] Implement and verify WhatsApp OTP and production delivery integration.
- [ ] Complete identity verification and recovery requirements.
- [ ] Complete Admin-assisted registration workflow.
- [ ] Complete account provisioning and registration review workflow.
- [ ] Complete role and permission management.
- [ ] Complete Admin user management.
- [ ] Complete user profile management.
- [ ] Verify role and permission enforcement throughout the API.

Phase 3 – Ahbab, Jemaah and Organisational Management

- [ ] Complete Ahbab profile management.
- [ ] Complete address and active Mohallah assignment workflows.
- [ ] Complete account activity history.
- [ ] Complete account disable/reactivate and appeal workflows.
- [ ] Implement Jemaah creation and management.
- [ ] Implement Jemaah membership management.
- [ ] Define and implement membership status and lifecycle.
- [ ] Implement organisational hierarchy and placement workflows.
- [ ] Implement administrative appointment and delegation workflows.
- [ ] Implement Syukbah management.
- [ ] Integrate Ahbab with organisation and Syukbah structures.
- [ ] Verify access control, data ownership and audit history.

Phase 4 – Takaza Management

- [ ] Complete Main Takaza creation and management.
- [ ] Complete Sub Takaza creation and management.
- [ ] Enforce the maximum two-level hierarchy.
- [ ] Ensure Main and Sub Takaza lifecycles remain independent.
- [ ] Complete Takaza listing, search and filtering.
- [ ] Implement Takaza status and transition rules.
- [ ] Implement proposed start date and Admin confirmation/lock workflow.
- [ ] Implement Takaza amendment and cancellation workflows.
- [ ] Preserve Takaza history and prevent ordinary deletion.
- [ ] Implement Takaza participation applications.
- [ ] Implement Admin nomination and Ahbab consent.
- [ ] Implement participant approval and status management.
- [ ] Integrate Amer appointment foundation rules into the complete workflow.
- [ ] Implement Amer replacement and appointment history.
- [ ] Define and implement Supervisor workflow after authority is agreed.
- [ ] Implement Takaza events and attendance records.
- [ ] Verify Takaza lifecycle and audit history.

Important: Amer appointment validation, replacement rules and former Amer access already have foundation-level implementation. The remaining work is to integrate and verify these rules within the complete Takaza workflow, not to duplicate the existing domain logic.

Detailed Takaza requirements are maintained in "v2/docs/JMV2004-Takaza-Management.md".

Phase 5 – Rekod Amal, Kawaif and Tafakut

- [ ] Define and complete Rekod Amal data and workflow.
- [ ] Complete relevant activity configuration and assignment.
- [ ] Complete Rekod Amal submission and review.
- [ ] Preserve approved and historical Rekod Amal records.
- [ ] Define Kawaif categories and structure.
- [ ] Define Kawaif verification and administration.
- [ ] Define Common Tafakut.
- [ ] Define Takaza-specific Tafakut.
- [ ] Define criteria-selection and assessment workflow.
- [ ] Reconcile V1 eligibility principles with V2 Tafakut requirements.
- [ ] Agree mandatory and evaluative criteria.
- [ ] Agree assessment outcomes and recommendation rules.
- [ ] Design assessment data model and criteria versioning.
- [ ] Implement assessment engine only after requirements are agreed.
- [ ] Verify assessment evidence, recommendation and decision history.

Phase 6 – Human Review and Project Membership

- [ ] Define reviewer roles and decision authority.
- [ ] Define approval, rejection and conditional approval workflows.
- [ ] Implement separate system recommendation and human decision records.
- [ ] Record decision rationale and supporting evidence.
- [ ] Define Project Member terminology and its relationship with Takaza participation.
- [ ] Define membership confirmation workflow.
- [ ] Define membership status and lifecycle.
- [ ] Implement relevant suspension, withdrawal or removal processes.
- [ ] Verify audit history and decision traceability.

Phase 7 – Takaza Operations, Reports and Comments

- [ ] Define Takaza event requirements and event templates.
- [ ] Implement event attendance and relevant remarks.
- [ ] Implement Percha generation and amendment workflow where approved.
- [ ] Implement Kharguzari and individual reporting workflows.
- [ ] Implement full Takaza report submission by Amer.
- [ ] Implement comments and discussion records.
- [ ] Define permissions for reports and comments.
- [ ] Preserve report, comment and version history.
- [ ] Implement relevant Takaza completion requirements.
- [ ] Define annual archive requirements and verification.

Phase 8 – Frontend and User Experience

- [ ] Complete frontend workflows for implemented backend modules.
- [ ] Complete Admin dashboard.
- [ ] Complete Ahbab dashboard.
- [ ] Complete profile and account screens.
- [ ] Complete Jemaah and organisation management screens.
- [ ] Complete Syukbah management screens.
- [ ] Complete Takaza management screens.
- [ ] Complete Rekod Amal and Tafakut screens.
- [ ] Complete reports and comments interface.
- [ ] Verify navigation and dashboard behaviour.
- [ ] Verify responsive layouts.
- [ ] Verify role-based visibility and actions.
- [ ] Verify validation and error handling.
- [ ] Ensure user-facing workflows reflect the approved business rules.

Phase 9 – Verification and Deployment

- [ ] Run automated tests.
- [ ] Run build and Worker dry-run checks.
- [ ] Verify API and frontend integration.
- [ ] Verify database schema and migration history.
- [ ] Review security and access-control enforcement.
- [ ] Complete end-to-end testing.
- [ ] Confirm deployment configuration and environment.
- [ ] Confirm dedicated V2 production D1 database.
- [ ] Obtain explicit deployment approval.
- [ ] Deploy only through the approved manual process.
- [ ] Verify the deployed environment after release.

No production deployment or remote migration should be inferred from successful local tests or build checks.

---

7. Deferred Scope

7.1 Case Management

Status: ON HOLD

Full Case Management is deliberately deferred.

It must not become an active development priority until the relevant core business workflows and dependencies have been established and agreed.

The V2 Design Checkpoint records a requirement for a system-generated Requires Attention case when a Takaza is cancelled.

This requirement must be distinguished from implementation of the complete Case Management module.

The minimal cancellation-related attention record and its relationship with affected participants require reconciliation with the deferred Case Management scope.

Any future proposal to activate full Case Management must include:

- Purpose and scope.
- Data requirements.
- Access rules.
- Assignment and responsibility.
- Actions and resolution.
- Status transitions and closure.
- Relationship with Takaza and participation records.

---

8. Decisions and Requirements Register

8.1 AGREED

The following decisions are recorded as agreed at the stated project or design scope.

1. V1 and V2 must remain separate in code, configuration, database and deployment.
2. V2 is the forward development platform.
3. Development should proceed incrementally, avoiding indefinite polishing of one module while dependent workflows remain untouched.
4. Activities provide evidence for assessing Takaza candidate eligibility in the V1 assessment direction.
5. Assessment may use both common and Takaza-specific criteria in the V1 assessment direction.
6. The system recommendation must remain separate from the final human decision.
7. The system must not replace authorised human judgement.
8. A candidate may be approved despite some gaps where the overall case or potential contribution justifies approval, provided mandatory rules are respected and the rationale is recorded. This is an agreed V1 assessment principle and requires reconciliation before universal application in V2.
9. Important decisions and membership changes must retain audit history.
10. Implemented domain rules must be distinguished from complete user-facing workflows.
11. Production deployment and remote migration require explicit approval.
12. V1 must be preserved as an existing system and must not be unintentionally disrupted by V2 development.

8.2 V2 DESIGN BASELINE – FOR REVIEW

The following requirements are recorded in V2 design documents but must retain their respective review and approval status.

1. Main Takaza and Sub Takaza support a maximum of two hierarchy levels.
2. Main and Sub Takaza lifecycles remain independent.
3. Takaza participation and application decisions are separate concepts.
4. Amer is appointed per Takaza and must be a participant in the relevant Takaza.
5. Amer replacement must retain appointment history and a reason.
6. Former Amer access is Admin-controlled.
7. Takaza start-date proposal and official Admin confirmation/lock are separate steps.
8. Takaza amendments must preserve old and new values, actor, date/time and reason.
9. Takaza must not be physically deleted through ordinary operations.
10. Rekod Amal is the official V2 term for Activity Record.
11. Tafakut is the V2 criteria-selection and assessment process.
12. Kawaif is a separate eligibility-related profile record.
13. Takaza reports, comments and historical records must preserve relevant history.
14. Takaza event attendance is separate from Takaza lifecycle status.

The detailed requirements are maintained in the relevant V2 design and module documents. A requirement marked FOR REVIEW must not be silently promoted to AGREED.

8.3 PROPOSED

1. A dedicated Eligibility Assessment Engine.
2. Criterion types: Mandatory, Evaluative and Potential / Readiness.
3. Assessment outcomes: QUALIFIED, CONDITIONALLY_QUALIFIED, NOT_QUALIFIED and INSUFFICIENT_DATA.
4. Criteria versioning.
5. Conditional approval with recorded conditions, deadlines and follow-up.
6. A structured assessment history linking evidence, recommendation and human decision.
7. A unified assessment model reconciling V1 Activity evidence and V2 Rekod Amal, Kawaif and Tafakut.

These proposals require confirmation before they become implementation rules.

8.4 PENDING

1. Minimum number of approved Activities or Rekod Amal required for assessment.
2. Whether assessment should consider a defined time window.
3. Mandatory versus evaluative criteria for each Takaza.
4. Numeric scoring, weighting or rule-based recommendations.
5. Reviewer authority and override permissions.
6. Conditions, deadlines and monitoring for conditional approval.
7. Exact Kawaif categories, scoring and verification rules.
8. Detailed Tafakut form and assessment workflow.
9. Reconciliation of V1 candidate-gap approval principles with V2 Tafakut outcomes.
10. Complete Takaza lifecycle and endorsement rules.
11. Supervisor authority and workflow.
12. Project Member confirmation, suspension, withdrawal and removal rules.
13. Detailed relationship between Takaza participation and Project Member status.
14. Complete production OTP and message-delivery requirements.
15. Final identity-document verification and recovery requirements.
16. Reporting, comments and annual archive requirements.
17. Cancellation-related Requires Attention record and its relationship with full Case Management.

Any numeric threshold or example, such as five approved Activities within the previous six months, remains an example only. It is not an agreed business rule.

---

9. Development Rules

1. Do not mix V1 and V2 implementation or deployment resources.
2. Do not assume an existing backend API means the complete workflow is finished.
3. Do not treat a design document as proof of implementation.
4. Do not invent or silently change business rules.
5. Record new decisions in this document or the appropriate version-specific specification.
6. Keep AGREED, FOR REVIEW, PROPOSED and PENDING requirements distinct.
7. Do not implement assessment rules before the relevant criteria and decision authority are agreed.
8. Preserve audit history for important decisions and membership changes.
9. Use automated tests where practical.
10. Verify existing implementation before duplicating or replacing it.
11. Keep changes focused and reviewable.
12. Do not delete or relocate project documentation without an agreed reason.
13. Do not perform production deployment, remote migration or destructive database operations without explicit approval.
14. Report verification limitations honestly.
15. Reconcile V1 business terminology with V2 domain terminology before reusing requirements.
16. Keep detailed module requirements in their respective V2 specifications and use this roadmap as the project-level continuity reference.

---

10. Verification and Development Continuity

Every significant development task should record:

- Objective and scope.
- Files or modules affected.
- Existing implementation reviewed.
- Requirements and decisions used.
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
6. Relevant version-specific requirements and design documents.

Repository synchronization should be verified before beginning a new development phase.

The local working copy and the GitHub branch should be reconciled before proceeding with new implementation work.

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

Important supporting V2 documents include:

- "v2/docs/V2_DESIGN_CHECKPOINT.md"
- "v2/docs/V2_IMPLEMENTATION_STATUS.md"
- "v2/docs/Auth.md"
- "v2/docs/JMV2001-Ahbab-Profile-Account-Management.md"
- "v2/docs/JMV2002-Organization-Structure-Governance.md"
- "v2/docs/JMV2003-Syukbah-Management.md"
- "v2/docs/JMV2004-Takaza-Management.md"

Version-specific technical and business specifications should remain with their respective version.

Historical documents and backups should be preserved unless an explicit decision is made to archive, replace or remove them.

---

12. V2 Decision and Documentation Reconciliation

Reconciliation Date: 28 November 2026
Applies To: JuhudManager V2
Authority: V2 Master Decision Register, Module Requirements and current module specifications

This section clarifies how the historical project roadmap must be interpreted against the current approved V2 requirements.

12.1 Authority of V2 Documentation

For V2 requirements and decisions, use the following authoritative documents:

- "v2/docs/MASTER_DECISION_REGISTER.md" — approved decisions.
- "v2/docs/OPEN_DECISIONS_REGISTER.md" — unresolved decisions.
- "v2/docs/MODULE_REQUIREMENTS.md" — consolidated functional requirements.
- "v2/docs/V2_IMPLEMENTATION_STATUS.md" — implementation status and V2 development roadmap.
- Relevant V2 module specifications under "v2/docs/".

This root roadmap remains the shared project-level continuity document for V1 and V2. It must not maintain a competing V2 implementation status or override approved V2 decisions.

12.2 Project Member and Takaza Participation

The historical V1 term Project Member remains relevant to V1 documentation and historical development context.

For V2:

- Jemaah Membership and Takaza Participation are separate concepts.
- Takaza Participation is the authoritative V2 record of an Ahbab's participation in a Takaza.
- Relevant V1 Project Member records map to V2 Takaza Participation where appropriate.
- V2 must not introduce a separate Project Member entity.
- V2 participation status, withdrawal, removal, appeal, transfer and rejoining follow the current JMV2004 specification.

Accordingly, references in this roadmap to defining a separate V2 Project Member entity, terminology or lifecycle must not be treated as outstanding V2 requirements.

The historical V1 Project Member workflow remains within V1 scope.

12.3 Amer Appointment

The V2 Amer appointment prerequisite is confirmed:

- An Amer candidate must already be a confirmed participant in the same Takaza before the appointment becomes effective.
- If the candidate is not yet a confirmed participant, the normal participation process must first be completed.
- Appointment may take effect before the official Takaza start date.
- Appointment requires the applicable Admin and candidate consent.
- Appointment, replacement, expiry and history follow the current JMV2004 specification.

The existence of foundation-level Amer code must not be treated as proof that the complete user-facing workflow is implemented.

12.4 Password Reset

Password Reset is a required V2 feature but is not implemented.

The approved baseline requires:

- Use of the registered and verified email address.
- OTP containing six digits.
- Five-minute OTP validity.
- Maximum five verification attempts.
- Sixty-second resend cooldown.
- New password meeting the minimum twelve-character requirement.
- Revocation of all existing sessions and tokens after successful reset.
- Audit event and security notification.

Admin-Assisted Account Recovery is a separate process and must not be represented as ordinary Password Reset.

12.5 Case Management

Full Case Management remains ON HOLD.

A cancellation-related Requires Attention record does not mean that the complete Case Management module is implemented or approved for activation.

The detailed scope and status must follow the current V2 decision and implementation documents.

12.6 Interpretation of Historical Roadmap Sections

The following sections retain their historical and project-continuity purpose:

- V1 assessment and Project Member proposals.
- Historical V1 implementation snapshots.
- V1 development sequence.
- Historical V1 Activities and assessment concepts.

They must not automatically become V2 requirements.

Where an older V2 statement conflicts with a later approved V2 decision, the current authoritative V2 documents take precedence.

12.7 Current V2 Implementation Status

The V2 implementation position must be read exclusively from:

"v2/docs/V2_IMPLEMENTATION_STATUS.md"

That document records current implementation evidence, blockers, verification limitations, development phases and release gates.

Historical status snapshots in this root roadmap must not be interpreted as current production verification.

In particular:

- A successful test result applies only to the tested scope.
- A successful build does not prove complete functional implementation.
- A migration record does not by itself prove every production feature is operational.
- A deployed Worker does not prove all frontend and business workflows are complete.
- Design approval does not constitute implementation approval.

12.8 Maintenance Rule

When V2 requirements or decisions change:

1. Update the relevant V2 authoritative document first.
2. Update the V2 Implementation Status if implementation progress or evidence changes.
3. Review this root roadmap for conflicting or outdated project-level statements.
4. Preserve historical V1 context.
5. Do not silently promote pending decisions into approved requirements.

---

Reconciliation Status: Added as the current V2 interpretation layer for this project-level roadmap.

Last Updated: 28 November 2026

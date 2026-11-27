# JuhudManager V2 — Open Decisions Register

Document ID: JMV2-ODR-001
Version: 2.0
Date: 28 November 2026
Status: Open Decisions — Pending Resolution

---

1. Purpose

This document records JuhudManager V2 decisions that remain unresolved.

It prevents provisional proposals from being treated as approved requirements or implemented as confirmed system behaviour.

Every unresolved decision must be resolved through explicit agreement and reflected in all affected documents before implementation.

A pending decision does not authorize developers to invent behaviour or make business-policy assumptions.

This register must be read together with:

- "MASTER_DECISION_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "V2_IMPLEMENTATION_STATUS.md"
- "REPOSITORY_DISPOSITION.md"
- Relevant module specifications
- "UAC_MATRIX.md"
- "DASHBOARD_NAVIGATION_SPEC_V2.md"

2. Decision Status Definitions

Status| Meaning
OPEN| No final decision has been approved
PENDING REVIEW| A proposal exists but requires review
PROVISIONAL| A temporary working rule exists and may change
ON HOLD| Decision or workflow is deliberately deferred
DECIDED| A final decision has been approved and transferred to the Master Decision Register
SUPERSEDED| Replaced by a later approved decision

Only decisions marked "DECIDED" and properly recorded in "MASTER_DECISION_REGISTER.md" may be treated as final requirements.

"ON HOLD" does not mean that the decision has been rejected. It means that implementation or further work is deferred.

3. Open Decision Register

ODR-001 — Markaz Negara Governance

Status: OPEN

Two governance alternatives remain under consideration:

- Amer Negara holds final authority.
- Ahli Syura provides collective governance, with Faisalah holding final authority.

The system must not assume that both arrangements apply simultaneously.

Decision required:

- Select the governance model.
- Define appointment and removal authority.
- Define decision-making and escalation procedures.
- Define the relationship between Amer Negara, Ahli Syura and Faisalah.
- Define accountability and dispute-resolution procedures.

Implementation impact: Organization governance, role permissions, approval workflows, organizational structure and audit records.

ODR-002 — Country Organization Hierarchy

Status: OPEN

The final organization hierarchy within a country has not been fully confirmed.

Potential levels include:

- Markaz Negara
- Negeri
- Daerah
- Kawasan
- Mohallah

The system must support configurable organizational scope without assuming that every country uses identical administrative levels.

Decision required:

- Confirm the standard hierarchy.
- Define which levels are mandatory or optional.
- Define parent-child relationships.
- Define whether a country may introduce additional levels.
- Define administrative scope and reporting relationships.

Implementation impact: Organization schema, administration scope, reporting, authorization and dashboard navigation.

ODR-003 — Additional Country Syukbah Approval

Status: OPEN

The Global Baseline Syukbah is managed by SUPER_ADMIN and provides a common baseline for countries.

Not every country must activate every baseline Syukbah.

The approval authority for additional country-specific Syukbah has not been finalized.

Decision required:

- Identify the approving authority.
- Define who may propose an additional Syukbah.
- Define whether approval is required before activation.
- Define who may suspend or retire an additional Syukbah.
- Define how country-specific Syukbah relates to the Global Baseline.

Implementation impact: Syukbah creation, approval, activation, suspension, retirement and country-level governance.

ODR-004 — Supervisor Authority and Eligibility

Status: OPEN

The Supervisor appointment process has provisional rules, but the full scope of authority remains unresolved.

The following matters require confirmation:

- Whether a Supervisor must already be a confirmed participant in the relevant Takaza.
- The Supervisor's operational responsibilities.
- Whether the Supervisor may approve or reject operational decisions.
- Whether the Supervisor may access participant records or reports.
- Whether the Supervisor may act on behalf of the Amer or Admin.
- Whether any specific delegation is permitted.
- Whether additional TAFAKUT or eligibility requirements apply.

Until resolved, no special approval or administrative authority must be inferred from the Supervisor title.

Implementation impact: Role permissions, appointment workflow, access control, delegation, dashboard navigation and audit.

ODR-005 — DIRECT_ASSIGNMENT Participation Conditions

Status: OPEN

"DIRECT_ASSIGNMENT" is an approved participation method, but its detailed conditions remain unresolved.

Decision required:

- Whether Ahbab consent is mandatory.
- Whether TAFAKUT is mandatory.
- Whether specific eligibility conditions apply.
- Whether an Admin may assign directly without a separate application.
- Whether notification or acknowledgment is required.
- How refusal or non-response is handled.
- Whether any exceptional assignment procedure is permitted.

No implementation may assume that "DIRECT_ASSIGNMENT" bypasses consent or TAFAKUT requirements.

Implementation impact: Takaza participation workflow, eligibility validation, notifications and authorization.

ODR-006 — Full Case Management Workflow

Status: ON HOLD

Cancellation of a Takaza must create a Requires Attention case identifying affected Ahbab and the relevant Takaza.

However, the complete Case Management module has not been approved.

Decision required:

- Case categories and classification.
- Case ownership and assignment.
- Investigation and review workflow.
- Case statuses and transitions.
- Escalation and closure authority.
- Appeal and follow-up handling.
- Notifications and audit requirements.
- Reporting and retention requirements.

Until approved, only the minimum cancellation-related Requires Attention process is required.

Implementation impact: Case Management module, workflow engine, authorization, notifications and audit.

ODR-007 — Annual Archive Correction Policy

Status: OPEN

Annual Archive information may be supplemented or corrected by authorized Admin users.

The correction policy has not been finalized.

Decision required:

- Which information may be corrected.
- Which Admin scope may perform corrections.
- Whether supporting reasons or evidence are mandatory.
- Whether correction requires second-person approval.
- Whether corrections affect statistics and historical summaries.
- How original values and correction history are retained.

Corrections must not silently rewrite original operational history.

Implementation impact: Archive management, audit trail, reporting integrity and data access control.

ODR-008 — Post-Completion Takaza Changes

Status: OPEN

The general Takaza lifecycle and completion requirements have been defined.

Exceptional changes after completion remain unresolved.

Decision required:

- Whether a completed Takaza may be reopened.
- Which information may be corrected after completion.
- Whether reopening requires higher-scope Admin approval.
- How reports, attendance, Percha and historical records are affected.
- Whether the original completion record must remain immutable.
- Whether a reopening event requires a separate audit record and reason.

No automatic reopening or retrospective alteration should be implemented without an approved rule.

Implementation impact: Takaza lifecycle, authorization, audit and historical reporting.

ODR-009 — Chief Admin and Deputy Appointment Process

Status: OPEN

The organizational structure supports one Chief Admin and one or more Deputies at each applicable organizational level.

The complete appointment and succession process remains unresolved.

Decision required:

- Appointment authority.
- Candidate eligibility.
- Consent requirements.
- Appointment duration.
- Replacement and removal process.
- Temporary acting authority.
- Handling of vacancies and unavailable office holders.
- Accountability and review procedures.

Implementation impact: Organization governance, role assignment, appointment workflow and approval controls.

ODR-010 — Reactivation and Rejoining Edge Cases

Status: OPEN

Account status, Takaza participation status and organizational membership must remain separate concepts.

Some reactivation and rejoining scenarios require further decisions.

Decision required:

- Conditions for restoring an inactive account.
- Whether a previously withdrawn participant may rejoin the same Takaza.
- Whether a removed participant may reapply.
- Whether a new participation record is always required.
- How historical records are linked and retained.
- Whether previous TAFAKUT results remain valid.
- How account reactivation interacts with existing Jemaah membership and participation restrictions.

Existing decisions distinguishing "WITHDRAWN" and "REMOVED" must remain in force.

Password Reset, OTP verification or email change must not automatically reactivate a disabled or suspended account.

Implementation impact: Account management, participation history, eligibility checks, authorization and audit.

ODR-011 — Syukbah Deputy and Acting Delegation

Status: OPEN

Syukbah supports one Admin and one or more Deputies.

The detailed delegation rules have not been finalized.

Decision required:

- Which duties may be delegated.
- Whether delegation is temporary or permanent.
- Whether an Admin must explicitly authorize each delegation.
- When a Deputy may act because the Admin is unavailable.
- Whether acting authority ends automatically.
- Whether delegated actions require additional audit information.
- Which actions remain exclusive to the Admin Syukbah.

Implementation impact: Syukbah permissions, delegation, acting authority and audit.

ODR-012 — Admin Syukbah Eligibility

Status: OPEN

The general candidate eligibility direction is based on Ahbab status and applicable TAFAKUT requirements.

The specific eligibility criteria for Admin Syukbah require confirmation.

Decision required:

- Required Ahbab status.
- Required experience or KAWAIF qualifications.
- TAFAKUT type and round requirements.
- Appointment authority.
- Whether additional organizational approval is required.
- Whether any appointment duration or renewal conditions apply.

Implementation impact: Syukbah appointment, eligibility validation and authorization.

ODR-013 — Annual Archive Main Takaza Filter

Status: OPEN

Annual Archive supports country, year and status filters.

Whether a dedicated Main Takaza filter is required has not been finalized.

Decision required:

- Whether users may filter by Main Takaza.
- Whether Sub Takaza should be grouped under its Main Takaza.
- Whether the filter applies to both Admin and Ahbab views.
- How the filter interacts with existing country, year and status filters.

Implementation impact: Archive query design, data relationships and user interface.

ODR-014 — Event Templates

Status: OPEN

Takaza events are flexible and are not limited to a fixed number or fixed sequence.

Admins may reuse an existing Aktiviti Khidmat record or create a new event.

The need for reusable event templates remains unresolved.

Decision required:

- Whether global event templates are required.
- Whether country-level or Takaza-level templates are permitted.
- Which fields may be customized.
- Whether templates can be versioned.
- Whether templates may be reused across Main and Sub Takaza.
- Who may create, modify and retire templates.

Implementation impact: Event management, configuration, reuse and user interface.

---

4. Rules for Handling Open Decisions

1. Do not treat an "OPEN" decision as an approved requirement.
2. Do not silently select an implementation approach for an unresolved governance or business rule.
3. Where a provisional rule is necessary, label it "PROVISIONAL" and record its limitations.
4. Do not allow an unresolved item to invalidate requirements that have already been approved independently.
5. Do not infer permissions from a title, appointment or organizational relationship unless explicitly authorized.
6. Do not implement an "ON HOLD" workflow beyond the minimum behaviour explicitly permitted by the relevant baseline.
7. Record the decision, decision date and approving authority when an item is resolved.
8. Transfer the approved outcome into "MASTER_DECISION_REGISTER.md".
9. Update affected module specifications and implementation tracking documents.
10. Preserve the decision history.
11. Identify any existing implementation that conflicts with a newly approved decision.
12. Do not mark a feature as implemented merely because its business decision has been approved.

5. Decision Resolution and Approval Record

Use the following record when resolving an item.

Field| Required Information
Decision ID| ODR reference
Previous Status| OPEN / PENDING REVIEW / PROVISIONAL / ON HOLD
Final Decision| Approved outcome
Decision Authority| Person or governing body authorized to decide
Decision Date| Date of approval
Rationale| Reason for the approved decision
Alternatives Considered| Other options considered, where relevant
Affected Documents| Documents requiring updates
Affected Requirements| Functional and non-functional requirements affected
Authorization Impact| Roles, scopes, permissions and approval rules affected
Database Impact| Schema, constraints, indexes and migration impact
API / Backend Impact| Endpoints, validation and business logic changes
Frontend Impact| Screens, forms, navigation and user interactions
Implementation Impact| Required development and testing work
Updated By| Person responsible for documentation updates

A decision is not considered fully documented until the approval record and affected documents have been updated.

6. Change Control

When a decision is approved, amended or superseded:

1. Update this register.
2. Update "MASTER_DECISION_REGISTER.md" where necessary.
3. Update affected module specifications.
4. Update UAC and Dashboard specifications where relevant.
5. Update implementation status and roadmap.
6. Identify existing code, database structures or workflows that conflict with the new decision.
7. Record required migration, API, backend and frontend changes.
8. Preserve the previous decision history.
9. Record the approving authority and effective date.
10. Verify that the change does not unintentionally affect V1.

Do not silently replace historical decisions.

7. Relationship with Other Documents

This register does not replace the Master Decision Register.

Its purpose is to identify unresolved matters and prevent accidental assumptions.

The Master Decision Register is the central reference for approved and provisional design decisions.

When a decision is finalized:

- Update this register.
- Update the Master Decision Register.
- Update the relevant module specification.
- Update UAC and Dashboard specifications if affected.
- Update the implementation status and roadmap.
- Preserve the historical decision record.

The implementation status document must distinguish between an approved requirement and an implemented feature.

---

End of Document

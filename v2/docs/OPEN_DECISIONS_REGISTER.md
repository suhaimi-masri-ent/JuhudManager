JuhudManager V2 — Open Decisions Register

Document ID: JMV2-ODR-001
Version: 1.0
Date: 27 November 2026
Status: Open Decisions — Pending Resolution

---

1. Purpose

This document records JuhudManager V2 decisions that remain unresolved.

It prevents provisional proposals from being treated as approved requirements or implemented as confirmed system behaviour.

This register must be read together with:

- "MASTER_DECISION_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "IMPLEMENTATION_STATUS_AND_ROADMAP.md"
- "REPOSITORY_DISPOSITION.md"

2. Decision Status Definitions

Status| Meaning
OPEN| No final decision has been approved
PENDING REVIEW| A proposal exists but requires review
PROVISIONAL| A temporary working rule exists and may change
DECIDED| A final decision has been approved and transferred to the Master Decision Register

Only decisions marked DECIDED may be treated as final requirements.

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

Implementation impact: Organization governance, role permissions, approval workflows and audit records.

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

Implementation impact: Organization schema, administration scope, reporting and authorization.

ODR-003 — Additional Country Syukbah Approval

Status: OPEN

The Global Baseline Syukbah is managed by SUPER_ADMIN and provides a common baseline for countries.

Not every country must activate every baseline Syukbah.

The approval authority for additional country-specific Syukbah has not been finalized.

Decision required:

- Identify the approving authority.
- Define whether approval is required before activation.
- Define how country-specific Syukbah relates to the Global Baseline.

Implementation impact: Syukbah creation, approval and country-level governance.

ODR-004 — Supervisor Authority and Eligibility

Status: OPEN

The Supervisor appointment process has provisional rules, but the full scope of authority remains unresolved.

The following matters require confirmation:

- Whether a Supervisor must already be a confirmed participant in the relevant Takaza.
- The Supervisor's operational responsibilities.
- Whether the Supervisor may approve or reject operational decisions.
- Whether the Supervisor may access participant records or reports.
- Whether the Supervisor may act on behalf of the Amer or Admin.

Until resolved, no special approval or administrative authority must be inferred from the Supervisor title.

Implementation impact: Role permissions, appointment workflow, access control and audit.

ODR-005 — DIRECT_ASSIGNMENT Participation Conditions

Status: OPEN

DIRECT_ASSIGNMENT is an approved participation method, but its detailed conditions remain unresolved.

Decision required:

- Whether Ahbab consent is mandatory.
- Whether TAFAKUT is mandatory.
- Whether specific eligibility conditions apply.
- Whether an Admin may assign directly without a separate application.
- How refusal or non-response is handled.

No implementation may assume that DIRECT_ASSIGNMENT bypasses consent or TAFAKUT requirements.

Implementation impact: Takaza participation workflow and eligibility validation.

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

Until approved, only the minimum cancellation-related Requires Attention process is required.

Implementation impact: Case management module, workflow engine, notifications and audit.

ODR-007 — Annual Archive Correction Policy

Status: OPEN

Annual Archive information may be supplemented or corrected by authorized Admin users.

The correction policy has not been finalized.

Decision required:

- Which information may be corrected.
- Which Admin scope may perform corrections.
- Whether supporting reasons or evidence are mandatory.
- Whether correction requires second-person approval.
- How original values and correction history are retained.

Corrections must not silently rewrite original operational history.

Implementation impact: Archive management, audit trail and reporting integrity.

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

No automatic reopening or retrospective alteration should be implemented without an approved rule.

Implementation impact: Takaza lifecycle, audit and historical reporting.

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

Implementation impact: Organization governance, role assignment and approval workflows.

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

Existing decisions distinguishing WITHDRAWN and REMOVED must remain in force.

Implementation impact: Account management, participation history and eligibility checks.

ODR-011 — Syukbah Deputy and Acting Delegation

Status: OPEN

Syukbah supports one Admin and one or more Deputies.

The detailed delegation rules have not been finalized.

Decision required:

- Which duties may be delegated.
- Whether delegation is temporary or permanent.
- Whether an Admin must explicitly authorize each delegation.
- When a Deputy may act because the Admin is unavailable.
- Whether delegated actions require additional audit information.

Implementation impact: Syukbah permissions, delegation and audit.

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

Implementation impact: Syukbah appointment and eligibility validation.

ODR-013 — Annual Archive Main Takaza Filter

Status: OPEN

Annual Archive supports country, year and status filters.

Whether a dedicated Main Takaza filter is required has not been finalized.

Decision required:

- Whether users may filter by Main Takaza.
- Whether Sub Takaza should be grouped under its Main Takaza.
- Whether the filter applies to both Admin and Ahbab views.

Implementation impact: Archive query design and user interface.

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

Implementation impact: Event management, configuration and user interface.

---

4. Rules for Handling Open Decisions

1. Do not treat an OPEN decision as an approved requirement.
2. Do not silently select an implementation approach for an unresolved governance or business rule.
3. Where a provisional rule is necessary, label it PROVISIONAL and record its limitations.
4. Do not allow an unresolved item to invalidate requirements that have already been approved independently.
5. Record the decision, decision date and approving authority when an item is resolved.
6. Transfer the approved outcome into "MASTER_DECISION_REGISTER.md".
7. Update affected module specifications and implementation tracking documents.
8. Preserve the decision history.

5. Decision Resolution Record

Use the following record when resolving an item:

Field| Required Information
Decision ID| ODR reference
Previous Status| OPEN / PENDING REVIEW / PROVISIONAL
Final Decision| Approved outcome
Decision Authority| Person or governing body authorized to decide
Decision Date| Date of approval
Affected Documents| Documents requiring updates
Implementation Impact| Required system changes
Updated By| Person responsible for documentation

6. Relationship with Other Documents

This register does not replace the Master Decision Register.

Its purpose is to identify unresolved matters and prevent accidental assumptions.

When a decision is finalized:

- Update this register.
- Update the Master Decision Register.
- Update the relevant module specification.
- Update the implementation roadmap where necessary.
- Preserve the historical decision record.

---

End of Document

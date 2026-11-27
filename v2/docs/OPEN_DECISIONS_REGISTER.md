
# JuhudManager V2 — Open Decisions Register

**Document ID:** JMV2-ODR-001  
**Version:** 2.1  
**Date:** 28 November 2026  
**Status:** Open Decisions — Pending Resolution

---

# 1. Purpose

This document records JuhudManager V2 decisions that remain unresolved.

It prevents provisional proposals from being treated as approved requirements or implemented as confirmed system behaviour.

Every unresolved decision must be resolved through explicit agreement and reflected in all affected documents before implementation.

A pending decision does not authorize developers to invent behaviour or make business-policy assumptions.

This register must be read together with:

- `MASTER_DECISION_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `REPOSITORY_DISPOSITION.md`
- Relevant module specifications
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`

The Master Decision Register is the central reference for approved and provisional decisions.

This register must not be used to reopen a decision that has already been confirmed unless a formal review or change request is initiated.

# 2. Decision Status Definitions

| Status | Meaning |
|---|---|
| OPEN | No final decision has been approved |
| PENDING REVIEW | A proposal exists but requires review |
| PROVISIONAL | A temporary agreed direction exists with stated limitations |
| ON HOLD | Decision or workflow is deliberately deferred |
| CONFIRMED | Decision has been approved and transferred to the Master Decision Register |
| SUPERSEDED | Replaced by a later approved decision |

Alignment with Master Decision Register:

- `OPEN` corresponds to an unresolved `PENDING` matter in the Master Decision Register.
- `PENDING REVIEW` remains unresolved.
- `PROVISIONAL` must retain its limitations.
- `ON HOLD` means implementation or further work is deferred.
- `CONFIRMED` means the decision has been approved and recorded in the Master Decision Register.
- `SUPERSEDED` means a later approved decision has replaced the previous decision.

Only decisions recorded as `CONFIRMED` in the Master Decision Register may be treated as approved requirements without additional qualification.

A requirement marked `NOT IMPLEMENTED` in the implementation status is not automatically an open business decision.

An approved requirement may remain unimplemented.

An `ON HOLD` workflow must not be implemented beyond the minimum behaviour explicitly permitted by the approved baseline.

# 3. Open Decision Register

## ODR-001 — Markaz Negara Governance

**Status: OPEN**

Two governance alternatives remain under consideration:

- Amer Negara holds final authority.
- Ahli Syura provides collective governance, with Faisalah holding final authority.

The system must not assume that both arrangements apply simultaneously.

**Decision required:**

- Select the governance model.
- Define appointment and removal authority.
- Define decision-making and escalation procedures.
- Define the relationship between Amer Negara, Ahli Syura and Faisalah.
- Define accountability and dispute-resolution procedures.
- Define the relationship between organizational leadership and system administration authority.

**Implementation impact:** Organization governance, role permissions, approval workflows, organizational structure and audit records.

## ODR-002 — Country Organization Hierarchy

**Status: OPEN**

The final organization hierarchy within a country has not been fully confirmed.

Potential levels include:

- Markaz Negara
- Negeri
- Daerah
- Kawasan
- Mohallah

The system must support configurable organizational scope without assuming that every country uses identical administrative levels.

**Decision required:**

- Confirm the standard hierarchy.
- Define which levels are mandatory or optional.
- Define parent-child relationships.
- Define whether a country may introduce additional levels.
- Define administrative scope and reporting relationships.
- Define how hierarchy changes affect existing organizational records.

**Implementation impact:** Organization schema, administration scope, reporting, authorization and dashboard navigation.

## ODR-003 — Additional Country Syukbah Approval

**Status: OPEN**

The Global Baseline Syukbah is managed by SUPER_ADMIN and provides a common baseline for countries.

Not every country must activate every baseline Syukbah.

The approval authority for additional country-specific Syukbah has not been finalized.

**Decision required:**

- Identify the approving authority.
- Define who may propose an additional Syukbah.
- Define whether approval is required before activation.
- Define who may suspend or retire an additional Syukbah.
- Define how country-specific Syukbah relates to the Global Baseline.
- Define whether additional Syukbah requires periodic review.

**Implementation impact:** Syukbah creation, approval, activation, suspension, retirement and country-level governance.

## ODR-004 — Supervisor Authority and Eligibility

**Status: OPEN**

Supervisor appointment has a provisional working direction, but the full scope of authority and eligibility remains unresolved.

**Existing provisional direction:**

- Admin and selected person must consent.
- Appointment duration temporarily follows Amer appointment principles.
- Admin may shorten, extend or end the appointment early.
- Appointment changes must be audited.
- Appointment changes must not change Takaza dates or status.
- Existing TAFAKUT information may be considered.
- A separate TAFAKUT is not required under the current provisional direction.

These provisional rules do not establish additional Supervisor authority.

**Decision required:**

- Whether a Supervisor must already be a confirmed participant in the relevant Takaza.
- The Supervisor's operational responsibilities.
- Whether the Supervisor may approve or reject operational decisions.
- Whether the Supervisor may access participant records or reports.
- Whether the Supervisor may act on behalf of the Amer or Admin.
- Whether any specific delegation is permitted.
- Whether additional eligibility requirements apply.
- Whether the provisional appointment direction should become confirmed.

Until resolved, no special approval or administrative authority must be inferred from the Supervisor title.

**Implementation impact:** Role permissions, appointment workflow, access control, delegation, dashboard navigation and audit.

## ODR-005 — DIRECT_ASSIGNMENT Participation Conditions

**Status: OPEN**

`DIRECT_ASSIGNMENT` is an approved participation method, but its detailed conditions remain unresolved.

**Decision required:**

- Whether Ahbab consent is mandatory.
- Whether TAFAKUT is mandatory.
- Whether specific eligibility conditions apply.
- Whether an Admin may assign directly without a separate application.
- Whether notification or acknowledgment is required.
- How refusal or non-response is handled.
- Whether any exceptional assignment procedure is permitted.
- Whether different conditions apply to Main and Sub Takaza.

No implementation may assume that `DIRECT_ASSIGNMENT` bypasses consent or TAFAKUT requirements.

**Implementation impact:** Takaza participation workflow, eligibility validation, notifications and authorization.

## ODR-006 — Full Case Management Workflow

**Status: ON HOLD**

Cancellation of a Takaza must create a `Requires Attention` case identifying affected Ahbab and the relevant Takaza.

The minimum cancellation-related process is part of the current baseline.

However, the complete Case Management module has not been approved.

**Decision required:**

- Case categories and classification.
- Case ownership and assignment.
- Investigation and review workflow.
- Case statuses and transitions.
- Escalation and closure authority.
- Appeal and follow-up handling.
- Notifications and audit requirements.
- Reporting and retention requirements.
- Whether Case Management may be used for matters beyond Takaza cancellation.

Until approved, only the minimum cancellation-related `Requires Attention` process is required.

Cancellation must not automatically cancel individual participation records.

Admin must handle affected participants individually.

**Implementation impact:** Case Management module, workflow engine, authorization, notifications and audit.

## ODR-007 — Annual Archive Correction Policy

**Status: OPEN**

Annual Archive information may be supplemented or corrected by authorized Admin users.

The correction policy has not been finalized.

**Decision required:**

- Which information may be corrected.
- Which Admin scope may perform corrections.
- Whether supporting reasons or evidence are mandatory.
- Whether correction requires second-person approval.
- Whether corrections affect statistics and historical summaries.
- How original values and correction history are retained.
- Whether corrections to finalized Annual Summary records require separate approval.

Corrections must not silently rewrite original operational history.

**Implementation impact:** Archive management, audit trail, reporting integrity and data access control.

## ODR-008 — Post-Completion Takaza Changes

**Status: OPEN**

The general Takaza lifecycle and completion requirements have been defined.

Exceptional changes after completion remain unresolved.

**Decision required:**

- Whether a completed Takaza may be reopened.
- Which information may be corrected after completion.
- Whether reopening requires higher-scope Admin approval.
- How reports, attendance, Percha and historical records are affected.
- Whether the original completion record must remain immutable.
- Whether a reopening event requires a separate audit record and reason.
- Whether reopening affects Annual Archive or Annual Summary information.

No automatic reopening or retrospective alteration should be implemented without an approved rule.

**Implementation impact:** Takaza lifecycle, authorization, audit and historical reporting.

## ODR-009 — Chief Admin and Deputy Appointment Process

**Status: OPEN**

The organizational structure supports one Chief Admin and one or more Deputies at each applicable organizational level.

The complete appointment and succession process remains unresolved.

**Decision required:**

- Appointment authority.
- Candidate eligibility.
- Consent requirements.
- Appointment duration.
- Replacement and removal process.
- Temporary acting authority.
- Handling of vacancies and unavailable office holders.
- Accountability and review procedures.
- Whether additional approval is required for certain organizational levels.

**Implementation impact:** Organization governance, role assignment, appointment workflow and approval controls.

## ODR-010 — Reactivation and Rejoining Edge Cases

**Status: OPEN — LIMITED SCOPE**

Account status, Takaza participation status and organizational membership must remain separate concepts.

Several fundamental rules have already been confirmed and must not be reopened through this item.

**Already confirmed:**

- Password Reset does not automatically reactivate a DISABLED or SUSPENDED account.
- OTP verification does not constitute account reactivation.
- Email change does not constitute account reactivation.
- Account reactivation requires a separate authorized process.
- `WITHDRAWN` and `REMOVED` are distinct participation statuses.
- Rejoining creates a new linked participation record.
- Previous participation records must remain preserved.
- A denied appeal does not permanently prevent future normal reapplication or TAFAKUT where required.

These confirmed rules remain in force.

**Remaining decision required:**

- Conditions for restoring an inactive account beyond the existing reactivation baseline.
- Whether a previously withdrawn participant may rejoin the same Takaza immediately or must satisfy additional conditions.
- Whether a removed participant may reapply after a successful appeal or through normal reapplication.
- Whether previous TAFAKUT results remain valid in specific rejoining scenarios.
- How account reactivation interacts with existing Jemaah membership and participation restrictions.
- Whether any additional review is required when a participant returns after a prolonged absence.

This item must not be used to reverse the confirmed distinction between account reactivation and participation rejoining.

**Implementation impact:** Account management, participation history, eligibility checks, authorization and audit.

## ODR-011 — Syukbah Deputy and Acting Delegation

**Status: OPEN**

Syukbah supports one Admin and one or more Deputies.

The detailed delegation rules have not been finalized.

**Decision required:**

- Which duties may be delegated.
- Whether delegation is temporary or permanent.
- Whether an Admin must explicitly authorize each delegation.
- When a Deputy may act because the Admin is unavailable.
- Whether acting authority ends automatically.
- Whether delegated actions require additional audit information.
- Which actions remain exclusive to the Admin Syukbah.
- Whether a Deputy may appoint or remove moderators.
- Whether a Deputy may approve administrative or configuration changes.

**Implementation impact:** Syukbah permissions, delegation, acting authority and audit.

## ODR-012 — Admin Syukbah Eligibility

**Status: OPEN**

The general candidate eligibility direction is based on Ahbab status and applicable TAFAKUT requirements.

The specific eligibility criteria for Admin Syukbah require confirmation.

**Decision required:**

- Required Ahbab status.
- Required experience or KAWAIF qualifications.
- TAFAKUT type and round requirements.
- Appointment authority.
- Whether additional organizational approval is required.
- Whether any appointment duration or renewal conditions apply.
- Whether specific Syukbah categories require additional qualifications.

**Implementation impact:** Syukbah appointment, eligibility validation and authorization.

## ODR-013 — Annual Archive Main Takaza Filter

**Status: OPEN**

Annual Archive supports country, year and status filters.

Whether a dedicated Main Takaza filter is required has not been finalized.

**Decision required:**

- Whether users may filter by Main Takaza.
- Whether Sub Takaza should be grouped under its Main Takaza.
- Whether the filter applies to both Admin and Ahbab views.
- How the filter interacts with existing country, year and status filters.
- Whether the selected Main Takaza filter affects summary statistics.

**Implementation impact:** Archive query design, data relationships and user interface.

## ODR-014 — Event Templates

**Status: OPEN**

Takaza events are flexible and are not limited to a fixed number or fixed sequence.

Admins may reuse an existing Aktiviti Khidmat record or create a new event.

The need for reusable event templates remains unresolved.

**Decision required:**

- Whether global event templates are required.
- Whether country-level or Takaza-level templates are permitted.
- Which fields may be customized.
- Whether templates can be versioned.
- Whether templates may be reused across Main and Sub Takaza.
- Who may create, modify and retire templates.
- Whether template changes affect existing scheduled events.

**Implementation impact:** Event management, configuration, reuse and user interface.

---

# 4. Confirmed Decisions Not to Be Reopened as Open Items

The following matters have already been established in the Master Decision Register and relevant approved design documents.

They are included here to prevent accidental duplication or reopening as unresolved decisions.

## 4.1 Password Reset

Status: CONFIRMED — NOT YET IMPLEMENTED

Password Reset is a required V2 feature.

It uses the registered and verified email with the existing OTP policy:

- Six-digit OTP.
- Five-minute validity.
- Maximum five attempts.
- Sixty-second resend cooldown.
- Minimum twelve-character new password.

Successful verification permits a new password.

All existing sessions and tokens must be revoked.

An audit event and security notification are required.

If the user cannot access the verified email, a separate Admin-assisted recovery process is required.

Password Reset must not reactivate a DISABLED or SUSPENDED account.

This is an implementation requirement, not an open business decision.

## 4.2 TAFAKUT Independent Assessors

Status: CONFIRMED

Each assessment round requires exactly two independent Admin assessors.

Initial assessment rules:

| Assessor 1 | Assessor 2 | Outcome |
|---|---|---|
| PASS | PASS | PASS |
| FAIL | FAIL | FAIL |
| PASS | FAIL | Third Admin required |
| FAIL | PASS | Third Admin required |

A disagreement requires a third Admin.

## 4.3 TAFAKUT Additional Rounds

Status: CONFIRMED

Every additional assessment round uses two new assessors who have not previously assessed that candidate.

Higher or wider-scope Admin appoints the assessors.

The original assessment records remain preserved.

The third Admin disagreement process and a subsequent additional assessment round are separate workflow requirements.

## 4.4 TAFAKUT Managing Admin Final Decision

Status: CONFIRMED

Managing Admin may make a final decision that differs from the assessment majority.

Mandatory justification is required whenever the final decision differs from the assessment majority.

The final decision is a separate decision record.

Original assessor submissions and assessment outcomes remain immutable.

The Managing Admin's decision must not be represented as if it were the assessors' unanimous or majority result.

## 4.5 Withdrawal

Status: CONFIRMED

Withdrawal is an Ahbab right.

Ahbab may request withdrawal from a Takaza.

Admin must acknowledge and record a valid request.

Admin cannot block, veto or arbitrarily refuse a valid withdrawal request.

`WITHDRAWN` status is recorded after Admin confirmation.

Request date and confirmation date must be preserved.

Admin confirmation is an administrative recording step, not discretionary permission to deny the right to withdraw.

## 4.6 Removal and Appeal

Status: CONFIRMED

Removal requires justification from at least one other Admin.

The second Admin provides justification only and has no veto.

Managing Admin makes the final decision.

Appeal is reviewed by a higher or wider-scope Admin.

Original removal records remain preserved.

`WITHDRAWN` and `REMOVED` remain distinct statuses.

## 4.7 Amer Appointment

Status: CONFIRMED

The Amer candidate must already be a confirmed participant in the same Takaza before appointment becomes effective.

Appointment may occur before the official Takaza start date.

Both Admin and candidate consent are required.

A separate Amer TAFAKUT is not required where valid prior TAFAKUT exists.

Replacement requires a reason and justification from another Admin. The second Admin has no veto. Managing Admin makes the final decision.

## 4.8 Takaza Structure and Lifecycle

Status: CONFIRMED

Only Main Takaza and Sub Takaza are permitted.

Maximum hierarchy depth is two levels.

Main and Sub Takaza have independent lifecycles.

No automatic cascade of status changes is permitted.

Takaza must not be physically deleted.

Permitted statuses:

- `DRAFT`
- `RELEASED`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

## 4.9 Amer Report and Completion

Status: CONFIRMED

Full Amer report is mandatory before Takaza can become `COMPLETED`.

If the report is missing after end activities:

- Report status becomes `OVERDUE`.
- Takaza must not become `COMPLETED`.
- Amer remains responsible for submission.
- Admin may extend the due date.
- Original due date must be preserved.
- Extensions must be recorded.

## 4.10 Percha Amendment

Status: CONFIRMED

Admin proposes an amendment.

A different Admin must approve or reject it.

The proposing Admin cannot approve their own amendment.

Rejected amendments do not change the original Percha.

All versions and amendment history must be retained.

---

# 5. Rules for Handling Open Decisions

1. Do not treat an `OPEN` decision as an approved requirement.
2. Do not silently select an implementation approach for an unresolved governance or business rule.
3. Where a provisional rule is necessary, label it `PROVISIONAL` and record its limitations.
4. Do not allow an unresolved item to invalidate requirements that have already been approved independently.
5. Do not infer permissions from a title, appointment or organizational relationship unless explicitly authorized.
6. Do not implement an `ON HOLD` workflow beyond the minimum behaviour explicitly permitted by the relevant baseline.
7. Record the decision, decision date and approving authority when an item is resolved.
8. Transfer the approved outcome into `MASTER_DECISION_REGISTER.md`.
9. Update affected module specifications and implementation tracking documents.
10. Preserve the decision history.
11. Identify any existing implementation that conflicts with a newly approved decision.
12. Do not mark a feature as implemented merely because its business decision has been approved.
13. Do not reopen a confirmed decision merely because its implementation is incomplete.
14. Distinguish a business decision from an implementation task, technical design choice and deployment status.

# 6. Decision Resolution and Approval Record

Use the following record when resolving an item.

| Field | Required Information |
|---|---|
| Decision ID | ODR reference |
| Previous Status | OPEN / PENDING REVIEW / PROVISIONAL / ON HOLD |
| Final Status | CONFIRMED / PROVISIONAL / ON HOLD / SUPERSEDED |
| Final Decision | Approved outcome |
| Decision Authority | Person or governing body authorized to decide |
| Decision Date | Date of approval |
| Effective Date | Date the decision takes effect |
| Rationale | Reason for the approved decision |
| Alternatives Considered | Other options considered, where relevant |
| Affected Documents | Documents requiring updates |
| Affected Requirements | Functional and non-functional requirements affected |
| Authorization Impact | Roles, scopes, permissions and approval rules affected |
| Database Impact | Schema, constraints, indexes and migration impact |
| API / Backend Impact | Endpoints, validation and business logic changes |
| Frontend Impact | Screens, forms, navigation and user interactions |
| Implementation Impact | Required development and testing work |
| Updated By | Person responsible for documentation updates |

A decision is not considered fully documented until the approval record and affected documents have been updated.

# 7. Change Control

When a decision is approved, amended or superseded:

1. Update this register.
2. Update `MASTER_DECISION_REGISTER.md` where necessary.
3. Update affected module specifications.
4. Update UAC and Dashboard specifications where relevant.
5. Update implementation status and roadmap.
6. Identify existing code, database structures or workflows that conflict with the new decision.
7. Record required migration, API, backend and frontend changes.
8. Preserve the previous decision history.
9. Record the approving authority and effective date.
10. Verify that the change does not unintentionally affect V1.
11. Confirm that the new decision does not contradict other confirmed requirements.
12. Update the relevant implementation and verification evidence when development is completed.

Do not silently replace historical decisions.

A documented or approved decision does not prove that the corresponding feature has been implemented.

# 8. Relationship with Other Documents

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

The implementation status document must distinguish between:

- Approved requirement.
- Provisional requirement.
- Pending decision.
- ON HOLD workflow.
- Implemented feature.
- Partially implemented feature.
- Unimplemented feature.
- Feature requiring verification.

---

**End of Document**

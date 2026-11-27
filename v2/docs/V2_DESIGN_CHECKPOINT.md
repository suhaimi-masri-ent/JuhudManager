
# JuhudManager V2 — Design Checkpoint

**Document:** V2 Design Checkpoint  
**Version:** 2.1  
**Branch:** `integration/v1-v2-separation-develop`  
**Status:** Living Checkpoint — Design Consolidation and Implementation Preparation  
**Checkpoint Date:** 28 November 2026

---

## 1. Project Direction

**AGREED**

- The existing system is designated JuhudManager V1 (legacy system).
- The new architecture and application are designated JuhudManager V2.
- V1 must be preserved as a reference and fallback. It must not be discarded or overwritten as part of the V2 redesign.
- The repository separation into `v1/` and `v2/` has been prepared on the integration branch.
- The current repository structure separates V1 source/configuration and V2 source/configuration.
- V1 and V2 must retain separate Worker configurations and database environments.
- Complete and reconcile the business workflow design before finalising dependent V2 ERD/database schema and implementation.
- Design decisions, implementation status and deployment status must be tracked separately.
- The Master Decision Register is the central authority for approved and provisional V2 decisions.
- The Open Decisions Register records unresolved matters and decisions that remain pending or on hold.

### 1.1 Current Repository Structure

The intended and prepared repository structure is:

```text
JuhudManager/
├── v1/
│   ├── public/
│   ├── src/
│   ├── worker/
│   └── wrangler.jsonc
├── v2/
│   ├── src/
│   ├── web/
│   ├── migrations/
│   ├── docs/
│   └── wrangler.jsonc
├── docs/
├── .github/
│   └── workflows/
└── README.md
```

The exact repository contents and workflow configuration must be checked against the active branch before subsequent code or deployment changes.

The separation work is not, by itself, proof that every V1 and V2 deployment path has been independently verified.

---

## 2. Decision Labels

| Label | Meaning |
|---|---|
| `AGREED` | Confirmed direction or business rule |
| `PROPOSED` | Suggested design not yet approved |
| `PENDING` | Requires further discussion or decision |
| `PROVISIONAL` | Temporary direction that remains subject to confirmation |
| `ON HOLD` | Work or decision is explicitly paused |
| `IMPLEMENTED` | Verified as present in the relevant codebase |
| `TESTED` | Verified through an identified test or execution |
| `DEPLOYED` | Verified as deployed to the specified environment |
| `NOT IMPLEMENTED` | Required feature not yet implemented |
| `SUPERSEDED` | Replaced by a newer approved decision or specification |

A design decision marked `AGREED` is not automatically implemented.

A provisional decision must not be presented as a final decision.

A test passing does not prove that every related production workflow is implemented.

A deployed service does not prove that every business feature is complete.

Implementation status must be supported by source code, test or deployment evidence.

---

## 3. Confirmed Project and Architecture Decisions

### 3.1 V1 and V2 Separation

**AGREED**

- V1 remains the legacy system.
- V2 is developed independently.
- V1 and V2 must not share deployment configuration accidentally.
- V1 and V2 must not share database migration execution.
- V2 migrations must target the V2 database only.
- V1 source and database must be preserved during transition.
- Deployment workflows must identify the intended application and environment.
- Changes to one version must not unintentionally deploy or modify the other.

### 3.2 Authentication and Account Security

**AGREED**

- Registration uses email OTP verification.
- OTP is six digits.
- OTP validity is five minutes.
- Maximum verification attempts are five.
- Resend cooldown is 60 seconds.
- Identity reservation and verification must follow the approved registration workflow.
- Password minimum length is 12 characters.
- Session idle timeout is 30 minutes.
- Maximum session lifetime is 12 hours.
- Account status, access level, core role and functional appointment are separate concepts.
- Account disablement must follow the approved audit, notification, session termination and review requirements.
- Password Reset, OTP verification or email change must not automatically reactivate a disabled or suspended account.

### 3.3 Password Reset

**REQUIRED — NOT IMPLEMENTED**

- Password Reset is a required V2 feature.
- Normal Password Reset uses the registered and verified email address.
- It uses the existing OTP policy:
  - Six-digit OTP.
  - Five-minute validity.
  - Maximum five attempts.
  - 60-second resend cooldown.
- Successful verification permits the user to set a new password.
- Successful reset must revoke all existing sessions and relevant tokens.
- Revoked sessions and tokens must not be reusable.
- A security audit event must be recorded.
- A security notification must be sent.
- Admin-Assisted Account Recovery is a separate workflow for users who no longer have access to their verified email.
- Admin-Assisted Account Recovery must not be presented as normal Password Reset.
- Password Reset must not change account status, assigned roles, organization membership or Takaza participation.

The detailed authentication requirements are maintained in `v2/docs/Auth.md`.

The consolidated functional requirements are maintained in `v2/docs/MODULE_REQUIREMENTS.md`.

No document or dashboard may describe Password Reset as implemented until verified in the codebase and tested against its acceptance criteria.

---

## 4. Confirmed Organization and Authorization Decisions

### 4.1 Core Roles

**AGREED**

The core roles are:

- `SUPER_ADMIN`
- `ADMIN`
- `AHBAB`

Core roles must remain separate from functional appointments.

### 4.2 Administrative Scope

**AGREED**

- SUPER_ADMIN has global system governance authority.
- ADMIN operates within authorized organizational scope.
- AHBAB access is based on approved account access and relevant relationships.
- An ADMIN must not automatically receive unrestricted access to every country or organization.
- Cross-organizational assistance requires consent from both relevant Chief Admins.
- Such assistance must identify the task, scope, duration and audit trail.

### 4.3 Functional Appointments

Functional appointments are distinct from core roles.

Examples include:

- Admin Markaz
- Admin Syukbah
- Admin Takaza
- Deputy
- Amer
- Supervisor
- Moderator
- TAFAKUT Assessor

An appointment must have its own scope, effective period, status and permitted responsibilities.

No appointment automatically grants unrelated permissions.

### 4.4 Organization Governance

**AGREED / PENDING**

- Markaz Negara may supervise Negara Naungan while country records remain separate.
- Markaz Negeri Chief Admin title is Faisalah.
- One Chief Admin per organizational level, with one or more Deputies.
- Markaz Negara governance remains unresolved between:
  1. Amer Negara as final authority; or
  2. Ahli Syura with Faisalah as final authority.
- The final country organizational hierarchy remains configurable and pending confirmation.
- The exact appointment and delegation processes require further specification.

These unresolved matters must remain in `v2/docs/OPEN_DECISIONS_REGISTER.md`.

---

## 5. Confirmed Jemaah and Takaza Decisions

### 5.1 Jemaah Membership and Takaza Participation

**AGREED**

- Jemaah Membership and Takaza Participation are separate relationships.
- Membership in a Jemaah does not automatically make a person a participant in every Takaza associated with that Jemaah.
- V1 Project Member data maps to Takaza Participation where applicable.
- V2 must not create a separate Project Member entity merely to reproduce the V1 model.
- Participation history must be preserved.

### 5.2 Takaza Structure

**AGREED**

- Takaza supports Main and Sub levels only.
- Maximum hierarchy depth is two.
- A Sub Takaza cannot have children.
- Main and Sub Takaza must belong to the same country.
- Main and Sub Takaza have independent lifecycles.
- A Main Takaza status change does not automatically cascade to its Sub Takaza.
- ADMIN can create and activate Takaza without SUPER_ADMIN approval.
- Incomplete Amer, participant or Supervisor setup may produce warnings without automatically blocking activation.

### 5.3 Takaza Statuses

**AGREED**

The approved status baseline is:

- `DRAFT`
- `RELEASED`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

Status transitions must follow the Takaza specification.

### 5.4 Participation Methods

**AGREED**

The participation methods are configurable and extensible:

- `AUTOMATIC_INCLUSION`
- `VOLUNTARY_APPLICATION`
- `ADMIN_NOMINATION`
- `DIRECT_ASSIGNMENT`

Methods may be combined where configured.

Key rules:

- Automatic inclusion creates a candidate with `PENDING_ADMIN_CONFIRMATION`.
- ADMIN must confirm the candidate before the person becomes a confirmed participant.
- Existing Jemaah members are not automatically confirmed participants in a newly formed Takaza.
- An Ahbab joining a Jemaah after a Takaza becomes ACTIVE may also become a candidate for ADMIN confirmation.
- Voluntary Application and Admin Nomination follow the applicable consent and TAFAKUT requirements.
- TAFAKUT PASS does not automatically mean participation approval.
- Direct Assignment consent and TAFAKUT requirements remain pending.

Configuration changes after RELEASED or ACTIVE apply only to new participation and undecided applications, not existing confirmed participants.

### 5.5 Withdrawal, Removal and Appeal

**AGREED**

- Ahbab may request withdrawal.
- Participation becomes `WITHDRAWN` only after ADMIN confirms the request.
- ADMIN acknowledges a valid withdrawal request but cannot block or veto it.
- The confirmation step records operational completion; it must not be used to deny the Ahbab's right to withdraw.
- Request and confirmation dates must be recorded.
- ADMIN may remove a participant with justification from at least one other ADMIN.
- The second ADMIN provides justification but does not have a veto.
- The managing ADMIN makes the final removal decision.
- Ahbab must be notified of the reason.
- Appeal is handled by a higher/wider-scope ADMIN.
- Appeal does not automatically change participation status.
- A successful appeal may overturn removal and restore participation without a new participation process.
- The original removal record remains in history.
- A denied appeal does not prevent future normal reapplication or TAFAKUT where required.
- `WITHDRAWN` and `REMOVED` are distinct statuses.
- Rejoining creates a new linked participation record while preserving history.
- Transfer requires relevant consent, new TAFAKUT for the receiving Takaza and ADMIN decision.
- Transfer creates a new participation record; the original record remains preserved.

### 5.6 Capacity

**AGREED**

- Capacity may be changed at any time.
- Lowering capacity below existing participation does not automatically remove existing participants.
- The system displays an over-capacity warning.
- The new capacity applies to future participation decisions.
- No automatic waiting list is created.

### 5.7 Amer Appointment

**AGREED**

- Each Main or Sub Takaza has its own Amer.
- An Amer must already be a confirmed participant in the same Takaza before the appointment becomes effective.
- If the candidate is not yet a participant, the normal participation process must be completed first.
- Appointment may occur before the official Takaza start date.
- Both ADMIN and the selected candidate must consent.
- No separate Amer TAFAKUT is required if a valid prior TAFAKUT result exists.
- Suitability may be included in the next TAFAKUT round.
- Appointment start and end dates must be recorded.
- ADMIN may shorten, extend or end an appointment early, with audit history.
- Ending an Amer appointment does not automatically change Takaza status or dates.
- Expiry ends the appointment and notifies ADMIN.
- Replacement requires justification from at least one other ADMIN.
- The second ADMIN provides justification but does not have a veto.
- The managing ADMIN makes the final decision.

### 5.8 Supervisor Appointment

**PROVISIONAL / PENDING**

- Supervisor appointment is provisional.
- ADMIN and the selected person must consent.
- Appointment duration temporarily follows Amer appointment principles.
- ADMIN may shorten, extend or end the appointment early with audit history.
- Supervisor appointment does not change Takaza status or dates.
- Existing TAFAKUT may be considered; suitability may be included in a subsequent round.
- No separate TAFAKUT is required under the current provisional baseline.

The following matters remain unresolved:

- Whether the Supervisor must be a confirmed participant in the relevant Takaza.
- Supervisor operational responsibilities and authority.
- Whether the Supervisor may approve or reject operational decisions.
- Whether the Supervisor may access participant records or reports.
- Whether the Supervisor may act on behalf of the Amer or Admin.
- Whether specific delegation is permitted.
- Whether additional TAFAKUT or eligibility requirements apply.

No additional Supervisor permissions may be inferred until approved.

See `v2/docs/OPEN_DECISIONS_REGISTER.md`, ODR-004.

### 5.9 Takaza Start Date

**AGREED**

- A proposed start date is not an official or locked date.
- Amer Jemaah may agree to the proposed date or suggest a different date while it remains a proposal.
- Once Amer agrees, ADMIN confirms and locks the official start date.
- After the date is locked, Amer cannot change it through the normal process.
- Proposed and confirmed dates must be retained with decision and audit information.

### 5.10 Takaza Amendments, Cancellation and Deletion

**AGREED**

- ADMIN may amend Takaza information subject to the applicable rules.
- The system must preserve old and new values, actor, date/time and reason where required.
- Takaza must not be deleted.
- Cancellation and amendments must preserve Takaza history and related records.
- Capacity may be changed at any time.
- Lowering capacity below existing participation does not automatically remove existing participants.
- The system should display an over-capacity warning.
- No automatic waiting list is created.

### 5.11 Cancellation and Requires Attention Case

**AGREED**

- Cancelling a Takaza automatically creates a Requires Attention case.
- The case identifies affected Ahbab and the relevant Takaza.
- Participation is not automatically cancelled.
- ADMIN handles each affected participant separately.
- Commitments, Rekod Amal, participation history and audit records are retained.
- The detailed Case Management workflow remains ON HOLD pending specification.

### 5.12 Takaza End Date and Completion

**AGREED / PENDING**

- Takaza has a planned/fixed end date.
- ADMIN may end a Takaza earlier with a recorded reason.
- ADMIN may amend the end date with history.
- Completion requires the applicable completion conditions.
- Amer's full report is mandatory before completion.
- If the report is overdue, Takaza must not automatically become COMPLETED.
- Exceptional changes after completion remain pending.

### 5.13 Takaza Events

**AGREED**

- A Takaza may have multiple events; events are not limited to three fixed events.
- Events may occur before start, at commencement, during Takaza, before the end date or on the end date.
- ADMIN determines which events are included.
- Events may reuse an existing Aktiviti Khidmat record or be created directly for the Takaza.
- Existing Aktiviti Khidmat information should be referenced and reused rather than duplicated unnecessarily.
- Event and attendance records belong to the relevant Takaza.
- Attendance and remarks are separate from Takaza lifecycle status.
- Event templates remain pending detailed specification.

---

## 6. Confirmed TAFAKUT and KAWAIF Decisions

### 6.1 KAWAIF

**AGREED**

- KAWAIF is a separate Ahbab profile qualification and experience record.
- Ahbab may submit and edit pending KAWAIF information.
- ADMIN may add or update missing/outdated information without waiting for Ahbab.
- Source or basis must be recorded.
- Old and new values, actor and timestamp must be preserved.
- Higher or wider administrative scope governs categories, criteria, scoring and eligibility.
- KAWAIF is a reference for decisions, not a replacement for TAFAKUT.

### 6.2 TAFAKUT Assessment

**AGREED**

Each standard TAFAKUT round uses exactly two independent ADMIN assessors.

Initial decision rules:

| Assessor 1 | Assessor 2 | Outcome |
|---|---|---|
| PASS | PASS | PASS |
| FAIL | FAIL | FAIL |
| PASS | FAIL | Third ADMIN required |
| FAIL | PASS | Third ADMIN required |

Additional rules:

- A disagreement requires a third ADMIN assessor.
- The third ADMIN is appointed by the authorized higher/wider-scope Admin.
- Every additional assessment round after the disagreement process uses two new assessors who have not assessed the candidate previously.
- Higher or wider administrative scope appoints assessors.
- An assessor may be replaced if unable to continue; completed work remains valid.
- Assessors see each other's submitted work only after both have submitted.
- Submitted assessment work is immutable.
- Reassessment creates a new assessment record.
- FAIL is not a permanent ban.
- There is no fixed maximum number of assessment rounds.
- `SUSPEND` and `ON_HOLD` are distinct outcomes and do not change account login or profile status.

### 6.3 Final Managing Admin Decision

**AGREED**

The managing ADMIN may make a final decision that differs from the assessment majority.

Requirements:

- The managing ADMIN must have the authority to make the relevant decision within the applicable scope.
- A justification is mandatory.
- The final decision and justification must be recorded.
- The original assessor submissions and assessment outcome must remain unchanged.
- The final ADMIN decision must not overwrite the independent assessment records.

This is a distinct decision layer. It does not mean that an assessor may edit another assessor's result or that the assessment history may be rewritten.

**Cross-document alignment note:**

This rule is recorded in:

- `v2/docs/MASTER_DECISION_REGISTER.md`
- `v2/docs/MODULE_REQUIREMENTS.md`

It must also be reflected consistently in `docs/SYSTEM_REALIGNMENT_DESIGN.md` and the detailed TAFAKUT specification.

Until that reconciliation is committed, this checkpoint records the Master Decision Register direction and identifies the cross-document alignment task explicitly.

### 6.4 TAFAKUT Forms and Data

**AGREED**

- TAFAKUT form types and templates are managed by the authorized higher/wider administrative scope.
- Takaza ADMIN selects the applicable form type and round but does not edit the template.
- Template changes create new versions.
- Previous versions remain retained and linked to assessments.
- Data may come from system/profile sources, Ahbab input and assessor input.
- Ahbab may request correction of automatically populated data.
- Source data must not be overwritten before ADMIN verification.
- Ahbab may save and edit a DRAFT before submission.
- After submission, the form is locked.
- Correction must follow the ADMIN workflow.
- Ahbab sees comments and final decision after completion.
- Ahbab does not reply to assessor comments under the current baseline.
- Notifications are sent when forms are opened and decisions are made.
- No automatic reminders or mandatory deadlines are currently defined.

---

## 7. Confirmed Participation, Withdrawal and Appeal Decisions

**AGREED**

### 7.1 Withdrawal

- Ahbab may request withdrawal.
- Participation becomes `WITHDRAWN` only after ADMIN confirms the request.
- ADMIN acknowledgment is required but cannot be used to block a valid withdrawal request.
- Request date and confirmation date are recorded.
- The confirmation step is operational record completion, not a veto over a valid request.

### 7.2 Removal

- ADMIN may remove a participant at any time within authorized scope.
- Removal requires justification from at least one other ADMIN.
- The second ADMIN provides justification but does not have a veto.
- The managing ADMIN makes the final decision.
- Ahbab must be notified of the reason.
- The removal decision and supporting justification must be retained.

### 7.3 Appeal

- Appeal is handled by a higher/wider-scope ADMIN.
- Appeal does not automatically change participation status.
- A successful appeal may overturn removal and restore participation without a new participation process.
- The original removal record remains in history.
- A denied appeal does not prevent future normal reapplication or TAFAKUT where required.

### 7.4 Distinct Statuses and Rejoining

- `WITHDRAWN` and `REMOVED` are distinct statuses.
- Rejoining creates a new linked participation record.
- The previous participation record remains preserved.
- Exact reactivation and rejoining edge cases remain subject to the Open Decisions Register.

### 7.5 Transfer

- Transfer requires relevant consent.
- New TAFAKUT is required for the receiving Takaza.
- ADMIN makes the transfer decision.
- Transfer creates a new participation record.
- The original record remains preserved.

---

## 8. Confirmed Percha, Reports and Archive Decisions

### 8.1 Percha

**AGREED**

- Percha is generated after Bayan Hidayat.
- Percha contains the approved operational details, including Jemaah, place, Halqah, route, destination and relevant dates.
- ADMIN proposes an amendment.
- A different ADMIN must approve the amendment.
- Approval and rejection are recorded.
- Rejection retains the original Percha.
- A rejected amendment may be resubmitted.
- Full history must be preserved.

### 8.2 Kharguzari and Amer Report

**AGREED**

- Kharguzari is due one day before Bayan Wapsi.
- Individual Kharguzari is authored by the relevant Ahbab or authorized ADMIN.
- Amer may access relevant Kharguzari for the full report.
- Original submitted records are immutable.
- Follow-up comments are separate records.
- Comment authors may edit their own comments subject to the applicable rules.
- Amer's full report is mandatory before Takaza completion.
- If the report is missing after the relevant end activities, it becomes `OVERDUE`.
- Takaza remains incomplete until the report is submitted and completion conditions are met.
- ADMIN may extend the report due date with history.
- An extension does not automatically clear `OVERDUE` status or complete Takaza.

### 8.3 Annual Archive and Admin Summary

**AGREED / PENDING**

- Annual Archive is organized by year and authorized scope.
- ADMIN can view records within authorized scope.
- Ahbab can view archive records for Takaza in which they participated, even if no longer active.
- Archive statistics may include Main/Sub Takaza counts, participants and status counts.
- Filters include country, year and status.
- Main Takaza filter remains pending.
- No PDF or Excel export is included in the current baseline.
- Archive generation is automatic by default.
- ADMIN may add supplementary information subject to audit and correction rules.
- Admin Notes and Annual Summary are separate from operational records.
- Annual Summary may cover the country overall, each Main Takaza and each Sub Takaza.
- Summary statuses are `DRAFT`, `INTERIM` and `FINAL`.
- Summary status is independent of Takaza status.
- Summary contains statistics and commentary; attachments are not included in the current baseline.
- Annual Archive correction policy remains pending.

### 8.4 Juhud Reports

**AGREED**

Juhud Reports is a separate publication module.

It must not be confused with:

- Operational Takaza progress reports.
- Individual Kharguzari.
- Annual Archive.
- Admin Notes and Annual Summary.

An authorized ADMIN may publish Juhud Reports without SUPER_ADMIN approval.

---

## 9. Dashboard and Navigation Decisions

**AGREED**

The dashboard design uses four experiences:

- `LIMITED`
- `AHBAB`
- `ADMIN`
- `SUPER_ADMIN`

These are not four core roles.

Dashboard and navigation must reflect:

- Account status.
- Access level.
- Core role.
- Functional appointment.
- Administrative scope.
- Resource-level permission.

Additional rules:

- Amer Workspace is available only to a user with an effective Amer appointment.
- TAFAKUT assessment functions are available only to assigned assessors.
- Syukbah discussion functions depend on the user's membership and Moderator permissions.
- Admin Syukbah, Admin Takaza and Admin Markaz are separate functional appointments.
- SUPER_ADMIN global visibility does not automatically grant operational ownership or participation rights.
- Frontend menu visibility is not a security boundary.
- Backend authorization is mandatory for every operation.
- Supervisor permissions must not be inferred beyond the approved provisional appointment rules.

The detailed dashboard and navigation requirements are maintained in:

- `v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md`
- `v2/docs/UAC_MATRIX.md`

---

## 10. Current Implementation and Deployment Position

This section is a checkpoint, not an independent certification of every feature.

### 10.1 V2 Foundation

**Previously reported project verification — 26 November 2026**

- V2 Worker: `juhudmanager-v2-api`
- V2 D1 database: `juhudmanager-v2-db`
- D1 binding: `DB`
- V2 migrations numbered 0001–0021.
- Migration 0021 relates to Super Admin owner verification.
- V2 health endpoint previously reported `status: ok` and database connected.
- V2 database previously reported 33 tables after migration 0021.
- GitHub Actions build and test previously reported successful.
- Test suite previously reported 94/94 passing.

These are previously reported results. They must not be treated as proof that every new design requirement is implemented or that the current production environment remains unchanged.

The latest verified implementation status must be maintained in:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

### 10.2 Authentication Bootstrap

**OPEN / UNRESOLVED — Based on previously reported verification**

The Super Admin bootstrap and owner verification workflow previously encountered an eligibility error.

The reported state included:

- Bootstrap owner account `DISABLED`.
- Bootstrap status `PENDING`.
- No active password.
- No active SUPER_ADMIN role assignment.
- Owner verification endpoint rejected the designated bootstrap owner as ineligible.

This issue must be rechecked against the current code and database state before treating the Super Admin bootstrap workflow as complete.

Do not assume that a previous error remains unchanged without fresh verification.

### 10.3 Required but Not Implemented

At minimum:

- Password Reset remains REQUIRED — NOT IMPLEMENTED.
- Other modules and workflows must be checked against their specifications before assigning IMPLEMENTED status.
- Supervisor detailed authority remains provisional and must not be treated as implemented permissions.
- Full Case Management remains ON HOLD.

### 10.4 Verification Rules

A feature may be labelled:

- `IMPLEMENTED` only after code inspection confirms the relevant behavior.
- `TESTED` only when a relevant test or verification has been executed.
- `DEPLOYED` only when the target environment has been verified.
- `COMPLETE` only when the approved acceptance criteria have been met.

Design approval alone is not implementation evidence.

---

## 11. Open Design Decisions

The following topics remain pending and must be tracked in `v2/docs/OPEN_DECISIONS_REGISTER.md`:

1. Markaz Negara governance model.
2. Final country organizational hierarchy.
3. Additional Country Syukbah approval.
4. Supervisor authority, scope and participant status.
5. Direct Assignment consent and TAFAKUT requirements.
6. Full Case Management workflow.
7. Annual Archive correction policy.
8. Exceptional post-completion Takaza changes.
9. Chief Admin and Deputy appointment process.
10. Reactivation and rejoining edge cases.
11. Syukbah Deputy and acting delegation.
12. Admin Syukbah eligibility.
13. Annual Archive Main Takaza filter.
14. Event templates and detailed event workflow.

No implementation should silently resolve these decisions without approval.

The current status of each item must be checked against the Open Decisions Register. This checkpoint must not replace that register.

---

## 12. Repository Separation and Migration Position

**SEPARATION PREPARED ON THE INTEGRATION BRANCH**

The repository separation work has been prepared on:

`integration/v1-v2-separation-develop`

The intended layout is:

```text
JuhudManager/
├── v1/                 # Legacy V1 system
├── v2/                 # V2 architecture and implementation
├── docs/               # Shared project documentation
├── .github/
│   └── workflows/
└── README.md
```

The separation includes distinct V1 and V2 configuration and deployment workflow definitions.

Before merging or changing production deployment:

1. Inspect the final Git diff.
2. Verify V1 Worker configuration and deployment path.
3. Verify V2 Worker configuration and deployment path.
4. Verify Pages build and deployment paths.
5. Verify migration workflows target only the V2 database.
6. Verify no V1 production configuration or database reference has been overwritten.
7. Run the applicable build and test workflows.
8. Verify the resulting deployment independently.
9. Preserve the V1 backup/tag and branch until the separation is accepted.

A prepared branch does not automatically mean the separation has been merged or deployed to production.

---

## 13. Recommended Next Steps

The following sequence reflects the current documentation and design consolidation stage.

1. Reconcile `docs/SYSTEM_REALIGNMENT_DESIGN.md` v2.1 with the TAFAKUT final Managing Admin decision recorded in the Master Decision Register.
2. Verify that `v2/docs/MODULE_REQUIREMENTS.md` and `v2/docs/MASTER_DECISION_REGISTER.md` remain aligned.
3. Review the detailed module specifications against the Master Decision Register and Open Decisions Register.
4. Update the UAC Matrix and Dashboard Navigation Specification where approved decisions require it.
5. Resolve outstanding open decisions or explicitly retain them as pending.
6. Review the V2 Design Checkpoint and Implementation Status documents together.
7. Finalize the V2 Master Design Specification.
8. Review and approve the complete business workflow specification.
9. Produce and review the V2 ERD and database schema after business workflows are sufficiently stable.
10. Verify the repository separation and deployment workflows.
11. Resolve Super Admin bootstrap and owner verification.
12. Implement Password Reset and other required features according to approved specifications.
13. Implement V2 incrementally with tests and verification at each stage.

The order may be adjusted when a dependency or newly approved decision requires it. Changes must be recorded.

---

## 14. Working Rules

- Work on the agreed development branch and inspect actual repository state before code changes.
- Do not treat a proposal as an approved requirement.
- Do not treat a provisional rule as a final decision.
- Do not describe a feature as implemented unless verified in the codebase.
- Do not make database migrations based only on incomplete or pending workflow decisions.
- Preserve V1 source, data, history and working functionality.
- Keep V1 and V2 deployment and database operations separate.
- Maintain this checkpoint as a living record of important design decisions.
- Keep the Master Decision Register, Module Requirements and Open Decisions Register aligned.
- When a decision changes, update every affected specification and record the change.
- Do not silently overwrite historical decisions; retain traceability.
- Keep implementation status separate from design status.
- Use the relevant module specification as the source for detailed workflow rules.
- Use `v2/docs/V2_IMPLEMENTATION_STATUS.md` as the authority for verified V2 implementation status.
- Record unresolved decisions in `v2/docs/OPEN_DECISIONS_REGISTER.md`.
- Use `v2/docs/MASTER_DECISION_REGISTER.md` as the central decision authority.

---

**Last Updated:** 28 November 2026  
**Document Version:** 2.1  
**Document Status:** Living Checkpoint — Design Consolidation and Implementation Preparation

**End of Document.**

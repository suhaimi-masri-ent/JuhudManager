JuhudManager V2 — Open Decisions Register

Document ID: JMV2-ODR-001
Version: 1.0
Date: 27 November 2026
Status: Working Register — Decisions Pending

---

1. Purpose

This document records unresolved decisions for JuhudManager V2.

It prevents provisional assumptions from being treated as approved requirements.

Every decision must be resolved through an explicit agreement and reflected in all affected documents before implementation.

A pending decision does not authorize developers to invent behavior.

2. Decision Status

Status| Meaning
PENDING| Decision not yet made
UNDER REVIEW| Options are being evaluated
APPROVED| Decision has been explicitly agreed
ON HOLD| Decision or workflow is deferred
SUPERSEDED| Replaced by a later decision

3. Open Decisions

ODR-001 — Markaz Negara Governance

Status: PENDING

Two alternatives remain:

- Amer Negara has final authority.
- Ahli Syura governs, with Faisalah having final authority.

The alternatives must not be combined or treated as simultaneously approved.

Required outcome: Select one governance model and define authority, appointment, accountability and decision-making boundaries.

Affected documents: JMV2002, UAC Matrix, Dashboard Specification.

ODR-002 — Country Organizational Hierarchy

Status: PENDING

The final hierarchy and configuration rules for each country have not been completed.

Potential levels include:

- Markaz Negara.
- Negeri.
- Daerah.
- Kawasan.
- Mohallah.

Required outcome: Define mandatory levels, optional levels, parent-child rules, country-specific configuration and administrative scope.

Affected documents: JMV2002, UAC Matrix, Dashboard Specification.

ODR-003 — Additional Country Syukbah Approval

Status: PENDING

Global Baseline Syukbah is managed by SUPER_ADMIN.

The approval process for additional country-specific Syukbah has not been finalized.

Required outcome: Define who may propose, approve, activate, suspend and retire an additional Syukbah.

Affected documents: JMV2003, UAC Matrix.

ODR-004 — Supervisor Authority and Eligibility

Status: PENDING

Supervisor appointment is provisionally based on consent and duration principles similar to Amer.

Unresolved matters:

- Must Supervisor already be a confirmed participant?
- What is the exact authority and scope?
- Does Supervisor receive any operational permissions?
- Can Supervisor act for Amer, and under what conditions?

Required outcome: Define eligibility, authority, delegation and limitations.

Until approved, no special Supervisor permissions may be assumed.

Affected documents: JMV2004, UAC Matrix, Dashboard Specification.

ODR-005 — Direct Assignment Safeguards

Status: PENDING

"DIRECT_ASSIGNMENT" is an approved participation method, but its safeguards are not finalized.

Unresolved matters:

- Whether Ahbab consent is mandatory.
- Whether TAFAKUT is required.
- Whether Admin may directly confirm participation.
- Whether additional notification or acknowledgment is required.

Required outcome: Define the complete participation and confirmation flow.

Do not assume Direct Assignment bypasses consent or TAFAKUT.

Affected documents: JMV2004, UAC Matrix.

ODR-006 — Full Case Management Workflow

Status: ON HOLD

Takaza cancellation must create a "Requires Attention" case.

The initial case must identify affected Takaza and Ahbab.

The full Case Management workflow is not approved for implementation yet.

Unresolved matters include:

- Case ownership.
- Assignment and reassignment.
- Case statuses.
- Resolution and closure.
- Escalation.
- Notifications.
- Appeal or review.
- Audit and reporting.

Required outcome: A separate Case Management specification.

Affected documents: JMV2004, Implementation Roadmap, UAC Matrix.

ODR-007 — Annual Archive Correction Policy

Status: PENDING

Admin may add information to Annual Archive, but correction rules have not been finalized.

Required outcome: Define:

- Which fields may be corrected.
- Who may correct them.
- Whether correction requires a second Admin.
- How original and corrected values are preserved.
- Whether correction affects statistics.
- How corrections are audited.

Original operational records must not be silently overwritten.

Affected documents: JMV2004, Implementation Status.

ODR-008 — Changes After Takaza Completion

Status: PENDING

Normal Takaza completion requires all completion conditions, including the full Amer report.

Exceptional changes after "COMPLETED" have not been defined.

Required outcome: Define whether a completed Takaza can be reopened, amended or corrected, who authorizes it and how history is preserved.

Until approved, no general post-completion editing permission may be assumed.

Affected documents: JMV2004, UAC Matrix.

ODR-009 — Chief Admin and Deputy Appointment

Status: PENDING

The general leadership structure is established, but appointment and removal procedures require further definition.

Unresolved matters:

- Who nominates candidates?
- Who approves appointment?
- Whether candidate consent is mandatory.
- Appointment duration.
- Acting appointment.
- Replacement and removal.
- Appeal or review.

Required outcome: Define procedures for each organizational level.

Affected documents: JMV2002, UAC Matrix.

ODR-010 — Reactivation and Rejoining Edge Cases

Status: PENDING

General account reactivation and Takaza rejoining principles are established.

Some edge cases still require definition.

Unresolved matters:

- Interaction between account reactivation and existing Jemaah membership.
- Rejoining after withdrawal.
- Rejoining after removal.
- Whether previous TAFAKUT results remain valid.
- Whether new participation requires a new assessment.
- Treatment of historical restrictions.

Required outcome: Define the relationship between account recovery, membership and new participation.

Affected documents: Auth, JMV2001, JMV2004, UAC Matrix.

ODR-011 — Syukbah Deputy and Acting Delegation

Status: PENDING

One or more Deputies may be appointed.

The exact authority and acting arrangements are not finalized.

Unresolved matters:

- Whether Deputy authority is automatic or task-based.
- Who assigns acting responsibility.
- Duration of acting appointment.
- Whether acting authority ends automatically.
- Which actions require Admin Syukbah approval.

Required outcome: Define delegation and acting authority without creating automatic unrestricted access.

Affected documents: JMV2003, UAC Matrix, Dashboard Specification.

ODR-012 — Admin Syukbah Eligibility

Status: PENDING

Ahbab eligibility and TAFAKUT may apply to Syukbah administrative appointments, but final criteria need confirmation.

Required outcome: Define eligibility, required qualification, assessment and appointment approval.

Affected documents: JMV2003, JMV2004.

ODR-013 — Annual Archive Main Takaza Filter

Status: PENDING

Country, year and status filters are included in the archive baseline.

Whether a separate Main Takaza filter is required remains undecided.

Required outcome: Confirm whether the filter is necessary and define its interaction with Sub Takaza records.

Affected documents: JMV2004, Dashboard Specification.

ODR-014 — Event Templates

Status: PENDING

Admin may create or reuse events for Takaza.

A standard event-template library has not been finalized.

Required outcome: Decide whether templates are global, country-specific, Syukbah-specific or Takaza-specific, and define who may maintain them.

Affected documents: JMV2004, Implementation Roadmap.

---

4. Decision Approval Requirements

Every resolved decision must record:

1. Decision ID.
2. Date.
3. Approved decision.
4. Approving authority.
5. Rationale.
6. Alternatives considered, where relevant.
7. Affected requirements.
8. Affected authorization rules.
9. Database and migration impact.
10. API and backend impact.
11. Frontend and dashboard impact.
12. Required document updates.

A decision is not considered implemented merely because it has been approved.

5. Change Control

When a decision changes:

- Update this register.
- Update the Master Decision Register where necessary.
- Update affected module specifications.
- Update UAC and Dashboard specifications where relevant.
- Update implementation status and roadmap.
- Preserve the previous decision history.
- Identify any existing implementation that conflicts with the new decision.

Do not silently replace historical decisions.

6. Relationship with Other Documents

This register must be read with:

- "MASTER_DECISION_REGISTER.md"
- "Auth.md"
- "JMV2001-Ahbab-Profile-Account-Management.md"
- "JMV2002-Organization-Structure-Governance.md"
- "JMV2003-Syukbah-Management.md"
- "JMV2004-Takaza-Management.md"
- "UAC_MATRIX.md"
- "DASHBOARD_NAVIGATION_SPEC_V2.md"
- "V2_IMPLEMENTATION_STATUS.md"
- "V2_DESIGN_CHECKPOINT.md"

---

End of Document

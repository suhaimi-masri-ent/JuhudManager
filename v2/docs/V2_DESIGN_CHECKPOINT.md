# JuhudManager V2 – Design Checkpoint

**Document:** V2 Design Checkpoint
**Branch:** `develop`
**Status:** Living checkpoint – design in progress
**Checkpoint date:** 19 November 2026

---

## 1. Project Direction

**AGREED**

- The existing system is designated **JuhudManager V1 (legacy system)**.
- The system currently being designed is **JuhudManager V2 (new architecture)**.
- V1 is to be preserved as a reference and fallback; it must not be discarded or overwritten as part of the V2 redesign.
- The repository is expected to separate V1 and V2, with the proposed structure:
  - `v1/` – existing V1 source and configuration.
  - `v2/` – new V2 implementation.
  - `docs/` – shared project and design documentation.
  - Root `README.md` – project overview and navigation.
- **No repository move has been performed by this checkpoint.** The migration plan remains to be prepared and executed safely.
- Complete the business workflow design before finalising the V2 ERD/database schema and starting dependent implementation.

## 2. Decision Labels

| Label | Meaning |
|---|---|
| **AGREED** | Confirmed direction or rule. |
| **PROPOSED** | Suggested design that has not yet been approved. |
| **PENDING** | Requires further discussion or a decision. |
| **IMPLEMENTED** | Verified as present in the relevant codebase. |

A design decision marked AGREED is not automatically an implemented feature.

## 3. Confirmed Design Decisions

### 3.1 Takaza and Participation

**AGREED**

- Takaza is managed through an Admin-controlled workflow.
- Main Takaza and Sub Takaza participation/application workflows are supported.
- Ahbab may apply to join a Sub Takaza; Admin may also initiate or create the relevant application/record.
- Application decision and active participation are separate concepts.
- An Ahbab may withdraw an application before a final decision. The application is retained with status `WITHDRAWN`; its history and communication are preserved.
- Reapplication after rejection is not blocked by a fixed waiting period or application-count limit at this stage.
- The exact post-completion handling of Ahbab participation and commitments remains to be designed.

### 3.2 Takaza Start Date

**AGREED**

- A proposed start date is not an official/locked start date.
- The Amer Jemaah (also referred to as Leader) may agree to the proposed date or suggest a different date while it remains a proposal.
- Once the Amer Jemaah has agreed, Admin locks/confirms the official start date.
- After Admin locks the date, the Amer Jemaah cannot propose or change it through the normal process.
- The system must retain the proposed date and the confirmed/locked date, together with the relevant decision and audit information.
- Takaza activation/participation timing is governed by the official start date, not merely by an editable proposal.

### 3.3 Takaza Amendments, Cancellation and Deletion

**AGREED**

- After the start date is locked, Admin may amend other Takaza information, such as name, description, category, capacity and other operational details.
- The locked official start date cannot be changed through the normal amendment process.
- Amendments must preserve the old and new values, actor, date/time and reason.
- Capacity changes do not require an automatic warning when existing participation exceeds the revised capacity. The change is recorded.
- Takaza must not be deleted.
- Admin may cancel or amend a Takaza; cancellation and amendments must retain the Takaza's history and related records.

### 3.4 Cancellation and Attention Case

**AGREED**

- When a Takaza is cancelled, the system automatically creates a **Requires Attention** case.
- The case identifies the affected Ahbab and the relevant Takaza.
- The system does not automatically cancel each Ahbab's participation.
- Admin handles each affected Ahbab/participation separately through the case process.
- Commitments, Rekod Amal, participation history and audit records are retained.
- The case requires Admin attention and is not closed merely because the Takaza is cancelled.
- Detailed Case Management workflow and case statuses remain to be designed.

### 3.5 Takaza End Date and Completion

**AGREED**

- A Takaza has a planned/fixed end date.
- A Takaza may be ended earlier by Admin decision; the reason and actual end information must be recorded.
- The system may automatically mark a Takaza `COMPLETED` when its end date is reached.
- Admin may amend the end date when circumstances require it, with the change recorded.
- The exact exceptional procedure for amending a Takaza that has already become `COMPLETED` needs to be specified.

### 3.6 Takaza Events

**AGREED**

- A Takaza may have many events; event types are not limited to three fixed events.
- Events may take place before the Takaza starts, at commencement, during the Takaza, before its end date, and on the end date.
- Admin determines which events are included for each Takaza.
- Events can come from either of two sources:
  1. An existing Aktiviti Khidmat record selected by Admin.
  2. A new event created directly by Admin for the Takaza.
- When an existing Aktiviti Khidmat is selected, the Takaza event should retain a reference to the source record and reuse its relevant information rather than requiring duplicate entry.
- The event/attendance record belongs to the relevant Takaza, even when the event originated from Aktiviti Khidmat.
- Each event records Ahbab attendance and an appropriate remark (for example, attended or did not attend).
- Event attendance does **not** determine whether the Takaza is `ACTIVE` or `COMPLETED`; it is a separate participation record.
- Event templates/pre-set events may be managed by Admin. The detailed template workflow remains to be designed.

### 3.7 Existing Shared Terminology and Design Concepts

**AGREED in the wider design**

- **Rekod Amal** is the official term for Activity Record.
- **Tafakut** is the official term for Criteria Selection.
- Tafakut has two conceptual layers: Common Tafakut and Takaza-specific Tafakut.
- Ahbab updates Rekod Amal. The system selects relevant records through Tafakut for assessment and report generation.
- System-generated progress and human assessment/decisions must remain distinct.
- Historical records and decision/audit trails must be preserved.

## 4. Current Design Position

This checkpoint captures the decisions reached in the design discussion up to 19 November 2026. It is not a complete specification and does not certify implementation status.

| Area | Position |
|---|---|
| V1 / V2 project direction | **AGREED** |
| Takaza application and participation principles | **Partially agreed; details remain** |
| Start date proposal and Admin lock | **AGREED** |
| Amendments and no-delete principle | **AGREED** |
| Cancellation and Requires Attention case | **AGREED; case workflow pending** |
| End date and automatic completion | **AGREED; exceptional post-completion handling pending** |
| Takaza event sources and attendance | **AGREED; detailed event workflow pending** |
| Rekod Amal and Tafakut terminology/concepts | **AGREED in wider design** |
| Full business workflow | **IN PROGRESS** |
| V2 ERD and database schema | **NOT FINALISED** |
| V1 repository relocation | **NOT STARTED** |
| V2 implementation | **NOT STARTED as a separate V2 codebase** |

## 5. Remaining Design Work

The following areas still require workflow discussion and/or consolidation:

1. Ahbab participation, commitments and responsibilities after a Takaza is completed.
2. Detailed Case Management, including assignment, actions, resolution and closure.
3. Full Takaza lifecycle and all transition rules, including exceptional cases.
4. Jemaah/group structure, Amer Jemaah responsibilities and related permissions.
5. Event lifecycle, templates, scheduling, changes, cancellation and attendance remarks.
6. Detailed interaction between Aktiviti Khidmat, Takaza Events and Rekod Amal.
7. Kawaif assessment and decision workflow.
8. Tafakut criteria configuration, evaluation and version/history rules.
9. Role and permission matrix.
10. Notifications, reminders and communication.
11. Reporting and audit requirements.
12. Reconciliation of all current design decisions with existing project documentation.

These are design topics, not approved implementation requirements until explicitly agreed.

## 6. Repository Separation and Migration Plan

**AGREED direction; execution pending**

The intended repository layout is:

```text
JuhudManager/
├── v1/                 # Existing legacy system
├── v2/                 # New architecture and implementation
├── docs/               # Shared project/design documentation
└── README.md           # Project overview and navigation
```

Before moving files:

1. Inspect and record the current repository tree, active branch and deployment configuration.
2. Preserve a known-good V1 snapshot using an appropriate Git tag or branch.
3. Identify all V1 build, Worker, Pages, Wrangler and deployment path dependencies.
4. Plan the relocation so V1 continues to build and deploy correctly.
5. Move V1 into `v1/` only after the preservation and dependency checks.
6. Verify V1 after relocation; do not assume that a successful file move means deployment still works.
7. Establish V2 with separate configuration and an isolated database/environment. Do not point V2 migrations at the live V1 database.
8. Keep the existing V1 data and working functionality intact during the transition.

No source relocation, production deployment change or database migration is authorised by this checkpoint.

## 7. Recommended Next Steps

1. Continue and complete the remaining business workflow discussions.
2. Update this checkpoint as decisions are agreed; keep proposed and pending items clearly labelled.
3. Consolidate the agreed workflows into a V2 Master Design Specification.
4. Review and approve the complete specification.
5. Produce and review the V2 ERD and database schema.
6. Prepare and execute the V1 preservation/relocation plan.
7. Establish the isolated V2 foundation.
8. Implement V2 incrementally, with tests and verification at each stage.

## 8. Working Rules

- Work on the agreed development branch and inspect the actual repository state before making code changes.
- Do not treat a proposal as an approved requirement.
- Do not describe a feature as implemented unless verified in the codebase.
- Do not make database migrations based only on incomplete or pending workflow decisions.
- Preserve V1 source, data, history and working functionality.
- Keep production changes separate from design documentation and V2 development.
- Maintain this checkpoint as a living record of important design decisions.
- Keep `README.md` unchanged during checkpoint-only documentation updates unless explicitly requested.

---

**Last updated:** 19 November 2026
**Document status:** Living checkpoint – design in progress

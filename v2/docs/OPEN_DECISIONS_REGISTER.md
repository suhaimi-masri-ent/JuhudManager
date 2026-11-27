Ini ialah versi dokumen JuhudManager V2 — Open Decisions Register yang telah dikemas kini. Saya telah menambah blok metadata yang kemas di bahagian atas, jadual ringkasan untuk memudahkan rujukan pantas, format badge/status yang jelas bagi setiap ODR, serta callout untuk garis panduan kritikal.
(Nota: Teks asal anda terpotong di penghujung ayat ODR-009 ("...appointment workflow a"), jadi saya telah melengkapkannya kepada appointment workflow, and audit.)
markdown
# JuhudManager V2 — Open Decisions Register

| Metadata | Details |
| :--- | :--- |
| **Document ID** | `JMV2-ODR-001` |
| **Version** | `2.0` |
| **Date** | 28 November 2026 |
| **Status** | `Open Decisions — Pending Resolution` |

---

## 1. Purpose

This document records **JuhudManager V2** decisions that remain unresolved. It prevents provisional proposals from being treated as approved requirements or implemented as confirmed system behaviour.

> **Governance Rule:** Every unresolved decision must be resolved through explicit agreement and reflected in all affected documents before implementation. A pending decision does **not** authorize developers to invent behaviour or make business-policy assumptions.

### Related Documents
This register must be read together with:
* `MASTER_DECISION_REGISTER.md`
* `MODULE_REQUIREMENTS.md`
* `V2_IMPLEMENTATION_STATUS.md`
* `REPOSITORY_DISPOSITION.md`
* `UAC_MATRIX.md`
* `DASHBOARD_NAVIGATION_SPEC_V2.md`
* *Relevant module specifications*

---

## 2. Decision Status Definitions

| Status | Meaning |
| :--- | :--- |
| `OPEN` | No final decision has been approved. |
| `PENDING REVIEW` | A proposal exists but requires review. |
| `PROVISIONAL` | A temporary working rule exists and may change. |
| `ON HOLD` | Decision or workflow is deliberately deferred. |
| `DECIDED` | A final decision has been approved and transferred to the Master Decision Register. |
| `SUPERSEDED` | Replaced by a later approved decision. |

* **Approval Requirement:** Only decisions marked `DECIDED` and properly recorded in `MASTER_DECISION_REGISTER.md` may be treated as final requirements.
* **Deferral Clarification:** `ON HOLD` does not mean that the decision has been rejected; it means that implementation or further work is deliberately deferred.

---

## 3. Summary Index

| ID | Title | Status | Primary Impact Area |
| :--- | :--- | :--- | :--- |
| **ODR-001** | Markaz Negara Governance | `OPEN` | Organization Governance & Approvals |
| **ODR-002** | Country Organization Hierarchy | `OPEN` | Organization Schema & Scope |
| **ODR-003** | Additional Country Syukbah Approval | `OPEN` | Syukbah Lifecycle & Country Governance |
| **ODR-004** | Supervisor Authority and Eligibility | `OPEN` | Role Permissions & Delegation |
| **ODR-005** | `DIRECT_ASSIGNMENT` Participation Conditions | `OPEN` | Takaza Participation & Eligibility |
| **ODR-006** | Full Case Management Workflow | `ON HOLD` | Case Management Module & Workflow |
| **ODR-007** | Annual Archive Correction Policy | `OPEN` | Archive Management & Audit Trail |
| **ODR-008** | Post-Completion Takaza Changes | `OPEN` | Takaza Lifecycle & Historical Reporting |
| **ODR-009** | Chief Admin and Deputy Appointment Process | `OPEN` | Role Assignment & Succession |

---

## 4. Open Decision Register

### ODR-001 — Markaz Negara Governance
* **Status:** `OPEN`

**Context:**  
Two governance alternatives remain under consideration:
* **Option A:** Amer Negara holds final authority.
* **Option B:** Ahli Syura provides collective governance, with Faisalah holding final authority.

*(The system must not assume that both arrangements apply simultaneously.)*

**Decisions Required:**
* Select the governance model.
* Define appointment and removal authority.
* Define decision-making and escalation procedures.
* Define the relationship between Amer Negara, Ahli Syura, and Faisalah.
* Define accountability and dispute-resolution procedures.

**Implementation Impact:** Organization governance, role permissions, approval workflows, organizational structure, and audit records.

---

### ODR-002 — Country Organization Hierarchy
* **Status:** `OPEN`

**Context:**  
The final organization hierarchy within a country has not been fully confirmed. Potential levels include: `Markaz Negara` → `Negeri` → `Daerah` → `Kawasan` → `Mohallah`. The system must support configurable organizational scope without assuming that every country uses identical administrative levels.

**Decisions Required:**
* Confirm the standard hierarchy.
* Define which levels are mandatory or optional.
* Define parent-child relationships.
* Define whether a country may introduce additional levels.
* Define administrative scope and reporting relationships.

**Implementation Impact:** Organization schema, administration scope, reporting, authorization, and dashboard navigation.

---

### ODR-003 — Additional Country Syukbah Approval
* **Status:** `OPEN`

**Context:**  
The Global Baseline Syukbah is managed by `SUPER_ADMIN` and provides a common baseline for countries. Not every country must activate every baseline Syukbah, and the approval authority for additional country-specific Syukbah has not been finalized.

**Decisions Required:**
* Identify the approving authority.
* Define who may propose an additional Syukbah.
* Define whether approval is required before activation.
* Define who may suspend or retire an additional Syukbah.
* Define how country-specific Syukbah relates to the Global Baseline.

**Implementation Impact:** Syukbah creation, approval, activation, suspension, retirement, and country-level governance.

---

### ODR-004 — Supervisor Authority and Eligibility
* **Status:** `OPEN`

**Context:**  
The Supervisor appointment process has provisional rules, but the full scope of authority remains unresolved.

> **Constraint:** Until resolved, no special approval or administrative authority must be inferred from the Supervisor title.

**Decisions Required:**
* Whether a Supervisor must already be a confirmed participant in the relevant Takaza.
* The Supervisor's operational responsibilities.
* Whether the Supervisor may approve or reject operational decisions.
* Whether the Supervisor may access participant records or reports.
* Whether the Supervisor may act on behalf of the Amer or Admin.
* Whether any specific delegation is permitted.
* Whether additional `TAFAKUT` or eligibility requirements apply.

**Implementation Impact:** Role permissions, appointment workflow, access control, delegation, dashboard navigation, and audit.

---

### ODR-005 — `DIRECT_ASSIGNMENT` Participation Conditions
* **Status:** `OPEN`

**Context:**  
`DIRECT_ASSIGNMENT` is an approved participation method, but its detailed conditions remain unresolved.

> **Constraint:** No implementation may assume that `DIRECT_ASSIGNMENT` bypasses consent or `TAFAKUT` requirements.

**Decisions Required:**
* Whether Ahbab consent is mandatory.
* Whether `TAFAKUT` is mandatory.
* Whether specific eligibility conditions apply.
* Whether an Admin may assign directly without a separate application.
* Whether notification or acknowledgment is required.
* How refusal or non-response is handled.
* Whether any exceptional assignment procedure is permitted.

**Implementation Impact:** Takaza participation workflow, eligibility validation, notifications, and authorization.

---

### ODR-006 — Full Case Management Workflow
* **Status:** `ON HOLD`

**Context:**  
Cancellation of a Takaza must create a *Requires Attention* case identifying affected Ahbab and the relevant Takaza. However, the complete Case Management module has not been approved.

> **Constraint:** Until approved, only the minimum cancellation-related *Requires Attention* process is required.

**Decisions Required:**
* Case categories and classification.
* Case ownership and assignment.
* Investigation and review workflow.
* Case statuses and transitions.
* Escalation and closure authority.
* Appeal and follow-up handling.
* Notifications and audit requirements.
* Reporting and retention requirements.

**Implementation Impact:** Case Management module, workflow engine, authorization, notifications, and audit.

---

### ODR-007 — Annual Archive Correction Policy
* **Status:** `OPEN`

**Context:**  
Annual Archive information may be supplemented or corrected by authorized Admin users, but the correction policy has not been finalized.

> **Constraint:** Corrections must not silently rewrite original operational history.

**Decisions Required:**
* Which information may be corrected.
* Which Admin scope may perform corrections.
* Whether supporting reasons or evidence are mandatory.
* Whether correction requires second-person approval.
* Whether corrections affect statistics and historical summaries.
* How original values and correction history are retained.

**Implementation Impact:** Archive management, audit trail, reporting integrity, and data access control.

---

### ODR-008 — Post-Completion Takaza Changes
* **Status:** `OPEN`

**Context:**  
The general Takaza lifecycle and completion requirements have been defined, but exceptional changes after completion remain unresolved.

> **Constraint:** No automatic reopening or retrospective alteration should be implemented without an approved rule.

**Decisions Required:**
* Whether a completed Takaza may be reopened.
* Which information may be corrected after completion.
* Whether reopening requires higher-scope Admin approval.
* How reports, attendance, Percha, and historical records are affected.
* Whether the original completion record must remain immutable.
* Whether a reopening event requires a separate audit record and reason.

**Implementation Impact:** Takaza lifecycle, authorization, audit, and historical reporting.

---

### ODR-009 — Chief Admin and Deputy Appointment Process
* **Status:** `OPEN`

**Context:**  
The organizational structure supports one Chief Admin and one or more Deputies at each applicable organizational level. The complete appointment and succession process remains unresolved.

**Decisions Required:**
* Appointment authority.
* Candidate eligibility.
* Consent requirements.
* Appointment duration.
* Replacement and removal process.
* Temporary acting authority.
* Handling of vacancies and unavailable office holders.
* Accountability and review procedures.

**Implementation Impact:** Organization governance, role assignment, appointment workflow, and audit.
Use code with caution.

Penambahbaikan Utama:

• Metadata Block Table: Menjadikan maklumat dokumen (Document ID, Version, Date, Status) di bahagian atas kelihatan seperti dokumen spesifikasi teknikal rasmi.
• Summary Index Table: Menambah jadual ringkasan di bahagian atas supaya pembaca terus nampak semua 9 ODR dan status masing-masing tanpa perlu skrol panjang.
• Blockquote Constraints: Setiap peraturan penting (seperti "No implementation may assume..." atau "Corrections must not silently rewrite...") diasingkan dalam kotak amaran supaya pembangun sistem mudah perasan had dan kekangan teknikal.
Adakah terdapat sambungan teks selepas ODR-009 (seperti ODR-010 atau bahagian penutup) yang terpotong dan ingin anda masukkan sekali?


# JuhudManager – System Realignment Design

**Document:** System Realignment Design  
**Branch:** `develop`  
**Status:** Agreed Design Direction – Detailed Schema Pending  
**Last Updated:** 19 November 2026

---

## 1. Purpose

This document records the agreed direction for realigning JuhudManager around its operational purpose.

JuhudManager is designed to manage:

1. Takaza and its operational structure.
2. Ahbab participation.
3. Rekod Amal (activity records).
4. Tafakut (criteria selection).
5. System-generated reports.
6. Assessment and human review.

This document is a design reference. It does not authorise database migrations or changes to the live system.

All implementation changes must preserve existing data and working functionality wherever practical.

## 2. Core System Concepts

The system is organised around the following main areas:

1. Takaza Management
2. Ahbab Management
3. Rekod Amal Management
4. Tafakut Management
5. Generated Reports
6. Assessment and Human Review

### 2.1 Takaza Management

Takaza Management is the main project and effort management area.

Examples include:

- Takaza Makami
- Takaza Biruni
- Takaza Khidmat
- Usaha Masturat
- Pelajar Diini
- Pelajar Asri
- Ulama
- OKU
- OBB
- Other Takaza as required

The structure must be configurable rather than permanently hardcoded.

**Project Code / Percha No.**

- Only Takaza Biruni currently requires Project Code / Percha No.
- Other Takaza do not currently require this number.
- The system should support the field according to the relevant Takaza configuration.
- Internal Takaza code and Project Code / Percha No. must remain separate identifiers.

### 2.2 Ahbab Management

Ahbab refers to participants represented by registered User or Employee accounts.

The relationship must support:

- One Ahbab participating in multiple Takaza.
- One Takaza having multiple Ahbab.
- Individual participation records for each Ahbab and Takaza.
- Participation history.

Ahbab account status and Takaza participation/activity status must be managed separately.

### 2.3 Takaza Makami

Takaza Makami is an official Takaza within Takaza Management.

It is not merely a hidden system function or background process.

Every Ahbab is automatically registered as a participant of Takaza Makami.

**Automatic participation rules:**

1. When an account becomes an active Ahbab account, the system automatically creates or activates the Makami participation record.
2. Admin does not need to register each Ahbab manually.
3. Makami participation remains active while the Ahbab account is active.
4. When the Ahbab account is deactivated, Makami participation is marked inactive.
5. If the account is reactivated, the existing Makami participation is reactivated rather than creating a duplicate record.
6. Previous participation and Rekod Amal history must be preserved.

Automatic participation does not mean that the Ahbab is automatically making progress.

### 2.4 Activity Status and Reporting Status

The system must distinguish between the status of an activity and the reporting/progress status.

**Activity status:**

| Status | Meaning |
|---|---|
| ACTIVE | Activity is currently active |
| IDLE | Activity has not been updated or carried out for a period |
| INACTIVE | Activity is no longer active |

**Reporting/progress status:**

| Status | Meaning |
|---|---|
| NOT_SUBMITTED | No report or update has been submitted |
| IN_PROGRESS | Progress has been reported |
| LIMITED_PROGRESS | Limited progress has been reported |
| NO_PROGRESS | Ahbab explicitly reports no progress |

These are separate dimensions. An activity being IDLE does not automatically mean that the Ahbab has reported NO_PROGRESS.

**Who manages activity status:**

- The system monitors updates and may automatically detect activities that have become idle.
- Admin can manually change activity status when necessary.
- Ahbab does not need to manage ACTIVE, IDLE or INACTIVE status.
- Ahbab is responsible for updating Rekod Amal and progress information.

The inactivity period and exact automatic detection rules remain subject to detailed workflow design.

## 3. Rekod Amal Management

The official term for Activity Records is **Rekod Amal**.

Rekod Amal represents the actual activities, efforts and progress recorded by Ahbab.

Rekod Amal is the source data used by Tafakut and the report-generation process.

Possible reporting frequencies include:

- Daily
- Weekly
- Monthly
- Yearly
- Ad Hoc

The system must preserve the historical record of submitted Rekod Amal.

A Rekod Amal record should retain relevant information such as:

- Ahbab / User ID
- Activity classification
- Activity date or reporting period
- Description
- Progress status
- Submission status
- Reviewer information, where applicable
- Attachment reference, where applicable
- Created and updated information
- Audit history

Rekod Amal must not automatically be treated as proof of eligibility. It is evidence that may be selected and considered through Tafakut.

One Rekod Amal record may be used by more than one Tafakut when it satisfies the respective criteria.

## 4. Tafakut Management

**Tafakut** is the official name for Criteria Selection.

Tafakut determines which Rekod Amal records and other relevant information are selected for generating reports and supporting assessment for a particular Takaza.

Admin is responsible for defining and managing Tafakut.

### 4.1 Common and Specific Criteria

Tafakut supports two conceptual layers:

- Common criteria: criteria that may be relevant across different Takaza.
- Takaza-specific criteria: criteria designed for the needs of a particular Takaza.

However, each Takaza manages its own Tafakut independently.

A common criterion does not require every Takaza to use the same shared Tafakut configuration.

Admin may define similar or different criteria for each Takaza according to operational requirements.

### 4.2 Multiple Tafakut Types

A Takaza may have multiple types of Tafakut.

Examples:

| Takaza | Possible Tafakut types |
|---|---|
| Takaza Makami | Daily, Weekly, Monthly, Yearly |
| Takaza Biruni | Project Progress, Percha-related |
| Takaza Khidmat | Khidmat Activities, Participation |
| Other Takaza | According to operational requirements |

These are examples only. Admin determines the actual Tafakut types and criteria.

One Ahbab may be evaluated through multiple Tafakut types within the same Takaza.

### 4.3 Dynamic Tafakut

Tafakut is dynamic and must not be locked after a Takaza starts operating.

Admin may:

- Generate Tafakut at any time.
- Add criteria.
- Modify criteria.
- Remove criteria.
- Generate a new Tafakut.
- Re-generate reports using historical or current criteria.

Changes to Tafakut must not silently destroy or overwrite historical information.

The system must preserve Tafakut history/version information, including the criteria used at the time of a previous report generation.

### 4.4 Tafakut and Rekod Amal Relationship

Tafakut selects relevant Rekod Amal according to its criteria.

The same Rekod Amal may contribute to multiple Tafakut if it meets the criteria of each Tafakut.

The system must retain traceability between:

- The original Rekod Amal.
- The Tafakut criteria applied.
- The generated report.
- The relevant Ahbab and Takaza.

## 5. System-Generated Reports

Reports are generated by the system based on historical Rekod Amal and Tafakut criteria.

Reports are not simply manually submitted documents.

The general workflow is:

1. Ahbab updates Rekod Amal.
2. Admin defines Tafakut for the relevant Takaza.
3. The system selects relevant Rekod Amal according to Tafakut.
4. The system generates an individual report for the selected Ahbab.
5. Admin can review the generated report.
6. Ahbab can view their own report.

### 5.1 Individual Report Generation

Report generation is performed for one Ahbab at a time.

Admin selects the relevant:

- Takaza
- Tafakut type
- Ahbab
- Reporting period
- Historical or current criteria context

The system generates the corresponding individual report.

Bulk/group report generation is not part of the currently agreed requirement.

### 5.2 Historical Reports

Reports are generated from historical data.

The system must support:

- Generating reports using historical Rekod Amal.
- Generating reports using historical Tafakut criteria.
- Generating new reports using the latest Tafakut criteria.
- Retaining previous report-generation history.
- Re-generating reports without deleting the original source records.

Changing Tafakut must not make previous reporting periods inaccessible.

### 5.3 Ahbab Report Access

Ahbab may view the results of their own Tafakut reports.

Access rules:

| Role | Permission |
|---|---|
| Ahbab | Read-only access to own reports |
| Admin | Generate, view and manage individual reports |
| Other Ahbab | No access to another Ahbab's individual reports |

Ahbab cannot:

- Edit generated reports.
- Modify Tafakut criteria.
- Comment on or submit feedback through the report.
- View another Ahbab's individual report.

## 6. Assessment and Human Review

Tafakut and generated reports provide structured evidence for assessment.

Assessment may consider:

- Common criteria.
- Takaza-specific criteria.
- Rekod Amal history.
- Activity frequency and consistency.
- Actual progress and participation.
- Missing or unverified information.
- Other requirements defined for the relevant Takaza.

The system may assist with assessment recommendations, but it must not replace authorised human judgement.

System recommendations and final human decisions must remain separate.

Final decisions, justification and relevant history must be retained.

## 7. Current System – Existing Implementation

The following components exist in the current implementation and must be considered during realignment.

| Existing component | Current purpose |
|---|---|
| `user_accounts` | Stores User and Employee accounts |
| `user_roles` | Defines account roles |
| `takaza_categories` | Stores Takaza categories |
| `takazas` | Stores individual Takaza registrations |
| `takaza_code_sequences` | Generates internal Takaza codes |
| `activity_types` | Stores activity definitions and frequency |
| `activity_records` | Stores activity submissions |
| `activity_assignments` | Assigns activity types to users |
| `audit_logs` | Records important system actions |

### 7.1 Current Relationships

```text
user_accounts
    |
    +---- activity_records
    |          |
    |          +---- activity_types
    |
    +---- activity_assignments
               |
               +---- activity_types


takaza_categories
    |
    +---- takazas
               |
               +---- parent Takaza (optional)
```

### 7.2 Current Limitations

The current implementation has separate structures for:

- `activity_types` – activity definitions.
- `takaza_categories` – Takaza registration categories.
- `activity_records` – user activity submissions.
- `activity_assignments` – activity type assignments.

The current `activity_assignments` relationship points to `activity_types`, not registered Takaza.

The current data model therefore does not yet fully represent the intended relationships between Takaza, Ahbab, Rekod Amal and Tafakut.

## 8. Proposed System Structure

```text
JUHUDMANAGER
|
+-- TAKAZA MANAGEMENT
|   |
|   +-- Takaza Makami
|   +-- Takaza Biruni
|   +-- Takaza Khidmat
|   +-- Usaha Masturat
|   +-- Pelajar Diini
|   +-- Pelajar Asri
|   +-- Ulama
|   +-- OKU
|   +-- OBB
|   +-- Other Takaza
|
+-- AHBAB MANAGEMENT
|   |
|   +-- Ahbab Profile
|   +-- Takaza Participation
|   +-- Automatic Makami Participation
|
+-- REKOD AMAL MANAGEMENT
|   |
|   +-- Activity Classification
|   +-- Rekod Amal Submission
|   +-- Activity Status Monitoring
|   +-- Rekod Amal History
|
+-- TAFAKUT MANAGEMENT
|   |
|   +-- Takaza-specific Tafakut
|   +-- Multiple Tafakut Types
|   +-- Criteria Management
|   +-- Tafakut History
|
+-- GENERATED REPORTS
|   |
|   +-- Individual Report Generation
|   +-- Historical Report Generation
|   +-- Ahbab Read-only Access
|
+-- ASSESSMENT MANAGEMENT
    |
    +-- Assessment Evidence
    +-- System Recommendation
    +-- Human Review
    +-- Final Decision
```

This is a logical module structure. The final navigation layout may be adjusted during implementation.

## 9. Proposed Data Model Direction

This section describes conceptual data relationships only. It is not a final database schema.

### 9.1 Takaza

Individual Takaza registrations should retain their own identity, name, category, description, dates and lifecycle status.

Internal Takaza code and Project Code / Percha No. must remain separate.

### 9.2 Takaza–Ahbab Participation

A relationship record is required to connect Ahbab with Takaza.

Conceptual fields:

- Participation ID
- Takaza ID
- Ahbab User ID
- Assigned By
- Assigned Date
- Participation Status
- Start Date
- End Date, where applicable
- Remarks

Makami participation must be automatically created or reactivated according to Ahbab account status.

### 9.3 Rekod Amal

Rekod Amal must preserve the original submitted information and its history.

The final schema must support traceability between Rekod Amal and the relevant Ahbab.

It must also support the selection of a Rekod Amal record by multiple Tafakut where applicable.

### 9.4 Tafakut

A Takaza may have multiple Tafakut definitions.

Conceptual entities may include:

- Tafakut
- Tafakut Type
- Tafakut Criteria
- Tafakut Criteria History / Version
- Tafakut-to-Takaza relationship

Each Tafakut must be associated with the relevant Takaza.

Criteria history must be retained so historical reports can be reproduced using the criteria that were applied at the time.

### 9.5 Generated Reports

The report data model should preserve:

- Report ID
- Takaza ID
- Ahbab User ID
- Tafakut ID
- Criteria version or historical reference
- Reporting period
- Generation timestamp
- Selected Rekod Amal references
- Report result or output reference
- Generated by
- Report history

The implementation should retain sufficient source references to reproduce or inspect historical reports.

### 9.6 Assessment

Assessment should use generated reports and other relevant evidence.

It should support:

- Assessment recommendation.
- Human review.
- Final decision and justification.
- Conditions and follow-up, where applicable.
- Assessment history.

## 10. Important Data and Workflow Rules

1. Every active Ahbab is automatically registered as a participant of Takaza Makami.
2. Makami participation remains active while the Ahbab account is active.
3. Deactivating an Ahbab account makes its Makami participation inactive.
4. Reactivating an Ahbab account reactivates the existing Makami participation without creating a duplicate.
5. Account status, participation status, activity status and reporting status are separate concepts.
6. No update must not be interpreted automatically as no progress.
7. The system may detect idle activities based on update history.
8. Admin may manually change activity status.
9. Ahbab updates Rekod Amal but does not manage activity status.
10. Rekod Amal is the source record for Tafakut and generated reports.
11. A Takaza may have multiple Tafakut types.
12. Each Takaza manages its own Tafakut configuration independently.
13. Tafakut criteria can be changed and regenerated at any time.
14. Tafakut history must be preserved.
15. One Ahbab may be assessed through multiple Tafakut within the same Takaza.
16. One Rekod Amal may be selected by multiple Tafakut when relevant.
17. Reports are generated individually for one Ahbab at a time.
18. Reports may be generated using historical or current Tafakut criteria.
19. Ahbab may view only their own generated reports, with read-only access.
20. Ahbab cannot edit or comment on generated reports.
21. Project Code / Percha No. is currently required only for Takaza Biruni.
22. Internal Takaza codes and Project Code / Percha No. must remain separate.
23. Assessment recommendations must not automatically become final human decisions.
24. Historical Rekod Amal, Tafakut, reports and audit information must be preserved.

## 11. Migration and Compatibility Principles

The realignment must preserve existing data and working functionality.

- Do not delete existing activity or Takaza records.
- Do not replace existing IDs unnecessarily.
- Do not modify historical migration files.
- Introduce new migrations only after the target schema and data mapping have been reviewed.
- Prefer gradual migration and a compatibility period.
- Validate foreign-key relationships before retiring old structures.
- Keep existing user submissions and review history accessible.
- Preserve historical information required for Tafakut and report generation.
- Do not deploy to production until development and testing are complete.

The `worker/schema-baseline/0001_baseline.sql` file is a schema snapshot for a new/empty database. It is not a migration to run against the existing live database.

## 12. Development Sequence

| Step | Work item | Objective |
|---|---|---|
| 1 | Confirm system realignment design | Agree on the target operational relationships |
| 2 | Finalise Takaza classification | Establish Takaza structure and configuration |
| 3 | Design Ahbab participation | Implement automatic Makami participation and other Takaza participation |
| 4 | Design Rekod Amal model | Establish the activity record structure and history |
| 5 | Design Tafakut model | Support multiple Tafakut types and dynamic criteria |
| 6 | Design report generation | Support individual and historical report generation |
| 7 | Prepare database migration plan | Preserve existing data and IDs |
| 8 | Implement workflows incrementally | Build and test each module |
| 9 | Implement assessment | Support evidence, recommendation and human decision |
| 10 | End-to-end testing | Validate operational workflows |

## 13. Remaining Design Decisions

The following details still require clarification before database migrations:

1. Exact Takaza classification and subcategory structure.
2. Exact Rekod Amal classification and its relationship to existing Activity Types.
3. Exact inactivity period and automatic IDLE detection rules.
4. Whether and how reminders should be generated for missing updates.
5. Detailed Tafakut criteria types, operators and evaluation rules.
6. Whether Tafakut criteria need weighting or scoring.
7. Detailed generated report format and presentation.
8. Whether reports require an explicit Admin review/approval status before Ahbab can view them.
9. Detailed assessment outcomes and human decision workflow.
10. Future Project Code / Percha No. requirements for other Takaza.

These details may be refined as the operational workflow becomes clearer.

## 14. Development Working Agreement

- All development changes are made in `develop`.
- `main` remains unchanged until overall development and testing are accepted.
- Work incrementally: Build → Test → Observe → Refine.
- Preserve existing working features wherever possible.
- Inspect the actual current source before proposing code changes.
- Do not claim implementation or deployment until verified.
- Keep README.md unchanged unless specifically requested.
- Maintain this design document separately from README.md.

---

**Last Updated:** 19 November 2026  
**Document Status:** Agreed Design Direction – Detailed Schema Pending

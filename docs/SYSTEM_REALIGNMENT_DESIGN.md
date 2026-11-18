
# JuhudManager – System Realignment Design

**Document:** System Realignment Design  
**Branch:** `develop`  
**Status:** Working Design – Agreed Direction, Detailed Schema Pending  
**Last Updated:** 19 November 2026

---

## 1. Purpose

This document records the agreed direction for realigning JuhudManager around its actual operational purpose.

JuhudManager is not merely an Activity Management system. Its main purpose is to manage Takaza, Ahbab participation, activity track records, and assessment.

The objective is to realign the existing implementation without unnecessarily rebuilding working components or losing existing records.

This document is a design reference. It does not authorise database migrations or changes to the live system.

## 2. Core System Concepts

The system is based on four main components:

1. **Takaza Management** – defines and manages Takaza.
2. **Ahbab Management** – manages users/employees participating in Takaza.
3. **Activity Management** – records activities and progress reported by Ahbab.
4. **Assessment Management** – evaluates Ahbab using activity records and Takaza-specific requirements.

### 2.1 Takaza Management

Takaza Management is the main project/effort management area.

Examples of Takaza and effort categories include:

- Takaza Makami
- Takaza Biruni
- Takaza Khidmat
- Usaha Masturat
- Pelajar Diini
- Pelajar Asri
- Ulama
- OKU
- OBB
- Other categories as required

The categories should be configurable rather than permanently hardcoded into the application.

**Project Code / Percha No.**

- Only Takaza Biruni currently requires a Project Code / Percha No.
- Other Takaza categories do not currently require this number.
- The application should support an optional Project Code / Percha No. field.
- The field should be displayed or hidden according to the relevant Takaza category or configuration.

The existing internal Takaza identifier/code must remain distinct from Project Code / Percha No.

### 2.2 Ahbab Management

Ahbab refers to participants represented by registered User or Employee accounts.

An Ahbab may participate in more than one Takaza.

A Takaza may have multiple Ahbab.

The system must therefore support a many-to-many relationship between Ahbab and Takaza.

Participation should be trackable independently for each Takaza.

### 2.3 Takaza Makami

Every Ahbab is expected to participate in Makami activities as part of their basic involvement.

Makami participation is expected to be continuous and should be monitored through regular activity updates.

However, the system must not assume that every Ahbab is making progress.

Possible situations include:

- Ahbab regularly reports progress.
- Ahbab reports limited or incomplete progress.
- Ahbab explicitly reports no progress.
- Ahbab has not submitted an update.
- Ahbab has not yet started or participated.

These situations must remain distinguishable in the system.

The exact mechanism for representing default Makami participation (automatic association or explicit membership record) remains subject to detailed workflow design.

### 2.4 Activity Management

Activities represent the actual efforts or progress reported by Ahbab.

Activities may be recorded according to different frequencies, including:

- Daily
- Weekly
- Monthly
- Yearly
- Ad Hoc

Activity records provide a historical track record of an Ahbab's involvement.

The system should retain the distinction between:

- Activity definition / classification.
- Activity record submitted by an Ahbab.
- Review and verification of the submitted record.

An activity record should not automatically be treated as proof of eligibility. It is evidence that may be considered during assessment.

### 2.5 Assessment Management

Assessment evaluates an Ahbab against the requirements of a particular Takaza.

Activity history is one of the sources of evidence.

Assessment may consider:

- Common requirements.
- Takaza-specific requirements.
- Activity frequency and consistency.
- Actual progress and participation.
- Missing or unverified information.
- Other criteria defined for the relevant Takaza.

The system should assist the assessment process, not replace authorised human judgement.

System recommendations and final human decisions must remain separate.

## 3. Current System – Existing Implementation

The following tables and components were found in the current `develop` branch.

| Existing component | Current purpose |
|---|---|
| `user_accounts` | Stores User and Employee accounts |
| `user_roles` | Defines account roles |
| `takaza_categories` | Stores Takaza categories |
| `takazas` | Stores individual Takaza registrations |
| `takaza_code_sequences` | Generates internal Takaza codes |
| `activity_types` | Stores activity definitions and frequency |
| `activity_records` | Stores activity submissions by users |
| `activity_assignments` | Assigns activity types to users |
| `audit_logs` | Records important system actions |

### 3.1 Current Relationships

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

### 3.2 Current Limitations

The current implementation has two separate classification structures:

- `activity_types` for activity definitions.
- `takaza_categories` for Takaza registration categories.

The current `activity_assignments` table references `activity_types`, not registered Takaza.

Activity records also reference `activity_types` directly.

Consequently, the existing data relationships do not yet represent the intended relationship between Takaza, Ahbab and their activity track records.

## 4. Proposed System Structure

The proposed logical structure is:

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
|   +-- Participation Status
|
+-- ACTIVITY MANAGEMENT
|   |
|   +-- Activity Classification
|   +-- Activity Records
|   +-- Activity Review
|   +-- Activity History
|
+-- ASSESSMENT MANAGEMENT
    |
    +-- Common Criteria
    +-- Takaza-specific Criteria
    +-- Assessment Records
    +-- Human Review
    +-- Final Decision
```

This is a logical module structure. The final navigation layout may be adjusted during implementation.

## 5. Current-to-Proposed Component Mapping

| Current component | Proposed direction |
|---|---|
| Activity Types | Realign as Activity Classification |
| Takaza Categories | Integrate into the broader Takaza classification design |
| Takaza Registration | Retain as the registration and management of individual Takaza |
| Activity Assignments | Redesign to support Takaza-to-Ahbab participation and activity requirements |
| Activity Records | Retain and realign to the new activity classification |
| Submission Review | Retain as Activity Review |
| User Management | Retain and expose the Ahbab concept in relevant workflows |
| Audit Trail | Retain |
| Eligibility Assessment | Develop as Assessment Management |

Existing working functions should be reused wherever practical.

## 6. Proposed Data Model Direction

The following is a conceptual proposal, not a final database schema.

### 6.1 Takaza Classification

A configurable classification structure should support parent categories and subcategories.

Possible fields:

- Classification ID
- Classification Code
- Classification Name
- Parent Classification ID
- Description
- Project Code / Percha No. (optional)
- Frequency (optional, where applicable)
- Status
- Created / Updated information

This should provide a consistent way to organise Takaza and activity classifications without forcing every classification to have the same requirements.

### 6.2 Takaza

Individual Takaza registrations should remain separate from classification definitions.

A Takaza record should retain its own identity, name, category, description, dates and lifecycle status.

Internal Takaza code and Project Code / Percha No. must be treated as separate concepts.

### 6.3 Takaza–Ahbab Participation

A relationship record is required to connect Ahbab with Takaza.

Conceptual fields:

- Participation ID
- Takaza ID
- Ahbab User ID
- Assigned By
- Assigned Date
- Participation Status
- Start Date
- End Date (where applicable)
- Remarks

This supports multiple Ahbab in one Takaza and multiple Takaza for one Ahbab.

Takaza Makami's default participation mechanism requires further workflow confirmation.

### 6.4 Activity Classification and Records

Activity definitions should be separated from actual activity submissions.

Activity records should retain:

- Ahbab / User ID
- Activity Classification ID
- Activity Date or Reporting Period
- Description
- Progress Status
- Submission Status
- Reviewer information
- Attachment reference (where applicable)
- Audit history

Historical records must remain traceable to the classification that was used when they were submitted.

### 6.5 Assessment

Assessment should be designed after the Takaza, Ahbab and Activity relationships are established.

It should eventually support:

- Common criteria.
- Takaza-specific criteria.
- Evidence from activity history.
- Assessment recommendation.
- Human review.
- Final decision and justification.
- Conditions and follow-up, where applicable.
- Assessment history.

## 7. Important Data and Workflow Rules

1. Every Ahbab is expected to participate in Takaza Makami activities.
2. Makami participation does not imply that progress is always present.
3. No update must not be interpreted automatically as no progress.
4. Explicitly reported no progress must be distinguishable from missing reports.
5. An Ahbab may participate in multiple Takaza.
6. A Takaza may have multiple Ahbab.
7. Activity records are evidence of efforts and progress.
8. Activity records may contribute to assessment for other Takaza.
9. Project Code / Percha No. is currently required only for Takaza Biruni.
10. Internal Takaza codes and Project Code / Percha No. must remain separate.
11. Assessment recommendations must not automatically become final human decisions.
12. Historical records and audit information must be preserved during realignment.

## 8. Migration and Compatibility Principles

The realignment must preserve existing data and working functionality.

- Do not delete existing activity or Takaza records.
- Do not replace existing IDs unnecessarily.
- Do not modify historical migration files.
- Introduce new migrations only after the target schema and data mapping have been reviewed.
- Prefer a gradual migration and compatibility period.
- Validate foreign-key relationships before retiring old structures.
- Keep existing user submissions and review history accessible.
- Do not deploy to production until development and testing are complete.

The `worker/schema-baseline/0001_baseline.sql` file is a schema snapshot for a new/empty database. It is not a migration to run against the existing live database.

## 9. Proposed Development Sequence

| Step | Work item | Objective |
|---|---|---|
| 1 | Confirm system realignment design | Agree on the target relationships |
| 2 | Finalise classification model | Establish Takaza and Activity classification structure |
| 3 | Design Ahbab participation model | Establish Takaza-to-Ahbab relationships |
| 4 | Design activity data relationship | Connect activity records to the new classification |
| 5 | Prepare database migration plan | Preserve existing data and IDs |
| 6 | Implement Takaza and Ahbab workflows | Support participation and assignment |
| 7 | Realign Activity Management | Support regular track records and review |
| 8 | Test end-to-end workflows | Validate actual operational use |
| 9 | Define assessment criteria | Establish common and Takaza-specific requirements |
| 10 | Implement Assessment Management | Support assessment and human decisions |

## 10. Pending Design Decisions

The following details still require clarification before database migrations:

1. Should Makami participation be created automatically for every Ahbab, or represented through explicit participation records?
2. Should Takaza Makami be represented as a registered Takaza record or as a special/default participation category?
3. How should an Ahbab report a period with no progress?
4. Should the system generate reminders for missing daily, weekly or monthly updates?
5. Can one activity record contribute evidence to more than one Takaza assessment?
6. Which Takaza categories require Project Code / Percha No. in future?
7. What are the exact assignment, withdrawal, suspension and completion workflows?

These decisions can be refined as the operational workflow becomes clearer.

## 11. Development Working Agreement

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
**Document Status:** Working Design – Agreed Direction, Detailed Schema Pending

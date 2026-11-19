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


### 2.4 Activity Status and System-Generated Progress Status

The system must distinguish between the status of an activity and the progress status generated from Rekod Amal.

**Activity status:**

| Status | Meaning |
|---|---|
| ACTIVE | Activity is currently active |
| IDLE | Activity has not been updated or carried out for a period |
| INACTIVE | Activity is no longer active |

**System-generated progress status:**

| Status | Meaning |
|---|---|
| IN_PROGRESS | Available records indicate progress |
| LIMITED_PROGRESS | Available records indicate limited progress |
| NO_PROGRESS | Available records explicitly indicate no progress |
| NO_RECORD | No relevant record or update is available for the assessment period |

**Progress status rules:**

1. Progress status is determined automatically by the system.
2. Ahbab does not manually select or set their progress status.
3. Ahbab is responsible for updating Rekod Amal based on daily activities and Takaza activities they participate in or have committed to.
4. The system analyses Rekod Amal history against the relevant Tafakut criteria and assessment date or period.
5. `NO_RECORD` must not be interpreted as `NO_PROGRESS`.
6. The system must retain the source records and criteria used to determine each generated status.

**Who manages activity status:**

- The system monitors updates and may automatically detect activities that have become idle.
- Admin can manually change activity status when necessary.
- Ahbab does not manage ACTIVE, IDLE or INACTIVE status.
- Ahbab only updates Rekod Amal.

The inactivity period and exact automatic detection rules remain subject to detailed workflow design.


### 2.5 Takaza Release and Ahbab Commitment

Admin controls the release of a Takaza.

Once released, Ahbab can:

- View the Takaza information and requirements.
- Express interest.
- Commit voluntarily to the Takaza.
- Monitor their commitment status.

An Ahbab may commit to more than one Takaza.

An Ahbab's original commitment must be preserved as historical information, even if Admin later assigns the Ahbab to another Takaza.

### 2.6 Takaza Group Formation

A Takaza may have multiple groups.

Admin is responsible for preparing and managing Draft Groups before finalising group membership.

Draft Group capabilities include:

- Adding Ahbab who have committed voluntarily.
- Assigning Ahbab who have not committed.
- Removing Ahbab from a Draft Group.
- Moving Ahbab between Draft Groups.
- Moving Ahbab to another Takaza.
- Reviewing Ahbab eligibility and commitment information.
- Maintaining multiple Draft Group arrangements.

Draft Groups may be reorganised until Admin finalises them.

#### Admin Assignment and Kawaif

Admin has the authority to nominate or assign Ahbab to a Takaza Group, even if the Ahbab has not voluntarily committed.

The system must distinguish between:

- `COMMITTED` – Ahbab voluntarily expresses commitment.
- `ADMIN_ASSIGNED` – Ahbab is nominated or assigned by Admin.
- `KAWAIF_PASSED` – Ahbab meets the applicable eligibility criteria.

Admin assignment and Kawaif assessment are separate information dimensions.

Being assigned by Admin or passing Kawaif does not automatically activate group membership.

Ahbab must explicitly confirm acceptance before becoming an active group member.

### 2.7 Ahbab Confirmation

After Admin prepares a Draft Group, the system requests confirmation from each selected Ahbab.

Confirmation statuses:

| Status | Meaning |
|---|---|
| PENDING | Awaiting Ahbab response |
| ACCEPTED | Ahbab agrees to join |
| DECLINED | Ahbab declines the proposed membership |

Ahbab may provide a reason when declining. The reason is optional but should be recorded when provided.

Admin can review the response and reorganise the Draft Group accordingly.

A declined nomination does not constitute misconduct or failure by the Ahbab.

#### Confirmation Rules

1. Admin assignment does not imply acceptance.
2. Kawaif Passed does not imply acceptance.
3. Only explicit acceptance can qualify an Ahbab for active membership.
4. Pending and declined Ahbab are not counted as confirmed group members.
5. Admin may finalise a group while some Ahbab remain Pending, provided the confirmed membership count satisfies the configured group size requirements.

### 2.8 Group Size and Finalisation

Each Draft Group must support configurable minimum and maximum member limits.

Admin may finalise a group when the number of accepted and eligible Ahbab is within the configured range.

Pending and declined Ahbab do not count towards the confirmed membership total.

Finalisation does not require every nominated Ahbab to have responded.

Once finalised, accepted and eligible Ahbab may be activated as group members.

### 2.9 Final Group Amendments

Finalised groups are not permanently locked.

Admin retains authority to:

- Add Ahbab.
- Remove Ahbab.
- Transfer Ahbab between groups.
- Transfer Ahbab to another Takaza.
- Reorganise group membership according to operational requirements.

Every amendment must create a historical record.

Group Amendment History should include:

- Date and time.
- Admin or actor responsible.
- Ahbab involved.
- Original Takaza and Group.
- New Takaza and Group, where applicable.
- Amendment action.
- Reason or remarks.
- Relevant Ahbab confirmation status.

Historical membership and amendment records must not be silently overwritten or deleted.

### 2.10 Takaza Transfer and Original Commitment

Admin may transfer an Ahbab from one Draft Group or Takaza to another.

The system must preserve:

- The Ahbab's original voluntary commitment.
- The original Takaza selected by the Ahbab.
- The Admin's transfer decision.
- The reason or remarks for the transfer.
- The subsequent confirmation by the Ahbab.

A transfer to another Takaza requires the Ahbab's explicit acceptance before the new membership becomes ACTIVE.

The original commitment must never be rewritten to make it appear that the Ahbab initially selected the new Takaza.

### 2.11 Ahbab Withdrawal

Ahbab has the right to withdraw from an active Takaza Group immediately.

Withdrawal does not require Admin approval.

Withdrawal workflow:

1. Ahbab initiates withdrawal.
2. Ahbab may provide a reason (optional).
3. The system immediately changes the membership status to `WITHDRAWN`.
4. Admin is notified.
5. The system records the withdrawal date, time and reason.
6. Historical membership and Rekod Amal records are preserved.

Admin cannot prevent or delay an Ahbab's withdrawal.

Withdrawal does not delete the Ahbab's previous commitment or participation history.

### 2.12 Re-nomination After Withdrawal

An Ahbab who has withdrawn from a Takaza cannot directly reactivate the previous membership or make a new commitment to the same Takaza without going through a new nomination process.

Rejoining the same Takaza requires:

1. New Admin nomination.
2. Eligibility assessment, where applicable.
3. New Ahbab confirmation.
4. Activation of a new membership record after acceptance and fulfilment of applicable requirements.

The previous membership remains `WITHDRAWN`.

A new participation must be recorded separately. Historical membership records must not be reactivated or overwritten.

### 2.13 Takaza Group Status and Audit Principles

The system must distinguish between:

- Ahbab account status.
- Original commitment status.
- Admin assignment status.
- Kawaif eligibility status.
- Group confirmation status.
- Group membership status.

These are separate dimensions and must not be represented as one combined status.

All important actions must be auditable, including:

- Takaza release.
- Ahbab commitment.
- Admin assignment.
- Kawaif assessment.
- Ahbab acceptance or decline.
- Group creation and finalisation.
- Group amendments and transfers.
- Ahbab withdrawal.
- Re-nomination.

The system must preserve the history of decisions and actions by both Admin and Ahbab.


## 3. Rekod Amal Management

The official term for Activity Records is **Rekod Amal**.

Rekod Amal represents the actual activities and efforts recorded by Ahbab.

Ahbab is responsible for updating Rekod Amal based on:

- Daily activities (Amalan Harian).
- Activities related to Takaza in which the Ahbab participates.
- Activities related to Takaza to which the Ahbab has committed.

Rekod Amal is the primary source data used by Tafakut, automatic progress evaluation and report generation.

Possible activity frequencies include:

- Daily
- Weekly
- Monthly
- Yearly
- Ad Hoc

The system must preserve the historical records of Rekod Amal.

A Rekod Amal record should retain relevant information such as:

- Ahbab / User ID
- Activity classification
- Related Takaza, where applicable
- Activity date or reporting period
- Description
- Supporting information or attachment reference, where applicable
- Created and updated information
- Audit history

Progress status is not manually entered by Ahbab. It is determined automatically by the system based on available Rekod Amal, relevant Tafakut criteria and the applicable assessment date or period.

The system must distinguish between the absence of records and records that explicitly indicate no progress.

Rekod Amal must not automatically be treated as proof of eligibility. It is evidence that may be selected and considered through Tafakut.

One Rekod Amal record may be used by more than one Tafakut when it satisfies the respective criteria.

## 4. Tafakut Management

**Tafakut** is the official name for Criteria Selection.

Tafakut determines which Rekod Amal records and other relevant information are selected for evaluating progress, generating reports and supporting assessment for a particular Takaza.

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

The system must preserve Tafakut history/version information, including the criteria used at the time of a previous progress evaluation or report generation.

### 4.4 Tafakut and Rekod Amal Relationship

Tafakut selects relevant Rekod Amal according to its criteria.

The same Rekod Amal may contribute to multiple Tafakut if it meets the criteria of each Tafakut.

The system must retain traceability between:

- The original Rekod Amal.
- The Tafakut criteria applied.
- The generated progress result or report.
- The relevant Ahbab and Takaza.

## 5. System-Generated Reports and Progress Monitoring

The system automatically analyses Rekod Amal history against the relevant Tafakut criteria to determine Ahbab progress.

Progress information may be accessed through two methods:

1. Individual report generation requested by Admin.
2. System-generated progress listing for all relevant Ahbab as of a selected date.

### 5.1 Individual Report Generation

Admin may request an individual report for one Ahbab at a time.

Admin selects the relevant:

- Takaza
- Tafakut type
- Ahbab
- Reporting period or assessment date
- Historical or current criteria context

The system selects relevant Rekod Amal, evaluates the applicable criteria and generates the individual report.

Bulk individual report generation is not part of the currently agreed requirement.

### 5.2 Progress Listing as of Date

The system must support a progress listing covering all relevant Ahbab as of a selected date.

The listing is generated automatically from available Rekod Amal and the applicable Tafakut criteria.

The listing should identify each Ahbab and their system-generated progress status:

| Progress Status | Meaning |
|---|---|
| IN_PROGRESS | Available records indicate progress |
| LIMITED_PROGRESS | Available records indicate limited progress |
| NO_PROGRESS | Available records indicate no progress |
| NO_RECORD | No relevant record or update is available for the assessment period |

The listing is intended for Admin monitoring and may be viewed without requiring Admin to generate each Ahbab's individual report separately.

`NO_RECORD` must not be interpreted as `NO_PROGRESS`.

### 5.3 Historical Reports and Progress Results

The system must preserve sufficient historical information to support:

- Evaluating progress using historical Rekod Amal.
- Applying historical Tafakut criteria.
- Generating reports using current Tafakut criteria.
- Viewing progress as of a previous date.
- Retaining previous report-generation history.
- Re-generating reports without deleting original source records.

Changing Tafakut must not make previous reporting periods inaccessible.

Each generated report or historical progress result must retain traceability to the source Rekod Amal, criteria version, Ahbab, Takaza and assessment date or period used.

### 5.4 Ahbab Report Access

Ahbab may view the results of their own Tafakut reports.

Access rules:

| Role | Permission |
|---|---|
| Ahbab | Read-only access to own reports |
| Admin | Generate, view and manage individual reports and progress listings |
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
|   +-- Takaza Registration
|   +-- Takaza Release
|   +-- Takaza Categories
|   |
|   +-- AHBAB COMMITMENT
|   |   +-- Voluntary Commitment
|   |   +-- Commitment History
|   |
|   +-- GROUP MANAGEMENT
|       +-- Draft Selection
|       +-- Draft Groups
|       +-- Admin Assignment / Nomination
|       +-- Kawaif Assessment
|       +-- Ahbab Confirmation
|       +-- Group Finalisation
|       +-- Final Group Management
|       +-- Group Amendment History
|       +-- Ahbab Withdrawal
|       +-- Re-nomination
|
+-- AHBAB MANAGEMENT
|   |
|   +-- Ahbab Profile
|   +-- Account Status
|   +-- Takaza Participation
|   +-- Automatic Makami Participation
|
+-- REKOD AMAL MANAGEMENT
|   |
|   +-- Amal Classification
|   +-- Rekod Amal Submission
|   +-- Activity Status Monitoring
|   +-- Progress Reporting
|   +-- Rekod Amal History
|
+-- TAFAKUT MANAGEMENT
|   |
|   +-- Takaza-specific Tafakut
|   +-- Multiple Tafakut Types
|   +-- Criteria Management
|   +-- Criteria Version History
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

The final schema must support historical records, multiple Takaza participation, flexible group formation and traceability of Admin and Ahbab decisions.

### 9.1 Takaza

Individual Takaza registrations should retain their own identity, name, category, description, dates and lifecycle status.

Internal Takaza code and Project Code / Percha No. must remain separate.

Takaza should also support its release information, including:

- Release status.
- Release date and time.
- Released by.
- Relevant release information or remarks.

The release process must not be confused with group finalisation.

### 9.2 Takaza Commitment

A separate record is required to preserve each Ahbab's voluntary commitment.

Conceptual fields:

- Commitment ID
- Takaza ID
- Ahbab User ID
- Commitment date and time
- Commitment status
- Remarks, where applicable
- Created and updated information

The original commitment must remain unchanged when Admin later assigns or transfers the Ahbab to another Takaza.

A new commitment or nomination must be recorded as a separate event or record where applicable.

### 9.3 Admin Nomination and Assignment

The system must support Admin nominating an Ahbab who has not voluntarily committed to a Takaza.

Conceptual fields:

- Nomination ID
- Takaza ID
- Ahbab User ID
- Assigned by Admin
- Assignment date and time
- Nomination status
- Remarks or reason
- Related Draft Group, where applicable

Admin nomination and voluntary commitment must remain distinguishable.

`ADMIN_ASSIGNED` represents the assignment source or method. It is not an eligibility result or membership status.

### 9.4 Kawaif Assessment

The system must retain the eligibility assessment applied to an Ahbab for a particular Takaza or nomination.

Conceptual fields:

- Kawaif Assessment ID
- Takaza ID
- Ahbab User ID
- Related nomination or selection
- Assessment result
- Criteria reference
- Assessment date and time
- Assessed by
- Remarks and supporting information

`KAWAIF_PASSED` represents an eligibility outcome.

It must remain separate from Admin assignment, Ahbab confirmation and active membership.

The detailed Kawaif criteria and evaluation rules remain subject to further design.

### 9.5 Draft Groups and Final Groups

A Takaza may contain multiple groups.

The system must support group creation, draft composition, finalisation and subsequent amendments.

Conceptual entities may include:

**Takaza Groups**
- Group ID
- Takaza ID
- Group name or reference
- Minimum members
- Maximum members
- Group status
- Created by
- Created and updated information

**Group Membership / Selection**
- Membership or selection ID
- Group ID
- Ahbab User ID
- Related commitment or nomination
- Selection source
- Selection status
- Confirmation status
- Membership status
- Start date
- End date, where applicable

The design must distinguish between:

- Draft selection.
- Ahbab confirmation.
- Eligibility result.
- Active group membership.
- Withdrawn membership.

A person being listed in a Draft Group does not automatically become an active member.

### 9.6 Ahbab Confirmation

Ahbab confirmation must be recorded separately from the Admin selection or nomination.

Conceptual fields:

- Confirmation ID
- Related membership or selection ID
- Ahbab User ID
- Confirmation response
- Response date and time
- Decline reason, where provided
- Confirmation history

Confirmation responses:

- `PENDING`
- `ACCEPTED`
- `DECLINED`

A new Takaza transfer requires new confirmation from the Ahbab before the new membership becomes active.

### 9.7 Group Finalisation and Membership Lifecycle

The system must retain the finalisation event and the membership state of each Ahbab.

Conceptual information:

- Group finalisation date and time.
- Finalised by.
- Group size limits at finalisation.
- Confirmed and eligible membership count.
- Finalisation status.
- Membership activation date.

Only accepted and eligible Ahbab count towards the confirmed membership total.

Pending and declined Ahbab must not count towards the minimum or maximum confirmed membership count.

### 9.8 Group Amendment History

A separate historical record is required for changes made after group formation or finalisation.

Conceptual fields:

- Amendment ID
- Group or membership reference
- Ahbab User ID
- Previous Takaza ID
- New Takaza ID
- Previous Group ID
- New Group ID
- Amendment action
- Reason or remarks
- Changed by
- Date and time
- Relevant Ahbab confirmation reference

The system must preserve every amendment.

Previous membership and transfer information must not be silently overwritten.

### 9.9 Ahbab Withdrawal and Re-nomination

Withdrawal must be recorded as a separate membership lifecycle event.

Conceptual fields:

- Withdrawal ID
- Membership ID
- Ahbab User ID
- Withdrawal date and time
- Reason, if provided
- Notification status
- Recorded status

Withdrawal must immediately change the relevant membership to `WITHDRAWN`, without requiring Admin approval.

A later return to the same Takaza requires a new nomination process and a new membership record after the applicable eligibility and confirmation requirements are met.

The previous withdrawn membership must remain historical and must not be reactivated.

### 9.10 Rekod Amal

Rekod Amal must preserve the original submitted information and its history.

The final schema must support traceability between Rekod Amal and the relevant Ahbab.

It must also support the selection of a Rekod Amal record by multiple Tafakut where applicable.

### 9.11 Tafakut

A Takaza may have multiple Tafakut definitions.

Conceptual entities may include:

- Tafakut
- Tafakut Type
- Tafakut Criteria
- Tafakut Criteria History / Version
- Tafakut-to-Takaza relationship

Each Tafakut must be associated with the relevant Takaza.

Criteria history must be retained so historical reports can be reproduced using the criteria that were applied at the time.

### 9.12 Generated Reports

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

### 9.13 Assessment

Assessment should use generated reports and other relevant evidence.

It should support:

- Assessment recommendation.
- Human review.
- Final decision and justification.
- Conditions and follow-up, where applicable.
- Assessment history.

## 10. Important Data and Workflow Rules

### Takaza and Commitment

1. Admin controls the release of Takaza.
2. Ahbab may voluntarily commit to any released Takaza.
3. An Ahbab may commit to multiple Takaza.
4. Original voluntary commitments must be preserved as historical records.
5. Admin may nominate Ahbab who have not voluntarily committed.
6. Admin assignment must not be treated as voluntary commitment.
7. Admin may reorganise Draft Groups and transfer Ahbab between groups or Takaza.
8. A transfer must not overwrite the Ahbab's original commitment.
9. A transfer to another Takaza requires the Ahbab's explicit acceptance before new membership activation.

### Kawaif and Ahbab Confirmation

10. Kawaif assessment is separate from Admin assignment and Ahbab confirmation.
11. Passing Kawaif does not automatically activate membership.
12. Admin assignment does not automatically activate membership.
13. Ahbab must explicitly accept before becoming an active member.
14. Confirmation responses are `PENDING`, `ACCEPTED` or `DECLINED`.
15. Decline reason is optional but should be retained when provided.
16. Declining a nomination is not misconduct or failure.
17. Pending and declined Ahbab are not counted as confirmed group members.

### Group Formation and Management

18. A Takaza may have multiple groups.
19. Each group has configurable minimum and maximum member limits.
20. Admin may finalise a group when the accepted and eligible membership count satisfies the configured range.
21. Admin does not need to wait for every selected Ahbab to respond if the confirmed membership count already satisfies the group requirements.
22. Finalised groups may still be amended by Admin.
23. Every post-finalisation change must create a Group Amendment History record.
24. Historical group membership, transfer and amendment records must be preserved.

### Withdrawal and Re-nomination

25. Ahbab may withdraw from an active group immediately without Admin approval.
26. Withdrawal immediately changes the relevant membership status to `WITHDRAWN`.
27. Admin must be notified of the withdrawal.
28. Withdrawal reason is optional.
29. Withdrawal must not delete previous commitments, participation or Rekod Amal history.
30. Rejoining the same Takaza after withdrawal requires a new Admin nomination process.
31. Re-nomination requires a new membership record and new Ahbab confirmation.
32. Previous withdrawn membership must never be reactivated or overwritten.

### Ahbab and Makami

33. Every active Ahbab is automatically registered as a participant of Takaza Makami.
34. Makami participation remains active while the Ahbab account is active.
35. Deactivating an Ahbab account makes its Makami participation inactive.
36. Reactivating an Ahbab account reactivates the existing Makami participation without creating a duplicate.
37. Account status, participation status, activity status and system-generated progress status are separate concepts.
38. Automatic Makami participation does not imply that the Ahbab has made progress.

### Rekod Amal and Tafakut

39. No update must not be interpreted automatically as no progress.
40. The system may detect idle activities based on update history.
41. Admin may manually change activity status.
42. Ahbab updates Rekod Amal but does not manage activity status.
43. Rekod Amal is the source record for Tafakut and generated reports.
44. A Takaza may have multiple Tafakut types.
45. Each Takaza manages its own Tafakut configuration independently.
46. Tafakut criteria can be changed and regenerated at any time.
47. Tafakut history must be preserved.
48. One Ahbab may be assessed through multiple Tafakut within the same Takaza.
49. One Rekod Amal may be selected by multiple Tafakut when relevant.
50. Reports are generated individually for one Ahbab at a time.
51. Reports may be generated using historical or current Tafakut criteria.
52. Ahbab may view only their own generated reports, with read-only access.
53. Ahbab cannot edit or comment on generated reports.

### Assessment and Data Preservation

54. Assessment recommendations must not automatically become final human decisions.
55. System recommendations and final human decisions must remain separate.
56. Historical Rekod Amal, Tafakut, reports, commitments, nominations, memberships and audit information must be preserved.
57. Project Code / Percha No. is currently required only for Takaza Biruni.
58. Internal Takaza codes and Project Code / Percha No. must remain separate.

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
| 1 | Confirm system realignment design | Agree on the target operational relationships and workflows |
| 2 | Finalise Takaza classification | Establish Takaza structure and configuration |
| 3 | Takaza release workflow | Allow Admin to release Takaza for Ahbab participation |
| 4 | Ahbab commitment workflow | Support voluntary commitment and preserve commitment history |
| 5 | Draft Group management | Allow Admin to create and reorganise Draft Groups |
| 6 | Admin nomination and Kawaif | Support Admin assignment and eligibility assessment |
| 7 | Ahbab confirmation | Record acceptance, decline and pending responses |
| 8 | Group finalisation | Enforce minimum and maximum confirmed member requirements |
| 9 | Final Group management | Support amendments, transfers and amendment history |
| 10 | Withdrawal and re-nomination | Support immediate withdrawal and new nomination after withdrawal |
| 11 | Ahbab participation | Implement automatic Makami participation and other Takaza participation |
| 12 | Rekod Amal model | Establish the activity record structure and history |
| 13 | Tafakut model | Support multiple Tafakut types and dynamic criteria |
| 14 | Report generation | Support individual and historical report generation |
| 15 | Database migration plan | Preserve existing data and IDs |
| 16 | Incremental implementation | Build and test each module |
| 17 | Assessment | Support evidence, recommendation and human decision |
| 18 | End-to-end testing | Validate complete operational workflows |

The sequence is a logical development order. Some modules may be refined iteratively as implementation and operational testing reveal additional requirements.

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

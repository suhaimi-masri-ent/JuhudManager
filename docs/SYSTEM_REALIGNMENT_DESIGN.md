
# JuhudManager – System Realignment Design

**Document:** System Realignment Design  
**Version:** 2.0  
**Branch:** `integration/v1-v2-separation-develop`  
**Status:** Consolidated V2 Design Reference  
**Last Updated:** 28 November 2026

---

## 1. Purpose

This document describes the target system structure and operational design for JuhudManager V2.

The purpose of the realignment is to ensure that the system reflects the agreed operational model, including:

1. Ahbab accounts and profiles.
2. Organization structure and governance.
3. Takaza management.
4. Takaza Main and Sub relationships.
5. Takaza participation and participant lifecycle.
6. Kawaif qualification and experience records.
7. Tafakut assessment.
8. Amer and Supervisor appointments.
9. Percha and Takaza operational activities.
10. Rekod Amal and reporting.
11. Annual Archive.
12. Audit, notifications and administrative controls.

This document is a design reference. It does not authorise database migrations, production changes or implementation claims.

All implementation must follow the approved V2 documentation and the actual verified source code and database state.

## 2. Document Authority and Reconciliation

This document consolidates the earlier system realignment direction with the current JuhudManager V2 design.

Where an earlier concept conflicts with an approved V2 specification, the current V2 specification takes precedence.

The relevant documentation includes:

- `v2/docs/Auth.md`
- `v2/docs/UAC_MATRIX.md`
- `v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md`
- `v2/docs/JMV2001-Ahbab-Profile-Account-Management.md`
- `v2/docs/JMV2002-Organization-Structure-Governance.md`
- `v2/docs/JMV2003-Syukbah-Management.md`
- `v2/docs/JMV2004-Takaza-Management.md`
- `v2/docs/OPEN_DECISIONS_REGISTER.md`
- `v2/docs/V2_IMPLEMENTATION_STATUS.md`

The documents have different responsibilities:

| Document | Responsibility |
|---|---|
| System Realignment Design | Consolidated system concepts and relationships |
| JMV2001 | Ahbab profile and account management |
| JMV2002 | Organization structure and governance |
| JMV2003 | Syukbah management |
| JMV2004 | Takaza, participation and operational workflows |
| UAC Matrix | User access control and permissions |
| Dashboard Navigation Specification | Navigation and dashboard behaviour |
| Open Decisions Register | Unresolved decisions |
| V2 Implementation Status | Actual implementation status |

This document must not independently redefine detailed rules already governed by the relevant V2 specification.

## 3. Core Design Principles

### 3.1 Separate Account, Profile, Role and Participation

The system must distinguish between:

- User account status.
- Ahbab profile information.
- Assigned system roles.
- Organization membership or relationships.
- Takaza participation.
- Appointment or delegated responsibility.
- Activity and assessment records.

These are separate information dimensions.

Changing one dimension must not automatically change another unless an explicitly approved workflow requires it.

For example:

- Disabling an account does not mean deleting its historical participation.
- Being an Ahbab does not automatically make a person an Admin.
- Being appointed Amer does not automatically create Takaza participation.
- Passing a Tafakut assessment does not automatically activate participation.
- Being a participant does not automatically grant administrative permissions.

### 3.2 Preserve Historical Information

Important operational records must remain traceable.

The system should preserve:

- Original and amended information.
- Actor responsible for each action.
- Date and time.
- Reason or justification where required.
- Previous and resulting status.
- Relevant approval or confirmation.
- References to related records.

Historical records must not be silently overwritten or deleted.

### 3.3 Human Decisions and System Processing

The system may automate record creation, status calculation, notifications and workflow routing.

However, automated processing must not replace an explicitly required human decision.

Where an Admin decision is required, the system must not treat a system-generated recommendation or preliminary result as final approval.

### 3.4 Configuration and Extensibility

Where operational requirements may differ between countries, organizations or Takaza, the system should support controlled configuration.

Configuration must not create uncontrolled differences in core business rules.

Changes to configuration must preserve historical versions where previous records depend on them.

### 3.5 Auditability

Important actions must be auditable, particularly:

- Account and role changes.
- Organization assignments.
- Takaza creation and lifecycle changes.
- Participation decisions.
- Kawaif updates and verification.
- Tafakut assessments.
- Amer and Supervisor appointments.
- Percha amendments.
- Activity and attendance records.
- Withdrawal, removal and appeal decisions.
- Archive amendments.

## 4. Main System Domains

JuhudManager V2 is organised around the following domains.

| Domain | Main responsibility |
|---|---|
| Identity and Access | Authentication, accounts, roles and access control |
| Ahbab Management | Ahbab profile, qualifications and account relationships |
| Organization Management | Country and organization structure |
| Syukbah Management | Syukbah records, administration and discussion |
| Takaza Management | Main Takaza, Sub Takaza and lifecycle |
| Participation Management | Ahbab participation and participant history |
| Kawaif Management | Qualification and experience information |
| Tafakut Management | Structured assessment and decisions |
| Appointment Management | Amer and Supervisor appointments |
| Percha Management | Percha generation and amendment |
| Activity Management | Takaza events, attendance and activity records |
| Reporting | Takaza reports and other operational reports |
| Annual Archive | Historical annual records and summaries |
| Notification Management | User-language notifications |
| Audit Management | Historical actions and accountability |

These are logical domains. They do not require a one-to-one relationship with database tables or dashboard pages.

## 5. Takaza Management

### 5.1 Takaza as an Operational Entity

Takaza is a managed operational entity.

The system must support different Takaza types and operational requirements without permanently hardcoding every possible Takaza category.

Each Takaza must have its own identity, configuration, lifecycle and history.

The system must distinguish between:

- Takaza definition and configuration.
- Takaza registration.
- Takaza release.
- Takaza participation.
- Takaza activities.
- Takaza reporting.
- Takaza completion and archival.

### 5.2 Main Takaza and Sub Takaza

The approved V2 model supports a maximum of two Takaza levels:

1. Main Takaza.
2. Sub Takaza.

A Main Takaza may have multiple Sub Takaza records.

A Sub Takaza cannot have another child Takaza.

Main and Sub Takaza have independent lifecycle records.

The system must not automatically cancel, complete or otherwise change a Sub Takaza merely because its Main Takaza changes status, or vice versa.

Main and Sub Takaza must belong to the same country.

Each Main and Sub Takaza has its own appointed Amer.

### 5.3 Takaza Lifecycle

The approved lifecycle statuses are:

| Status | Meaning |
|---|---|
| `DRAFT` | Takaza is being prepared |
| `RELEASED` | Takaza has been released for the relevant operational process |
| `ACTIVE` | Takaza is operational |
| `ON_HOLD` | Takaza is temporarily paused |
| `COMPLETED` | Takaza has been completed |
| `CANCELLED` | Takaza has been cancelled |

Status changes must follow the authorised workflow.

A lifecycle status must not be confused with:

- Participation status.
- Amer appointment status.
- Event or attendance status.
- Tafakut assessment status.
- Annual Summary status.

### 5.4 Takaza Administration

An authorised Takaza Admin may create and manage Main and Sub Takaza within the Admin's permitted scope.

The Admin may configure the Takaza and verify or activate it without requiring SUPER_ADMIN approval for every ordinary Takaza operation.

Incomplete setup should be visible through appropriate warnings.

The system must enforce the Admin's country and organizational scope.

### 5.5 Takaza Start and End Dates

The proposed start date is not automatically a locked official date.

The Amer Jemaah may agree with the proposed date or suggest another date while the date remains under discussion.

After the Amer agrees, the Admin confirms and locks the official start date.

Once locked, the Amer cannot change the official date through the normal process.

Takaza must support a planned or fixed end date.

An Admin may amend the end date with a recorded history.

An Admin may also end a Takaza early with a reason.

The system may automatically complete a Takaza at its end date only when the required completion conditions have been satisfied.

The exact exceptional process for changing a Takaza after completion remains subject to the Open Decisions Register.


## 6. Takaza Participation Management

### 6.1 Separate Jemaah Membership and Takaza Participation

Jemaah membership and Takaza participation are separate concepts.

An Ahbab may be a Jemaah member without participating in every Takaza.

An Ahbab may participate in multiple Takaza, subject to the applicable participation requirements.

The system must maintain an individual participation record for each Ahbab and each relevant Takaza.

The V1 concept of Project Member maps to Takaza Participation where relevant.

V2 must not introduce a separate Project Member entity that duplicates Takaza Participation.

### 6.2 Participation Methods

The system must support configurable participation methods.

The methods include:

- `AUTOMATIC_INCLUSION`
- `VOLUNTARY_APPLICATION`
- `ADMIN_NOMINATION`
- `DIRECT_ASSIGNMENT`

A Takaza may use one or more methods.

The methods may be combined according to the Takaza's operational requirements.

Admin may configure applicable conditions for each method.

The detailed consent and TAFAKUT requirements for `DIRECT_ASSIGNMENT` remain unresolved and must not be assumed to bypass normal safeguards.

### 6.3 Participation Confirmation

Participation must follow the applicable confirmation and approval process.

For `AUTOMATIC_INCLUSION`, the system creates a candidate participation record with status `PENDING_ADMIN_CONFIRMATION`.

The candidate does not become a confirmed participant until Admin confirms the participation.

This rule also applies when existing Jemaah members are considered for automatic inclusion during Main Takaza formation.

When an Ahbab joins a Jemaah after a Takaza has become ACTIVE, the system may create a candidate participation record for Admin confirmation.

Automatic candidate creation must not be treated as automatic participant activation.

### 6.4 Voluntary Application and Admin Nomination

For `VOLUNTARY_APPLICATION` and `ADMIN_NOMINATION`, the system must record the relevant application or nomination.

For Sub Takaza, Ahbab consent is required.

TAFAKUT must be applied where required by the relevant eligibility criteria.

Passing TAFAKUT does not automatically approve participation.

The authorised Admin remains responsible for the final participation decision.

### 6.5 Participation History

Every participation record must retain its own history.

The system must distinguish between:

- Pending confirmation.
- Confirmed participation.
- Active participation.
- Withdrawal.
- Removal.
- Rejoining through a new participation process.

A new participation record must not silently reactivate or overwrite a previous withdrawn or removed record.

### 6.6 Configuration Changes

Changes to participation configuration after a Takaza reaches `RELEASED` or `ACTIVE` apply only to:

- New participation candidates.
- Applications that have not yet been decided.

Changes must not retroactively rewrite the participation method or approval requirements of existing confirmed participants.

Historical configuration must remain traceable.

### 6.7 Capacity Management

Admin may change the participation capacity at any time.

If the capacity is reduced below the number of existing participants:

- Existing participants remain participants.
- The system must not automatically remove participants.
- The system displays an over-capacity warning.
- The new capacity applies to future participation decisions.

A waiting-list feature is not part of the currently agreed requirement.

### 6.8 Withdrawal

An Ahbab may request withdrawal from a Takaza.

The withdrawal request is not automatically final.

The participation status changes to `WITHDRAWN` only after Admin confirms the withdrawal.

The system must record:

- Withdrawal request date and time.
- Confirmation date and time.
- Confirming Admin.
- Reason or remarks, where applicable.
- Previous participation status.
- Related Takaza.

Withdrawal must preserve the original participation history.

### 6.9 Removal

An authorised managing Admin may remove an Ahbab from a Takaza.

Removal requires justification from at least one other Admin.

The second Admin's justification is supporting input, not a veto.

The managing Admin retains the final decision.

The system must retain the decision history and notify the Ahbab with the reason.

`REMOVED` and `WITHDRAWN` are different outcomes and must not be combined.

### 6.10 Appeal

An Ahbab may appeal a removal decision.

The appeal is handled by an Admin with a higher or wider scope than the original managing Admin, according to the applicable governance rules.

An appeal does not automatically change the participation status.

If the appeal is successful, the authorised decision may overturn the removal and restore the Ahbab without requiring a new participation process.

The original removal record must remain in history.

If the appeal is rejected, the Ahbab may apply again through the normal participation process, including TAFAKUT where required.

### 6.11 Rejoining

Rejoining after `WITHDRAWN` or `REMOVED` requires a new linked participation record.

The previous participation record must remain unchanged.

The new participation record must retain a reference to the relevant previous record where applicable.

The exact reactivation and rejoining edge cases remain subject to the Open Decisions Register.

### 6.12 Transfer Between Takaza

A transfer between Takaza requires:

1. Consent from the relevant parties.
2. TAFAKUT for the receiving Takaza.
3. An Admin decision.
4. A new participation record for the receiving Takaza.
5. Preservation of the original participation record.

A transfer must not rewrite the historical participation record of the original Takaza.

---

## 7. Kawaif Management

### 7.1 Purpose

Kawaif is a separate Ahbab profile record for qualifications, experience and relevant capabilities.

Kawaif must not be treated as the same process as TAFAKUT.

Kawaif provides reference information that may support operational decisions and assessment.

### 7.2 Ahbab Submission

Ahbab may submit and edit Kawaif information.

New or amended information remains pending until verified by an authorised Admin.

The system must preserve the submitted information and its verification history.

### 7.3 Admin Maintenance

Admin may add or update Kawaif information when information is missing, incomplete or outdated.

Admin does not need to wait for Ahbab to submit an update.

Every Admin-entered or amended record must include its source or basis.

The system must preserve:

- Previous information.
- New information.
- Source or basis.
- Actor responsible.
- Date and time.
- Verification status.
- Verifying Admin.

### 7.4 Governance and Scope

Higher or wider-scope Admin controls:

- Kawaif categories.
- Qualification criteria.
- Eligibility requirements.
- Scoring or evaluation configuration, where applicable.
- Scope of applicable Kawaif information.

The detailed category and criteria structure must follow the relevant approved specification.

### 7.5 Relationship With TAFAKUT

Kawaif information may be used as reference during TAFAKUT.

Kawaif is not itself a TAFAKUT decision.

A Kawaif record must not automatically cause an Ahbab to pass or fail TAFAKUT unless the applicable approved criteria explicitly require that information.

---

## 8. TAFAKUT Management

### 8.1 Purpose

TAFAKUT is the formal assessment process used to evaluate an Ahbab against the applicable requirements.

TAFAKUT is separate from:

- Kawaif profile information.
- Takaza participation.
- Admin nomination.
- Amer appointment.
- System-generated activity or progress reports.

A TAFAKUT result supports an authorised decision but does not automatically activate participation or appointment.

### 8.2 Independent Assessors

Each TAFAKUT round requires exactly two independent Admin assessors.

The two assessors must complete their assessments independently.

Assessors must not see each other's submitted assessment before both have submitted.

Completed assessment submissions are immutable.

A reassessment must create a new assessment record rather than modifying a completed submission.

### 8.3 Decision Rules

The decision rules are:

| Assessor 1 | Assessor 2 | Result |
|---|---|---|
| PASS | PASS | PASS |
| FAIL | FAIL | FAIL |
| PASS | FAIL | Requires another round |
| FAIL | PASS | Requires another round |

When the two assessors disagree, a third Admin round is required.

Each additional round uses two new assessors who have not previously assessed that case.

The process may continue through multiple rounds until a decision is reached under the applicable rules.

### 8.4 Assessor Appointment and Replacement

The higher or wider-scope Admin appoints the assessors.

If an assessor becomes unable to continue, the assessor may be replaced without restarting the entire process.

Completed assessment work must remain preserved.

A replacement assessor must not overwrite the previous assessor's completed work.

### 8.5 TAFAKUT Forms

TAFAKUT forms may vary according to:

- TAFAKUT Type.
- Assessment Round.
- Applicable criteria.
- Required information.
- Relevant operational scope.

Higher or wider-scope Admin controls:

- TAFAKUT types.
- Form templates.
- Criteria.
- Questions.
- Question ordering.
- Input types.
- Additional questions.
- Form configuration.

Takaza Admin selects the applicable type and round but cannot independently edit the approved form template.

Every template change creates a new version.

Previous versions must remain available and linked to the relevant historical assessment.

### 8.6 Data Sources

TAFAKUT information may come from:

1. Automatically populated profile, activity or system information.
2. Information entered by Ahbab.
3. Assessor input.

The system must identify the source of each relevant information item.

Ahbab may review automatically populated information and request correction.

Ahbab must not directly overwrite source information.

An authorised Admin verifies corrections and updates the relevant source record.

The person verifying a source correction does not have to be one of the TAFAKUT assessors.

### 8.7 Ahbab Form Workflow

Ahbab may:

- Save a form as `DRAFT`.
- Resume a draft.
- Edit the draft before submission.
- Review the completed form before submission.

After submission, the form is locked.

Corrections must follow the Admin-controlled correction process.

For now, an opened but unsubmitted form cannot be cancelled directly by the assessor.

Admin may return a form to `DRAFT` with a recorded reason.

### 8.8 Assessor Submission

Assessors normally submit their assessments directly.

A completed assessment must remain immutable.

If an assessor has not completed the assessment, Admin may manage the case through the approved workflow.

A reassessment must be represented by a new assessment record.

### 8.9 Ahbab Access to Results

Ahbab may view the relevant comments and final decision after the TAFAKUT process is completed.

The current agreed design does not provide a reply or feedback workflow for these comments.

### 8.10 Notifications

The system must notify:

- Ahbab when a TAFAKUT form is opened.
- Ahbab when the final decision is made.
- Assessors when assigned to an assessment.

Notifications must use the user's language preference.

Automatic reminders and mandatory assessment deadlines are not part of the currently agreed requirement.

### 8.11 SUSPEND and ON_HOLD

`SUSPEND` and `ON_HOLD` must remain separate from account status.

- `SUSPEND` affects eligibility for participation.
- `ON_HOLD` pauses a process or decision.

Neither status automatically disables login or changes the Ahbab profile or account status.

### 8.12 Failure and Future Attempts

A `FAIL` result is not a permanent ban.

There is no agreed waiting period or maximum number of attempts.

A future TAFAKUT must follow the applicable assessment workflow and preserve previous results.

---

## 9. Amer and Supervisor Appointments

### 9.1 Amer Appointment

Each Main and Sub Takaza has its own Amer.

An Amer must already be a confirmed participant in the same Takaza before the appointment becomes effective.

If the selected person is not yet a confirmed participant, the normal participation process must be completed first.

The appointment may be made before the official Takaza start date.

The appointment does not need to wait until the Takaza becomes `ACTIVE`.

### 9.2 Appointment Consent

Both the authorised Admin and the selected candidate must consent to the appointment.

The system must record the appointment decision and relevant confirmation.

### 9.3 TAFAKUT for Amer

A separate TAFAKUT is not required if the candidate already has a valid prior TAFAKUT result.

Suitability may be included in a subsequent TAFAKUT round where appropriate.

This rule does not remove any other applicable eligibility requirement.

### 9.4 Appointment Duration

Amer appointment records must include:

- Appointed person.
- Takaza reference.
- Appointment start date.
- Appointment end date.
- Appointing Admin.
- Candidate consent.
- Appointment status.
- Relevant remarks and history.

The appointment normally aligns with the Takaza duration.

Admin may shorten, extend or end the appointment early.

Every change must be audited.

Changing an Amer appointment must not automatically change the Takaza's own dates or lifecycle status.

### 9.5 Appointment Expiry

If an Amer appointment expires while the Takaza remains `ACTIVE`:

- The appointment ends.
- The system notifies the relevant Admin.
- The Takaza remains `ACTIVE`.
- The system must not automatically cancel or complete the Takaza.

Admin must manage the subsequent appointment.

### 9.6 Amer Replacement

Admin may replace an Amer at any time before the appointment expires.

Replacement requires:

- A recorded reason.
- Justification from at least one other Admin.

The second Admin's justification is supporting input, not a veto.

The managing Admin retains the final decision.

Previous appointments must remain in history.

### 9.7 Supervisor Appointment

A Supervisor may be appointed provisionally by Admin.

The appointment requires consent from the Admin and selected person.

The temporary duration follows the Amer appointment principles unless a more specific approved rule is introduced.

Admin may shorten, extend or end the appointment early.

Every change must be audited.

Supervisor appointment must not change the Takaza's dates or lifecycle status.

The Supervisor's exact authority, scope and whether the Supervisor must already be a participant remain unresolved.

No additional authority must be inferred from the appointment alone.

Existing TAFAKUT information may be considered. A separate TAFAKUT is not required under the current provisional direction.


## 10. Percha Management

### 10.1 Purpose

Percha is an operational document generated for the relevant Takaza workflow.

Percha generation is linked to the Bayan Hidayat process.

Percha is not merely an internal Takaza identifier or Project Code.

### 10.2 Percha Generation

After Bayan Hidayat, the system generates the relevant Percha record.

The Percha must contain the applicable operational information, including:

- Percha number.
- Jemaah.
- Place.
- Halqah.
- Route.
- Destination.
- Bayan Hidayat date.
- Kharguzari information.
- Bayan Wapsi date.
- End activities.

The system must retain the relationship between Percha, Takaza and the relevant operational records.

### 10.3 Percha Amendment

An Admin may propose a Percha amendment.

A different Admin must approve the amendment.

The system must preserve:

- Original Percha information.
- Proposed changes.
- Reason for amendment.
- Admin proposing the amendment.
- Admin approving or rejecting it.
- Decision date and time.
- Amendment history.

If an amendment is rejected, the original Percha remains effective.

The Admin may submit a revised proposal.

A new proposal must not silently overwrite a previous rejected proposal.

### 10.4 Kharguzari

Kharguzari is part of the relevant Takaza operational reporting.

The required Kharguzari submission is one day before Bayan Wapsi.

The system must retain the relevant submission date and operational references.

### 10.5 Relationship With Other Reports

Percha, Kharguzari, Amer reports, Juhud Reports and Annual Archive are distinct information products.

They must not be merged into one generic report record without preserving their separate purposes and workflows.

---

## 11. Takaza Activities and Attendance

### 11.1 Flexible Activity Structure

Takaza activities must support different operational stages.

Activities are not restricted to a fixed number of events.

Depending on the Takaza, activities may take place:

- Before the official start date.
- During commencement.
- During the Takaza.
- Before the end date.
- On the end date.

The relevant Takaza Admin configures the required activities.

### 11.2 Activity Sources

An activity may use an existing Aktiviti Khidmat record or a newly created activity.

If an existing activity record is selected, the system should reuse its relevant details rather than creating an unnecessary duplicate.

Activity and attendance records must remain linked to the relevant Takaza.

### 11.3 Attendance and Remarks

Attendance and remarks are separate from Takaza lifecycle status.

An attendance record must not automatically change the Takaza's lifecycle status.

The system must preserve the activity date, participant information, attendance result and relevant remarks.

### 11.4 Activity Templates

Reusable activity templates may be considered.

The detailed template structure and governance remain open for further decision.

---

## 12. Takaza Completion and Amer Reporting

### 12.1 Completion Requirements

Takaza completion must follow the approved operational completion requirements.

The Amer's full report is required before the Takaza can be marked `COMPLETED`.

### 12.2 Overdue Amer Report

If the end activities have been completed but the Amer has not submitted the required full report:

- The report is marked `OVERDUE`.
- The Takaza must not automatically become `COMPLETED`.
- The Amer remains responsible for submission.
- The system must preserve the original report due date.

### 12.3 Extension

Admin may extend the report due date.

The system must preserve:

- Original due date.
- Extended due date.
- Extension reason.
- Admin responsible.
- Extension date and time.
- Previous extension history.

An extension does not automatically complete the Takaza.

The report remains `OVERDUE` until the required report is submitted.

### 12.4 Completion Decision

The Takaza may be marked `COMPLETED` only after the required completion conditions have been fulfilled and the authorised process has confirmed completion.

The system must preserve the completion decision and relevant history.

---

## 13. Rekod Amal and Reporting

### 13.1 Purpose

Rekod Amal is the record of relevant activities and efforts.

It must remain distinguishable from:

- Takaza participation.
- Takaza attendance.
- Percha.
- Amer reports.
- Juhud Reports.
- Annual Archive summaries.

### 13.2 Individual Records

The system must preserve relevant information for each Rekod Amal record, including:

- Ahbab reference.
- Activity classification.
- Related Takaza, where applicable.
- Activity date or reporting period.
- Description.
- Supporting information or attachment reference, where applicable.
- Created and updated information.
- Verification information, where applicable.
- Audit history.

### 13.3 Individual Kharguzari

An Ahbab may access and submit their own individual Kharguzari.

An authorised Admin may access Kharguzari within the permitted scope.

Amer may access the relevant Kharguzari information for preparing the Amer report.

Original submitted content must remain immutable.

Follow-up comments must be stored separately.

The author may edit their own follow-up comment according to the applicable rules.

### 13.4 Juhud Reports

Juhud Reports are a separate publication module.

They must not be treated as the same thing as:

- Takaza operational reports.
- Amer reports.
- Kharguzari.
- Annual Archive.

The publication workflow and access permissions must follow the relevant V2 specification.

---

## 14. Annual Archive

### 14.1 Purpose

Annual Archive preserves historical Takaza information and annual operational summaries.

It is a historical reference module and must not replace the operational Takaza records.

### 14.2 Admin Access

Admin may view historical Annual Archive records within the permitted scope, including previous years.

Admin access is governed by country and organizational scope.

### 14.3 Ahbab Access

Ahbab may view archive information only for Takaza in which the Ahbab participated.

This access remains available even when the relevant Takaza or participation is no longer active.

Ahbab must not access another Ahbab's restricted individual information.

### 14.4 Archive Statistics

Annual Archive should support relevant statistics, including:

- Number of Main Takaza.
- Number of Sub Takaza.
- Number of participants.
- Participation status counts.
- Takaza counts by year.
- Takaza counts by lifecycle status.

Statistics must be based on the relevant historical records and must not silently change because of later operational updates.

### 14.5 Filters

The archive should support:

- Country.
- Year.
- Takaza status.
- Other approved filters.

The Main Takaza filter remains subject to the Open Decisions Register.

### 14.6 Export

PDF and Excel export are not part of the currently agreed Annual Archive requirement.

### 14.7 Automatic Archive

Annual Archive is automatic by default.

The system should preserve the relevant annual records without requiring Admin to manually recreate every operational record.

Admin may add additional information where permitted.

### 14.8 Corrections

The correction policy for Annual Archive remains unresolved.

Any approved correction process must:

- Preserve the original information.
- Record the corrected information.
- Identify the actor.
- Record date and time.
- Retain the reason or basis.
- Avoid silently changing original operational history.

### 14.9 Admin Notes and Annual Summary

Admin Notes and Annual Summary are separate from the original operational records.

Annual Summary may include:

- Overall country summary.
- Summary for each Main Takaza.
- Summary for each Sub Takaza.
- Relevant statistics.
- Admin commentary.

Annual Summary is text-based under the current agreed direction. Attachments are not included.

### 14.10 Annual Summary Status

Annual Summary supports:

| Status | Meaning |
|---|---|
| `DRAFT` | Summary is being prepared |
| `INTERIM` | Summary is issued while operations remain ongoing |
| `FINAL` | Summary is finalised |

Annual Summary status is independent of Takaza lifecycle status.

A summary may be prepared after completion or issued as an interim summary while a Takaza remains active.

---

## 15. Notifications

Notifications must use the language preference of the relevant user.

The system must send notifications for the events specified in the relevant module workflows.

Examples include:

- Participation confirmation requests.
- Participation decisions.
- Withdrawal or removal decisions.
- Appeal decisions.
- TAFAKUT form opening.
- TAFAKUT final decisions.
- Assessor assignments.
- Amer and Supervisor appointments.
- Percha amendment decisions.
- Relevant operational events.

Automatic reminders and mandatory deadlines must not be introduced unless approved in the relevant specification.

Notification delivery must not be treated as proof that a user has read or accepted the notification.

---

## 16. Conceptual Data Domains

This section describes logical data domains. It is not a final database schema.

The actual table structure must be designed and reviewed separately.

### 16.1 Identity and Access

Relevant entities include:

- User Account.
- Email Identity.
- Authentication Session.
- User Role.
- Access Scope.
- Audit Event.

Authentication and account lifecycle rules are governed by `v2/docs/Auth.md`.

### 16.2 Ahbab and Profile

Relevant entities include:

- Ahbab Profile.
- Kawaif Record.
- Kawaif Verification.
- Profile Change History.
- Organization Relationship.

### 16.3 Organization

Relevant entities include:

- Country.
- Organization Unit.
- Organization Relationship.
- Chief Admin Assignment.
- Deputy Assignment.
- Cross-Organization Support Assignment.

The exact organization hierarchy and unresolved governance rules remain subject to JMV2002 and the Open Decisions Register.

### 16.4 Syukbah

Relevant entities include:

- Syukbah.
- Syukbah Administration.
- Syukbah Deputy Assignment.
- Syukbah Moderator.
- Syukbah Discussion.
- Discussion Comment.
- Discussion Audit History.

Syukbah rules are governed by JMV2003.

### 16.5 Takaza

Relevant entities include:

- Takaza.
- Takaza Configuration.
- Takaza Lifecycle History.
- Takaza Relationship.
- Takaza Participation.
- Participation Method.
- Participation Decision.
- Participation History.
- Withdrawal Request.
- Removal Decision.
- Appeal.

The maximum Takaza relationship depth is two levels: Main and Sub.

### 16.6 Kawaif and TAFAKUT

Relevant entities include:

- Kawaif Category.
- Kawaif Record.
- Kawaif Verification.
- TAFAKUT Type.
- TAFAKUT Template.
- TAFAKUT Template Version.
- TAFAKUT Criteria.
- TAFAKUT Round.
- TAFAKUT Assessor Assignment.
- TAFAKUT Assessment.
- TAFAKUT Decision.

### 16.7 Appointments

Relevant entities include:

- Amer Appointment.
- Supervisor Appointment.
- Appointment Consent.
- Appointment History.
- Appointment Extension.
- Appointment Termination.

### 16.8 Percha and Activities

Relevant entities include:

- Percha.
- Percha Amendment Proposal.
- Percha Amendment Decision.
- Takaza Activity.
- Activity Attendance.
- Kharguzari.
- Amer Report.
- Activity History.

### 16.9 Reporting and Archive

Relevant entities include:

- Juhud Report.
- Annual Archive.
- Annual Statistics.
- Admin Note.
- Annual Summary.
- Annual Summary Version.

These conceptual domains do not prescribe the final number of database tables.

---

## 17. Data Integrity and Audit Requirements

The system must preserve data integrity across all operational domains.

At minimum:

1. Every important record must have a stable identity.
2. Historical relationships must remain traceable.
3. A participation record must identify the relevant Ahbab and Takaza.
4. Main and Sub Takaza relationships must be validated.
5. Participation status must not be confused with account status.
6. Appointment status must not be confused with Takaza status.
7. TAFAKUT assessments must preserve assessor identity and submission history.
8. Completed assessments must not be silently edited.
9. Percha amendment proposals and decisions must remain traceable.
10. Annual Archive corrections must preserve the original information.
11. Important Admin actions must create audit records.
12. Access control must be enforced at the API and data-access layers, not only in the user interface.

---

## 18. Migration and Compatibility Principles

The realignment must preserve existing data and working functionality wherever practical.

The following principles apply:

- Do not delete existing production data.
- Do not replace existing IDs unnecessarily.
- Do not modify historical migration files.
- Introduce new migrations only after the target schema and data mapping have been reviewed.
- Prefer incremental migration.
- Validate foreign-key relationships before retiring old structures.
- Preserve existing user submissions and review history.
- Preserve historical participation and audit information.
- Do not assume old V1 concepts map directly to V2 tables.
- Do not deploy unverified schema changes to production.

Existing V2 migrations and database state must be treated as implementation evidence.

The current implementation status must be checked against `v2/docs/V2_IMPLEMENTATION_STATUS.md`.

This design document does not authorise direct changes to the live database.

---

## 19. Development and Verification Sequence

The following sequence is a logical planning guide, not a declaration that any feature has been implemented.

| Step | Work area | Objective |
|---|---|---|
| 1 | Identity and Access | Establish authentication and access control |
| 2 | Ahbab Management | Establish profile and account relationships |
| 3 | Organization Management | Establish country and organization governance |
| 4 | Syukbah Management | Establish Syukbah administration and discussion |
| 5 | Takaza Management | Establish Main and Sub Takaza |
| 6 | Participation Management | Establish participation methods and lifecycle |
| 7 | Kawaif | Establish qualification and experience records |
| 8 | TAFAKUT | Establish forms, assessors and decision workflow |
| 9 | Appointment Management | Establish Amer and Supervisor appointments |
| 10 | Percha | Establish generation and amendment workflow |
| 11 | Activities | Establish Takaza events and attendance |
| 12 | Reporting | Establish Kharguzari and Amer reporting |
| 13 | Annual Archive | Establish annual records and summaries |
| 14 | Audit and Notifications | Verify traceability and user notifications |
| 15 | Integration Testing | Verify end-to-end operational workflows |
| 16 | Production Readiness | Verify migration, security and deployment readiness |

Implementation must follow the approved specifications and the verified implementation status.

---

## 20. Open Design Decisions

The following matters remain unresolved and must be tracked in `v2/docs/OPEN_DECISIONS_REGISTER.md`.

1. Markaz Negara governance: Amer Negara as final authority OR Ahli Syura with Faisalah as final authority.
2. Final country organization hierarchy.
3. Approval requirements for additional Country Syukbah.
4. Supervisor authority, scope and participant requirement.
5. Direct Assignment consent and TAFAKUT requirements.
6. Full Case Management workflow.
7. Annual Archive correction policy.
8. Exceptional changes after Takaza completion.
9. Chief Admin and Deputy appointment process.
10. Reactivation and rejoining edge cases.
11. Syukbah Deputy and acting delegation.
12. Admin Syukbah eligibility.
13. Annual Archive Main Takaza filter.
14. Activity templates.

No unresolved item should be treated as an approved requirement without an explicit decision.

---

## 21. Development Working Principles

All development work must follow these principles:

1. Preserve the separation between V1 and V2.
2. Treat V2 documentation as the authority for V2 business rules.
3. Inspect actual source code before proposing implementation changes.
4. Verify database state before proposing migrations.
5. Do not modify historical migrations.
6. Do not claim implementation or deployment without evidence.
7. Use incremental development and testing.
8. Preserve existing data and working functionality.
9. Keep implementation status separate from design status.
10. Record unresolved decisions in the official Open Decisions Register.
11. Keep this design document separate from README files.
12. Do not introduce new product terminology or unrelated project concepts without approval.

## 22. Document Maintenance

This document is maintained as a consolidated system design reference.

When an approved V2 specification changes:

1. Identify the affected sections in this document.
2. Update the relevant design references.
3. Preserve consistency with the authoritative specification.
4. Update the document version and date.
5. Do not silently change unresolved decisions into approved requirements.

The implementation status must always be maintained in `v2/docs/V2_IMPLEMENTATION_STATUS.md`.

The unresolved decisions must always be maintained in `v2/docs/OPEN_DECISIONS_REGISTER.md`.

---

**Document Status:** Consolidated V2 Design Reference  
**Version:** 2.0  
**Last Updated:** 28 November 2026

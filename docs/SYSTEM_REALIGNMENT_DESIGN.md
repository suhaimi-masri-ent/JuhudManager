
# JuhudManager – System Realignment Design

**Document:** System Realignment Design  
**Version:** 2.2  
**Branch:** `integration/v1-v2-separation-develop`  
**Status:** Consolidated V2 Design Reference — Reconciled with Current V2 Baselines  
**Last Updated:** 28 November 2026

---

## 1. Purpose

This document describes the target system structure and operational design for JuhudManager V2.

The realignment covers:

1. Ahbab accounts and profiles.
2. Organization structure and governance.
3. Takaza management and Main/Sub relationships.
4. Takaza participation and participant lifecycle.
5. KAWAIF qualification and experience records.
6. TAFAKUT assessment.
7. Amer and Supervisor appointments.
8. Percha and Takaza operational activities.
9. Rekod Amal and reporting.
10. Annual Archive.
11. Notifications, audit and administrative controls.

This is a cross-domain design reference. It does not authorize database migrations, production changes or implementation claims.

All implementation must follow the applicable V2 documentation and verified source code, tests and database state.

## 2. Document Authority and Reconciliation

This document is not an independent source of approval. The V2 documentation authority is:

1. `v2/docs/MASTER_DECISION_REGISTER.md` — central record of approved and provisional V2 decisions.
2. `v2/docs/OPEN_DECISIONS_REGISTER.md` — unresolved decisions and deferred matters.
3. `v2/docs/MODULE_REQUIREMENTS.md` — consolidated functional requirements.
4. Relevant detailed module specifications — module-specific workflows and behaviour.
5. `v2/docs/UAC_MATRIX.md` — access-control baseline.
6. `v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md` — dashboard and navigation behaviour.
7. `v2/docs/V2_IMPLEMENTATION_STATUS.md` — implementation status supported by verified code and test evidence.
8. This document — cross-domain concepts and relationships; it does not override the sources above.

Only decisions marked `DECIDED` in the Master Decision Register may be treated as final. Provisional rules must retain their provisional status. Items marked `OPEN`, `PENDING REVIEW` or `ON HOLD` must not be presented as settled requirements.

If authoritative documents appear to conflict, the conflict must be recorded and resolved. Developers must not silently choose an interpretation.

Relevant documents:

- `v2/docs/MASTER_DECISION_REGISTER.md`
- `v2/docs/MODULE_REQUIREMENTS.md`
- `v2/docs/OPEN_DECISIONS_REGISTER.md`
- `v2/docs/Auth.md`
- `v2/docs/UAC_MATRIX.md`
- `v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md`
- `v2/docs/JMV2001-Ahbab-Profile-Account-Management.md`
- `v2/docs/JMV2002-Organization-Structure-Governance.md`
- `v2/docs/JMV2003-Syukbah-Management.md`
- `v2/docs/JMV2004-Takaza-Management.md`
- `v2/docs/V2_IMPLEMENTATION_STATUS.md`

| Document | Responsibility |
|---|---|
| Master Decision Register | Approved and provisional V2 decisions |
| Module Requirements | Consolidated functional requirements |
| Open Decisions Register | Unresolved decisions and deferred workflows |
| Auth | Authentication and account lifecycle |
| JMV2001 | Ahbab profile and account management |
| JMV2002 | Organization structure and governance |
| JMV2003 | Syukbah management |
| JMV2004 | Takaza and operational workflows |
| UAC Matrix | User access control and permissions |
| Dashboard Navigation Specification | Navigation and dashboard behaviour |
| V2 Implementation Status | Verified implementation status |
| System Realignment Design | Cross-domain concepts and relationships |

This document must not independently redefine detailed rules governed by the relevant V2 specification.

## 3. Core Design Principles

### 3.1 Authentication and Password Reset

Password Reset / Forgot Password is a REQUIRED V2 feature but is NOT YET IMPLEMENTED.

This section describes the required target behaviour only. It is not evidence that the feature exists in the current application.

Required direction:

- Password Reset uses the user's registered and verified email address.
- OTP is 6 digits, valid for 5 minutes, with a maximum of 5 attempts and a 60-second resend cooldown.
- After successful verification, the user may set a new password.
- Successful reset must revoke all existing sessions and tokens so they cannot be reused.
- The system must record an audit event and send a security notification.
- If the user no longer has access to the verified email, recovery must use a separate Admin-assisted recovery process. It must not be represented as ordinary Password Reset.
- Password Reset, OTP verification or email change must not automatically reactivate a `DISABLED` or `SUSPENDED` account.
- Password Reset must not change account status, assigned roles, Ahbab profile information, organization membership or Takaza participation.

### 3.2 Separate Account, Profile, Role and Participation

The system must distinguish between:

- User account status.
- Ahbab profile information.
- Assigned system roles.
- Organization membership or relationships.
- Takaza participation.
- Appointment or delegated responsibility.
- Activity and assessment records.

These are separate information dimensions. Changing one must not automatically change another unless an explicitly approved workflow requires it.

Examples:

- Disabling an account does not delete historical participation.
- Being an Ahbab does not automatically make a person an Admin.
- Being appointed Amer does not automatically create Takaza participation.
- Passing TAFAKUT does not automatically activate participation.
- Being a participant does not automatically grant administrative permissions.

### 3.3 Preserve Historical Information

Important operational records must remain traceable.

Preserve original and amended information, responsible actor, date and time, reason or justification where required, previous and resulting status, relevant approval and references to related records.

Historical records must not be silently overwritten or deleted.

### 3.4 Human Decisions and System Processing

The system may automate record creation, status calculation, notifications and workflow routing.

Automation must not replace an explicitly required human decision. A system-generated recommendation or preliminary result must not be treated as final approval where Admin approval is required.

### 3.5 Configuration and Extensibility

The system should support controlled configuration where operational requirements differ between countries, organizations or Takaza.

Configuration must not create uncontrolled differences in core business rules. Changes must preserve historical versions where previous records depend on them.

### 3.6 Auditability

Important auditable actions include:

- Account and role changes.
- Organization assignments.
- Takaza creation and lifecycle changes.
- Participation decisions.
- KAWAIF updates and verification.
- TAFAKUT assessments and final decisions.
- Managing Admin decisions that differ from the assessment outcome.
- Mandatory justifications associated with final Admin decisions.
- Amer and Supervisor appointments.
- Percha amendments.
- Activity and attendance records.
- Withdrawal, removal and appeal decisions.
- Archive amendments.

## 4. Main System Domains

JuhudManager V2 is organised around these logical domains:

| Domain | Main responsibility |
|---|---|
| Identity and Access | Authentication, accounts, roles and access control |
| Ahbab Management | Ahbab profile and account relationships |
| Organization Management | Country and organization structure |
| Syukbah Management | Syukbah administration and discussion |
| Takaza Management | Main Takaza, Sub Takaza and lifecycle |
| Participation Management | Ahbab participation and history |
| KAWAIF Management | Qualification and experience information |
| TAFAKUT Management | Structured assessment and decisions |
| Appointment Management | Amer and Supervisor appointments |
| Percha Management | Percha generation and amendment |
| Activity Management | Takaza events, attendance and activity records |
| Reporting | Operational and Takaza reports |
| Annual Archive | Historical annual records and summaries |
| Notification Management | User-language notifications |
| Audit Management | Historical actions and accountability |

These are logical domains. They do not require a one-to-one relationship with database tables or dashboard pages.

## 5. Takaza Management

### 5.1 Takaza as an Operational Entity

Each Takaza has its own identity, configuration, lifecycle and history.

The system must distinguish between Takaza definition, registration, release, participation, activities, reporting, completion and archival.

### 5.2 Main Takaza and Sub Takaza

The V2 model supports a maximum of two levels:

1. Main Takaza.
2. Sub Takaza.

A Main Takaza may have multiple Sub Takaza. A Sub Takaza cannot have another child Takaza.

Main and Sub Takaza have independent lifecycle records. A status change in one must not automatically change the other.

Main and Sub Takaza must belong to the same country. Each has its own appointed Amer.

### 5.3 Takaza Lifecycle

The lifecycle statuses are:

| Status | Meaning |
|---|---|
| `DRAFT` | Takaza is being prepared |
| `RELEASED` | Takaza has been released for the relevant operational process |
| `ACTIVE` | Takaza is operational |
| `ON_HOLD` | Takaza is temporarily paused |
| `COMPLETED` | Takaza has been completed |
| `CANCELLED` | Takaza has been cancelled |

Lifecycle status must not be confused with participation, appointment, event, attendance, TAFAKUT or Annual Summary status.

### 5.4 Takaza Administration

An authorized Takaza Admin may create and manage Main and Sub Takaza within the Admin's permitted scope.

Ordinary Takaza operations do not require SUPER_ADMIN approval for every action. Incomplete setup should be shown through appropriate warnings.

The system must enforce country and organizational scope.

### 5.5 Takaza Start and End Dates

The proposed start date is not automatically the official locked date.

The Amer Jemaah may agree with the proposed date or suggest another date while it remains under discussion. After the Amer agrees, Admin confirms and locks the official start date.

Once locked, the Amer cannot change the official date through the normal process.

Takaza supports a planned or fixed end date. Admin may amend it with recorded history or end a Takaza early with a reason.

Automatic completion at the end date is permitted only when all required completion conditions are satisfied.

Exceptional changes after completion remain subject to the Open Decisions Register.

## 6. Takaza Participation Management

### 6.1 Separate Jemaah Membership and Takaza Participation

Jemaah membership and Takaza participation are separate concepts.

An Ahbab may belong to a Jemaah without participating in every Takaza and may participate in multiple Takaza subject to applicable requirements.

The system maintains an individual participation record for each Ahbab and relevant Takaza.

V1 Project Member records map to V2 Takaza Participation where relevant. V2 must not introduce a separate Project Member entity that duplicates Takaza Participation.

### 6.2 Participation Methods

The configurable methods include:

- `AUTOMATIC_INCLUSION`
- `VOLUNTARY_APPLICATION`
- `ADMIN_NOMINATION`
- `DIRECT_ASSIGNMENT`

A Takaza may use one or more methods, and methods may be combined.

Admin may configure conditions for each method.

The consent and TAFAKUT requirements for `DIRECT_ASSIGNMENT` remain unresolved. It must not be assumed to bypass normal safeguards.

### 6.3 Participation Confirmation

For `AUTOMATIC_INCLUSION`, the system creates a candidate participation record with status `PENDING_ADMIN_CONFIRMATION`.

The candidate does not become a confirmed participant until Admin confirms participation.

This also applies to existing Jemaah members considered for automatic inclusion during Main Takaza formation.

When an Ahbab joins a Jemaah after a Takaza becomes `ACTIVE`, the system may create a candidate record for Admin confirmation.

Automatic candidate creation must never be treated as automatic participant activation.

### 6.4 Voluntary Application and Admin Nomination

The system records the relevant application or nomination.

For Sub Takaza, Ahbab consent is required. TAFAKUT applies where required by the relevant eligibility criteria.

Passing TAFAKUT does not automatically approve participation. The authorized Admin makes the final participation decision.

### 6.5 Participation History

Each participation record retains its own history.

The system distinguishes pending confirmation, confirmed participation, active participation, withdrawal, removal and rejoining through a new participation process.

A new record must not silently reactivate or overwrite a previous withdrawn or removed record.

### 6.6 Configuration Changes

After a Takaza reaches `RELEASED` or `ACTIVE`, participation configuration changes apply only to:

- New participation candidates.
- Applications that have not yet been decided.

Changes must not retroactively rewrite the method or approval requirements of existing confirmed participants.

Historical configuration must remain traceable.

### 6.7 Capacity Management

Admin may change participation capacity at any time.

If capacity is reduced below the existing participant count:

- Existing participants remain participants.
- No participant is automatically removed.
- The system displays an over-capacity warning.
- The new capacity applies to future participation decisions.

A waiting-list feature is not part of the current baseline.

### 6.8 Withdrawal

An Ahbab may request withdrawal from a Takaza.

The participation status becomes `WITHDRAWN` after Admin records confirmation.

Admin's role is to acknowledge and record a valid withdrawal request. Admin must not block or veto a valid request. The confirmation step records operational completion and must not be used to deny the Ahbab's right to withdraw.

Record:

- Withdrawal request date and time.
- Confirmation date and time.
- Confirming Admin.
- Reason or remarks, where applicable.
- Previous participation status.
- Related Takaza.

Withdrawal must preserve the original participation history.

### 6.9 Removal

An authorized managing Admin may remove an Ahbab from a Takaza.

Removal requires justification from at least one other Admin. The second Admin's justification is supporting input, not a veto. The managing Admin retains the final decision.

The system retains the decision history and notifies the Ahbab with the reason.

`REMOVED` and `WITHDRAWN` are different outcomes.

### 6.10 Appeal

An Ahbab may appeal a removal decision.

The appeal is handled by an Admin with higher or wider scope than the original managing Admin, according to applicable governance rules.

An appeal does not automatically change participation status.

If successful, the authorized decision may overturn removal and restore the Ahbab without requiring a new participation process. The original removal record remains in history.

If rejected, the Ahbab may apply again through the normal participation process, including TAFAKUT where required.

### 6.11 Rejoining

Rejoining after `WITHDRAWN` or `REMOVED` requires a new linked participation record.

The previous record remains unchanged. The new record references the previous record where applicable.

Exact reactivation and rejoining edge cases remain subject to the Open Decisions Register.

### 6.12 Transfer Between Takaza

A transfer requires:

1. Consent from the relevant parties.
2. TAFAKUT for the receiving Takaza.
3. An Admin decision.
4. A new participation record for the receiving Takaza.
5. Preservation of the original participation record.

A transfer must not rewrite the original Takaza participation history.

## 7. KAWAIF Management

### 7.1 Purpose

KAWAIF is a separate Ahbab profile record for qualifications, experience and relevant capabilities.

It is reference information that may support operational decisions and TAFAKUT. It is not itself a TAFAKUT decision.

### 7.2 Ahbab Submission

Ahbab may submit and edit KAWAIF information.

New or amended information remains pending until verified by an authorized Admin. Submitted information and verification history must be preserved.

### 7.3 Admin Maintenance

Admin may add or update missing, incomplete or outdated KAWAIF information without waiting for Ahbab to submit an update.

Every Admin-entered or amended record must include its source or basis.

Preserve previous and new information, source, actor, date and time, verification status and verifying Admin.

### 7.4 Governance and Scope

Higher or wider-scope Admin controls:

- KAWAIF categories.
- Qualification criteria.
- Eligibility requirements.
- Scoring or evaluation configuration, where applicable.
- Scope of applicable KAWAIF information.

Detailed categories and criteria follow the relevant approved specification.

### 7.5 Relationship With TAFAKUT

KAWAIF may be used as reference during TAFAKUT.

A KAWAIF record must not automatically cause an Ahbab to pass or fail unless applicable approved criteria explicitly require that information.

## 8. TAFAKUT Management

### 8.1 Purpose

TAFAKUT is the formal assessment process used to evaluate an Ahbab against applicable requirements.

It is separate from KAWAIF, Takaza participation, Admin nomination, Amer appointment and system-generated activity reports.

A TAFAKUT result supports an authorized decision but does not automatically activate participation or appointment.

### 8.2 Independent Assessors

Each TAFAKUT assessment round requires exactly two independent Admin assessors.

Assessors work independently and must not see each other's submitted assessment before both have submitted.

Completed submissions are immutable. Reassessment creates a new assessment record.

An assessor must not edit, replace or overwrite another assessor's submitted assessment.

### 8.3 Initial Assessment Decision Rules

The initial two-assessor decision matrix is:

| Assessor 1 | Assessor 2 | Assessment Outcome |
|---|---|---|
| PASS | PASS | PASS |
| FAIL | FAIL | FAIL |
| PASS | FAIL | Third Admin required |
| FAIL | PASS | Third Admin required |

Rules:

- PASS + PASS produces an assessment outcome of PASS.
- FAIL + FAIL produces an assessment outcome of FAIL.
- Any disagreement between the two assessors requires a third Admin.
- The third Admin is appointed by the authorized higher or wider-scope Admin.
- The third Admin's involvement must be recorded as part of the assessment decision history.

The disagreement process must not be incorrectly treated as permission for either original assessor to change their submitted assessment.

### 8.4 Additional Assessment Rounds

Where an additional assessment round is required:

- Exactly two assessors are assigned for that additional round.
- Both assessors must be new to the candidate's previous assessment rounds.
- An assessor who has previously assessed the same candidate must not be reused in a subsequent additional round.
- The higher or wider-scope Admin appoints the assessors.
- Previous assessments and decisions remain preserved.
- The process may continue through additional rounds under the applicable rules.
- There is no fixed maximum number of assessment rounds.

The third Admin required to resolve an initial disagreement and the two new assessors assigned to a subsequent additional round are distinct workflow requirements. They must not be merged or confused.

### 8.5 Final Managing Admin Decision

The managing Admin may make a final decision that differs from the assessment majority.

This authority is a separate decision layer from the independent assessor process.

Requirements:

- The managing Admin must have authority within the applicable administrative scope.
- The managing Admin may decide differently from the assessment majority.
- A written or recorded justification is mandatory whenever the final decision differs from the assessment majority.
- The final decision must be explicitly recorded as the managing Admin's decision.
- The justification must be linked to the relevant TAFAKUT case and assessment records.
- The system must retain the original assessment submissions and their outcomes.
- The final Admin decision must not overwrite, alter or delete any assessor submission.
- The decision history must identify the responsible managing Admin and the date/time of the decision.

The existence of this final decision authority does not remove the requirement for independent assessors, the third Admin disagreement process or new assessors in additional rounds.

### 8.6 Assessor Appointment and Replacement

Higher or wider-scope Admin appoints assessors.

If an assessor cannot continue, the assessor may be replaced without restarting the entire process. Completed assessment work remains preserved and must not be overwritten.

A replacement must not invalidate completed independent assessment work unless a separate authorized decision explicitly requires otherwise.

### 8.7 TAFAKUT Forms

Forms may vary by TAFAKUT Type, assessment Round, criteria, required information and operational scope.

Higher or wider-scope Admin controls:

- TAFAKUT types.
- Form templates and versions.
- Criteria and questions.
- Question ordering and input types.
- Additional questions and form configuration.

Takaza Admin selects the applicable type and round but cannot independently edit the approved template.

Every template change creates a new version. Previous versions remain available and linked to historical assessments.

### 8.8 Data Sources

TAFAKUT information may come from:

1. Automatically populated profile, activity or system information.
2. Information entered by Ahbab.
3. Assessor input.

The system identifies the source of each relevant item.

Ahbab may review automatically populated information and request correction but must not directly overwrite source information.

An authorized Admin verifies corrections and updates the source record. The verifier need not be a TAFAKUT assessor.

### 8.9 Ahbab Form Workflow

Ahbab may save a draft, resume and edit before submission.

After submission, the form is locked. Corrections must go through Admin.

An Admin may return a form to `DRAFT` with a recorded reason.

### 8.10 Assessor Submission

Assessors submit their own assessments.

Completed submissions are immutable. An opened but unsubmitted form is not cancelled through an assumed workflow; any permitted Admin return to draft must be recorded.

### 8.11 Ahbab Access to Results

Ahbab may view relevant comments and the final decision after the assessment is complete.

A reply or feedback workflow is not included in the current baseline.

### 8.12 Notifications

Required notifications include:

- Ahbab when a form is opened.
- Assessors when assigned.
- Ahbab when the final decision is made.

Notifications use the user's selected language.

Automatic reminders and mandatory deadlines are not included unless separately approved.

### 8.13 SUSPEND and ON_HOLD

`SUSPEND` and `ON_HOLD` are separate from account status.

- `SUSPEND` affects eligibility for participation.
- `ON_HOLD` pauses a process or decision.

Neither status automatically disables login or changes the Ahbab profile or account status.

### 8.14 Failure and Future Attempts

A `FAIL` result is not a permanent ban.

No fixed waiting period or attempt limit is imposed by this baseline. Future assessment follows the applicable eligibility and Admin process.

## 9. Amer and Supervisor Appointments

### 9.1 Amer Appointment

Every Main and Sub Takaza has its own Amer.

The Amer candidate must already be a confirmed participant in the same Takaza before the appointment becomes effective.

If the candidate is not yet a confirmed participant, the normal participation process must be completed first.

Appointment may occur before the official Takaza start date and does not need to wait until the Takaza becomes `ACTIVE`.

### 9.2 Appointment Consent

Both the authorized Admin and selected candidate must consent.

The system records the appointment decision and relevant confirmation.

### 9.3 TAFAKUT for Amer

A separate TAFAKUT is not required if the candidate has a valid prior TAFAKUT result.

Suitability may be included in a subsequent TAFAKUT round where appropriate. This does not remove other applicable eligibility requirements.

### 9.4 Appointment Duration

Amer appointment records include:

- Appointed person.
- Takaza reference.
- Appointment start and end dates.
- Appointing Admin.
- Candidate consent.
- Appointment status.
- Relevant remarks and history.

The appointment normally aligns with the Takaza duration.

Admin may shorten, extend or end the appointment early. Every change must be audited.

Changing an Amer appointment must not automatically change Takaza dates or lifecycle status.

### 9.5 Appointment Expiry

If an Amer appointment expires while the Takaza remains `ACTIVE`:

- The appointment ends.
- The system notifies the relevant Admin.
- The Takaza remains `ACTIVE`.
- The system does not automatically cancel or complete the Takaza.

Admin manages the subsequent appointment.

### 9.6 Amer Replacement

Admin may replace an Amer before the appointment expires.

Replacement requires a recorded reason and justification from at least one other Admin.

The second Admin's justification is supporting input, not a veto. The managing Admin retains the final decision.

Previous appointments remain in history.

### 9.7 Supervisor Appointment

Supervisor appointment is PROVISIONAL.

Current provisional direction:

- Admin and selected person must consent.
- Appointment duration temporarily follows Amer appointment principles.
- Admin may shorten, extend or end the appointment early.
- Appointment changes must be audited.
- Appointment does not change Takaza dates or lifecycle status.
- Existing TAFAKUT information may be considered.
- A separate TAFAKUT is not required under the current provisional direction.

The following matters remain OPEN in the Open Decisions Register:

- Whether a Supervisor must already be a confirmed participant in the relevant Takaza.
- Supervisor operational responsibilities and authority.
- Whether the Supervisor may approve or reject decisions.
- Whether the Supervisor may access participant records or reports.
- Whether the Supervisor may act on behalf of the Amer or Admin.
- Whether specific delegation or additional eligibility / TAFAKUT requirements apply.

Until these matters are decided, no special approval, administrative, delegation or access authority may be inferred from the Supervisor title or appointment.

## 10. Percha Management

### 10.1 Purpose

Percha is an operational document generated for the relevant Takaza workflow after Bayan Hidayat.

It is not merely an internal Takaza identifier or Project Code.

### 10.2 Percha Generation

After Bayan Hidayat, the system generates the relevant Percha record.

Applicable information includes:

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

The Percha remains linked to the Takaza and relevant operational records.

### 10.3 Percha Amendment

An Admin may propose an amendment. A different Admin must approve or reject it.

Preserve original information, proposed changes, reason, proposing Admin, approving or rejecting Admin, decision date and time, and amendment history.

If rejected, the original Percha remains effective. A revised proposal may be submitted without overwriting the rejected proposal.

### 10.4 Kharguzari

The required Kharguzari submission is one day before Bayan Wapsi.

The system retains the submission date and operational references.

### 10.5 Relationship With Other Reports

Percha, Kharguzari, Amer reports, Juhud Reports and Annual Archive are distinct information products.

They must not be merged into one generic report record without preserving their separate purposes and workflows.

## 11. Takaza Activities and Attendance

### 11.1 Flexible Activity Structure

Activities are not restricted to a fixed number or sequence.

Depending on the Takaza, activities may take place:

- Before the official start date.
- During commencement.
- During the Takaza.
- Before the end date.
- On the end date.

The relevant Takaza Admin configures the required activities.

### 11.2 Activity Sources

An activity may reuse an existing Aktiviti Khidmat record or be newly created.

If an existing activity is selected, reuse its relevant details rather than creating an unnecessary duplicate.

Activity and attendance records remain linked to the relevant Takaza.

### 11.3 Attendance and Remarks

Attendance and remarks are separate from Takaza lifecycle status.

Attendance must not automatically change the Takaza lifecycle.

Preserve activity date, participant information, attendance result and relevant remarks.

### 11.4 Activity Templates

Reusable activity templates may be considered.

Their detailed structure and governance remain OPEN in the Open Decisions Register.

## 12. Takaza Completion and Amer Reporting

### 12.1 Completion Requirements

The Amer's full report is required before the Takaza can be marked `COMPLETED`.

### 12.2 Overdue Amer Report

If end activities are complete but the Amer has not submitted the required full report:

- The report is marked `OVERDUE`.
- The Takaza must not automatically become `COMPLETED`.
- The Amer remains responsible for submission.
- The original report due date is preserved.

### 12.3 Extension

Admin may extend the report due date.

Preserve the original and extended due dates, extension reason, responsible Admin, extension date and time, and previous extension history.

An extension does not automatically complete the Takaza. The report remains `OVERDUE` until submitted.

### 12.4 Completion Decision

The Takaza may be marked `COMPLETED` only after all required completion conditions have been fulfilled and the authorized process has confirmed completion.

Preserve the completion decision and relevant history.

## 13. Rekod Amal and Reporting

### 13.1 Purpose

Rekod Amal records relevant activities and efforts.

It remains distinguishable from Takaza participation, attendance, Percha, Amer reports, Juhud Reports and Annual Archive summaries.

### 13.2 Individual Records

Relevant information includes:

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

An authorized Admin may access Kharguzari within permitted scope.

Amer may access relevant Kharguzari for preparing the Amer report.

Original submitted content remains immutable. Follow-up comments are stored separately. The author may edit their own follow-up comment according to applicable rules.

### 13.4 Juhud Reports

Juhud Reports is a separate publication module.

It is not the same as Takaza operational reports, Amer reports, Kharguzari or Annual Archive.

Its publication workflow and access permissions follow the relevant V2 specification.

## 14. Annual Archive

### 14.1 Purpose

Annual Archive preserves historical Takaza information and annual operational summaries.

It is a historical reference module and does not replace operational Takaza records.

### 14.2 Admin Access

Admin may view historical Annual Archive records, including previous years, within permitted country and organizational scope.

### 14.3 Ahbab Access

Ahbab may view archive information only for Takaza in which the Ahbab participated, even if the Takaza or participation is no longer active.

Ahbab must not access another Ahbab's restricted individual information.

### 14.4 Archive Statistics

Statistics include:

- Main Takaza count.
- Sub Takaza count.
- Participant counts.
- Participation status counts.
- Takaza counts by year.
- Takaza counts by lifecycle status.

Statistics must be based on historical records and must not silently change because of later operational updates.

### 14.5 Filters

Confirmed filters include:

- Country.
- Year.
- Takaza status.

The Main Takaza filter remains OPEN in the Open Decisions Register.

### 14.6 Export

PDF and Excel export are not part of the current Annual Archive baseline.

### 14.7 Automatic Archive

Annual Archive is automatic by default.

The system preserves relevant annual records without requiring Admin to manually recreate every operational record.

Admin may add information where permitted and subject to audit.

### 14.8 Corrections

The correction policy remains OPEN by data type and scope.

Any approved correction process must preserve original information, record corrected information, identify the actor, record date and time, retain the reason or basis and avoid silently changing original operational history.

### 14.9 Admin Notes and Annual Summary

Admin Notes and Annual Summary are separate from original operational records.

Annual Summary may include:

- Overall country summary.
- Summary for each Main Takaza.
- Summary for each Sub Takaza.
- Relevant statistics.
- Admin commentary.

Annual Summary is text-based under the current direction. Attachments are not included.

### 14.10 Annual Summary Status

| Status | Meaning |
|---|---|
| `DRAFT` | Summary is being prepared |
| `INTERIM` | Summary is issued while operations remain ongoing |
| `FINAL` | Summary is finalized |

Annual Summary status is independent of Takaza lifecycle status.

A summary may be prepared after completion or issued as an interim summary while a Takaza remains active.

## 15. Notifications

Notifications use the language preference of the relevant user.

Required events follow the applicable module workflows and include:

- Account security events.
- OTP and authentication events.
- Participation confirmation requests and decisions.
- Withdrawal, removal and appeal decisions.
- TAFAKUT form opening, assessor assignment and final decisions.
- Amer and Supervisor appointment changes.
- Percha amendment decisions.
- Relevant operational events.

Automatic reminders and mandatory deadlines must not be introduced unless separately approved.

Notification delivery does not prove that a user has read or accepted the notification.

## 16. Conceptual Data Domains

This section describes logical data domains, not a final database schema.

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
- KAWAIF Record.
- KAWAIF Verification.
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

Exact hierarchy and unresolved governance rules remain subject to JMV2002 and the Open Decisions Register.

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

### 16.6 KAWAIF and TAFAKUT

Relevant entities include:

- KAWAIF Category and Record.
- KAWAIF Verification.
- TAFAKUT Type.
- TAFAKUT Template and Template Version.
- TAFAKUT Criteria.
- TAFAKUT Round.
- TAFAKUT Assessor Assignment.
- TAFAKUT Assessment.
- TAFAKUT Decision.
- TAFAKUT Final Admin Decision.
- TAFAKUT Decision Justification.

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

## 17. Data Integrity and Audit Requirements

The system must preserve data integrity across all operational domains.

At minimum:

1. Every important record has a stable identity.
2. Historical relationships remain traceable.
3. Each participation record identifies the relevant Ahbab and Takaza.
4. Main and Sub Takaza relationships are validated.
5. Participation status is not confused with account status.
6. Appointment status is not confused with Takaza status.
7. TAFAKUT assessments preserve assessor identity and submission history.
8. Completed assessments are not silently edited.
9. TAFAKUT disagreement and additional-round history must be retained.
10. A final Managing Admin decision must be separately recorded from the assessor outcome.
11. A justification must be retained whenever the Managing Admin's final decision differs from the assessment majority.
12. The system must preserve the identity of the managing Admin, decision date/time, final decision and linked assessment records.
13. Percha amendment proposals and decisions remain traceable.
14. Annual Archive corrections preserve original information.
15. Important Admin actions create audit records.
16. Access control is enforced at API and data-access layers, not only in the user interface.

## 18. Migration and Compatibility Principles

Realignment must preserve existing data and working functionality wherever practical.

- Do not delete existing production data.
- Do not replace existing IDs unnecessarily.
- Do not modify historical migration files.
- Introduce migrations only after target schema and data mapping are reviewed.
- Prefer incremental migration.
- Validate foreign-key relationships before retiring old structures.
- Preserve existing user submissions, review history, participation history and audit information.
- Do not assume old V1 concepts map directly to V2 tables.
- Do not deploy unverified schema changes to production.

Existing V2 migrations and database state are implementation evidence.

Check `v2/docs/V2_IMPLEMENTATION_STATUS.md` for current implementation status.

This design document does not authorize direct changes to the live database.

## 19. Development and Verification Sequence

This sequence is a planning guide, not a declaration that any feature has been implemented.

| Step | Work area | Objective |
|---|---|---|
| 1 | Identity and Access | Authentication and access control |
| 2 | Ahbab Management | Profile and account relationships |
| 3 | Organization Management | Country and organization governance |
| 4 | Syukbah Management | Syukbah administration and discussion |
| 5 | Takaza Management | Main and Sub Takaza |
| 6 | Participation Management | Participation methods and lifecycle |
| 7 | KAWAIF | Qualification and experience records |
| 8 | TAFAKUT | Forms, assessors and decision workflow |
| 9 | Appointment Management | Amer and Supervisor appointments |
| 10 | Percha | Generation and amendment workflow |
| 11 | Activities | Takaza events and attendance |
| 12 | Reporting | Kharguzari and Amer reporting |
| 13 | Annual Archive | Annual records and summaries |
| 14 | Audit and Notifications | Traceability and user notifications |
| 15 | Integration Testing | End-to-end operational workflows |
| 16 | Production Readiness | Migration, security and deployment readiness |

Implementation must follow approved specifications and verified implementation status.

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

No unresolved item may be treated as an approved requirement without an explicit decision.

## 21. Development Working Principles

All development work must:

1. Preserve the separation between V1 and V2.
2. Treat the V2 decision and requirements documents as the authority for V2 business rules.
3. Inspect actual source code before proposing implementation changes.
4. Verify database state before proposing migrations.
5. Never modify historical migrations.
6. Never claim implementation or deployment without evidence.
7. Use incremental development and testing.
8. Preserve existing data and working functionality.
9. Keep implementation status separate from design status.
10. Record unresolved decisions in the official Open Decisions Register.
11. Keep this design document separate from README files.
12. Avoid introducing new product terminology or unrelated project concepts without approval.

## 22. Document Maintenance

This document is maintained as a consolidated system design reference.

When an approved V2 specification changes:

1. Identify affected sections in this document.
2. Update the relevant design references.
3. Preserve consistency with authoritative specifications.
4. Update the document version and date.
5. Do not silently change unresolved decisions into approved requirements.

Implementation status is maintained in `v2/docs/V2_IMPLEMENTATION_STATUS.md`.

Unresolved decisions are maintained in `v2/docs/OPEN_DECISIONS_REGISTER.md`.

---

**Document Status:** Consolidated V2 Design Reference — Reconciled with Current V2 Baselines  
**Version:** 2.2  
**Last Updated:** 28 November 2026

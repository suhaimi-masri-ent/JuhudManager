# JuhudManager V2 — Consolidated Module Requirements

**Document ID:** JMV2-MOD-001  
**Version:** 1.2  
**Date:** 28 November 2026  
**Status:** Consolidated Working Baseline — For Review

---

# 1. Purpose and Scope

This document consolidates the functional requirements for the principal JuhudManager V2 modules.

It covers:

1. Authentication and account management.
2. Ahbab profile management.
3. Organization structure and governance.
4. Syukbah management.
5. Jemaah membership.
6. Takaza management and participation.
7. Amer and Supervisor appointments.
8. KAWAIF.
9. TAFAKUT.
10. Withdrawal, removal, appeal and transfer.
11. Events and activities.
12. Percha and Kharguzari.
13. Takaza reports and completion.
14. Annual Archive and Annual Summary.
15. Juhud Reports.
16. Notifications, audit and authorization.

This document describes required system behavior. It does not claim that every feature has been implemented.

The Master Decision Register is the central decision reference. Where this document and the Master Decision Register conflict, the latest explicitly approved decision must be reconciled into both documents.

Requirements marked pending, provisional or ON HOLD must not be treated as approved implementation specifications.

# 2. Authentication and Account Management

## 2.1 User Registration

The system supports email-based registration and OTP verification.

Requirements:

- Six-digit OTP.
- Five-minute validity.
- Maximum five verification attempts.
- Sixty-second resend cooldown.
- Fifteen-minute identity reservation.
- Minimum password length of twelve characters.
- Verified email identity required for normal email-based account activation.

Registration status must remain separate from account status and access level.

## 2.2 Login and Sessions

Session requirements:

- Idle timeout: 30 minutes.
- Maximum session lifetime: 12 hours.
- Sessions must be invalidated when account disablement requires termination.
- Revoked sessions and tokens must not be reusable.

## 2.3 Password Reset

**Required feature — NOT YET IMPLEMENTED.**

Password Reset must use the registered and verified email address.

The flow is:

1. User requests Password Reset.
2. System sends an OTP to the registered and verified email.
3. OTP follows the existing six-digit, five-minute, five-attempt and sixty-second resend policy.
4. User verifies the OTP.
5. User establishes a new password.
6. All existing sessions and authentication tokens are revoked.
7. System records an audit event.
8. System sends a security notification.

The new password must satisfy the minimum twelve-character password requirement.

Successful Password Reset must not:

- Reactivate a DISABLED account.
- Reactivate a SUSPENDED account.
- Change account status.
- Change access level.
- Restore revoked sessions or tokens.
- Bypass any separate account review or reactivation process.

If the user cannot access the registered and verified email, the user must use a separate Admin-assisted recovery process.

Admin-assisted recovery is a separate controlled process. It must not be represented as ordinary Password Reset or used to bypass identity verification.

## 2.4 Email Change

Email change requires verification of the new email address through OTP.

The system must preserve identity history and prevent unauthorized identity replacement.

Email change eligibility may include ACTIVE, LIMITED and DISABLED account states, subject to the approved identity verification requirements.

Email change must not automatically reactivate an account.

## 2.5 Account Status and Access Level

Account statuses:

- `ACTIVE`
- `DISABLED`
- `SUSPENDED`

Access levels:

- `PUBLIC`
- `LIMITED`
- `FULL`

These are separate attributes.

A LIMITED access level must never override a DISABLED or SUSPENDED account.

## 2.6 Disablement and Reactivation

When an authorized Admin disables an account:

- Login is blocked.
- Active sessions are terminated.
- Tokens are revoked.
- Audit history is recorded.
- Relevant notifications are sent.
- Applicable appeal and review procedures remain available.

Reactivation is a separate authorized process.

Reactivation requires a new password. The previous password cannot be reused. Old sessions and tokens remain revoked.

Password Reset and account reactivation are independent processes.

## 2.7 Account Appeal

- One appeal per disable action.
- Reviewer must have higher or wider authority.
- Original disabling actor cannot review the appeal.
- Appeal approval does not automatically reactivate the account.
- Approved appeal permits a separate reactivation process.
- Rejection leaves the account DISABLED.
- Appeal and review decisions must be recorded in audit history.

## 2.8 Authentication Scope Limitations

The following are required or proposed features that must not be claimed as implemented without evidence:

- Password Reset.
- WhatsApp OTP.
- Two-factor authentication.
- Passport-based login.
- Admin-assisted account recovery workflow.

# 3. Ahbab Profile Management

## 3.1 Profile Data

Ahbab profile stores the user's personal and operational information.

Profile data must be separated from:

- Authentication credentials.
- Account status.
- Administrative roles.
- Takaza participation.
- KAWAIF records.

## 3.2 Profile Editing

Ahbab may edit permitted profile fields.

The system must distinguish:

- User-editable information.
- System-generated information.
- Admin-managed information.
- Verified identity information.

## 3.3 Protected Identity Information

National ID or Passport identity information must not be directly editable through ordinary profile editing.

Any correction must follow an authorized verification process and preserve history.

## 3.4 Profile Verification

The system must record:

- Submitted value.
- Previous value where applicable.
- Verification status.
- Verifying Admin.
- Verification timestamp.
- Reason or supporting basis where required.

The verifier need not be the same person as a TAFAKUT assessor.

## 3.5 KAWAIF Relationship

KAWAIF is a separate qualification and experience record associated with the Ahbab profile.

It must not be treated as:

- A substitute for the Ahbab profile.
- An authentication credential.
- An automatic TAFAKUT decision.
- An automatic participation approval.

# 4. Organization Structure and Governance

## 4.1 Administrative Roles

The system distinguishes:

- `SUPER_ADMIN`
- Country `ADMIN`
- Admin Markaz
- Admin Syukbah
- Admin Takaza

Each role has a defined scope.

Permissions must be enforced by the backend, not merely hidden in the frontend.

## 4.2 SUPER_ADMIN

SUPER_ADMIN has global system administration scope.

It does not automatically become the operational decision-maker for every Takaza or local organization matter.

## 4.3 Country ADMIN

Country ADMIN operates within the assigned country scope.

Access to another country requires an explicitly authorized arrangement.

Country scope must remain separate from global system administration scope.

## 4.4 Organization Hierarchy

Potential organization levels:

- Markaz Negara.
- Negeri.
- Daerah.
- Kawasan.
- Mohallah.

The final country hierarchy is configurable or pending confirmation.

Markaz Negara may supervise Negara Naungan without merging country records.

Supervision must not cause unrelated country records, identities or administrative ownership to be merged.

## 4.5 Chief Admin and Deputy

Each organizational level has one Chief Admin and may have one or more Deputies.

Faisalah is the title of the Markaz Negeri Chief Admin.

Appointment and removal procedures remain pending where not explicitly approved.

## 4.6 Cross-Organization Support

Cross-organization support requires:

- Consent of both Chief Admins.
- Defined task and scope.
- Start and end dates.
- Audit history.

Temporary support must not create unrestricted permanent access.

# 5. Syukbah Management

## 5.1 Syukbah Structure

Syukbah is separate from the organization hierarchy.

Global Baseline Syukbah is managed by SUPER_ADMIN.

Countries use the common baseline. Not every Syukbah must be activated in every country.

Additional country-specific Syukbah requires an approval process that remains pending.

## 5.2 Syukbah Administration

Each Syukbah has:

- One Admin Syukbah.
- One or more Deputies.

Admin Syukbah is automatically a Moderator in the discussion area of their own Syukbah.

Admin Syukbah may appoint and remove moderators within the approved scope.

## 5.3 Moderator Permissions

Moderator may:

- Comment.
- Delete other users' comments.
- Soft-delete comments with audit history.

Moderator may not:

- Edit another user's comment.
- Hide comments.
- Pin comments.
- Unpin comments.

Users may delete their own comments.

Deletion of comments must preserve the required audit history.

## 5.4 CMS Separation

CMS is a separate module.

Discussion content does not automatically become official CMS content.

Publication into CMS must follow its own content management and authorization rules.

## 5.5 Delegation

Deputy and acting authority must be explicitly assigned.

No unrestricted authority is implied by the Deputy title alone.

Detailed delegation rules remain pending.

# 6. Jemaah Membership

## 6.1 Membership Record

Jemaah membership is separate from Takaza participation.

The system must preserve membership history and distinguish current membership from historical membership.

## 6.2 Membership and Takaza

Being a Jemaah member does not automatically make someone a confirmed Takaza participant.

Takaza participation must follow its own confirmation process.

## 6.3 Historical V1 Mapping

Relevant V1 Project Member records map to V2 Takaza Participation.

V2 must not create a separate Project Member entity.

# 7. Takaza Management

## 7.1 Takaza Hierarchy

Takaza supports:

- Main Takaza.
- Sub Takaza.

Rules:

- Maximum two levels.
- Sub Takaza cannot have children.
- Main and Sub must belong to the same country.
- Each has an independent lifecycle.
- No automatic cascade of status changes.
- Takaza must not be physically deleted.

## 7.2 Takaza Status

Permitted statuses:

- `DRAFT`
- `RELEASED`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

Status changes must follow the applicable authorization and lifecycle rules.

## 7.3 Creation and Activation

Admin may create Main and Sub Takaza.

Admin may verify and activate without SUPER_ADMIN approval.

Incomplete setup, including missing Amer or participant arrangements, may be permitted with visible warnings where the approved workflow allows it.

A warning must not silently replace a mandatory approval or eligibility requirement.

## 7.4 Participation Methods

The system supports:

- `AUTOMATIC_INCLUSION`
- `VOLUNTARY_APPLICATION`
- `ADMIN_NOMINATION`
- `DIRECT_ASSIGNMENT`

Methods may be combined.

Admin may configure conditions for each method.

After RELEASED or ACTIVE, changes apply only to new participation and undecided applications. Existing participants are not automatically affected.

Changes must not silently rewrite previously confirmed participation records.

## 7.5 Automatic Inclusion

Automatic inclusion creates a candidate with status:

`PENDING_ADMIN_CONFIRMATION`

Admin must confirm before participation becomes effective.

This applies even to existing Jemaah members at Main Takaza formation.

Ahbab joining a Jemaah after Takaza activation must also enter the confirmation process.

## 7.6 Voluntary Application

Ahbab may apply to participate.

Admin makes the final participation decision.

For Sub Takaza, Ahbab consent and TAFAKUT apply as required by the approved criteria.

## 7.7 Admin Nomination

Admin may nominate an Ahbab.

Ahbab consent is required.

For Sub Takaza, TAFAKUT applies where required.

A TAFAKUT PASS does not automatically approve participation.

## 7.8 Direct Assignment

Direct Assignment is a supported method.

Consent, TAFAKUT and confirmation safeguards remain pending where not explicitly decided.

The method must not be assumed to bypass normal safeguards.

Implementation must not invent exemptions or bypass rules.

## 7.9 Capacity

Admin may change capacity at any time.

If capacity is reduced below existing participation:

- Existing participants remain.
- System displays an over-capacity warning.
- New capacity applies to future participation.
- No waiting list is required.

Capacity changes must not silently remove existing participants.

# 8. Amer Appointment

## 8.1 Eligibility

Every Main and Sub Takaza has its own Amer.

The Amer candidate must already be a confirmed participant in the same Takaza before appointment becomes effective.

If not yet a confirmed participant, the normal participation process must first be completed.

## 8.2 Appointment Timing

Appointment may take place before the official Takaza start date.

Takaza does not need to be ACTIVE before the appointment.

Both Admin and candidate consent are required.

## 8.3 TAFAKUT

A separate Amer TAFAKUT is not required where valid prior TAFAKUT exists.

Suitability may be considered in the next TAFAKUT round.

A prior valid TAFAKUT result must not be treated as an automatic appointment decision.

## 8.4 Appointment Duration

Appointment normally aligns with Takaza duration.

Admin may shorten, extend or end the appointment early.

Appointment changes do not change Takaza dates or status.

All changes must be audited.

## 8.5 Expiry

If the Amer appointment expires while Takaza remains ACTIVE:

- Amer role ends.
- Admin is notified.
- Takaza remains ACTIVE.

Expiry of an appointment must not automatically complete or cancel Takaza.

## 8.6 Replacement

Admin may replace Amer before appointment expiry.

Requirements:

- Reason recorded.
- Justification from at least one other Admin.
- Second Admin provides justification only and has no veto.
- Managing Admin makes the final decision.
- Previous appointment history is retained.

The decision and its justification must be preserved as separate audit records.

# 9. Supervisor Appointment

Supervisor appointment is provisionally based on consent.

The selected person and Admin must consent.

Appointment duration temporarily follows Amer principles.

Admin may shorten, extend or end the appointment early.

Changes must be audited and must not change Takaza dates or status.

Pending decisions:

- Whether Supervisor must be a confirmed participant.
- Supervisor authority and scope.
- Whether any delegated authority is permitted.
- Whether Supervisor may act on behalf of Amer.
- Whether Supervisor may access or change participant records.

No special Supervisor permission may be implemented without an approved decision.

# 10. KAWAIF

## 10.1 Purpose

KAWAIF records Ahbab qualifications, experience and relevant capabilities.

It is reference information, not a TAFAKUT result.

## 10.2 Data Management

Ahbab may submit and edit information pending Admin verification.

Admin may add or update missing or outdated information.

Each record must preserve:

- Source and basis.
- Previous value.
- New value.
- Actor.
- Timestamp.
- Verification status.

Unverified information must remain distinguishable from verified information.

## 10.3 Governance

Higher or wider-scope Admin controls:

- Categories.
- Criteria.
- Scoring.
- Eligibility rules.

KAWAIF data may be used as a reference during participation and TAFAKUT processes.

KAWAIF information must not automatically determine a TAFAKUT result or participation decision.

# 11. TAFAKUT

## 11.1 Independent Assessors

Each TAFAKUT round uses exactly two independent Admin assessors.

The two assessors must submit their assessments independently.

Decision rules:

| Assessor 1 | Assessor 2 | Outcome |
|---|---|---|
| PASS | PASS | PASS |
| FAIL | FAIL | FAIL |
| PASS | FAIL | Third Admin required |
| FAIL | PASS | Third Admin required |

A disagreement requires a third Admin.

The third Admin is an additional decision participant for resolving the disagreement. The original assessor records remain preserved.

The system must not silently convert a disagreement into PASS or FAIL without the required third-Admin process.

## 11.2 Additional Rounds

Every additional round uses two new assessors who have not assessed the candidate previously.

Higher or wider-scope Admin appoints assessors.

The system must retain the assessment history across all rounds.

An assessor who has assessed the candidate in an earlier round must not be reused as one of the two assessors in a subsequent round.

## 11.3 Assessor Replacement

If an assessor cannot continue:

- Replace the assessor.
- Preserve completed work.
- Do not restart the entire assessment.
- Record the replacement and reason.
- Keep the original assessor's completed record unchanged.

Replacement must not erase or rewrite a completed assessment.

## 11.4 Submission Integrity

Assessors see each other's work only after both submit.

Submitted assessment records are immutable.

Reassessment creates a new record.

The system must preserve:

- Assessor identity.
- Assessment round.
- Submission timestamp.
- Assessment outcome.
- Comments and justification.
- Any subsequent reassessment.
- Any replacement or administrative intervention.

An Admin decision must not overwrite an assessor's original assessment.

## 11.5 Eligibility and Process Status

`SUSPEND` affects participation eligibility.

`ON_HOLD` pauses the process or decision.

Neither status changes account login, account status or profile status.

FAIL is not a permanent ban.

There is no fixed waiting period or attempt limit.

The system must distinguish an assessment outcome from an account status and from a Takaza participation status.

## 11.6 Managing Admin Final Decision

Managing Admin may make a final decision that differs from the assessment majority.

This authority is a separate decision layer and does not alter the original assessor outcomes.

Requirements:

- The Managing Admin's decision must be explicitly recorded.
- Mandatory justification must be supplied.
- The identity of the decision-maker must be recorded.
- Decision timestamp must be recorded.
- The relevant assessment round and assessor records must remain linked.
- The final decision must be distinguishable from the assessors' results.
- Original assessor records must remain immutable.
- Any subsequent review or change must create a separate history record.

The system must not represent the Managing Admin's decision as if it were the assessors' unanimous or majority result.

## 11.7 Forms and Templates

Higher or wider-scope Admin controls:

- Form types.
- Templates.
- Criteria.
- Questions.
- Question ordering.
- Input types.

Takaza Admin selects the form type and round but cannot edit the controlled template.

Every template change creates a new version.

Old versions remain retained and linked to assessment records.

A change to a template must not alter completed assessments that used an earlier version.

## 11.8 Data Sources

TAFAKUT data may come from:

- System, profile and activity data.
- Ahbab input.
- Assessor input.

Ahbab may request correction of system-populated data.

Original source data must not be overwritten before Admin verification.

The verifier may differ from the assessors.

The system must preserve the original value, proposed correction, verification result and responsible actor.

## 11.9 Ahbab Form

Ahbab may save, resume and edit a draft before submission.

After submission, the form is locked.

Corrections require Admin intervention.

Any correction must preserve the submitted version and the subsequent verified version as separate history.

## 11.10 Assessor Form

Assessors normally submit directly.

Admin may return an opened but unsubmitted form to DRAFT with a reason.

A submitted assessment must not be returned to DRAFT or silently edited.

A new assessment record is required for reassessment.

## 11.11 Notifications and Visibility

Notify Ahbab when:

- TAFAKUT form is opened.
- Final decision is made.

Notify assessors when assigned.

Use each user's selected language.

No automatic reminders or mandatory deadlines are included in this baseline.

Ahbab may view comments and the final decision after completion but cannot reply through the TAFAKUT workflow.

Visibility of assessment information must remain subject to the user's authorized scope.

# 12. Withdrawal, Removal and Appeal

## 12.1 Withdrawal

Withdrawal is an Ahbab right.

Ahbab may submit a request to withdraw from a Takaza.

Status becomes `WITHDRAWN` only after Admin confirms and records the withdrawal.

Admin must acknowledge and process a valid withdrawal request.

Admin cannot block, veto or arbitrarily refuse a valid withdrawal request.

Admin confirmation is an administrative recording step. It is not discretionary permission to deny the Ahbab's right to withdraw.

The system must record:

- Withdrawal request date and time.
- Requesting Ahbab.
- Relevant Takaza and participation record.
- Admin confirmation date and time.
- Confirming Admin.
- Any administrative note or reason where applicable.

The original request must remain preserved.

A pending confirmation must not be misrepresented as a completed `WITHDRAWN` status.

## 12.2 Removal

Managing Admin may remove a participant in accordance with the applicable authority and governance rules.

Removal requires justification from at least one other Admin.

The second Admin provides justification only and has no veto.

Managing Admin makes the final decision.

Requirements:

- Removal reason is mandatory.
- Supporting justification is retained.
- Managing Admin identity is recorded.
- Decision timestamp is recorded.
- Second Admin justification is preserved separately.
- Ahbab must be notified with the reason.
- Original participation history remains available.

The system must distinguish removal from voluntary withdrawal.

## 12.3 Appeal

Appeal is reviewed by a higher or wider-scope Admin.

Appeal does not automatically change status.

Successful appeal may restore participation without a new participation process, subject to the appeal decision.

Original removal remains in history.

The appeal record must include:

- Original removal decision.
- Appeal submission.
- Reviewer.
- Review timestamp.
- Decision.
- Justification.
- Any resulting participation status change.

Denied appeal does not permanently prevent future normal reapplication or TAFAKUT where required.

## 12.4 Rejoining

`WITHDRAWN` and `REMOVED` are distinct statuses.

Rejoining creates a new linked participation record.

Previous records remain available and must not be overwritten.

The new participation record must retain a reference to the relevant previous record where applicable.

# 13. Transfer

Transfer requires:

1. Consent of relevant parties.
2. New TAFAKUT for the receiving Takaza.
3. Admin decision.
4. New participation record.

Original participation record remains preserved.

Transfer must not silently change the historical Takaza association of the original record.

The receiving Takaza applies its own eligibility and participation requirements.

# 14. Events and Activities

## 14.1 Event Scheduling

Events are flexible and are not fixed to three.

Admin determines events for each Takaza.

Possible stages:

- Before start.
- Commencement.
- During Takaza.
- Before end.
- End date.

The list is not an exhaustive fixed event count.

## 14.2 Existing Activities

Admin may reuse an existing Aktiviti Khidmat record.

If no suitable record exists, Admin may create a new event.

Reuse must preserve the relationship between the activity and the relevant Takaza.

## 14.3 Attendance

Events and attendance belong to the relevant Takaza.

Attendance and remarks are separate from Takaza lifecycle status.

Event templates remain pending.

# 15. Percha

Percha is generated after Bayan Hidayat.

Required fields:

- Percha number.
- Jemaah.
- Place.
- Halqah.
- Route.
- Destination.
- Bayan Hidayat date.
- Kharguzari.
- Bayan Wapsi date.
- End activities.

## 15.1 Amendments

Admin proposes an amendment.

A different Admin must approve it.

If rejected, the original Percha remains unchanged.

Resubmission is permitted.

All versions and amendment history must be retained.

The system must record:

- Original Percha version.
- Proposed amendment.
- Proposing Admin.
- Proposal timestamp.
- Reviewing Admin.
- Approval or rejection.
- Decision timestamp.
- Reason or comments where applicable.

The proposing Admin must not approve their own amendment.

# 16. Kharguzari

Kharguzari is due one day before Bayan Wapsi.

Individual Kharguzari may be recorded by:

- Ahbab for their own record.
- Admin within authorized scope.

Amer may access the records for reporting.

Original submitted Kharguzari is immutable.

Follow-up comments are separate records.

Comment authors may edit their own comments.

The system must preserve the original Kharguzari and distinguish it from later comments, corrections or administrative notes.

# 17. Amer Report and Takaza Completion

Full Amer report is mandatory before Takaza can become `COMPLETED`.

If end activities are completed but Amer report is missing:

- Report status is `OVERDUE`.
- Takaza remains not COMPLETED.
- Amer remains responsible for submission.
- Admin may extend the due date.
- Original due date is retained.
- Extensions are recorded.
- Extension does not automatically complete Takaza.

Automatic completion is permitted only when all approved completion conditions are satisfied.

The system must preserve:

- Original report due date.
- Current due date.
- Extension request or action.
- Admin responsible for extension.
- Extension reason.
- Report submission timestamp.
- Completion decision and timestamp.

An extension must not erase the original due date or remove the Amer's reporting responsibility.

# 18. Takaza Cancellation

Cancellation creates a `Requires Attention` case automatically.

The case identifies the affected Takaza and Ahbab.

Cancellation does not automatically cancel each participant's participation.

Admin handles affected participants individually.

The system must preserve the cancellation event and the subsequent individual decisions.

Full Case Management workflow remains ON HOLD.

No unapproved automated participant-removal or withdrawal behavior may be introduced.

# 19. Annual Archive

## 19.1 Access

Admin may access prior-year records within authorized scope.

Ahbab may access archive records only for Takaza in which they participated, even if currently inactive.

Ahbab must not access unrelated Takaza records.

Archive access must follow the same server-side authorization principles as operational records.

## 19.2 Statistics

Archive statistics include:

- Main Takaza count.
- Sub Takaza count.
- Participant counts and statuses.
- Takaza count by year and status.

Statistics must preserve the distinction between Main and Sub Takaza.

## 19.3 Filters

Confirmed filters:

- Country.
- Year.
- Status.

A separate Main Takaza filter remains pending.

## 19.4 Archive Operation

Archive is automatic by default.

Admin may add information subject to audit.

Correction policy remains pending by data type and scope.

Archive corrections must not silently overwrite original operational records.

PDF and Excel export are not included in the current baseline.

# 20. Annual Summary

Annual Summary is separate from operational records.

Summary levels:

- Country overall.
- Each Main Takaza.
- Each Sub Takaza.

Summary is normally prepared after completion. Interim summaries may be prepared while Takaza remains active.

Statuses:

- `DRAFT`
- `INTERIM`
- `FINAL`

Summary status is independent of Takaza status.

Summary contains statistics and commentary.

Attachments are not included in the current baseline.

Annual Summary must not replace or modify the underlying operational records.

# 21. Juhud Reports

Juhud Reports is a separate publication module.

It must remain distinct from:

- Takaza operational reports.
- Amer reports.
- Annual Archive.
- Annual Summary.

Publication rules, editorial workflow and access permissions must be defined separately.

# 22. Notifications

Notifications must use the user's selected language.

Required notification events include:

- Account security events.
- OTP and authentication events.
- Password Reset and security notifications.
- TAFAKUT assignment and decision.
- Relevant participation decisions.
- Withdrawal confirmation.
- Amer and Supervisor appointment changes.
- Removal and appeal decisions.
- Takaza cancellation and relevant case creation.
- Other approved lifecycle events.

No automatic reminders or mandatory deadlines are included unless separately approved.

Notifications must not disclose information outside the recipient's authorized scope.

# 23. Audit and History

Audit records must preserve relevant changes and decisions.

Where applicable, record:

- Entity and record identifier.
- Previous value.
- New value.
- Actor.
- Timestamp.
- Reason.
- Related approval or justification.
- Related assessment or decision record.
- Relevant request and confirmation timestamps.

Ordinary history must not be physically deleted.

Sensitive information must not be exposed to users outside their authorized scope.

The following require particular audit attention:

- Account disablement and reactivation.
- Password Reset and session revocation.
- Identity and profile corrections.
- TAFAKUT assessments and reassessments.
- Assessor replacement.
- Managing Admin decisions that differ from assessor outcomes.
- Withdrawal requests and confirmations.
- Removal and appeal decisions.
- Amer appointment and replacement.
- Percha amendments and approvals.
- Kharguzari follow-up.
- Amer report extensions.
- Takaza cancellation and subsequent participant decisions.

Administrative decisions must not overwrite the original records on which those decisions were based.

# 24. Authorization and Dashboard

Every module must enforce server-side authorization.

Dashboard visibility is not authorization.

Hiding a menu or button does not replace backend permission checks.

The UAC Matrix defines the permission baseline.

The Dashboard and Navigation Specification defines presentation and navigation behavior.

Authorization must consider:

- Role.
- Country scope.
- Organization scope.
- Takaza scope.
- Record ownership or relationship.
- Explicit delegation, where approved.
- Relevant workflow status.

A user must not gain access merely because a frontend component or navigation item is visible.

# 25. Implementation and Verification Notes

The following requirements must not be described as implemented without code and test evidence:

- Password Reset.
- Admin-assisted account recovery.
- WhatsApp OTP.
- Two-factor authentication.
- Passport login.
- Complete Amer appointment workflow.
- Supervisor workflow.
- KAWAIF.
- TAFAKUT.
- Full participation lifecycle.
- Withdrawal confirmation workflow.
- Removal and appeal workflow.
- Transfer workflow.
- Events and attendance.
- Percha.
- Kharguzari.
- Amer report and completion.
- Annual Archive.
- Annual Summary.
- Full Case Management.

Implementation status must be maintained separately from requirements.

A requirement being documented or approved does not prove that it has been implemented.

A feature must only be marked implemented when the relevant code, database changes, authorization checks and tests provide sufficient evidence.

Pending decisions must remain visibly pending until formally resolved.

# 26. Related Documents

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `AUTH.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `V2_DESIGN_CHECKPOINT.md`

# 27. Implementation Roadmap

This section provides an implementation sequence for the requirements in this document.

The roadmap is a planning reference. It does not override approved decisions, open decisions or implementation evidence.

A phase may be marked complete only when its exit criteria are supported by code, database, authorization and test evidence.

## 27.1 Phase 1 — Authentication and Bootstrap

**Priority: CRITICAL**

Tasks:

1. Resolve bootstrap SUPER_ADMIN eligibility.
2. Establish the designated bootstrap owner.
3. Complete SUPER_ADMIN activation.
4. Verify email identity and account status.
5. Verify password and session handling.
6. Complete country ADMIN creation within authorized scope.
7. Verify account disablement and reactivation controls.
8. Implement Password Reset.
9. Verify profile update and identity verification behavior.

Exit criteria:

- Bootstrap SUPER_ADMIN works.
- No duplicate or ambiguous bootstrap identity remains.
- Country ADMIN can be created within authorized scope.
- Account and session controls pass tests.
- Password Reset passes full security tests.
- Disabled or suspended accounts are not automatically reactivated.
- Profile changes preserve verification and audit history.

## 27.2 Phase 2 — Authorization and Organization

**Priority: HIGH**

Tasks:

1. Complete UAC enforcement.
2. Implement country scope.
3. Implement organization hierarchy.
4. Implement Chief Admin and Deputy structure.
5. Implement cross-organization support.
6. Resolve pending governance decisions.
7. Implement Admin Markaz scope.
8. Verify Dashboard navigation against permissions.
9. Test access denial across country and organization boundaries.

Exit criteria:

- No unauthorized cross-country access.
- Administrative roles remain distinct.
- Organization scope is enforced by the backend.
- Dashboard actions match actual authorization.

## 27.3 Phase 3 — Ahbab and Syukbah

**Priority: HIGH**

Tasks:

1. Complete Ahbab profile management.
2. Complete identity verification.
3. Complete KAWAIF.
4. Implement Syukbah baseline.
5. Implement Syukbah Admin and Deputy controls.
6. Implement Moderator permissions.
7. Separate CMS and discussion functionality.
8. Verify Jemaah membership history.

Exit criteria:

- Profile changes preserve history.
- Protected identity information cannot be changed through ordinary editing.
- KAWAIF verification is auditable.
- Syukbah permissions are enforced.
- Jemaah membership is separate from Takaza participation.

## 27.4 Phase 4 — Takaza and Participation

**Priority: HIGH**

Tasks:

1. Implement Main and Sub Takaza.
2. Enforce maximum two-level hierarchy.
3. Implement Takaza lifecycle statuses.
4. Implement participation methods.
5. Implement Admin confirmation.
6. Implement capacity controls.
7. Implement participation history.
8. Implement withdrawal.
9. Implement removal and appeal.
10. Implement transfer.

Exit criteria:

- Main and Sub Takaza rules are enforced.
- Participation methods behave according to approved rules.
- Capacity changes do not remove existing participants.
- Withdrawal and removal remain distinct.
- Historical participation records are preserved.

## 27.5 Phase 5 — TAFAKUT

**Priority: HIGH**

Tasks:

1. Implement TAFAKUT rounds.
2. Implement independent assessor assignment.
3. Implement two-assessor decision rules.
4. Implement third-Admin disagreement resolution.
5. Implement additional assessment rounds.
6. Implement assessor replacement.
7. Implement immutable submitted assessments.
8. Implement versioned forms and templates.
9. Implement Managing Admin final decision.
10. Implement notifications and visibility rules.

Exit criteria:

- Assessor independence is enforced.
- Disagreement cannot bypass third-Admin resolution.
- Submitted records remain immutable.
- Reassessment creates new records.
- Managing Admin decisions remain separate from assessor outcomes.

## 27.6 Phase 6 — Amer, Supervisor and Activities

**Priority: HIGH**

Tasks:

1. Implement Amer appointment.
2. Implement Amer eligibility and consent.
3. Implement appointment expiry.
4. Implement Amer replacement.
5. Resolve Supervisor authority.
6. Implement approved Supervisor workflow.
7. Implement events and activities.
8. Implement attendance.
9. Implement Percha.
10. Implement Percha amendment approval.

Exit criteria:

- Amer appointment follows eligibility and consent rules.
- Appointment expiry does not automatically complete Takaza.
- Amer replacement preserves appointment history.
- Supervisor permissions follow approved decisions.
- Percha amendments require a different Admin's approval.

## 27.7 Phase 7 — Reporting and Archive

**Priority: MEDIUM**

Tasks:

1. Implement Kharguzari.
2. Implement Amer report.
3. Implement overdue report handling.
4. Implement report due-date extension.
5. Implement Takaza completion conditions.
6. Implement Annual Archive.
7. Implement Annual Summary.
8. Implement Juhud Reports publication workflow.

Exit criteria:

- Amer report is mandatory for completion.
- Original due dates remain preserved.
- Archive access follows authorized scope.
- Annual Summary does not modify operational records.
- Publication permissions are enforced.

## 27.8 Phase 8 — Case Management and Final Integration

**Priority: ON HOLD / FUTURE**

Tasks:

1. Resolve Case Management scope.
2. Approve case lifecycle and authority.
3. Define case categories and ownership.
4. Define notification and escalation rules.
5. Implement approved case workflow.
6. Conduct end-to-end integration testing.
7. Conduct authorization and security testing.
8. Verify deployment and operational readiness.

Exit criteria:

- Case Management is implemented only after approval.
- No unapproved automated participant action exists.
- End-to-end workflows pass their required tests.
- Release evidence is retained.

# 28. Release Gates

A release must not be considered ready merely because the frontend builds successfully.

The following gates apply.

## 28.1 Gate A — Repository and Build

- Repository structure is verified.
- V1 and V2 separation is preserved.
- Build completes successfully.
- Automated tests complete successfully.
- No unintended legacy dependency is introduced.

## 28.2 Gate B — Database

- Required migrations are applied.
- Migration order is verified.
- Foreign keys and constraints are checked.
- Critical indexes are present.
- Data integrity checks pass.
- No destructive migration is applied without explicit approval.

## 28.3 Gate C — Authentication and Authorization

- Registration and OTP verification work.
- Login and session expiry work.
- Password Reset works.
- Account disablement and reactivation rules work.
- SUPER_ADMIN bootstrap is verified.
- Country and organization boundaries are enforced.
- Unauthorized API requests are rejected.

## 28.4 Gate D — Workflow Integrity

- Required approvals are enforced.
- Independent assessments remain independent.
- Submitted records remain immutable.
- Audit history is preserved.
- Notifications are sent to authorized recipients.
- Pending decisions are not implemented as assumed rules.

## 28.5 Gate E — Operational Readiness

- Health endpoint is verified.
- Database connectivity is verified.
- Environment configuration is checked.
- Deployment workflow is verified.
- Error handling and logging are reviewed.
- Rollback or recovery procedure is documented.

A release gate must be supported by evidence. A statement in documentation alone is not sufficient.

# 29. Non-Negotiable Requirements

The following principles apply across all modules.

1. Backend authorization is mandatory.
2. Frontend visibility is not authorization.
3. Account status and access level are separate.
4. Password Reset must not reactivate a disabled or suspended account.
5. Historical records must not be silently overwritten.
6. Submitted assessment records must remain immutable.
7. Administrative decisions must be distinguishable from assessor outcomes.
8. Required approvals must not be bypassed.
9. Country and organization scope must be enforced.
10. Takaza Main and Sub hierarchy is limited to two levels.
11. Capacity changes must not silently remove existing participants.
12. Withdrawal and removal must remain distinct.
13. Amer report is mandatory before Takaza completion.
14. Case Management remains ON HOLD until formally approved.
15. Pending decisions must not be treated as approved requirements.
16. Implementation claims must be supported by verifiable evidence.
17. Security-sensitive actions must be audited.
18. No feature may rely solely on frontend restrictions for security.

# 30. Security and Data Integrity Principles

All modules must follow these principles.

## 30.1 Identity Integrity

- Verified identities must be protected.
- Identity corrections must be authorized.
- Previous identity values must be retained where required.
- Duplicate identity reservations must be prevented.
- Account recovery must not bypass verification.

## 30.2 Authorization Integrity

- Every protected API operation must validate authorization.
- Scope must be checked against the target record.
- Role assignment must not grant unintended global access.
- Delegated authority must be explicit and time-bounded where applicable.
- Revoked permissions must take effect immediately.

## 30.3 Record Integrity

- Historical records must remain available according to retention rules.
- Submitted records must not be silently edited.
- Corrections must create traceable history.
- Related records must retain their relationships.
- Deletion must follow approved retention and audit rules.

## 30.4 Session Integrity

- Revoked sessions must not be reusable.
- Account disablement must terminate relevant sessions.
- Password Reset must revoke all existing sessions and tokens.
- Session expiry must be enforced server-side.
- Client-side logout alone is insufficient.

# 31. Testing and Verification Requirements

Testing must cover both expected behavior and prohibited behavior.

## 31.1 Functional Tests

Test:

- Successful workflows.
- Invalid input.
- Missing required information.
- Unauthorized actions.
- Invalid status transitions.
- Duplicate submissions.
- Concurrent updates.
- Expired records.
- Rejected approvals.
- Repeated requests.

## 31.2 Authorization Tests

Test access by:

- SUPER_ADMIN.
- Country ADMIN.
- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.
- Ahbab.
- Unauthenticated users.

Tests must include attempts to access records outside the user's country, organization, Takaza or relationship scope.

## 31.3 Security Tests

Test:

- OTP expiry.
- OTP attempt limits.
- Resend cooldown.
- Identity reservation expiry.
- Password policy.
- Session idle timeout.
- Maximum session lifetime.
- Token revocation.
- Disabled and suspended account restrictions.
- Password Reset session termination.

## 31.4 Audit Tests

Verify that:

- Required actions create audit records.
- Actor identity is correct.
- Timestamps are retained.
- Previous and new values are correct.
- Reasons and justifications are preserved.
- Original records are not overwritten.
- Unauthorized users cannot access sensitive audit information.

## 31.5 Evidence Requirements

Each completed test phase should retain:

- Test name.
- Test date.
- Environment.
- Result.
- Relevant commit or build reference.
- Failure details where applicable.
- Corrective action where required.

Historical test results must not be represented as newly executed tests.

# 32. Implementation Status Classification

Implementation status must be maintained separately from functional requirements.

Use the following classifications:

| Status | Meaning |
|---|---|
| NOT STARTED | No implementation work has been verified |
| IN PROGRESS | Work is underway but acceptance criteria are incomplete |
| IMPLEMENTED — UNVERIFIED | Code exists but required verification is incomplete |
| VERIFIED | Required implementation and tests have passed |
| BLOCKED | Work cannot proceed because of a dependency or unresolved issue |
| ON HOLD | Work is intentionally paused pending approval or direction |
| NOT IMPLEMENTED | Required feature does not yet exist |

A feature must not be marked VERIFIED solely because:

- A document describes it.
- A database table exists.
- A frontend screen exists.
- A build succeeds.
- A single happy-path test passes.

Verification requires sufficient evidence for the relevant functional, authorization, data integrity and security requirements.

# 33. Open Decisions and Change Control

Open decisions must remain in the official Open Decisions Register.

A pending decision must not be silently converted into a requirement.

When a decision is approved:

1. Record the decision in the Master Decision Register.
2. Update this document where affected.
3. Update relevant module specifications.
4. Update UAC and Dashboard specifications where affected.
5. Update implementation status.
6. Identify required database, API, UI and test changes.
7. Preserve the decision history.

A change to an approved requirement must include:

- Change description.
- Reason.
- Decision authority.
- Approval date.
- Affected modules.
- Affected documents.
- Implementation impact.
- Verification impact.

# 34. Documentation Maintenance

The following documents are related to this requirements baseline:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `V2_DESIGN_CHECKPOINT.md`
- `AUTH.md`
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `REPOSITORY_DISPOSITION.md`

Document responsibilities:

- Module Requirements define functional behavior.
- Master Decision Register records approved decisions.
- Open Decisions Register tracks unresolved matters.
- Implementation Status tracks actual implementation and evidence.
- Design Checkpoint records the consolidated design baseline.
- AUTH defines authentication and account security requirements.
- UAC Matrix defines role and permission boundaries.
- Dashboard Specification defines navigation and presentation.
- Module specifications provide detailed module-level behavior.

Where documents conflict, the conflict must be recorded and reconciled. Do not silently assume that one document has changed the approved decision.

# 35. Review and Acceptance

This document is a consolidated working baseline for review.

Acceptance of this document does not mean:

- All features are implemented.
- All open decisions are resolved.
- All database structures are complete.
- All workflows are deployed.
- All tests have passed.
- Production release is approved.

Requirements become implementation-ready when their dependencies, decisions, permissions, data requirements and acceptance criteria are sufficiently defined.

# 36. Revision History

| Version | Date | Description |
|---|---|---|
| 1.1 | 28 November 2026 | Consolidated module requirements baseline |
| 1.2 | 28 November 2026 | Corrected document structure, retained original requirements and added implementation roadmap, release gates, security, testing and maintenance guidance |

# 37. Document Control

**Document:** JuhudManager V2 — Consolidated Module Requirements  
**Document ID:** JMV2-MOD-001  
**Version:** 1.2  
**Status:** Consolidated Working Baseline — For Review  
**Repository Path:** `v2/docs/MODULE_REQUIREMENTS.md`

This document must be reviewed whenever an approved decision materially changes module behavior, security requirements, authorization scope or workflow rules.

---

End of Document

JuhudManager V2 — Consolidated Module Requirements

Document ID: JMV2-MOD-001
Version: 1.0
Date: 27 November 2026
Status: Consolidated Working Baseline — For Review

---

1. Purpose and Scope

This document consolidates the functional requirements for the principal JuhudManager V2 modules.

It covers:

1. Authentication and account management.
2. Ahbab profile management.
3. Organization structure and governance.
4. Syukbah management.
5. Jemaah membership.
6. Takaza management and participation.
7. KAWAIF.
8. TAFAKUT.
9. Amer and Supervisor appointments.
10. Events and activities.
11. Percha and Kharguzari.
12. Takaza reports and completion.
13. Annual Archive and Annual Summary.
14. Notifications, audit and publication.

This document describes required system behavior. It does not claim that every feature has been implemented.

The Master Decision Register is the central decision reference. Where this document and the Master Decision Register conflict, the latest explicitly approved decision must be reconciled into both documents.

2. Authentication and Account Management

2.1 User Registration

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

2.2 Login and Sessions

Session requirements:

- Idle timeout: 30 minutes.
- Maximum session lifetime: 12 hours.
- Sessions must be invalidated when account disablement requires termination.
- Revoked sessions and tokens must not be reusable.

2.3 Password Reset

Required feature — Not yet implemented.

Password Reset must use the registered and verified email address.

Flow:

1. User requests Password Reset.
2. System sends OTP to the verified email.
3. OTP follows the existing six-digit, five-minute, five-attempt and sixty-second resend policy.
4. User verifies OTP.
5. User establishes a new password.
6. All existing sessions and tokens are revoked.
7. System records an audit event.
8. System sends a security notification.

If the user cannot access the verified email, the user must use a separate Admin-assisted recovery process.

Admin-assisted recovery must not be represented as ordinary Password Reset.

2.4 Email Change

Email change requires verification of the new email address through OTP.

The system must preserve identity history and prevent unauthorized identity replacement.

2.5 Account Status and Access Level

Account statuses:

- "ACTIVE"
- "DISABLED"
- "SUSPENDED"

Access levels:

- "PUBLIC"
- "LIMITED"
- "FULL"

These are separate attributes.

A LIMITED access level must never override a DISABLED account.

2.6 Disablement and Reactivation

When an authorized Admin disables an account:

- Login is blocked.
- Active sessions are terminated.
- Tokens are revoked.
- Audit history is recorded.
- Relevant notifications are sent.

Reactivation is a separate authorized process.

Reactivation requires a new password. The previous password cannot be reused. Old sessions remain revoked.

2.7 Account Appeal

- One appeal per disable action.
- Reviewer must have higher or wider authority.
- Original disabling actor cannot review the appeal.
- Appeal approval does not automatically reactivate the account.
- Approved appeal permits a separate Reactivation process.
- Rejection leaves the account DISABLED.

2.8 Authentication Scope Limitations

The following are not yet implemented or remain pending:

- Password Reset.
- WhatsApp OTP.
- Two-factor authentication.
- Passport-based login.

3. Ahbab Profile Management

3.1 Profile Data

Ahbab profile stores the user's personal and operational information.

Profile data must be separated from authentication credentials, account status and administrative roles.

3.2 Profile Editing

Ahbab may edit permitted profile fields.

The system must distinguish:

- User-editable information.
- System-generated information.
- Admin-managed information.
- Verified identity information.

3.3 Protected Identity Information

National ID or Passport identity information must not be directly editable through ordinary profile editing.

Any correction must follow an authorized verification process and preserve history.

3.4 Profile Verification

The system must record:

- Submitted value.
- Previous value where applicable.
- Verification status.
- Verifying Admin.
- Verification timestamp.
- Reason or supporting basis where required.

The verifier need not be the same person as a TAFAKUT assessor.

3.5 KAWAIF Relationship

KAWAIF is a separate qualification and experience record associated with the Ahbab profile.

It must not be treated as a substitute for the Ahbab profile or as an automatic TAFAKUT decision.

4. Organization Structure and Governance

4.1 Administrative Roles

The system distinguishes:

- SUPER_ADMIN.
- Country ADMIN.
- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.

Each role has a defined scope.

Permissions must be enforced by the backend, not merely hidden in the frontend.

4.2 SUPER_ADMIN

SUPER_ADMIN has global system administration scope.

It does not automatically become the operational decision-maker for every Takaza or local organization matter.

4.3 Country ADMIN

Country ADMIN operates within the assigned country scope.

Access to another country requires an explicitly authorized arrangement.

4.4 Organization Hierarchy

Potential organization levels:

- Markaz Negara.
- Negeri.
- Daerah.
- Kawasan.
- Mohallah.

The final country hierarchy is configurable or pending confirmation.

Markaz Negara may supervise Negara Naungan without merging country records.

4.5 Chief Admin and Deputy

Each organizational level has one Chief Admin and may have one or more Deputies.

Faisalah is the title of the Markaz Negeri Chief Admin.

Appointment and removal procedures remain pending.

4.6 Cross-Organization Support

Cross-organization support requires:

- Consent of both Chief Admins.
- Defined task and scope.
- Start and end dates.
- Audit history.

Temporary support must not create unrestricted permanent access.

5. Syukbah Management

5.1 Syukbah Structure

Syukbah is separate from the organization hierarchy.

Global Baseline Syukbah is managed by SUPER_ADMIN.

Countries use the common baseline. Not every Syukbah must be activated in every country.

Additional country-specific Syukbah requires an approval process that remains pending.

5.2 Syukbah Administration

Each Syukbah has:

- One Admin Syukbah.
- One or more Deputies.

Admin Syukbah is automatically a Moderator in the discussion area of their own Syukbah.

Admin Syukbah may appoint and remove moderators.

5.3 Moderator Permissions

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

5.4 CMS Separation

CMS is a separate module.

Discussion content does not automatically become official CMS content.

5.5 Delegation

Deputy and acting authority must be explicitly assigned.

No unrestricted authority is implied by the Deputy title alone.

Detailed delegation rules remain pending.

6. Jemaah Membership

6.1 Membership Record

Jemaah membership is separate from Takaza participation.

The system must preserve membership history and distinguish current membership from historical membership.

6.2 Membership and Takaza

Being a Jemaah member does not automatically make someone a confirmed Takaza participant.

Takaza participation must follow its own confirmation process.

6.3 Historical V1 Mapping

Relevant V1 Project Member records map to V2 Takaza Participation.

V2 must not create a separate Project Member entity.

7. Takaza Management

7.1 Takaza Hierarchy

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

7.2 Takaza Status

Permitted statuses:

- "DRAFT"
- "RELEASED"
- "ACTIVE"
- "ON_HOLD"
- "COMPLETED"
- "CANCELLED"

7.3 Creation and Activation

Admin may create Main and Sub Takaza.

Admin may verify and activate without SUPER_ADMIN approval.

Incomplete setup, including missing Amer or participant arrangements, may be permitted with visible warnings where the approved workflow allows it.

7.4 Participation Methods

The system supports:

- "AUTOMATIC_INCLUSION"
- "VOLUNTARY_APPLICATION"
- "ADMIN_NOMINATION"
- "DIRECT_ASSIGNMENT"

Methods may be combined.

Admin may configure conditions for each method.

After RELEASED or ACTIVE, changes apply only to new participation and undecided applications. Existing participants are not automatically affected.

7.5 Automatic Inclusion

Automatic inclusion creates a candidate with status:

"PENDING_ADMIN_CONFIRMATION"

Admin must confirm before participation becomes effective.

This applies even to existing Jemaah members at Main Takaza formation.

Ahbab joining a Jemaah after Takaza activation must also enter the confirmation process.

7.6 Voluntary Application

Ahbab may apply to participate.

Admin makes the final participation decision.

For Sub Takaza, Ahbab consent and TAFAKUT apply as required by the approved criteria.

7.7 Admin Nomination

Admin may nominate an Ahbab.

Ahbab consent is required.

For Sub Takaza, TAFAKUT applies where required.

A TAFAKUT PASS does not automatically approve participation.

7.8 Direct Assignment

Direct Assignment is a supported method.

Consent, TAFAKUT and confirmation safeguards remain pending.

The method must not be assumed to bypass normal safeguards.

7.9 Capacity

Admin may change capacity at any time.

If capacity is reduced below existing participation:

- Existing participants remain.
- System displays an over-capacity warning.
- New capacity applies to future participation.
- No waiting list is required.

8. Amer Appointment

8.1 Eligibility

Every Main and Sub Takaza has its own Amer.

The Amer candidate must already be a confirmed participant in the same Takaza before appointment becomes effective.

If not yet a confirmed participant, the normal participation process must first be completed.

8.2 Appointment Timing

Appointment may take place before the official Takaza start date.

Takaza does not need to be ACTIVE before the appointment.

Both Admin and candidate consent are required.

8.3 TAFAKUT

A separate Amer TAFAKUT is not required where valid prior TAFAKUT exists.

Suitability may be considered in the next TAFAKUT round.

8.4 Appointment Duration

Appointment normally aligns with Takaza duration.

Admin may shorten, extend or end the appointment early.

Appointment changes do not change Takaza dates or status.

All changes must be audited.

8.5 Expiry

If the Amer appointment expires while Takaza remains ACTIVE:

- Amer role ends.
- Admin is notified.
- Takaza remains ACTIVE.

8.6 Replacement

Admin may replace Amer before appointment expiry.

Requirements:

- Reason recorded.
- Justification from at least one other Admin.
- Second Admin provides justification only and has no veto.
- Managing Admin makes the final decision.
- Previous appointment history is retained.

9. Supervisor Appointment

Supervisor appointment is provisionally based on consent.

The selected person and Admin must consent.

Appointment duration temporarily follows Amer principles.

Admin may shorten, extend or end the appointment early.

Changes must be audited and must not change Takaza dates or status.

Pending decisions:

- Whether Supervisor must be a confirmed participant.
- Supervisor authority and scope.
- Whether any delegated authority is permitted.

No special Supervisor permission may be implemented without an approved decision.

10. KAWAIF

10.1 Purpose

KAWAIF records Ahbab qualifications, experience and relevant capabilities.

It is reference information, not a TAFAKUT result.

10.2 Data Management

Ahbab may submit and edit information pending Admin verification.

Admin may add or update missing or outdated information.

Each record must preserve:

- Source and basis.
- Previous value.
- New value.
- Actor.
- Timestamp.
- Verification status.

10.3 Governance

Higher or wider-scope Admin controls:

- Categories.
- Criteria.
- Scoring.
- Eligibility rules.

KAWAIF data may be used as a reference during participation and TAFAKUT processes.

11. TAFAKUT

11.1 Independent Assessors

Each round uses exactly two independent Admin assessors.

Decision rules:

Assessor 1| Assessor 2| Outcome
PASS| PASS| PASS
FAIL| FAIL| FAIL
PASS| FAIL| Third Admin
FAIL| PASS| Third Admin

A disagreement requires a third Admin.

11.2 Additional Rounds

Every additional round uses two new assessors who have not assessed the candidate previously.

Higher or wider-scope Admin appoints assessors.

11.3 Assessor Replacement

If an assessor cannot continue:

- Replace the assessor.
- Preserve completed work.
- Do not restart the entire assessment.

11.4 Submission Integrity

Assessors see each other's work only after both submit.

Submitted records are immutable.

Reassessment creates a new record.

11.5 Eligibility Status

"SUSPEND" affects participation eligibility.

"ON_HOLD" pauses the process or decision.

Neither status changes account login, account status or profile status.

FAIL is not a permanent ban.

There is no fixed waiting period or attempt limit.

11.6 Managing Admin Decision

Managing Admin may make a final decision that differs from the assessment majority.

Justification is mandatory.

11.7 Forms and Templates

Higher or wider-scope Admin controls form types, templates, criteria, questions, ordering and input types.

Takaza Admin selects the form type and round but cannot edit the template.

Every template change creates a new version.

Old versions remain retained and linked to assessment records.

11.8 Data Sources

TAFAKUT data may come from:

- System/profile/activity data.
- Ahbab input.
- Assessor input.

Ahbab may request correction of system-populated data.

Original source data must not be overwritten before Admin verification.

The verifier may differ from the assessors.

11.9 Ahbab Form

Ahbab may save, resume and edit a draft before submission.

After submission, the form is locked.

Corrections require Admin intervention.

11.10 Assessor Form

Assessors normally submit directly.

Admin may return an opened but unsubmitted form to DRAFT with a reason.

11.11 Notifications and Visibility

Notify Ahbab when:

- TAFAKUT form is opened.
- Final decision is made.

Notify assessors when assigned.

Use each user's language.

No automatic reminders or mandatory deadlines are included in this baseline.

Ahbab may view comments and final decision after completion but cannot reply through the TAFAKUT workflow.

12. Withdrawal, Removal and Appeal

12.1 Withdrawal

Ahbab may request withdrawal.

Status becomes "WITHDRAWN" only after Admin confirms.

Admin acknowledges the request and cannot block a valid withdrawal request.

Request and confirmation dates must be recorded.

12.2 Removal

Managing Admin may remove a participant at any time.

Removal requires justification from at least one other Admin.

The second Admin provides justification only and has no veto.

Managing Admin makes the final decision.

Ahbab must be notified with the reason.

12.3 Appeal

Appeal is reviewed by a higher or wider-scope Admin.

Appeal does not automatically change status.

Successful appeal may restore participation without a new participation process.

Original removal remains in history.

Denied appeal does not permanently prevent future normal reapplication or TAFAKUT where required.

12.4 Rejoining

"WITHDRAWN" and "REMOVED" are distinct statuses.

Rejoining creates a new linked participation record.

Previous records remain available.

13. Transfer

Transfer requires:

1. Consent of relevant parties.
2. New TAFAKUT for the receiving Takaza.
3. Admin decision.
4. New participation record.

Original participation record remains preserved.

14. Events and Activities

14.1 Event Scheduling

Events are flexible and are not fixed to three.

Admin determines events for each Takaza.

Possible stages:

- Before start.
- Commencement.
- During Takaza.
- Before end.
- End date.

14.2 Existing Activities

Admin may reuse an existing Aktiviti Khidmat record.

If no suitable record exists, Admin may create a new event.

14.3 Attendance

Events and attendance belong to the relevant Takaza.

Attendance and remarks are separate from Takaza lifecycle status.

Event templates remain pending.

15. Percha

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

15.1 Amendments

Admin proposes an amendment.

A different Admin must approve it.

If rejected, the original Percha remains unchanged.

Resubmission is permitted.

All versions and amendment history must be retained.

16. Kharguzari

Kharguzari is due one day before Bayan Wapsi.

Individual Kharguzari may be recorded by:

- Ahbab for their own record.
- Admin within authorized scope.

Amer may access the records for reporting.

Original Kharguzari is immutable.

Follow-up comments are separate records.

Comment authors may edit their own comments.

17. Amer Report and Takaza Completion

Full Amer report is mandatory before Takaza can become COMPLETED.

If end activities are completed but Amer report is missing:

- Report status is "OVERDUE".
- Takaza remains not COMPLETED.
- Amer remains responsible for submission.
- Admin may extend the due date.
- Original due date is retained.
- Extensions are recorded.
- Extension does not automatically complete Takaza.

Automatic completion is permitted only when all approved completion conditions are satisfied.

18. Takaza Cancellation

Cancellation creates a "Requires Attention" case automatically.

The case identifies the affected Takaza and Ahbab.

Cancellation does not automatically cancel each participant's participation.

Admin handles affected participants individually.

Full Case Management workflow remains ON HOLD.

19. Annual Archive

19.1 Access

Admin may access prior-year records within authorized scope.

Ahbab may access archive records only for Takaza in which they participated, even if currently inactive.

Ahbab must not access unrelated Takaza records.

19.2 Statistics

Archive statistics include:

- Main Takaza count.
- Sub Takaza count.
- Participant counts and statuses.
- Takaza count by year and status.

19.3 Filters

Confirmed filters:

- Country.
- Year.
- Status.

A separate Main Takaza filter remains pending.

19.4 Archive Operation

Archive is automatic by default.

Admin may add information subject to audit.

Correction policy remains pending by data type and scope.

Archive corrections must not silently overwrite original operational records.

PDF and Excel export are not included in the current baseline.

20. Annual Summary

Annual Summary is separate from operational records.

Summary levels:

- Country overall.
- Each Main Takaza.
- Each Sub Takaza.

Summary is normally prepared after completion. Interim summaries may be prepared while Takaza remains active.

Statuses:

- "DRAFT"
- "INTERIM"
- "FINAL"

Summary status is independent of Takaza status.

Summary contains statistics and commentary.

Attachments are not included in the current baseline.

21. Juhud Reports

Juhud Reports is a separate publication module.

It must remain distinct from:

- Takaza operational reports.
- Amer reports.
- Annual Archive.
- Annual Summary.

22. Notifications

Notifications must use the user's selected language.

Required notification events include:

- Account security events.
- OTP and authentication events.
- TAFAKUT assignment and decision.
- Relevant participation decisions.
- Amer and Supervisor appointment changes.
- Removal and appeal decisions.
- Takaza cancellation and relevant case creation.

No automatic reminders or mandatory deadlines are included unless separately approved.

23. Audit and History

Audit records must preserve relevant changes.

Where applicable, record:

- Entity and record identifier.
- Previous value.
- New value.
- Actor.
- Timestamp.
- Reason.
- Related approval or justification.

Ordinary history must not be physically deleted.

Sensitive information must not be exposed to users outside their authorized scope.

24. Authorization and Dashboard

Every module must enforce server-side authorization.

Dashboard visibility is not authorization.

Hiding a menu or button does not replace backend permission checks.

The UAC Matrix defines the permission baseline.

The Dashboard and Navigation Specification defines presentation and navigation behavior.

25. Implementation and Verification Notes

The following requirements must not be described as implemented without code and test evidence:

- Password Reset.
- WhatsApp OTP.
- Two-factor authentication.
- Passport login.
- Complete Amer appointment workflow.
- Supervisor workflow.
- KAWAIF.
- TAFAKUT.
- Full participation lifecycle.
- Events and attendance.
- Percha.
- Kharguzari.
- Amer report and completion.
- Annual Archive.
- Annual Summary.
- Full Case Management.

Implementation status must be maintained separately from requirements.

---

26. Related Documents

- "MASTER_DECISION_REGISTER.md"
- "OPEN_DECISIONS_REGISTER.md"
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

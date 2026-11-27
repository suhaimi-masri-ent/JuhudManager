JuhudManager V2 — Master Decision Register

Document ID: JMV2-MDR-001
Version: 4.0
Date: 27 November 2026
Status: Working Baseline — For Review

---

1. Purpose

This document is the central register of agreed decisions for JuhudManager V2.

It establishes a consistent reference for:

- Functional requirements
- Account and access governance
- Organization structure
- Syukbah management
- Jemaah and Takaza management
- KAWAIF and TAFAKUT
- Reporting and annual archive
- Audit and notification requirements

This register must be read together with the Open Decisions Register.

A requirement being documented does not mean it has already been implemented.

2. Decision Status

Status| Meaning
CONFIRMED| Agreed decision and usable as a V2 requirement
PROVISIONAL| Temporary agreed direction with limitations
PENDING| Decision has not been finalized
TBD| Details have not yet been specified
ON HOLD| Implementation or workflow is deferred
NOT IMPLEMENTED| Requirement exists but implementation is incomplete
NEEDS VERIFICATION| Implementation or deployment evidence is insufficient

3. Account, Identity and Authentication

3.1 Separation of Concepts

The following must remain separate:

- User identity
- Ahbab profile
- Login credentials
- Account status
- Access level
- User role
- Jemaah membership
- Takaza participation

One concept must not automatically determine another.

3.2 Account Status

Confirmed account statuses:

- "ACTIVE"
- "DISABLED"
- "SUSPENDED"

Access levels are separate:

- "PUBLIC"
- "LIMITED"
- "FULL"

Registration status is also separate from account status and access level.

3.3 Registration and OTP

Confirmed authentication requirements:

Item| Requirement
OTP length| 6 digits
OTP validity| 5 minutes
Maximum attempts| 5
Resend cooldown| 60 seconds
Identity reservation| 15 minutes
Minimum password length| 12 characters
Session idle timeout| 30 minutes
Maximum session lifetime| 12 hours

Email changes require OTP verification.

3.4 Password Reset

Decision: REQUIRED — NOT YET IMPLEMENTED

Password Reset / Forgot Password is a required V2 feature.

The approved direction is:

1. User submits the registered and verified email address.
2. System sends a six-digit OTP.
3. OTP follows the existing authentication policy.
4. User verifies the OTP.
5. User may establish a new password.
6. All existing sessions and tokens must be revoked.
7. System records an audit event.
8. System sends a security notification.

If the user no longer has access to the verified email, recovery must use a separate Admin-assisted process.

That process must not be treated as ordinary Password Reset.

Until implementation and testing are complete, the feature status remains "NOT IMPLEMENTED".

3.5 Account Disablement

When an account is "DISABLED":

- Login is blocked.
- Active sessions are terminated.
- Existing tokens are revoked.
- The action is audited.
- LIMITED access cannot override DISABLED status.

Pending-registration LIMITED access must not be confused with an Admin-disabled account.

3.6 Reactivation

Reactivation requires a separate authorized workflow.

Requirements:

- A new password must be established.
- The previous password cannot be reused.
- Old sessions remain revoked.
- Reactivation must be audited.
- No automatic reactivation is permitted.

3.7 Account Appeal

Confirmed rules:

- One appeal is available for each disable action.
- Reviewer must have higher or wider authority than the original actor.
- Original actor cannot review the appeal.
- Appeal approval does not automatically reactivate the account.
- Approval permits a separate Reactivation workflow.
- Rejection leaves the account DISABLED.
- A subsequent new disable action creates a new appeal opportunity.

3.8 Authentication Features Not Yet Implemented

- Password Reset
- WhatsApp OTP
- Two-factor authentication

Passport-based login remains pending.

4. Organization Structure and Governance

4.1 Administrative Scope

- "SUPER_ADMIN" has global system administration scope.
- Country "ADMIN" has administrative scope within the assigned country.
- System administration authority is distinct from organizational leadership authority.

4.2 Country and Markaz Relationships

Markaz Negara may supervise Negara Naungan.

However:

- Country records remain separate.
- Supervisory relationships do not merge country records.
- Country identity and ownership remain independently identifiable.

4.3 Organizational Leadership

Confirmed principles:

- One Chief Admin per organizational level.
- One or more Deputies may be appointed.
- "Faisalah" is the title of the Chief Admin of Markaz Negeri.

The following administrative functions remain distinct:

- Admin Markaz
- Admin Syukbah
- Admin Takaza

Their permissions must not automatically overlap.

4.4 Cross-Organization Support

Cross-organization support requires:

1. Consent from both relevant Chief Admins.
2. Clearly defined task.
3. Clearly defined scope.
4. Start date.
5. End date.
6. Auditable record.

4.5 Unresolved Governance Decisions

The final Markaz Negara governance model remains pending.

The alternatives are:

- Amer Negara as final authority; OR
- Ahli Syura with Faisalah as final authority.

Neither option is approved as the final model.

Country-specific organization hierarchy also remains pending.

5. Syukbah Management

5.1 Syukbah Structure

Syukbah is a work and administrative structure separate from the organization hierarchy.

Global Baseline Syukbah:

- Managed by SUPER_ADMIN.
- Provides a common baseline for countries.
- Does not require every baseline Syukbah to be activated in every country.

Additional country-specific Syukbah may be established subject to an approval process that remains pending.

5.2 Syukbah Administration

- One Admin Syukbah per Syukbah.
- One or more Deputies may be appointed.
- Admin Syukbah automatically becomes Moderator in the discussion space of their own Syukbah.
- Admin Syukbah may appoint or remove moderators.

5.3 Moderator Permissions

Moderator may:

- Publish comments.
- Delete other users' comments.
- Perform soft deletion with audit history.

Moderator may not:

- Edit another user's comment.
- Hide comments.
- Pin comments.
- Unpin comments.

Users may delete their own comments.

CMS remains separate from the discussion module.

Discussion content is not automatically official CMS content.

6. Jemaah and Takaza

6.1 Separate Membership and Participation

Jemaah membership and Takaza participation are separate records.

V1 Project Member records map to V2 Takaza Participation where relevant.

V2 must not introduce a separate Project Member entity.

6.2 Takaza Structure

Only two levels are permitted:

- Main Takaza
- Sub Takaza

Rules:

- Maximum two levels.
- Sub Takaza cannot have children.
- Main and Sub must belong to the same country.
- Main and Sub lifecycles are independent.
- No automatic cascade between Main and Sub.
- Takaza must not be physically deleted.

6.3 Takaza Status

Permitted statuses:

- "DRAFT"
- "RELEASED"
- "ACTIVE"
- "ON_HOLD"
- "COMPLETED"
- "CANCELLED"

Admin may create, verify and activate Main or Sub Takaza without requiring SUPER_ADMIN.

Incomplete Amer, participant or Supervisor setup may be allowed where policy permits, with warnings displayed.

6.4 Participation Methods

The system supports four configurable methods:

1. "AUTOMATIC_INCLUSION"
2. "VOLUNTARY_APPLICATION"
3. "ADMIN_NOMINATION"
4. "DIRECT_ASSIGNMENT"

Methods may be combined within one Takaza.

Automatic Inclusion

- Creates a candidate record.
- Candidate status is "PENDING_ADMIN_CONFIRMATION".
- Admin confirmation is required before participation becomes effective.
- Existing Jemaah members at Main Takaza formation also require confirmation.
- Ahbab joining a Jemaah after Takaza becomes ACTIVE also require Admin confirmation.

Voluntary Application

Ahbab submits an application.

Admin makes the final participation decision.

Admin Nomination

Admin nominates an Ahbab.

Ahbab consent is required.

For Sub Takaza, TAFAKUT applies where required.

Direct Assignment

Direct Assignment is supported as a configurable method.

Its consent and TAFAKUT requirements remain pending.

It must not be assumed to bypass normal safeguards.

Configuration Changes

After Takaza becomes RELEASED or ACTIVE:

- Changes apply to new participation.
- Changes apply to undecided applications.
- Existing participants are not automatically affected.

6.5 Amer Appointment

Every Main and Sub Takaza has its own Amer.

The following rule is mandatory:

The Amer candidate must already be a confirmed participant in the same Takaza before the appointment becomes effective.

If the candidate is not yet a confirmed participant, participation must first be resolved through the normal process.

Appointment may occur before the official Takaza start date. It does not need to wait until Takaza becomes ACTIVE.

Both Admin and candidate consent are required.

No separate Amer TAFAKUT is required where valid prior TAFAKUT exists. Suitability may be included in the next TAFAKUT round.

6.6 Amer Appointment Duration

- Appointment has start and end dates.
- Normally aligned with Takaza duration.
- Admin may shorten the appointment.
- Admin may extend the appointment.
- Admin may end the appointment early.
- These changes do not alter Takaza dates or status.
- All changes must be audited.

If Amer appointment expires while Takaza remains ACTIVE:

- Amer role ends.
- Admin is notified.
- Takaza remains ACTIVE unless separately changed.

6.7 Amer Replacement

Admin may replace Amer before appointment expiry.

Requirements:

- Reason must be recorded.
- Justification from at least one other Admin is required.
- Second Admin provides justification only.
- Second Admin does not have veto authority.
- Managing Admin makes the final decision.
- Previous appointment history remains available.

6.8 Supervisor

Supervisor appointment is provisional.

- Admin and selected person must consent.
- Appointment duration temporarily follows Amer principles.
- Admin may shorten, extend or end the appointment early.
- Appointment changes do not alter Takaza dates or status.
- Changes must be audited.

The following remain pending:

- Whether Supervisor must be a participant.
- Supervisor authority and scope.
- Any special permissions.

No special permissions may be assumed.

7. KAWAIF and TAFAKUT

7.1 KAWAIF

KAWAIF is a separate Ahbab qualification and experience record.

Rules:

- Ahbab may submit information.
- Ahbab may edit information pending Admin verification.
- Admin may add or update missing or outdated information.
- Source and basis must be recorded.
- Old and new values must be preserved.
- Actor and timestamp must be recorded.
- Higher or wider-scope Admin controls categories, criteria, scoring and eligibility.

KAWAIF is reference data and is not itself a TAFAKUT decision.

7.2 TAFAKUT Assessors

Each TAFAKUT round uses exactly two independent Admin assessors.

Decision rules:

Assessor 1| Assessor 2| Result
PASS| PASS| PASS
FAIL| FAIL| FAIL
PASS| FAIL| Third Admin required
FAIL| PASS| Third Admin required

Every additional round must use two new assessors who have not previously assessed that candidate.

Higher or wider-scope Admin appoints assessors.

If an assessor cannot continue:

- Replace the assessor.
- Do not restart the whole assessment.
- Preserve completed assessment work.

Assessors cannot see each other's work until both submit.

Submitted assessment records are immutable.

Reassessment creates a new record.

FAIL is not a permanent ban.

There is no fixed waiting period or attempt limit.

7.3 TAFAKUT Process Status

- "SUSPEND" affects eligibility for participation.
- "ON_HOLD" pauses process or decision.

Neither status changes account login, account status or profile status.

7.4 Final Admin Decision

Managing Admin may make a final decision different from the majority assessment result.

Justification is mandatory.

7.5 TAFAKUT Forms

Higher or wider-scope Admin controls:

- Form types.
- Templates.
- Criteria.
- Questions.
- Question order.
- Input types.
- Additional questions.
- Form configuration.

Takaza Admin may select the form type and round but may not edit the template.

Every template change creates a new version.

Old versions remain retained and linked to the relevant assessment process.

7.6 TAFAKUT Data

Data sources:

- Automatically populated system/profile/activity data.
- Ahbab-entered data.
- Assessor-entered data.

Ahbab may review automatically populated data and request correction.

Source records must not be overwritten until Admin verification.

7.7 Submission

Ahbab may:

- Save draft.
- Resume draft.
- Edit before submission.

After submission, the form is locked.

Corrections after submission go through Admin.

Assessors normally submit directly.

Admin may return an assessor form to DRAFT with a recorded reason.

7.8 Notifications

- Notify Ahbab when a form is opened.
- Notify Ahbab when a decision is made.
- Notify assessors when assigned.
- Use each user's language.
- No automatic reminders or mandatory deadlines at this baseline.

Ahbab may view comments and the final decision after completion.

No reply or feedback workflow is included.

8. Withdrawal, Removal, Appeal and Transfer

8.1 Withdrawal

- Ahbab requests withdrawal.
- Status becomes "WITHDRAWN" only after Admin confirms.
- Admin acknowledges the request and cannot block a valid withdrawal request.
- Request date and confirmation date are recorded.

8.2 Removal

Managing Admin may remove a participant at any time.

Requirements:

- Justification from at least one other Admin.
- Second Admin provides justification only.
- Second Admin has no veto.
- Managing Admin makes the final decision.
- Ahbab is notified with the reason.

8.3 Appeal

- Appeal is reviewed by a higher or wider-scope Admin.
- Appeal does not automatically change participation status.
- Successful appeal may restore participation without a new participation process.
- Original removal record remains preserved.
- Denied appeal permits future normal reapplication and TAFAKUT where required.

8.4 Distinct Statuses

"WITHDRAWN" and "REMOVED" are different states.

Rejoining creates a new linked participation record.

Previous history must remain available.

8.5 Transfer

Transfer requires:

- Consent of relevant parties.
- New TAFAKUT for the receiving Takaza.
- Admin decision.
- New participation record.

Original participation record remains preserved.

9. Capacity

Capacity may be changed at any time.

If capacity is reduced below the existing participant count:

- Existing participants remain.
- System displays an over-capacity warning.
- New capacity applies to future participation.
- No waiting list is required.

10. Events and Activities

Events are flexible and are not fixed to three.

Admin chooses event timing for each Takaza:

- Before start.
- Commencement.
- During Takaza.
- Before end.
- End date.

An existing Aktiviti Khidmat record may be reused.

Otherwise, Admin creates a new event.

Event and attendance belong to Takaza.

Attendance and remarks are separate from Takaza lifecycle status.

Event templates remain subject to future definition.

11. Percha and Kharguzari

11.1 Percha

Percha is generated after Bayan Hidayat.

Fields include:

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

Admin proposes amendments.

A different Admin must approve the amendment.

If rejected, original Percha remains unchanged.

Resubmission is allowed.

All versions and changes must be retained.

11.2 Kharguzari

Kharguzari is due one day before Bayan Wapsi.

Individual Kharguzari:

- Ahbab may record their own.
- Admin may record within authorized scope.
- Amer may access records for reporting.

Original Kharguzari is immutable.

Follow-up comments are separate records.

Comment author may edit their own comment.

12. Amer Report and Completion

Full Amer report is mandatory before Takaza completion.

If end activities are complete but Amer report is missing:

- Report status becomes "OVERDUE".
- Takaza must not become "COMPLETED".
- Amer remains responsible for submission.
- Admin may extend the due date.
- Original due date must be preserved.
- Every extension must be recorded.
- Extension does not automatically complete Takaza.

13. Cancellation

Cancellation creates a "Requires Attention" case automatically.

The case identifies:

- Affected Takaza.
- Affected Ahbab.

Cancellation does not automatically cancel each participant's participation.

Admin handles each affected participant individually.

Full Case Management workflow remains ON HOLD.

14. Annual Archive

Admin may access prior-year records within authorized scope.

Ahbab may access archive records only for Takaza in which they participated, even if their current status is inactive.

Ahbab cannot access unrelated Takaza archive records.

Statistics include:

- Main Takaza count.
- Sub Takaza count.
- Participant counts and statuses.
- Takaza count by year and status.

Filters:

- Country.
- Year.
- Status.

Main Takaza filter remains optional/TBD.

No PDF or Excel export is included in this baseline.

Archive is automatic by default.

Admin may add information, subject to audit.

Correction policy remains TBD by data type and scope.

Archive changes must not silently rewrite original operational transactions.

15. Annual Summary

Admin Notes / Annual Summary is separate from operational records.

Summary levels:

- Country overall.
- Each Main Takaza.
- Each Sub Takaza.

Normally prepared after completion.

Interim summaries may be prepared while Takaza is active.

Statuses:

- "DRAFT"
- "INTERIM"
- "FINAL"

Summary status is independent of Takaza status.

Summary contains statistics and commentary.

Attachments are not included in this baseline.

16. Notifications and Audit

Notifications use each user's language.

No automatic reminders or mandatory deadlines are required unless separately approved.

Audit records preserve, where applicable:

- Previous value.
- New value.
- Actor.
- Timestamp.
- Reason.

Ordinary operational history must not be deleted.

17. Separate Publication Module

Juhud Reports is a separate publication module.

It must not be conflated with:

- Takaza operational reports.
- Amer reports.
- Annual Archive.
- Annual Summary.

---

18. Related Documents

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

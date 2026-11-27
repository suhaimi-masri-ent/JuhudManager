
# JUHUDMANAGER V2 — USER ACCESS CONTROL MATRIX (UAC)

**Document ID:** UAC-V2  
**Version:** 2.1 — Consolidated Authorization Baseline  
**Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Scope:** Authentication, account access, system roles, administrative appointments, delegation, resource permissions and authorization  
**Applies to:** JuhudManager V2  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/docs/UAC_MATRIX.md`

---

## 1. Purpose

This document defines the User Access Control (UAC) model for JuhudManager V2.

The UAC model separates authorization into five dimensions:

1. Authentication — establishes the identity of the user through a valid server-side session.
2. Account and Access State — determines whether the account is permitted to access the system and at what level.
3. Role — determines the user's assigned system-level responsibilities.
4. Appointment and Delegation — determines operational responsibilities assigned within an organization, Syukbah or Takaza.
5. Resource Permission — determines which specific records and resources the user may access or modify.

A user must pass every applicable authorization check before an API performs an action.

No single role, appointment or relationship automatically grants unrestricted access.

This document establishes authorization boundaries. It does not independently create business authority, approve organizational appointments or resolve matters that remain open in the official decision registers.

## 2. Core Authorization Principles

The following principles apply throughout V2:

- A valid authenticated session is required for all non-public functions.
- Account status and registration status must be read from trusted database records.
- Role assignments must be read from database role assignments.
- Client-supplied roles, access levels, user IDs or appointment details must never be trusted as proof of authorization.
- Resource access must be checked against actual relationships and ownership in the database.
- Administrative authority is limited to the administrator's approved scope.
- Having an administrative role does not automatically make the administrator an Ahbab, Jemaah member, Takaza participant or Amer.
- An operational appointment does not automatically grant unrelated administrative permissions.
- Delegated authority must have an explicit scope and, where applicable, a defined duration.
- The frontend may hide unavailable functions for usability, but backend authorization is authoritative.
- The API must deny by default when authorization cannot be established.
- Sensitive actions must be audited.
- A role or appointment must not be treated as proof of consent.
- Required second-Admin approval and second-Admin justification must be enforced as different authorization requirements.
- A decision-maker must not overwrite the independent assessment or approval records used to support a decision.
- Historical access must be distinguished from current operational access.
- Authorization must be checked again when a sensitive action is submitted, not only when a page is opened.

## 3. Authentication, Account Status and Access Level

These concepts must remain separate.

### 3.1 Authentication

Authentication verifies the identity of the user.

A protected request must establish:

- The session exists and is valid.
- The session has not expired.
- The session has not been revoked.
- The session belongs to the authenticated user.
- The session is obtained through the server-side authentication mechanism.

Never accept a client-supplied `user_id`, role, access level or session object as proof of identity.

### 3.2 Account Status

The account status values are:

- `ACTIVE`
- `DISABLED`
- `SUSPENDED`

| Account Status | Meaning |
|---|---|
| `ACTIVE` | Account is enabled, subject to registration and authorization checks |
| `DISABLED` | Account is disabled and normal authenticated access is not permitted |
| `SUSPENDED` | Account is suspended and normal authenticated access is not permitted |

A disabled or suspended account must not receive normal operational access.

Any permitted account recovery, email verification or security process must use its specifically authorized endpoints.

An appointment or role remaining in the database does not override a disabled or suspended account.

### 3.3 Access Levels

Access Level is a derived authorization state, not a database role.

| Access Level | Condition | Baseline Access |
|---|---|---|
| `PUBLIC` | No authenticated session | Public registration and authentication endpoints |
| `LIMITED` | Eligible verified user awaiting registration review, subject to account policy | Own permitted profile and registration functions |
| `FULL` | Registration approved and account active | Functions permitted by assigned roles, appointments and resource relationships |

`LIMITED` does not mean that every `DISABLED` account may log in.

The system must distinguish an eligible pending-review account from an account disabled for security, administrative or other reasons.

### 3.4 LIMITED Access

A LIMITED user may, where account policy permits:

- View their own profile.
- Update permitted fields in their own profile.
- View their own registration status.
- Change their own password where permitted.
- Manage their own sessions where supported.
- Complete permitted registration-related actions.

A LIMITED user may not:

- Access Jemaah operational functions.
- Access Takaza operational functions.
- Access Syukbah operational functions.
- Create or update Rekod Amal unless explicitly permitted.
- Access administrative functions.
- Access another user's private information or records.
- Obtain access to operational records through a pending appointment.

### 3.5 FULL Access

FULL is an account access level, not a role.

A FULL user must still have the relevant role, appointment and resource permission for each operation.

For example:

- FULL alone does not grant AHBAB capabilities.
- FULL alone does not grant ADMIN capabilities.
- FULL alone does not grant SUPER_ADMIN capabilities.
- FULL alone does not make a user a Takaza participant or Amer.
- FULL alone does not grant access to every country, organization, Syukbah or Takaza.

## 4. System Roles

The baseline system roles are:

- `SUPER_ADMIN`
- `ADMIN`
- `AHBAB`

Roles are additive database assignments.

The authorization layer must not infer a role from:

- User name.
- Email address.
- Registration status.
- UI selection.
- Request payload.
- Organization membership alone.
- Takaza participation alone.
- Appointment title alone.

### 4.1 SUPER_ADMIN

SUPER_ADMIN has global system-administration authority.

Baseline responsibilities include:

- Global system configuration.
- Global Baseline Syukbah management.
- Authorized global oversight.
- Global role and access administration.
- Authorized system-level audit access.
- Other explicitly approved global functions.

SUPER_ADMIN does not automatically become:

- An Ahbab.
- A Jemaah member.
- A Takaza participant.
- An Amer.
- An Admin Syukbah.
- An Admin Takaza.
- An organizational Chief Admin.

SUPER_ADMIN must not bypass business-level authorship and ownership rules through ordinary application endpoints.

Any exceptional break-glass capability must be separately specified, permission-controlled and audited.

Global system authority does not mean that SUPER_ADMIN becomes the author of another user's report, assessment, Kharguzari or decision.

### 4.2 ADMIN

ADMIN is the administrative system role.

An ADMIN must have an explicitly defined administrative scope.

Possible scopes include:

- Country.
- Organization or Markaz.
- Specific Syukbah.
- Specific Takaza.
- Other approved administrative scope.

ADMIN must not be treated as a universal unrestricted role.

Administrative permissions are determined by:

- Assigned role.
- Approved administrative scope.
- Functional appointment, where applicable.
- Resource-level authorization.
- Applicable approval requirements.
- Valid delegation, where applicable.

### 4.3 AHBAB

AHBAB is the user role for an approved Ahbab account.

An AHBAB may access permitted functions according to:

- Their own profile ownership.
- Jemaah membership.
- Takaza participation.
- Specific appointments.
- Resource-level permissions.

AHBAB does not automatically grant access to every Jemaah, Takaza or organizational record.

### 4.4 Role Assignment

Role assignment must be performed through an authorized process.

The system must record:

- User receiving the role.
- Role assigned or removed.
- Actor.
- Administrative scope.
- Effective date.
- End date, if applicable.
- Reason or approval reference.
- Status.
- Audit history.

A role must not be inferred from a successful registration, profile update or appointment proposal.

Whether every approved registration automatically receives the AHBAB role remains subject to the relevant registration and role-assignment decision.

## 5. Functional Appointments and Operational Responsibilities

Functional appointments are separate from system roles.

They must be stored and authorized as explicit assignments with scope and history.

The following appointments must not automatically create unrestricted system roles.

### 5.1 Admin Markaz

Admin Markaz is an administrative appointment within an approved organizational scope.

Permissions depend on:

- Organization level.
- Country or organizational scope.
- Appointment status.
- Specific UAC permissions.
- Applicable governance and approval rules.

Admin Markaz does not automatically receive global SUPER_ADMIN authority.

### 5.2 Admin Syukbah

Admin Syukbah is an operational appointment for a specific Syukbah and organizational scope.

The Admin Syukbah may:

- Manage the assigned Syukbah's operations.
- Assign tasks to its Deputy.
- Manage its own Syukbah discussion.
- Add or remove additional moderators.
- View and manage records within the assigned scope.
- Prepare Syukbah reports.

The Admin Syukbah must not automatically:

- Manage every Syukbah.
- Manage the entire Markaz.
- Manage Takaza outside the assigned scope.
- Change official organizational decisions.
- Access unrelated sensitive records.
- Obtain global ADMIN or SUPER_ADMIN authority.

The authority to appoint or terminate Admin Syukbah remains subject to the approved governance process and relevant open decisions.

### 5.3 Deputy Admin Syukbah

Deputy Admin Syukbah assists the assigned Admin Syukbah.

The Deputy may:

- Perform assigned tasks.
- Access records required for assigned tasks.
- Carry out authorized temporary acting duties.

The Deputy does not automatically inherit all Admin Syukbah permissions.

Acting authority must specify:

- The person acting.
- The delegating authority.
- Scope.
- Start date.
- End date.
- Reason, where required.

The complete Deputy delegation and acting-authority rules remain subject to the relevant open decision.

### 5.4 Admin Takaza

Admin Takaza is an operational appointment for a specific Takaza or approved Takaza management scope.

The Admin Takaza may:

- Create and manage Takaza records within the assigned scope.
- Configure permitted participation methods.
- Review applications and nominations.
- Confirm participants.
- Manage permitted TAFAKUT processes.
- Appoint Amer and Supervisor according to approved rules.
- Manage activities, Percha and reports.
- Manage participant withdrawal and removal according to the applicable workflow.
- Manage Takaza completion and cancellation according to approved rules.
- Review and decide operational matters within the assigned scope.

Admin Takaza does not automatically become a participant, Amer or Supervisor.

Admin Takaza must not exercise authority over an unrelated Takaza merely because the same person administers another Takaza.

### 5.5 Amer

Amer is an appointment within a specific Main Takaza or Sub Takaza.

The Amer must:

- Already be a confirmed participant in the same Takaza before the appointment becomes effective.
- Consent to the appointment.
- Be appointed by an authorized Admin.
- Have a valid appointment period.

Amer retains participant status.

Additional permissions may include:

- Preparing and submitting the full Takaza report.
- Accessing permitted individual Kharguzari records for reporting.
- Recording assigned Takaza activities.
- Performing other explicitly approved Amer responsibilities.
- Commenting on permitted Takaza records.

Amer cannot:

- Manage unrelated Takaza.
- Modify another author's original report.
- Change official Takaza configuration unless separately authorized.
- Change the Takaza's official dates through ordinary participant permissions.
- Approve their own appointment.
- Grant themselves additional permissions.
- Override an Admin decision.
- Modify another assessor's submitted TAFAKUT assessment.

Amer appointment is limited to the relevant Takaza and its approved duration.

Every Main Takaza and every Sub Takaza has its own Amer appointment.

### 5.6 Supervisor

Supervisor is a separate appointment for a specific Takaza.

Supervisor appointment is currently PROVISIONAL.

The system must not assume that Supervisor:

- Is automatically a participant.
- Has Amer permissions.
- Has Admin permissions.
- Can make final Takaza decisions.
- Can approve or reject participant decisions.
- Can access all participant records or reports.
- Can act on behalf of Amer or Admin.

Supervisor authority and eligibility remain OPEN DECISIONS.

No special permissions may be implemented until the relevant authority and eligibility rules are approved.

### 5.7 Moderator

Moderator is a discussion-specific permission assignment.

The Admin Syukbah automatically becomes Moderator of the discussion for their own Syukbah during the valid appointment.

An Admin Syukbah may add or remove additional moderators within the assigned Syukbah.

Moderator permissions are limited to:

- Creating comments.
- Deleting comments.

Moderator cannot:

- Edit another user's comment.
- Hide comments.
- Pin comments.
- Unpin comments.
- Change Syukbah operational records.
- Make official organizational decisions.

A user may delete their own comment.

Deleted comments must use soft-delete and preserve audit history.

Moderator status does not grant administrative access to Syukbah records.

### 5.8 TAFAKUT Assessor

TAFAKUT Assessor is an assignment for a specific assessment process and round.

An assessor may:

- Access the assigned assessment form.
- Review permitted information.
- Submit an independent assessment.
- View other assessment work only after the required submission conditions are met.
- View the records required for the assigned assessment.

An assessor must not:

- Access unrelated assessment records.
- Modify another assessor's submitted work.
- Reopen or overwrite a completed assessment.
- Use the assessment assignment to obtain unrelated administrative access.
- Reuse a previous assessor assignment in a subsequent additional round for the same candidate.

Assessor assignments and assessment actions must be audited.

A third assessor appointed to resolve a disagreement has access only to the relevant assessment process and assigned task.

### 5.9 Other Temporary or Special Appointments

Any additional appointment must be explicitly defined before implementation.

At minimum, the assignment must specify:

- Appointment type.
- Appointee.
- Assigning authority.
- Scope.
- Permissions.
- Effective date.
- End date, where applicable.
- Delegation conditions.
- Revocation process.
- Audit requirements.

A new appointment must not inherit permissions merely because it has a similar title to an existing appointment.

## 6. Role and Appointment Matrix

Legend:

- Allow — baseline permission.
- Conditional — permission requires the relevant relationship, assignment or scope.
- Administer — authorized administrative capability within scope.
- Appointment — permission exists only while the relevant appointment is valid.
- — — not permitted by this baseline.

| Function | PUBLIC | LIMITED | AHBAB | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|
| Start registration | Allow | — | — | — | — |
| Request registration email OTP | Allow | — | — | — | — |
| Verify registration email OTP | Allow | — | — | — | — |
| Login | Allow | Conditional | Allow | Allow | Allow |
| View own registration status | — | Allow | Allow | Allow | Allow |
| View own profile | — | Allow | Allow | Allow | Allow |
| Update own permitted profile fields | — | Allow | Allow | Allow | Allow |
| Change own password | — | Conditional | Allow | Allow | Allow |
| Manage own sessions | — | Conditional | Allow | Allow | Allow |
| Access own Jemaah records | — | — | Conditional | Conditional | Conditional |
| Access own Takaza records | — | — | Conditional | Conditional | Conditional |
| Access Syukbah discussion | — | — | Conditional | Conditional | Conditional |
| Update own Rekod Amal | — | — | Conditional | — | — |
| Apply for Takaza | — | — | Conditional | — | — |
| Participate in TAFAKUT | — | — | Conditional | — | — |
| Assess assigned TAFAKUT | — | — | Appointment | Appointment | Appointment |
| Manage assigned Takaza | — | — | — | Appointment | Conditional |
| Prepare Amer report | — | — | Appointment | — | — |
| Manage assigned Syukbah | — | — | — | Appointment | Conditional |
| Moderate assigned discussion | — | — | Appointment | Appointment | Conditional |
| Review registrations | — | — | — | Administer | Administer |
| Manage users | — | — | — | Conditional | Administer |
| Manage role assignments | — | — | — | Conditional | Administer |
| Manage system configuration | — | — | — | Conditional | Administer |
| Manage Global Baseline Syukbah | — | — | — | — | Administer |
| Access audit logs | — | — | — | Conditional | Administer |

This table describes role-level capability categories only.

Appointment and resource-level checks are still mandatory.

A table entry does not override account status, scope restrictions, ownership rules or special approval requirements.

## 7. Resource-Level Authorization

Role and Access Level checks are not sufficient on their own.

### 7.1 AHBAB

An AHBAB may:

- Access their own profile.
- Access Jemaah records in which they are a member.
- Access Takaza records in which they are a confirmed participant.
- View their own Kharguzari.
- Update their own permitted Rekod Amal.
- Apply for Takaza according to its participation configuration.
- View permitted reports for Takaza in which they participate.
- Comment on Takaza where permitted.
- View their own applicable Annual Archive records.
- Access their own permitted registration and account-security functions.

An AHBAB must not access another person's private records merely because the account has FULL access.

### 7.2 Jemaah Membership

Jemaah membership grants access only to resources authorized for that membership.

- Membership does not automatically grant Takaza participation.
- Membership does not automatically grant Amer permissions.
- Membership does not grant administrative permissions.
- Membership history must be retained.
- A change in Jemaah membership must not silently alter unrelated Takaza records.

### 7.3 Takaza Participation

A confirmed Takaza participant may access permitted records for that Takaza.

Access depends on:

- Participation status.
- Takaza status.
- Resource type.
- Specific permission.
- Any applicable privacy restriction.

A candidate whose participation is still pending must not receive the same operational access as a confirmed participant.

`WITHDRAWN` and `REMOVED` participants do not automatically retain ordinary operational access, but their historical records must remain available to authorized parties.

Historical access must be determined separately from current participation access.

### 7.4 Amer

Amer retains participant permissions and receives additional permissions for the assigned Takaza.

Amer may:

- Prepare and submit the full Takaza report.
- Access permitted Kharguzari records for reporting.
- Perform assigned operational responsibilities.
- Comment where permitted.

Amer may not:

- Edit another user's original report.
- Change another user's Kharguzari.
- Access unrelated Takaza records.
- Exercise Supervisor or Admin permissions merely by being Amer.

Amer access ends or changes when the appointment expires or is terminated, subject to any separately authorized historical access.

### 7.5 Supervisor

Supervisor access is not defined beyond the provisional appointment.

Until eligibility and authority are approved:

- No special operational permission may be assumed.
- No Amer permission may be inherited.
- No Admin permission may be inherited.
- No final decision authority may be assigned.
- No access to private participant records may be granted solely by the Supervisor title.

### 7.6 Admin

An Admin may access resources within the assigned administrative scope.

Administrative scope must be checked for every operation.

An Admin must not:

- Access unrelated country records without authorization.
- Access unrelated Takaza or Syukbah records without authorization.
- Create a report on behalf of an Amer through ordinary Amer-authoring functions.
- Edit another user's original report.
- Edit another user's comment.
- Bypass required second-Admin justification or approval.
- Bypass required participant consent.
- Approve their own Percha amendment.
- Treat a pending proposal as an approved decision.
- Use an appointment in one resource to access unrelated resources.

### 7.7 SUPER_ADMIN

SUPER_ADMIN has global system-level authority, subject to security controls and audit.

SUPER_ADMIN does not automatically become the author or owner of another user's record.

SUPER_ADMIN must not bypass ordinary business-level ownership restrictions through normal application endpoints.

Any exceptional access must be separately specified and audited.

## 8. Administrative Scope

Administrative scope is mandatory for every ADMIN operation.

Possible scope dimensions include:

- Country.
- Markaz Negara.
- Markaz Negeri.
- Other approved organizational level.
- Specific Syukbah.
- Specific Takaza.
- Specific resource assignment.

The exact country hierarchy remains subject to the Organization Structure Governance document and relevant open decisions.

### 8.1 Country ADMIN

Country ADMIN is limited to the assigned country.

Country ADMIN must not automatically access another country's operational records.

The country scope must use the authoritative country identifier and relationship stored in the database.

### 8.2 Organization-Level Admin

An organization-level Admin is limited to the organization and subordinate resources explicitly included in the approved scope.

Supervisory relationships do not automatically merge country records or transfer ownership.

### 8.3 Syukbah Admin

Admin Syukbah is limited to the assigned Syukbah and its approved scope.

An appointment in one Syukbah does not automatically grant permissions in another Syukbah.

### 8.4 Takaza Admin

Admin Takaza is limited to the assigned Takaza or approved Takaza management scope.

Main Takaza and Sub Takaza have independent lifecycles.

An Admin's authority over one Takaza must not automatically be interpreted as authority over every related Takaza.

Any broader management scope must be explicitly assigned.

### 8.5 Cross-Organization Assistance

Cross-organization assistance requires:

- Consent from both involved Chief Admins.
- Defined task.
- Defined scope.
- Start and end dates.
- Limited data access.
- Audit records.

Temporary assistance does not create a permanent appointment in the receiving organization.

Cross-organization assistance must not merge country records or bypass data isolation.

### 8.6 Scope Changes

A change in administrative scope must:

- Be authorized by the appropriate authority.
- Identify the old and new scope.
- Record the effective date.
- Record the actor and approving authority where required.
- Preserve historical assignments.
- Re-evaluate access to existing resources.
- Revoke access that is no longer justified.

A scope change must not silently rewrite historical ownership or decisions.

## 9. Special Approval and Two-Admin Requirements

Some operations require additional approval or justification.

The system must distinguish between:

- A second Admin's approval.
- A second Admin's justification.
- A final decision by the managing Admin.

These are not interchangeable.

### 9.1 Percha Amendment

- One Admin proposes the amendment.
- A different Admin approves or rejects it.
- The proposing Admin cannot approve their own amendment.
- The original Percha remains preserved.
- All versions and decisions are retained.

This is a separate approval requirement.

### 9.2 Amer Replacement

- The managing Admin makes the final decision.
- Justification from at least one other Admin is required.
- The second Admin provides justification only.
- The second Admin does not have veto authority.
- The replacement and its reasons are audited.

This is not a second-Admin approval workflow.

### 9.3 Participant Removal

- The managing Admin makes the final decision.
- Justification from at least one other Admin is required.
- The second Admin provides justification only.
- The second Admin does not have veto authority.
- The participant is notified with the reason.
- Appeal rights remain available according to the defined workflow.

This is not a second-Admin approval workflow.

### 9.4 TAFAKUT

- Exactly two independent assessors are assigned for each normal round.
- Both submit their assessments independently.
- Assessors cannot see each other's submitted work before both have submitted.
- A disagreement requires a third Admin assessor.
- Additional rounds use two new assessors who have not previously assessed the candidate in the relevant process.
- Higher or wider-scope Admin appoints assessors.
- Assessor replacement preserves completed valid work.
- Submitted assessment records are immutable.
- Reassessment creates a new record.
- Managing Admin may make a final decision different from the assessment majority.
- A justification is mandatory when the final decision differs from the majority.
- The Managing Admin decision is recorded separately from assessor submissions.

The third assessor for disagreement and two new assessors for an additional round are distinct workflow requirements.

### 9.5 Withdrawal

A valid withdrawal request is a right of the Ahbab.

- Admin acknowledges and records the request.
- Admin must not block or veto a valid withdrawal request.
- `WITHDRAWN` is recorded after Admin confirms the withdrawal record.
- Confirmation is an administrative recording step, not discretionary permission to deny withdrawal.

### 9.6 Appeal

Appeals must be reviewed by an Admin with higher or wider authority than the original decision-maker.

The original decision-maker must not be the sole reviewer of their own decision appeal.

An appeal does not automatically change the relevant status before a decision is made.

## 10. Authentication and Authorization Flow

Every protected API must apply the following checks.

### Layer 1 — Authentication

Verify:

- Session exists.
- Session is valid.
- Session is not expired.
- Session is not revoked.
- Session belongs to the authenticated user.

### Layer 2 — Account and Registration State

Verify:

- Account status.
- Registration status.
- Access eligibility.
- Any applicable security restriction.
- Whether the endpoint is specifically permitted for the current account state.

### Layer 3 — Role

Verify:

- Required role is assigned in the database.
- Role is active and valid.
- Role assignment has not been revoked.
- Role is appropriate for the requested operation.

### Layer 4 — Appointment and Delegation

Where applicable, verify:

- Appointment exists.
- Appointment is active.
- Appointment scope matches the operation.
- Appointment has not expired.
- Delegation is valid.
- Delegation scope and duration cover the requested action.
- Appointment has not been suspended or terminated.

### Layer 5 — Resource Permission

Verify:

- User has the required relationship with the target resource.
- Target record is within the authorized scope.
- Participant or leadership relationship is valid.
- Author ownership is satisfied where required.
- Historical or operational access rules are satisfied.
- Additional approval requirements are met.
- Any required consent has been recorded.

Only after all applicable checks pass may the API allow the operation.

The order of checks must not permit a later layer to override a failed authentication or account-state check.

## 11. Registration and Account-State Relationship

The registration lifecycle is:

1. Registration is submitted.
2. Email OTP is verified.
3. Registration status becomes `PENDING_REVIEW`.
4. The user sets an initial password according to the authentication workflow.
5. Eligible users may receive LIMITED access while awaiting review.
6. ADMIN or SUPER_ADMIN reviews the registration within the authorized scope.
7. Approval changes the account to `ACTIVE` and grants FULL access according to assigned roles.
8. Rejection leaves the account `DISABLED` and blocks normal login/access.

Registration statuses must remain distinct from account statuses.

Do not introduce a `REJECTED` account status.

Rejection is represented by `registration_status = 'REJECTED'`, while the account remains `DISABLED`.

Approval of registration does not automatically grant every functional appointment or resource permission.

## 12. Password and Session Security

Password rules are defined in `AUTH.md`.

Password Reset is a required V2 feature but is currently NOT IMPLEMENTED.

Password Reset requirements:

- Must use the registered and verified email.
- Must use the agreed OTP policy.
- OTP length: 6 digits.
- OTP validity: 5 minutes.
- Maximum attempts: 5.
- Resend cooldown: 60 seconds.
- Successful reset permits the user to establish a new password.
- Successful reset must revoke all existing sessions and related tokens.
- Successful reset must create an audit event.
- Successful reset must send a security notification.
- Password Reset must not reactivate a DISABLED or SUSPENDED account.
- Password Reset must not change roles, appointments, profile details, Jemaah membership or Takaza participation.

Admin-Assisted Account Recovery is a separate process.

Password Reset and Admin-Assisted Account Recovery must not be treated as the same workflow.

Session policy:

- Idle timeout: 30 minutes.
- Maximum session lifetime: 12 hours.
- Revoked sessions must no longer authorize requests.
- Account disablement or suspension must terminate active sessions and revoke related tokens.
- A password reset must revoke existing sessions and related tokens.

## 13. Account Disablement, Suspension and Reactivation

Disabling or suspending an account must not be treated as ordinary role removal.

The applicable process must support:

- Audit record.
- Reason.
- Notification where required.
- Session termination.
- Token revocation.
- Appeal or review where applicable.
- Explicit reactivation decision.

A disabled or suspended account must not automatically regain access because an appointment or role remains in the database.

### 13.1 Account Disablement

When an account becomes `DISABLED`:

- Normal login is blocked.
- Active sessions are terminated.
- Existing tokens are revoked.
- The action is audited.
- LIMITED access cannot override DISABLED status.
- Existing roles and appointments do not restore access.

### 13.2 Account Suspension

When an account becomes `SUSPENDED`:

- Normal operational access is blocked.
- Active sessions and tokens are handled according to the approved security process.
- The action is audited.
- Any permitted review or appeal process uses specifically authorized endpoints.
- Suspension does not delete roles, appointments or historical records.

### 13.3 Reactivation

Reactivation requires a separate authorized workflow.

Requirements:

- A new password must be established.
- The previous password cannot be reused.
- Old sessions remain revoked.
- Reactivation must be audited.
- No automatic reactivation is permitted.
- Appeal approval does not itself reactivate the account.
- Reactivation requires a separate authorized decision and process.

Password Reset, OTP verification and email change do not constitute account reactivation.

### 13.4 Account Appeal

Confirmed rules:

- One appeal is available for each disable action.
- Reviewer must have higher or wider authority than the original actor.
- Original actor cannot review the appeal.
- Appeal approval does not automatically reactivate the account.
- Approval permits a separate Reactivation workflow.
- Rejection leaves the account DISABLED.
- A subsequent new disable action creates a new appeal opportunity.

### 13.5 Separation from Participation Status

Account status and Takaza participation status are separate.

For example:

- Password Reset does not reactivate a disabled account.
- Account reactivation does not automatically restore Takaza participation.
- Takaza withdrawal does not disable the account.
- Takaza removal does not automatically suspend the account.
- TAFAKUT `SUSPEND` does not change account login status.
- TAFAKUT `ON_HOLD` does not change account status.

## 14. API Implementation Requirements

- All protected routes must authenticate sessions server-side.
- All access-level checks must use trusted account and registration data.
- All role checks must query database role assignments.
- All appointment checks must query valid appointment records.
- All delegation checks must verify scope and duration.
- All resource checks must be performed server-side.
- The API must deny by default when a required permission cannot be established.
- The frontend must never be the sole authorization control.
- Sensitive administrative actions must create audit records.
- Ownership and authorship restrictions must be enforced by the API.
- Required second-Admin approval or justification must be enforced by the API.
- Resource identifiers supplied by clients must be checked against actual authorization.
- Error responses must not disclose private information about inaccessible resources.
- Authorization decisions must be consistent across API routes.
- Account status must be checked on every protected request or through an equivalent secure mechanism that cannot retain stale access after disablement or suspension.
- Appointment expiry and revocation must take effect without relying on the client to refresh its interface.
- Approval and consent records must be verified from trusted server-side data.
- APIs must not permit a user to approve their own action where independent approval is required.
- APIs must not allow submitted immutable records to be overwritten.
- Historical access must not automatically grant operational write permission.
- Bulk operations must apply authorization to every affected record.
- Background jobs and scheduled tasks must enforce equivalent scope and permission rules.
- Any system-initiated action must be distinguishable from a human actor in audit records.

## 15. Audit Requirements

The system must audit:

- Role assignment and removal.
- Administrative appointment and termination.
- Appointment scope changes.
- Delegation and acting assignments.
- Resource access changes.
- Administrative decisions.
- Approval and rejection actions.
- Participant confirmation and removal.
- Withdrawal confirmation.
- Appeal submission and decision.
- Amer and Supervisor appointments.
- TAFAKUT assessor assignment and decisions.
- Third-assessor assignment.
- Additional TAFAKUT rounds.
- Assessor replacement.
- Managing Admin final decisions.
- Percha amendment proposals and approvals.
- Account disablement, suspension and reactivation.
- Session revocation.
- Sensitive data access where required.
- Exceptional access.
- Changes to country, organization, Syukbah or Takaza scope.

Audit records must preserve:

- Actor.
- Action.
- Target record.
- Previous value where applicable.
- New value where applicable.
- Date and time.
- Reason or justification where required.
- Approval or justification record where applicable.
- Scope used for the action.
- Relevant appointment or delegation reference.

Audit history must not be modified or deleted through ordinary operations.

An audit record must distinguish:

- A request.
- A proposal.
- A justification.
- An approval.
- A final decision.
- A system-generated action.

These must not be represented as if they were the same event.

## 16. Decisions and Items Requiring Separate Specification

The following matters remain open or require further detail.

1. Whether every approved registration automatically receives the `AHBAB` role or requires a controlled assignment workflow.
2. Exact administrative scope for user management, role assignment and audit-log access.
3. Field-level profile update permissions for LIMITED users.
4. Complete resource-level permissions for each Jemaah operation.
5. Complete resource-level permissions for each Takaza operation.
6. Supervisor eligibility and authority.
7. Admin Syukbah appointment and termination authority.
8. Deputy Syukbah acting and delegation rules.
9. Additional Country Syukbah approval authority.
10. Exceptional SUPER_ADMIN break-glass access, if required.
11. Reactivation and rejoining edge cases.
12. Detailed permission rules for historical records after withdrawal, removal or account disablement.
13. Detailed permission rules for records after Takaza completion.
14. Exact access policy for archived records and historical reports.
15. Any additional temporary appointment types and their permission boundaries.

Until these details are explicitly decided, implementation must not assume broader permissions.

The following matters are already established and must not be reopened merely because their detailed implementation is pending:

- Amer must be a confirmed participant in the same Takaza before appointment.
- Supervisor authority and eligibility remain provisional/open.
- TAFAKUT uses two independent assessors for a normal round.
- Disagreement requires a third assessor.
- Additional rounds use two new assessors who have not previously assessed the candidate.
- Submitted assessments are immutable.
- Managing Admin final decision is separate from assessor submissions.
- Percha amendment requires a different Admin to approve.
- Amer replacement requires justification from another Admin, not a second-Admin veto.
- Participant removal requires justification from another Admin, not a second-Admin veto.
- A valid withdrawal request cannot be blocked by Admin.
- Withdrawal and removal are distinct participation outcomes.
- Password Reset does not reactivate a DISABLED or SUSPENDED account.

## 17. Related Documents

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `AUTH.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `V2_DESIGN_CHECKPOINT.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `REPOSITORY_DISPOSITION.md`
- `docs/SYSTEM_REALIGNMENT_DESIGN.md`

If a conflict exists:

1. The latest explicitly approved project decision in the Master Decision Register takes precedence.
2. The Open Decisions Register identifies matters that remain unresolved.
3. This UAC document defines authorization principles and permission boundaries.
4. Organization documents define organizational structure and governance.
5. Module documents define operational requirements and workflows.
6. Authentication requirements are defined in `AUTH.md`.
7. Dashboard and navigation documents define presentation, not authorization.
8. Open decisions must remain `OPEN`, `PENDING`, `PROVISIONAL` or `ON HOLD` until resolved.

A module document must not grant permissions that contradict the approved UAC baseline.

The UAC document must not convert an unresolved business decision into an approved permission.

## 18. Baseline Approval and Working Rules

This UAC matrix establishes the authorization baseline for V2 design and API planning.

Implementation must preserve the separation between:

- Authentication.
- Account and Access State.
- Role.
- Appointment and Delegation.
- Resource Permission.

No role or appointment may be interpreted as unrestricted system access.

Working rules:

- Never trust a client-supplied role, user ID, country, organization or Takaza scope as proof of authorization.
- Never use frontend visibility as the sole security control.
- Never treat FULL access as a universal role.
- Never treat LIMITED access as permission for every disabled account.
- Never allow a disabled or suspended account to regain access through an existing appointment.
- Never infer an appointment from a system role.
- Never infer participation from Jemaah membership.
- Never infer Amer status from TAFAKUT PASS.
- Never appoint Amer before confirmed participation in the same Takaza.
- Never assume Supervisor permissions that have not been approved.
- Never grant an Admin authority outside the assigned scope.
- Never treat temporary assistance as a permanent appointment.
- Never grant a Deputy all Admin permissions solely because of the Deputy title.
- Never allow a Moderator to manage operational records.
- Never reuse a previous assessor in a subsequent additional TAFAKUT round for the same candidate.
- Never allow assessors to see each other's submitted work before both submit.
- Never overwrite submitted TAFAKUT assessments.
- Never overwrite assessor records with a Managing Admin decision.
- Never confuse second-Admin approval with second-Admin justification.
- Never allow an Admin to approve their own Percha amendment.
- Never block a valid Ahbab withdrawal request.
- Never treat `WITHDRAWN` and `REMOVED` as the same status.
- Never assume an appeal automatically restores access or participation.
- Never assume account reactivation automatically restores Takaza participation.
- Never allow historical access to imply operational write access.
- Never allow a user to access another person's private records without an authorized relationship or permission.
- Never claim implementation is complete without verified source code, tests and deployment evidence.
- Preserve all sensitive decisions and authorization changes in audit history.
- Deny by default whenever authorization cannot be established.

---

**Document Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Version:** 2.1  
**Last Updated:** 28 November 2026  
**Next Review:** Role Assignment Policy, Administrative Scope, Supervisor Authority, Deputy Delegation, Historical Record Access and Remaining Resource-Level Permissions.

**End of document.**

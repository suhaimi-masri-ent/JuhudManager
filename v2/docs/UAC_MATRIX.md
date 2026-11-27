# JUHUDMANAGER V2 — USER ACCESS CONTROL MATRIX (UAC)

Document ID: UAC-V2
Version: 2.0 — Consolidated Authorization Baseline
Status: REQUIREMENTS BASELINE — FOR REVIEW
Scope: Authentication, access levels, roles, administrative appointments, resource permissions and authorization
Applies to: JuhudManager V2
Last Updated: 27 November 2026
Repository Path: "v2/docs/UAC_MATRIX.md"

---

1. Purpose

This document defines the User Access Control (UAC) model for JuhudManager V2.

The UAC model separates authorization into five dimensions:

1. Authentication — establishes the identity of the user through a valid server-side session.
2. Account and Access State — determines whether the account is permitted to access the system and at what level.
3. Role — determines the user's assigned system-level responsibilities.
4. Appointment and Delegation — determines operational responsibilities assigned within an organization, Syukbah or Takaza.
5. Resource Permission — determines which specific records and resources the user may access or modify.

A user must pass every applicable authorization check before an API performs an action.

No single role, appointment or relationship automatically grants unrestricted access.

2. Core Authorization Principles

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

3. Authentication, Account Status and Access Level

These concepts must remain separate.

3.1 Authentication

Authentication verifies the identity of the user.

A protected request must establish:

- The session exists and is valid.
- The session has not expired.
- The session has not been revoked.
- The session belongs to the authenticated user.
- The session is obtained through the server-side authentication mechanism.

Never accept a client-supplied "user_id", role, access level or session object as proof of identity.

3.2 Account Status

The account status values are:

- "ACTIVE"
- "DISABLED"
- "SUSPENDED"

These statuses must not be confused with registration status or access level.

Account Status| Meaning
"ACTIVE"| Account is enabled, subject to registration and authorization checks
"DISABLED"| Account is disabled and normal authenticated access is not permitted
"SUSPENDED"| Account is suspended and normal authenticated access is not permitted

A disabled or suspended account must not receive normal operational access.

Any permitted account recovery, email verification or security process must use its specifically authorized endpoints.

3.3 Access Levels

Access Level is a derived authorization state, not a database role.

Access Level| Condition| Baseline Access
"PUBLIC"| No authenticated session| Public registration and authentication endpoints
"LIMITED"| Eligible verified user awaiting registration review, subject to account policy| Own permitted profile and registration functions
"FULL"| Registration approved and account active| Functions permitted by assigned roles, appointments and resource relationships

"LIMITED" does not mean that every "DISABLED" account may log in.

The system must distinguish an eligible pending-review account from an account disabled for security, administrative or other reasons.

3.4 LIMITED Access

A LIMITED user may, where the account policy permits:

- View their own profile.
- Update permitted fields in their own profile.
- View their own registration status.
- Change their own password.
- Manage their own sessions where supported.
- Complete permitted registration-related actions.

A LIMITED user may not:

- Access Jemaah operational functions.
- Access Takaza operational functions.
- Access Syukbah operational functions.
- Create or update Rekod Amal unless explicitly permitted.
- Access administrative functions.
- Access another user's private information or records.

3.5 FULL Access

FULL is an account access level, not a role.

A FULL user must still have the relevant role, appointment and resource permission for each operation.

For example:

- FULL alone does not grant AHBAB capabilities.
- FULL alone does not grant ADMIN capabilities.
- FULL alone does not grant SUPER_ADMIN capabilities.
- FULL alone does not make a user a Takaza participant or Amer.

4. System Roles

The baseline system roles are:

- "SUPER_ADMIN"
- "ADMIN"
- "AHBAB"

Roles are additive database assignments.

The authorization layer must not infer a role from:

- User name.
- Email address.
- Registration status.
- UI selection.
- Request payload.
- Organization membership alone.

4.1 SUPER_ADMIN

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

SUPER_ADMIN must not bypass business-level authorship and ownership rules through ordinary application endpoints.

Any exceptional break-glass capability must be separately specified, permission-controlled and audited.

4.2 ADMIN

ADMIN is the administrative system role.

An ADMIN must have an explicitly defined administrative scope.

Possible scopes include:

- Country.
- Organization or Markaz.
- Other approved administrative scope.

ADMIN must not be treated as a universal unrestricted role.

Administrative permissions are determined by:

- Assigned role.
- Approved administrative scope.
- Functional appointment, where applicable.
- Resource-level authorization.
- Applicable approval requirements.

4.3 AHBAB

AHBAB is the user role for an approved Ahbab account.

An AHBAB may access permitted functions according to:

- Their own profile ownership.
- Jemaah membership.
- Takaza participation.
- Specific appointments.
- Resource-level permissions.

AHBAB does not automatically grant access to every Jemaah, Takaza or organizational record.

5. Functional Appointments and Operational Responsibilities

Functional appointments are separate from system roles.

They must be stored and authorized as explicit assignments with scope and history.

The following appointments must not automatically create unrestricted system roles.

5.1 Admin Markaz

Admin Markaz is an administrative appointment within an approved organizational scope.

Permissions depend on:

- Organization level.
- Country or organizational scope.
- Appointment status.
- Specific UAC permissions.
- Applicable governance and approval rules.

Admin Markaz does not automatically receive global SUPER_ADMIN authority.

5.2 Admin Syukbah

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

5.3 Deputy Admin Syukbah

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

5.4 Admin Takaza

Admin Takaza is an operational appointment for a specific Takaza or approved Takaza management scope.

The Admin Takaza may:

- Create and manage Takaza records within the assigned scope.
- Configure permitted participation methods.
- Review applications and nominations.
- Confirm participants.
- Manage permitted TAFAKUT processes.
- Appoint Amer and Supervisor according to the approved rules.
- Manage activities, Percha and reports.
- Manage participant withdrawal and removal according to the applicable workflow.
- Manage Takaza completion and cancellation according to approved rules.

Admin Takaza does not automatically become a participant, Amer or Supervisor.

5.5 Amer

Amer is an appointment within a specific Main Takaza or Sub Takaza.

The Amer must:

- Already be a confirmed participant in the same Takaza.
- Consent to the appointment.
- Be appointed by an authorized Admin.

Amer retains participant status.

Additional permissions may include:

- Preparing the full Takaza report.
- Accessing permitted individual Kharguzari records for reporting.
- Recording assigned Takaza activities.
- Performing other explicitly approved Amer responsibilities.

Amer cannot:

- Manage unrelated Takaza.
- Modify another author's report.
- Change official Takaza configuration unless separately authorized.
- Change the Takaza's official dates through ordinary participant permissions.

An Amer appointment is limited to the relevant Takaza and its approved duration.

5.6 Supervisor

Supervisor is a separate appointment for a specific Takaza.

Supervisor permissions must be explicitly defined.

The system must not assume that Supervisor:

- Is automatically a participant.
- Has Amer permissions.
- Has Admin permissions.
- Can make final Takaza decisions.

Supervisor authority and eligibility remain OPEN DECISIONS.

5.7 Moderator

Moderator is a discussion-specific permission assignment.

The Admin Syukbah automatically becomes Moderator of the discussion for their own Syukbah.

An Admin Syukbah may add or remove additional moderators.

Moderator permissions are limited to:

- Creating comments.
- Deleting comments.

Moderator cannot:

- Edit another user's comment.
- Hide comments.
- Pin comments.
- Unpin comments.

A user may delete their own comment.

Deleted comments must use soft-delete and preserve audit history.

Moderator status does not grant administrative access to Syukbah records.

5.8 TAFAKUT Assessor

TAFAKUT Assessor is an assignment for a specific assessment process and round.

An assessor may:

- Access the assigned assessment form.
- Review permitted information.
- Submit an independent assessment.
- View other assessment work only after the required submission conditions are met.

An assessor must not:

- Access unrelated assessment records.
- Modify another assessor's submitted work.
- Reopen or overwrite a completed assessment.
- Use the assessment assignment to obtain unrelated administrative access.

Assessor assignments and assessment actions must be audited.

6. Role and Appointment Matrix

Legend:

- Allow — baseline permission.
- Conditional — permission requires the relevant relationship, assignment or scope.
- Administer — authorized administrative capability within scope.
- Appointment — permission exists only while the relevant appointment is valid.
- — — not permitted by this baseline.

Function| PUBLIC| LIMITED| AHBAB| ADMIN| SUPER_ADMIN
Start registration| Allow| —| —| —| —
Request registration email OTP| Allow| —| —| —| —
Verify registration email OTP| Allow| —| —| —| —
Login| Allow| Conditional| Allow| Allow| Allow
View own registration status| —| Allow| Allow| Allow| Allow
View own profile| —| Allow| Allow| Allow| Allow
Update own permitted profile fields| —| Allow| Allow| Allow| Allow
Change own password| —| Conditional| Allow| Allow| Allow
Manage own sessions| —| Conditional| Allow| Allow| Allow
Access own Jemaah records| —| —| Conditional| Conditional| Conditional
Access own Takaza records| —| —| Conditional| Conditional| Conditional
Access Syukbah discussion| —| —| Conditional| Conditional| Conditional
Update own Rekod Amal| —| —| Conditional| —| —
Apply for Takaza| —| —| Conditional| —| —
Participate in TAFAKUT| —| —| Conditional| —| —
Assess assigned TAFAKUT| —| —| Appointment| Appointment| Appointment
Manage assigned Takaza| —| —| —| Appointment| Conditional
Prepare Amer report| —| —| Appointment| —| —
Manage assigned Syukbah| —| —| —| Appointment| Conditional
Moderate assigned discussion| —| —| Appointment| Appointment| Conditional
Review registrations| —| —| —| Administer| Administer
Manage users| —| —| —| Conditional| Administer
Manage role assignments| —| —| —| Conditional| Administer
Manage system configuration| —| —| —| Conditional| Administer
Manage Global Baseline Syukbah| —| —| —| —| Administer
Access audit logs| —| —| —| Conditional| Administer

This table describes role-level capability categories only.

Appointment and resource-level checks are still mandatory.

7. Resource-Level Authorization

Role and Access Level checks are not sufficient on their own.

7.1 AHBAB

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

An AHBAB must not access another person's private records merely because the account has FULL access.

7.2 Jemaah Membership

Jemaah membership grants access only to resources authorized for that membership.

- Membership does not automatically grant Takaza participation.
- Membership does not automatically grant Amer permissions.
- Membership does not grant administrative permissions.
- Membership history must be retained.

7.3 Takaza Participation

A confirmed Takaza participant may access permitted records for that Takaza.

Access depends on:

- Participation status.
- Takaza status.
- Resource type.
- Specific permission.
- Any applicable privacy restriction.

"WITHDRAWN" and "REMOVED" participants do not automatically retain ordinary operational access, but their historical records must remain available to authorized parties.

7.4 Amer

Amer retains participant permissions and receives additional permissions for the assigned Takaza.

Amer may:

- Prepare and submit the full Takaza report.
- Access permitted Kharguzari records for reporting.
- Perform assigned operational responsibilities.
- Comment where permitted.

Amer may not edit another user's original report.

7.5 Admin

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

7.6 SUPER_ADMIN

SUPER_ADMIN has global system-level authority, subject to security controls and audit.

SUPER_ADMIN does not automatically become the author or owner of another user's record.

SUPER_ADMIN must not bypass ordinary business-level ownership restrictions through normal application endpoints.

Any exceptional access must be separately specified and audited.

8. Administrative Scope

Administrative scope is mandatory for every ADMIN operation.

Possible scope dimensions include:

- Country.
- Markaz Negara.
- Markaz Negeri.
- Other approved organizational level.
- Specific Syukbah.
- Specific Takaza.
- Specific resource assignment.

The exact country hierarchy remains subject to the Organization Structure Governance document and the relevant open decisions.

8.1 Country ADMIN

Country ADMIN is limited to the assigned country.

Country ADMIN must not automatically access another country's operational records.

8.2 Organization-Level Admin

An organization-level Admin is limited to the organization and subordinate resources explicitly included in the approved scope.

8.3 Syukbah Admin

Admin Syukbah is limited to the assigned Syukbah and its approved scope.

8.4 Takaza Admin

Admin Takaza is limited to the assigned Takaza or approved Takaza management scope.

8.5 Cross-Organization Assistance

Cross-organization assistance requires:

- Consent from both involved Chief Admins.
- Defined task.
- Defined scope.
- Start and end dates.
- Limited data access.
- Audit records.

Temporary assistance does not create a permanent appointment in the receiving organization.

9. Special Approval and Two-Admin Requirements

Some operations require additional approval or justification.

The system must distinguish between:

- A second Admin's approval.
- A second Admin's justification.
- A final decision by the managing Admin.

These are not interchangeable.

9.1 Percha Amendment

- One Admin proposes the amendment.
- A different Admin approves or rejects it.
- The original Percha remains preserved.
- All versions and decisions are retained.

9.2 Amer Replacement

- The managing Admin makes the final decision.
- Justification from at least one other Admin is required.
- The second Admin does not have veto authority.
- The replacement and its reasons are audited.

9.3 Participant Removal

- The managing Admin makes the final decision.
- Justification from at least one other Admin is required.
- The second Admin does not have veto authority.
- The participant is notified.
- Appeal rights remain available according to the defined workflow.

9.4 TAFAKUT

- Exactly two independent assessors are assigned for each normal round.
- Both submit their assessments independently.
- A disagreement requires a third assessor.
- Additional rounds use two new assessors not previously used in the relevant process.
- Final managing Admin decisions must be justified and audited if they differ from the assessment outcome.

10. Authentication and Authorization Flow

Every protected API must apply the following checks.

Layer 1 — Authentication

Verify:

- Session exists.
- Session is valid.
- Session is not expired.
- Session is not revoked.
- Session belongs to the authenticated user.

Layer 2 — Account and Registration State

Verify:

- Account status.
- Registration status.
- Access eligibility.
- Any applicable security restriction.

Layer 3 — Role

Verify:

- Required role is assigned in the database.
- Role is active and valid.
- Role assignment has not been revoked.

Layer 4 — Appointment and Delegation

Where applicable, verify:

- Appointment exists.
- Appointment is active.
- Appointment scope matches the operation.
- Appointment has not expired.
- Delegation is valid.
- Delegation scope and duration cover the requested action.

Layer 5 — Resource Permission

Verify:

- User has the required relationship with the target resource.
- Target record is within the authorized scope.
- Participant or leadership relationship is valid.
- Author ownership is satisfied where required.
- Additional approval requirements are met.

Only after all applicable checks pass may the API allow the operation.

11. Registration and Account-State Relationship

The registration lifecycle is:

1. Registration is submitted.
2. Email OTP is verified.
3. Registration status becomes "PENDING_REVIEW".
4. The user sets an initial password according to the authentication workflow.
5. Eligible users may receive LIMITED access while awaiting review.
6. ADMIN or SUPER_ADMIN reviews the registration within the authorized scope.
7. Approval changes the account to "ACTIVE" and grants FULL access according to assigned roles.
8. Rejection leaves the account "DISABLED" and blocks normal login/access.

Registration statuses must remain distinct from account statuses.

Do not introduce a "REJECTED" account status.

Rejection is represented by "registration_status = 'REJECTED'", while the account remains "DISABLED".

12. Password and Session Security

- Password rules are defined in "Auth.md".
- Password Reset is a required V2 feature but is currently NOT IMPLEMENTED.
- Password Reset must use the registered and verified email.
- Password Reset must follow the agreed OTP policy.
- Successful reset must revoke existing sessions and related tokens.
- Successful reset must create an audit event and send a security notification.
- Admin-Assisted Account Recovery is a separate process.
- Password Reset and Admin-Assisted Account Recovery must not be treated as the same workflow.

Session policy:

- Idle timeout: 30 minutes.
- Maximum session lifetime: 12 hours.
- Revoked sessions must no longer authorize requests.

13. Account Disablement and Suspension

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

Account reactivation must be handled through an authorized workflow.

14. API Implementation Requirements

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

15. Audit Requirements

The system must audit:

- Role assignment and removal.
- Administrative appointment and termination.
- Appointment scope changes.
- Delegation and acting assignments.
- Resource access changes.
- Administrative decisions.
- Approval and rejection actions.
- Participant confirmation and removal.
- Amer and Supervisor appointments.
- TAFAKUT assessor assignment and decisions.
- Sensitive data access where required.
- Account disablement, suspension and reactivation.
- Session revocation.
- Exceptional access.

Audit records must preserve:

- Actor.
- Action.
- Target record.
- Previous value where applicable.
- New value where applicable.
- Date and time.
- Reason or justification where required.

Audit history must not be modified or deleted through ordinary operations.

16. Decisions and Items Requiring Separate Specification

The following matters remain open or require further detail:

1. Whether every approved registration automatically receives the "AHBAB" role or requires a controlled assignment workflow.
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

Until these details are explicitly decided, implementation must not assume broader permissions.

17. Related Documents

- "MASTER_DECISION_REGISTER.md"
- "OPEN_DECISIONS_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "IMPLEMENTATION_STATUS_AND_ROADMAP.md"
- "Auth.md"
- "JMV2001-Ahbab-Profile-Account-Management.md"
- "JMV2002-Organization-Structure-Governance.md"
- "JMV2003-Syukbah-Management.md"
- "JMV2004-Takaza-Management.md"
- "DASHBOARD_NAVIGATION_SPEC_V2.md"
- "V2_DESIGN_CHECKPOINT.md"
- "V2_IMPLEMENTATION_STATUS.md"

If a conflict exists:

1. The latest explicitly approved project decision takes precedence.
2. This UAC document defines authorization principles and permission boundaries.
3. Organization documents define organizational structure and governance.
4. Module documents define operational requirements.
5. Open decisions must remain "PENDING" until resolved.

18. Baseline Approval

This UAC matrix establishes the authorization baseline for V2 design and API planning.

Implementation must preserve the separation between:

- Authentication.
- Account and Access State.
- Role.
- Appointment and Delegation.
- Resource Permission.

No role or appointment may be interpreted as unrestricted system access.

Document Status: REQUIREMENTS BASELINE — FOR REVIEW
Version: 2.0
Last Updated: 27 November 2026

End of document.

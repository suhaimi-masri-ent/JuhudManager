
# JUHUDMANAGER V2 — DASHBOARD & NAVIGATION SPECIFICATION

**Document ID:** DASHBOARD-NAV-V2  
**Version:** 2.2 — Consolidated Dashboard & Navigation Baseline  
**Status:** DESIGN BASELINE — FOR REVIEW  
**Scope:** Dashboard, Navigation, Progress Overview and Juhud Reports CMS  
**Applies to:** JuhudManager V2  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/docs/DASHBOARD_NAVIGATION_SPEC_V2.md`

---

## 1. Purpose

This document defines the dashboard structure, navigation menus, dashboard content, functional visibility and user-facing navigation behaviour for JuhudManager V2.

Dashboard presentation must reflect the user's actual:

- Account status.
- Registration status.
- Access level.
- Assigned core roles.
- Administrative scope.
- Functional appointments.
- Delegated responsibilities.
- Resource-level permissions.
- Relationship to the requested records.

The system provides four primary dashboard experiences:

1. LIMITED Dashboard.
2. AHBAB Dashboard.
3. ADMIN Dashboard.
4. SUPER_ADMIN Dashboard.

These are dashboard experiences, not separate authorization roles.

A user may receive combined navigation capabilities when multiple roles or appointments are valid. The resulting dashboard must still respect every applicable authorization boundary.

This document defines presentation and navigation requirements. It does not replace backend authorization, business rules or the detailed workflows defined in the respective module specifications.

## 2. Dashboard Design Principles

The following principles apply throughout V2:

1. Each user sees a dashboard appropriate to their current account state and authorized access.
2. Dashboard visibility must follow `UAC_MATRIX.md`.
3. Account status, registration status, access level, core role, appointment and resource permission must remain separate concepts.
4. Hiding a menu does not replace backend authorization.
5. Administrative access must be restricted by the user's authorized organizational scope.
6. Personal data and operational records must remain protected by resource-level permissions.
7. Functional appointments must expose only the capabilities explicitly assigned to those appointments.
8. AHBAB users may access approved overall progress information without unrestricted access to internal records.
9. Operational reports and shared published reports must remain separate.
10. Administrative and security-sensitive functions must be auditable.
11. Dashboard modules must support future expansion without requiring a complete navigation redesign.
12. Unresolved business decisions must not be implemented as assumed permissions.
13. A menu must not be displayed merely because a user has a similarly named role or appointment.
14. Expired, revoked or suspended appointments must not expose current operational functions.
15. The interface must clearly identify the scope of administrative work.
16. A dashboard must not imply that a user has authority to approve, reject or modify records unless that authority has been granted.
17. Historical access and current operational access must be presented separately where relevant.
18. The system must distinguish between a request, proposal, justification, approval and final decision.

## 3. Dashboard and Authorization Model

### 3.1 Authorization Dimensions

The dashboard must derive its presentation from the following separate dimensions:

| Dimension | Purpose |
|---|---|
| Account Status | Determines whether the account is ACTIVE, DISABLED or SUSPENDED |
| Registration Status | Determines the user's registration lifecycle |
| Access Level | Determines effective access, such as PUBLIC, LIMITED or FULL |
| Core Role | Determines the user's assigned system role |
| Functional Appointment | Determines additional duties assigned to the user |
| Delegation | Determines specific temporary duties authorized by another authority |
| Administrative Scope | Determines the organizational records the user may administer |
| Resource Permission | Determines access to a specific record or operation |

No single dimension may automatically grant permissions belonging to another dimension.

### 3.2 Dashboard Categories

| Dashboard | Access Requirement | Primary Purpose |
|---|---|---|
| LIMITED | Explicitly authorized limited access | Registration and personal account |
| AHBAB | FULL access + AHBAB role | Personal Juhud workspace |
| ADMIN | FULL access + ADMIN role | Scoped operational administration |
| SUPER_ADMIN | FULL access + SUPER_ADMIN role | Global system governance |

The LIMITED Dashboard is not a role and must not be automatically granted to every DISABLED account.

A pending registration or review state may receive limited access only when the applicable registration and account rules authorize it.

A DISABLED or SUSPENDED account must not retain normal operational access merely because a dashboard or menu remains visible in the frontend.

### 3.3 Multiple Roles and Appointments

A user may hold more than one authorized role or functional appointment.

The dashboard may combine the corresponding navigation capabilities, subject to all applicable restrictions.

Examples:

- An AHBAB with an active Amer appointment receives the Amer Workspace for the assigned Takaza.
- An AHBAB appointed as a Moderator receives the relevant Syukbah discussion functions.
- An ADMIN appointed as Admin Takaza receives the functions assigned to that Takaza administration.
- An ADMIN appointed as Admin Syukbah receives the functions assigned to the relevant Syukbah.
- An AHBAB assigned as a TAFAKUT assessor receives access only to the assigned assessment tasks.
- A Deputy receives only the functions explicitly delegated to that Deputy.

Appointments do not automatically grant unrelated administrative permissions.

### 3.4 Administrative Scope

ADMIN access must be restricted to the user's authorized organizational scope.

The interface must not imply that every ADMIN has unrestricted country-wide or system-wide authority.

SUPER_ADMIN has global system governance access but does not automatically acquire:

- AHBAB participation rights.
- Amer rights.
- TAFAKUT assessor rights.
- Operational report ownership.
- Organizational leadership appointments.
- Takaza participation rights.

### 3.5 Navigation as a Derived View

Navigation is a derived presentation of effective permissions.

The system must not use navigation selection as proof of authorization.

The backend must independently validate every operation, including requests submitted through:

- Direct API calls.
- Bookmarked URLs.
- Browser history.
- Mobile navigation.
- Background requests.
- Reused form submissions.
- Stale frontend sessions.

---

## 4. LIMITED Dashboard

### 4.1 Purpose

The LIMITED Dashboard provides access to specifically authorized account and registration functions for users who do not yet have FULL operational access.

It may be used for users whose email has been verified and whose registration is awaiting review, where the registration workflow permits such access.

LIMITED access must not be used as a general workaround for disabled or suspended accounts.

### 4.2 Dashboard Content

Depending on the user's actual account and registration state:

- Welcome message.
- Registration status.
- Email verification status.
- Admin review status.
- My Profile.
- Change Password.
- Active Sessions, if authorized.
- Account Security.
- Notifications, if authorized.
- Logout.

Only functions permitted by the current account state may be displayed.

### 4.3 Registration Status Display

The dashboard may communicate:

- Email verification pending.
- Email verified.
- Awaiting Admin review.
- Approved.
- Rejected.

A rejected registration must not receive operational access.

Registration status and account status must be displayed separately where both are relevant.

The interface must not display a rejected registration as an active operational account.

### 4.4 Navigation

| Menu | Access |
|---|---|
| Dashboard | If limited access is authorized |
| My Profile | According to profile permissions |
| Change Password | According to authentication rules |
| Active Sessions | If authorized |
| Account Security | If authorized |
| Notifications | If authorized |
| Logout | Allow |
| My Jemaah | Deny |
| My Takaza | Deny |
| Rekod Amal | Deny |
| Progress Overview | Deny |
| Juhud Reports | Deny unless explicitly published for this access level |
| Administration | Deny |
| Amer Workspace | Deny |
| TAFAKUT Assessments | Deny |
| Syukbah Management | Deny |

### 4.5 Restrictions

- LIMITED access must not be treated as FULL access.
- LIMITED access must not grant AHBAB, ADMIN or SUPER_ADMIN permissions.
- A DISABLED or SUSPENDED account must not retain operational access merely because a limited dashboard exists.
- Registration approval must follow the registration workflow.
- Rejected registration must not be allowed to access operational modules.
- A pending appointment must not grant appointment-based access.
- LIMITED access must not expose private information belonging to other users.
- Password Reset must not reactivate a DISABLED or SUSPENDED account.

---

## 5. AHBAB Dashboard

### 5.1 Purpose

The AHBAB Dashboard provides a personal workspace for approved Ahbab.

The dashboard focuses on the user's own:

- Jemaah membership.
- Takaza participation.
- Rekod Amal.
- Activities.
- Notifications.
- Profile.
- Relevant published information.

It also provides access to approved overall Juhud progress information and published shared reports.

### 5.2 Main Dashboard Sections

#### A. Personal Overview

- My Jemaah.
- My Takaza.
- My Rekod Amal.
- My Activities.
- Notifications.
- My Profile.
- Account Security.

All records must be filtered by the user's actual relationship or ownership permissions.

Jemaah Membership and Takaza Participation are separate relationships.

The dashboard must not assume that membership in a Jemaah automatically makes the user a participant in every Takaza associated with that Jemaah.

#### B. Progress Overview

Provides an approved system-generated overview of overall Juhud progress.

Possible information includes:

- Total active Jemaah.
- Total active Takaza.
- Completed Takaza.
- Ongoing Takaza.
- Approved progress indicators.
- Progress summaries by permitted category.
- Historical progress trends where approved.

Progress Overview must not expose:

- Private individual Rekod Amal.
- National ID or WhatsApp information.
- Private user information.
- Internal administrative notes.
- Restricted operational records.
- Confidential TAFAKUT assessment details.
- Records outside the approved audience visibility rules.

The displayed information must follow approved aggregation and visibility rules.

Exact metrics and calculation formulas remain subject to separate specification.

#### C. Juhud Reports

Provides access to reports published for the AHBAB audience.

Possible content:

- Monthly Juhud Progress.
- Takaza Progress Highlights.
- Special Reports.
- Announcements.
- Archived Reports.

Only published reports whose visibility includes the current user may be displayed.

A published report must not expose private information or unauthorized operational records.

#### D. Amer Workspace

Visible only to an AHBAB with an effective and active Amer appointment.

Functions may include:

- Takaza under leadership.
- View relevant Takaza information.
- Access participant information within authorized scope.
- Create the full Takaza Progress Report.
- View own Progress Reports.
- Edit own Progress Reports where the report remains editable.
- Access relevant individual Kharguzari records for the Amer report.
- Comment on relevant Takaza records where authorized.
- View relevant notifications.
- Monitor report submission deadline.
- View report status, including overdue status.

Amer retains participant rights in the same Takaza.

Amer appointment does not automatically grant ADMIN permissions.

An expired or ended Amer appointment must no longer expose Amer Workspace functions.

The dashboard must not allow Amer to edit another user's original report or Kharguzari.

The full Amer report is mandatory before Takaza completion. If the report is overdue, the dashboard must clearly show the outstanding requirement and must not imply that the Takaza can be completed without it.

#### E. TAFAKUT Assessor Workspace

Visible only to a user with a valid assignment as an assessor for the relevant assessment process.

Functions may include:

- View assigned assessment.
- Access permitted candidate information.
- Complete the assigned assessment.
- Submit assessment.
- View own submitted assessment status.
- View the assessment process status where authorized.
- Receive relevant notifications.

The assessor must not see another assessor's submitted work before both required assessors have submitted.

A submitted assessment must be treated as immutable.

An assessor must not access unrelated TAFAKUT records merely because the user previously held an assessor appointment.

#### F. Syukbah Discussion

Visible according to the user's membership and discussion permissions.

An AHBAB may access the discussion associated with the relevant Syukbah where authorized.

Moderator functions are separate from ordinary discussion access.

### 5.3 Functional Appointment Navigation

Additional navigation may be displayed according to effective appointments.

| Appointment | Additional Navigation |
|---|---|
| Amer | Amer Workspace for assigned Takaza |
| Moderator | Relevant Syukbah Discussion moderation functions |
| Supervisor | No additional operational menu until authority is defined |
| TAFAKUT Assessor | Assigned TAFAKUT Assessments only |
| Deputy | Assigned delegated functions only |
| Admin Syukbah | Assigned Syukbah Management functions |
| Admin Takaza | Assigned Takaza Management functions |

A functional appointment must be checked for:

- Current status.
- Effective start date.
- Expiry or end date.
- Organizational or Takaza scope.
- Assigned responsibilities.
- Required consent.
- Delegation validity, where applicable.

A past, expired, revoked or suspended appointment must not grant current access.

### 5.4 AHBAB Navigation

| Menu | Visibility |
|---|---|
| Dashboard | All authorized AHBAB |
| My Jemaah | According to membership relationship |
| My Takaza | According to participation relationship |
| Rekod Amal | Own records and explicitly authorized records |
| My Activities | According to activity relationship |
| Progress Overview | Approved overall progress |
| Juhud Reports | Published reports visible to the user |
| Notifications | Own notifications |
| Amer Workspace | Active Amer only |
| TAFAKUT Assessments | Assigned assessor only |
| Syukbah Discussion | According to membership and Moderator permissions |
| My Profile | According to profile permissions |
| Change Password | According to authentication rules |
| Active Sessions | According to authentication rules |
| Logout | Allow |

Resource-level authorization applies to every menu and action.

### 5.5 Participation Status and Navigation

The My Takaza area must distinguish participation status.

Relevant states include:

- Pending confirmation.
- Confirmed participation.
- WITHDRAWN.
- REMOVED.
- Other approved participation states.

A pending applicant must not receive the same operational access as a confirmed participant.

A participant with `WITHDRAWN` or `REMOVED` status must not retain ordinary current operational access solely because historical records exist.

Historical participation records must remain available to authorized users according to historical access rules.

Rejoining must create a new linked participation record. It must not silently reactivate or overwrite the old record.

### 5.6 Withdrawal and Removal Presentation

Withdrawal and removal are distinct workflows.

Withdrawal:

- Ahbab may submit a withdrawal request.
- Admin acknowledges and records a valid request.
- Admin must not block or veto a valid withdrawal request.
- The dashboard must show the request and confirmation status.
- Request and confirmation dates must be retained.

Removal:

- Requires an authorized Admin decision.
- Requires justification from another Admin.
- The second Admin provides justification only and has no veto.
- The managing Admin makes the final decision.
- The user must receive the appropriate notification.
- Appeal must be available according to the approved workflow.

The interface must not present withdrawal as an Admin removal decision.

---

## 6. ADMIN Dashboard

### 6.1 Purpose

The ADMIN Dashboard provides operational administration capabilities within the user's authorized administrative scope.

ADMIN may be responsible for authorized operational functions such as:

- Registration review.
- Jemaah administration.
- Takaza administration.
- TAFAKUT administration.
- Syukbah administration.
- Organizational administration.
- Juhud Reports publishing.
- Authorized user administration.
- Relevant administrative review and reporting.

Not every ADMIN automatically receives all these capabilities.

The actual modules available must depend on assigned administrative permissions, organizational scope and functional appointments.

### 6.2 Dashboard Overview

Possible summary indicators:

- Pending Registrations.
- Active Jemaah.
- Active Takaza.
- Completed Takaza.
- Ongoing Takaza.
- Takaza requiring attention.
- Pending TAFAKUT decisions.
- Pending Amer reports.
- Overdue Amer reports.
- Pending Percha amendments.
- Pending participant withdrawal records.
- Pending removal appeals.
- Published Reports.
- Pending administrative tasks.

The dashboard must use actual authorized system data.

Placeholder values must not be presented as real statistics.

Every summary must respect the user's administrative scope.

The dashboard must not expose sensitive records through aggregate cards or notifications unless the viewer has the required permission.

### 6.3 Administration Modules

#### A. Registration Review

Available only to an ADMIN authorized to perform registration review.

Functions may include:

- View pending registrations.
- View registration details.
- Review submitted information.
- Approve registration.
- Reject registration.
- Provide mandatory rejection reason.
- Review registration history.

Registration decisions must follow the registration review workflow and database constraints.

Registration review permission does not automatically grant unrestricted user management.

#### B. Jemaah Management

Available according to the ADMIN's organizational scope and assigned permissions.

Functions may include:

- View authorized Jemaah.
- Manage Jemaah information.
- Manage membership.
- View relevant participation details.
- Review authorized Jemaah records.
- View membership history.

Membership management must not automatically modify Takaza Participation records.

#### C. Takaza Management

Available to an ADMIN authorized to manage the relevant Takaza.

Functions may include:

- View authorized Takaza.
- Create Main Takaza.
- Create Sub Takaza.
- Manage Takaza information.
- Manage Takaza status.
- Manage participation.
- Review applications and nominations.
- Confirm participants.
- Manage Amer appointment.
- Manage provisional Supervisor appointment according to the approved provisional rules.
- Manage relevant events and activities.
- Manage Percha.
- Review Kharguzari.
- Review Takaza reports.
- Manage completion and cancellation workflows.
- Review participant withdrawal records.
- Manage participant removal workflows.
- Review appeals within the authorized scope.

Main and Sub Takaza have independent lifecycles.

The interface must not imply that changing a Main Takaza status automatically changes its Sub Takaza.

Takaza statuses:

- `DRAFT`
- `RELEASED`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

The interface must distinguish Takaza Participation from Jemaah Membership.

#### D. TAFAKUT Management

Available to an ADMIN authorized to manage the relevant TAFAKUT process.

Functions may include:

- View assigned TAFAKUT processes.
- Configure permitted Takaza-level assessment selections.
- Assign eligible assessors where authorized.
- Monitor assessment progress.
- Review completed assessment results.
- Appoint a third assessor when the first two assessments disagree.
- Appoint two new assessors for an additional round.
- Review assessment history.
- Make the final administrative decision within authority.

TAFAKUT must follow its own assessment rules.

The standard assessment process requires exactly two independent assessors.

A third assessor is required when the first two assessments disagree.

Additional rounds use two new assessors who have not previously assessed the candidate in the relevant process.

Higher or wider-scope Admin appoints assessors.

The dashboard must not provide an action that allows one Admin to bypass the required independent assessment process.

The dashboard must distinguish:

1. Assessor submissions.
2. Assessment majority or disagreement.
3. Third-assessor outcome.
4. Additional assessment round.
5. Managing Admin final decision.

A Managing Admin may make a final decision different from the assessment majority, but mandatory justification is required.

The final decision must be a separate decision record. It must not overwrite assessor submissions.

TAFAKUT template and criteria administration belongs to the authorized higher or wider administrative scope.

#### E. Syukbah Management

Available only to an ADMIN with the appropriate Syukbah administrative appointment or permission.

Functions may include:

- View authorized Syukbah.
- Manage Syukbah information.
- Manage Syukbah status.
- Manage authorized appointments.
- Assign or remove discussion moderators.
- Review relevant Syukbah activity.
- Access authorized Syukbah records.
- Prepare authorized Syukbah reports.

Admin Syukbah, Deputy and Moderator are separate functional appointments.

Admin Syukbah does not automatically receive every ADMIN permission.

Deputy permissions are limited to approved delegation.

The detailed Deputy and acting authority remain subject to the relevant open decision.

#### F. Organizational Administration

Available according to the user's authorized organizational appointment and scope.

Functions may include:

- View organizational structure.
- Manage authorized organizational records.
- View relevant subordinate organizations.
- Manage permitted administrative assignments.
- Review authorized organizational reports.
- View appointment and delegation history.

The dashboard must not assume that unresolved country hierarchy or Markaz Negara governance decisions have already been finalized.

#### G. Progress Overview

ADMIN may access operational progress information within the permitted administrative scope.

The system must not expose records outside that scope.

#### H. Juhud Reports CMS

An authorized ADMIN may:

- Create reports.
- Edit own or otherwise authorized draft reports.
- Save drafts.
- Publish reports.
- Archive reports.
- Manage report visibility.
- Review publication history.

ADMIN may publish Juhud Reports directly without SUPER_ADMIN approval.

Publishing authority remains subject to the user's assigned permissions and applicable content restrictions.

#### I. Announcements

An authorized ADMIN may prepare and publish announcements for permitted audiences.

Audience selection must be enforced by the backend.

#### J. Administrative Review Queue

Where supported, the dashboard may provide a consolidated review queue for:

- Pending approvals.
- Pending justifications.
- Pending second-Admin approvals.
- Pending appeals.
- Pending Amer report submissions.
- Overdue requirements.
- Pending administrative decisions.

The queue must clearly identify the type of action required.

A second-Admin justification task must not be presented as a second-Admin approval task.

A proposal must not be displayed as an approved change.

### 6.4 ADMIN Navigation

| Menu | Visibility |
|---|---|
| Dashboard | Authorized ADMIN |
| Registration Review | If assigned permission |
| Jemaah Management | If assigned permission and scope |
| Takaza Management | If assigned permission and scope |
| TAFAKUT Management | If assigned permission and scope |
| Syukbah Management | If appointed or authorized |
| Organizational Administration | If assigned permission and scope |
| Progress Overview | Within administrative scope |
| Juhud Reports CMS | If assigned publishing permission |
| Announcements | If assigned permission |
| Administrative Review Queue | If assigned permission |
| Notifications | Own administrative notifications |
| My Profile | According to profile permissions |
| Change Password | According to authentication rules |
| Active Sessions | According to authentication rules |
| Logout | Allow |

### 6.5 ADMIN Restrictions

- ADMIN does not automatically receive global system authority.
- ADMIN cannot access records outside the authorized administrative scope.
- ADMIN does not automatically become a Jemaah member or Takaza participant.
- ADMIN does not automatically become an Amer.
- ADMIN cannot create Takaza progress reports on behalf of Amer.
- ADMIN cannot edit another user's report or comment unless an explicit business rule authorizes that operation.
- ADMIN cannot alter another user's Rekod Amal without an explicitly authorized workflow.
- ADMIN cannot bypass TAFAKUT independence requirements.
- ADMIN cannot bypass required second-Admin justification for applicable removal or Amer replacement decisions.
- ADMIN cannot bypass the separate approval requirement for Percha amendments.
- ADMIN cannot block a valid Ahbab withdrawal request.
- ADMIN cannot treat a pending proposal as an approved decision.
- ADMIN cannot use one Takaza appointment to access unrelated Takaza records.
- ADMIN cannot assume Supervisor authority while the relevant decision remains open.
- Administrative actions must be audited.

### 6.6 Two-Admin Requirements

Where business rules require another ADMIN's justification or approval, the dashboard must provide the corresponding workflow.

| Operation | Required Workflow |
|---|---|
| Amer replacement | Managing ADMIN makes decision with justification from another ADMIN |
| Participant removal | Managing ADMIN makes decision with justification from another ADMIN |
| Percha amendment | Proposed by one ADMIN and approved by a different ADMIN |
| TAFAKUT normal round | Two independent assessors |
| TAFAKUT disagreement | Third assessor required |
| TAFAKUT additional round | Two new eligible assessors |

The interface must distinguish between:

- Second-ADMIN justification.
- Second-ADMIN approval.
- Independent assessment.
- Managing ADMIN final decision.

These are not interchangeable.

### 6.7 Percha Amendment Interface

The Percha amendment workflow must:

1. Allow an authorized Admin to propose an amendment.
2. Preserve the original Percha.
3. Route the proposal to a different Admin.
4. Prevent the proposing Admin from approving their own proposal.
5. Allow the second Admin to approve or reject.
6. Record the decision and actor.
7. Preserve all versions and amendment history.

A proposal must not alter the active Percha before approval.

### 6.8 Amer Replacement Interface

The Amer replacement workflow must:

1. Record the proposed replacement.
2. Record the reason for replacement.
3. Obtain justification from another Admin.
4. Allow the managing Admin to make the final decision.
5. Record the final decision separately from the second Admin's justification.
6. Preserve the previous Amer appointment history.
7. Record the effective date of replacement.

The second Admin provides justification and does not have veto authority.

### 6.9 Participant Removal Interface

The participant removal workflow must:

1. Record the proposed removal.
2. Record the reason.
3. Obtain justification from another Admin.
4. Allow the managing Admin to make the final decision.
5. Notify the affected participant.
6. Provide the applicable appeal route.
7. Preserve the original participation history.

The second Admin provides justification and does not have veto authority.

### 6.10 Withdrawal Interface

The withdrawal workflow must:

1. Allow Ahbab to submit a withdrawal request.
2. Record the request date.
3. Notify the relevant Admin.
4. Allow Admin to acknowledge and record the withdrawal.
5. Record the confirmation date.
6. Preserve the participation history.

Admin acknowledgement is an administrative recording step, not discretionary permission to block a valid withdrawal.

---

## 7. SUPER_ADMIN Dashboard

### 7.1 Purpose

The SUPER_ADMIN Dashboard provides global system governance and highest-level administrative control.

Its primary responsibilities include:

- System security.
- Global account governance.
- Core role governance.
- System configuration.
- System integrity.
- Audit and monitoring.
- Global oversight.

SUPER_ADMIN is not required to perform ordinary operational administration.

### 7.2 Dashboard Overview

Possible summary indicators:

- Total Users.
- Active Accounts.
- Disabled Accounts.
- Suspended Accounts.
- Administrators.
- Security Events.
- Pending Global Governance Tasks.
- System Health.
- Data Integrity Alerts.
- Recent Administrative Changes.

All indicators must use actual system data.

### 7.3 System Administration Modules

#### A. User Management

- View user accounts.
- Review account information.
- Manage account status where authorized.
- Review account history.
- Perform authorized global account administration.

Account status changes must follow the account management rules and be audited.

#### B. Core Role Management

- View core role assignments.
- Assign permitted core roles.
- Revoke role assignments.
- Review role assignment history.

Core roles include:

- `SUPER_ADMIN`
- `ADMIN`
- `AHBAB`

Functional appointments must not be confused with core roles.

SUPER_ADMIN role management does not automatically mean that every appointment or organizational assignment can be changed without its own workflow.

#### C. System Configuration

- Manage approved system configuration.
- Manage system-level settings.
- Review configuration changes.
- Manage approved global reference data.

Configuration changes must be audited.

#### D. System Data Management

- Monitor data integrity.
- Review system data status.
- Perform authorized data administration.
- Review migration and schema status where supported.

Destructive operations require separately defined safeguards.

#### E. Audit Logs

- View administrative audit logs.
- View registration review audit records.
- View role assignment changes.
- View account status changes.
- View security-related events.
- Review relevant system configuration changes.
- Review appointment and delegation changes.
- Review exceptional access events.

Audit records must remain protected against unauthorized alteration or deletion.

#### F. System Monitoring

- Monitor system health.
- Monitor authentication events.
- Monitor security events.
- Review operational issues.
- Review integration and service status where supported.

#### G. Global Operational Visibility

- Jemaah Overview.
- Takaza Overview.
- Syukbah Overview.
- Progress Overview.
- Juhud Reports Overview.

Global visibility does not automatically grant participant, Amer, assessor, report-author or operational ADMIN privileges.

### 7.4 SUPER_ADMIN Navigation

| Menu | Visibility |
|---|---|
| Dashboard | SUPER_ADMIN |
| User Management | SUPER_ADMIN |
| Core Role Management | SUPER_ADMIN |
| System Configuration | SUPER_ADMIN |
| System Data Management | SUPER_ADMIN |
| Audit Logs | SUPER_ADMIN |
| System Monitoring | SUPER_ADMIN |
| Jemaah Overview | Global read access |
| Takaza Overview | Global read access |
| Syukbah Overview | Global read access |
| Progress Overview | Global overview |
| Juhud Reports Overview | According to governance permissions |
| My Profile | According to profile permissions |
| Change Password | According to authentication rules |
| Active Sessions | According to authentication rules |
| Logout | Allow |

### 7.5 SUPER_ADMIN Restrictions

- SUPER_ADMIN does not automatically become an AHBAB or Takaza participant.
- SUPER_ADMIN does not automatically become an Amer.
- SUPER_ADMIN does not automatically become a TAFAKUT assessor.
- SUPER_ADMIN cannot claim ownership of another user's report or comment.
- Global visibility must not silently bypass business-level ownership rules.
- SUPER_ADMIN system authority must not be treated as automatic authority to alter every operational decision.
- Any exceptional administrative intervention must follow an explicitly defined and auditable workflow.
- Administrative actions must be auditable.
- Global system access must not be interpreted as permission to alter historical business records without a defined process.

---

## 8. Progress Overview Module

### 8.1 Purpose

Progress Overview provides a system-generated view of Juhud development.

It is intended for monitoring and understanding progress without exposing unrestricted internal records.

Progress Overview is not a substitute for operational Takaza reports or published Juhud Reports.

### 8.2 Audiences

| Audience | Visibility |
|---|---|
| LIMITED | No access unless explicitly authorized |
| AHBAB | Approved overall progress |
| ADMIN | Operational progress within administrative scope |
| SUPER_ADMIN | Global system overview |

### 8.3 Possible Information

- Active Jemaah count.
- Active Takaza count.
- Completed Takaza count.
- Ongoing Takaza count.
- Progress by approved category.
- Historical progress trends.
- Approved achievement summaries.
- Relevant aggregate indicators.

Exact metrics and calculation formulas require their own approved definition.

### 8.4 Data Protection

Progress Overview must use approved aggregation and visibility rules.

It must not expose:

- Private Rekod Amal.
- National ID or WhatsApp information.
- Confidential TAFAKUT assessment records.
- Internal administrative notes.
- Private participant details.
- Records outside the viewer's authorized scope.
- Individual information through aggregation that could reasonably reveal a private record.

The system must distinguish between:

1. System-generated progress indicators.
2. Operational Takaza reports.
3. Published Juhud Reports.
4. Annual Archive and Admin Summary records.

These are separate data and presentation layers.

### 8.5 Scope and Filtering

ADMIN views must be filtered by authorized administrative scope.

AHBAB views must follow approved audience visibility rules.

SUPER_ADMIN views may provide global system overview, but must not automatically grant permission to edit the underlying operational records.

Filtering in the frontend is not sufficient. The backend must apply the same scope restrictions.

---

## 9. Juhud Reports CMS

### 9.1 Purpose

Juhud Reports is the shared-content module for publishing progress reports, achievements and announcements to selected audiences.

It is separate from:

- Operational Takaza progress reports prepared by Amer.
- Individual Kharguzari.
- Annual Archive.
- Admin Notes and Annual Summary.

These records must not be merged into one generic report entity without an approved data model.

### 9.2 Report Management

An ADMIN with publishing permission may:

- Create reports.
- Edit authorized drafts.
- Save drafts.
- Publish reports.
- Archive reports.
- Manage report visibility.
- Review publication history.

SUPER_ADMIN may access reports for system governance and oversight according to its permissions.

SUPER_ADMIN approval is not required before an authorized ADMIN publishes a report.

### 9.3 Publication Workflow

The baseline workflow is:

`DRAFT → PUBLISHED → ARCHIVED`

The system may support additional states if separately approved.

No SUPER_ADMIN approval stage is required in the baseline workflow.

### 9.4 Report Fields

Proposed report fields:

- Report ID.
- Title.
- Summary.
- Content.
- Category.
- Cover Image.
- Attachments.
- Author.
- Publication Date.
- Visibility.
- Status.
- Created At.
- Updated At.

The final database schema and attachment handling require a separate specification.

### 9.5 Visibility Options

Proposed audience options:

- All AHBAB.
- Selected Jemaah.
- Selected Takaza participants.
- ADMIN within authorized scope.
- SUPER_ADMIN.
- Other explicitly approved audiences.

Audience selection must be enforced by the backend, not merely by frontend filtering.

A selected Takaza audience must be resolved through actual Takaza Participation records, not inferred solely from Jemaah Membership.

### 9.6 Report Content

Reports may include:

- Text.
- Images.
- PDF attachments.
- Supporting documents.
- Approved progress summaries.

Published reports must not expose private information or unauthorized operational records.

### 9.7 Author and Ownership Rules

The system must preserve:

- Original author.
- Authorized editor.
- Publication actor.
- Publication date.
- Changes to visibility.
- Archive actor and date.
- Attachment history.

Editing another user's draft must require explicit permission.

The interface must not silently replace the original author when an authorized editor updates a report.

### 9.8 Audit Requirements

The system must record:

- Report creation.
- Report edits.
- Publication.
- Archiving.
- Changes to visibility.
- Relevant attachment changes.
- Changes to publication status.

The system must preserve the author and publication history.

---

## 10. Navigation and Authorization Rules

1. Navigation visibility must be derived from authenticated account state, registration status, access level, assigned roles, appointments, delegation, scope and resource permissions.
2. The backend remains the final authorization authority.
3. Direct API requests must receive the same authorization checks as normal UI navigation.
4. Resource-specific permissions must be enforced for every relevant operation.
5. A user with multiple roles or appointments may receive combined navigation capabilities only where authorized.
6. A role assignment must not bypass Access Level requirements.
7. A functional appointment must not automatically grant unrelated permissions.
8. A suspended or disabled account must not retain operational access.
9. Published report visibility must be checked on every request.
10. Administrative records must be filtered by authorized organizational scope.
11. AHBAB access to Jemaah and Takaza must be based on the relevant relationship records.
12. Jemaah Membership must not be treated as Takaza Participation.
13. Expired or ended appointments must no longer grant appointment-based access.
14. Frontend menu visibility must not be used as a security boundary.
15. Sensitive administrative actions must be audited.
16. Unresolved business decisions must not be implemented as assumed permissions.
17. Authorization failures must not reveal protected record information.
18. A pending application must not be presented as confirmed participation.
19. A pending appointment must not be presented as an active appointment.
20. A proposal must not be presented as an approved change.
21. A second-Admin justification must not be presented as an approval.
22. A final Managing Admin decision must remain distinguishable from independent assessment submissions.
23. Historical access must not automatically imply current operational access.
24. Navigation must be refreshed or revalidated when account status, role, appointment or delegation changes.

### 10.1 Authorization Evaluation

The backend should evaluate access in the following order:

1. Authenticate the user and validate the session.
2. Check account status.
3. Determine the effective access level.
4. Check the required core role.
5. Check functional appointment and its effective dates, if relevant.
6. Check delegation and its scope, if relevant.
7. Check administrative scope, if relevant.
8. Check the user's relationship to the requested resource.
9. Check the requested operation permission.
10. Verify any required approval, consent or justification.
11. Record the required audit event.

The exact implementation may use a different internal sequence, provided the same security guarantees are enforced.

A failed authentication or account-state check must never be overridden by a later role or appointment check.

### 10.2 Unauthorized Navigation

If a user opens a route for which they do not have permission:

- The system must deny access.
- The user must receive an appropriate message.
- Protected record details must not be disclosed.
- The frontend must return the user to an authorized route where appropriate.
- The denial must be audited where required by security policy.

### 10.3 Appointment Expiry and Revocation

When an appointment expires, is revoked or is terminated:

- Appointment-based navigation must be removed.
- Appointment-based API access must be denied.
- Any relevant delegated access must be re-evaluated.
- Historical records must remain preserved.
- Any permitted historical access must be governed separately.

---

## 11. Shared Navigation Components

The following components may be shared across dashboards:

- Application Header.
- Main Navigation.
- Notification Center.
- User Profile Menu.
- Breadcrumb Navigation.
- Dashboard Summary Cards.
- Search.
- Responsive Mobile Navigation.
- Account Status Indicator.
- Appointment Indicator.
- Organizational Scope Indicator.
- Administrative Review Queue.
- Recent Activity.
- Security Notifications.

The dashboard content and available navigation items must remain permission-aware.

### 11.1 Appointment Indicator

Where relevant, the interface should clearly show the user's active functional appointment.

Examples:

- Amer — Takaza name.
- Admin Syukbah — Syukbah name.
- Admin Takaza — Takaza name.
- Moderator — Syukbah name.
- TAFAKUT Assessor — Assigned assessment.
- Deputy — Delegated organization or Syukbah scope.
- Supervisor — Provisional appointment indicator only, without implying operational authority.

The indicator is informational and does not itself grant permission.

### 11.2 Scope Indicator

ADMIN users should be able to identify the organizational scope under which they are operating.

Where a user has multiple authorized scopes, the interface must make the currently selected scope clear.

Changing the displayed scope must not grant additional permissions.

The backend must independently validate the selected scope against the user's actual assignments.

### 11.3 Account Status Indicator

Where relevant, the interface should distinguish:

- ACTIVE.
- DISABLED.
- SUSPENDED.
- Pending registration.
- Pending review.

Account status must not be confused with participation or appointment status.

### 11.4 Notification Center

Notifications may include:

- Registration status changes.
- Account security events.
- Takaza participation updates.
- Amer appointment updates.
- TAFAKUT assessment assignments.
- TAFAKUT assessment deadlines.
- Percha amendment requests.
- Withdrawal acknowledgements.
- Removal decisions.
- Appeal decisions.
- Amer report deadlines.
- Overdue Amer reports.
- Administrative tasks.

Notifications must not disclose sensitive information to unauthorized recipients.

A notification does not grant permission to open the underlying resource.

The destination resource must be authorized independently when opened.

### 11.5 Responsive Navigation

Navigation must support:

- Desktop.
- Tablet.
- Mobile.

Responsive presentation must not change the underlying authorization rules.

A menu hidden on mobile must not imply that its API is inaccessible, and a menu shown on desktop must not imply that its API is authorized.

---

## 12. Items Requiring Separate Specification or Open Decision

The following items require detailed specifications or resolution before implementation:

1. Exact dashboard metrics and calculation formulas.
2. Exact field-level profile editing permissions.
3. Detailed registration review permissions by organizational scope.
4. Jemaah administration workflows and permission boundaries.
5. Detailed Takaza administration workflows.
6. Detailed TAFAKUT management workflow and appointment permissions.
7. Progress Overview aggregation and data visibility rules.
8. Juhud Reports CMS database schema and attachment handling.
9. Report visibility and audience targeting rules.
10. Notification delivery and preference management.
11. Detailed SUPER_ADMIN system configuration permissions.
12. Supervisor authority, scope and participant requirement.
13. Direct Assignment consent and TAFAKUT requirements.
14. Country organizational hierarchy.
15. Markaz Negara governance model.
16. Additional Country Syukbah approval requirements.
17. Deputy and acting delegation permissions.
18. Exact permissions for LIMITED access and pending registration states.
19. Historical record access after withdrawal or removal.
20. Post-completion Takaza changes and reopening.
21. Detailed Annual Archive correction permissions.
22. Exceptional global access and break-glass procedures, if required.

Until these are defined, implementation must not assume broader permissions.

The relevant decisions must be recorded in `OPEN_DECISIONS_REGISTER.md` or the applicable module specification.

### 12.1 Confirmed Rules That Must Not Be Reopened as Unresolved

The following rules are already established:

- Amer must be a confirmed participant in the same Takaza before appointment.
- Amer appointment requires Admin and candidate consent.
- Supervisor authority and eligibility remain provisional/open.
- TAFAKUT uses two independent assessors for a normal round.
- Disagreement requires a third assessor.
- Additional rounds use two new assessors who have not previously assessed the candidate.
- Submitted assessments are immutable.
- Managing Admin final decision is separate from assessor submissions.
- Percha changes require a different Admin to approve.
- Amer replacement requires justification from another Admin, not a second-Admin veto.
- Participant removal requires justification from another Admin, not a second-Admin veto.
- A valid withdrawal request cannot be blocked by Admin.
- Withdrawal and removal are distinct participation outcomes.
- Rejoining creates a new linked participation record.
- Password Reset does not reactivate a DISABLED or SUSPENDED account.
- Full Amer report is required before Takaza completion.
- An overdue Amer report prevents Takaza completion.
- Main Takaza and Sub Takaza have independent lifecycles.
- Case Management full workflow remains ON HOLD.

These confirmed rules must be reflected in dashboard presentation and navigation.

---

## 13. Relationship to UAC Matrix and Other Specifications

This document must be read together with:

- `UAC_MATRIX.md`
- `MASTER_DECISION_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `OPEN_DECISIONS_REGISTER.md`
- `AUTH.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `V2_DESIGN_CHECKPOINT.md`

If a dashboard or navigation requirement conflicts with the UAC Matrix, the approved authorization decisions take precedence.

If a navigation requirement conflicts with a module's business rules, the applicable approved module rules take precedence.

Dashboard navigation is a presentation of permissions, not the source of permissions.

`AUTH.md` defines authentication, session and account-security requirements.

The module specifications define operational workflows.

The Master Decision Register records approved and provisional decisions.

The Open Decisions Register identifies matters that remain unresolved.

No dashboard specification may convert an unresolved business decision into an approved permission.

### 13.1 Document Precedence

Where documents appear to conflict:

1. Latest explicitly approved project decision in `MASTER_DECISION_REGISTER.md`.
2. Applicable confirmed requirements and approved governance decisions.
3. `UAC_MATRIX.md` for authorization boundaries.
4. Relevant module specification for operational business rules.
5. `AUTH.md` for authentication and account-security rules.
6. This document for dashboard and navigation presentation.
7. Implementation notes and UI conventions.

An implementation detail must not override an approved business or authorization rule.

---

## 14. Baseline Summary

JuhudManager V2 provides four primary dashboard experiences:

| Dashboard | Primary Focus |
|---|---|
| LIMITED | Authorized registration and personal account functions |
| AHBAB | Personal Juhud workspace and approved shared progress |
| ADMIN | Scoped operational administration |
| SUPER_ADMIN | Global system governance and security |

Dashboard access is determined by separate authorization dimensions:

- Account Status.
- Registration Status.
- Access Level.
- Core Role.
- Functional Appointment.
- Delegation.
- Administrative Scope.
- Resource Permission.

The dashboard may combine authorized capabilities, but it must not merge the underlying authority of different roles and appointments.

Functional workspaces include:

- Amer Workspace.
- TAFAKUT Assessor Workspace.
- Syukbah Discussion and Moderator functions.
- Admin Syukbah functions.
- Admin Takaza functions.
- Deputy delegated functions.

Supervisor remains provisional and must not receive assumed operational permissions.

Two distinct progress and reporting modules are provided:

- Progress Overview — system-generated progress information.
- Juhud Reports — curated reports published for selected audiences.

Operational Takaza reports, individual Kharguzari, Annual Archive and Admin Summary remain separate from Juhud Reports.

An authorized ADMIN may publish Juhud Reports directly without SUPER_ADMIN approval.

Special administrative workflows must clearly distinguish:

- Second-Admin justification.
- Second-Admin approval.
- Independent TAFAKUT assessment.
- Managing Admin final decision.

Withdrawal, removal and appeal must remain distinct workflows.

All dashboard and navigation functions must follow the UAC Matrix, approved module rules and backend resource-level authorization.

---

**Document Status:** DESIGN BASELINE — FOR REVIEW  
**Version:** 2.2  
**Last Updated:** 28 November 2026  
**Next Review:** Dashboard Metrics, Report Visibility, Notification Rules, Supervisor Authority, Deputy Delegation and Remaining Resource-Level Permissions.

**End of Document.**

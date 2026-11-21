
# JuhudManager V2 — Dashboard & Navigation Specification

**Document:** Dashboard & Navigation Specification  
**Version:** V2  
**Status:** Design Baseline  
**Related Document:** UAC_MATRIX.md  
**Scope:** Dashboard, Navigation, Progress Overview and Juhud Reports CMS  
**Last Updated:** 21 November 2026

---

## 1. Purpose

This document defines the dashboard structure, navigation menus and functional visibility for JuhudManager V2.

The system provides four primary dashboard experiences:

1. LIMITED Dashboard
2. AHBAB Dashboard
3. ADMIN Dashboard
4. SUPER_ADMIN Dashboard

Dashboard visibility and available actions must follow the User Access Control Matrix (UAC).

This document defines the presentation and navigation baseline. It does not replace backend authorization requirements.

## 2. Dashboard Design Principles

1. Each user sees a dashboard appropriate to their account access level and assigned role.
2. Navigation visibility must follow the UAC Matrix.
3. Hiding a menu does not replace backend authorization.
4. Personal data and operational records must remain protected by resource-level permissions.
5. AHBAB users should have access to approved overall progress information, without unrestricted access to internal records.
6. Operational reports and shared reports must remain separate.
7. Administrative functions must be auditable.
8. Dashboard modules must support future expansion without redesigning the entire navigation structure.

## 3. Dashboard Categories

| Dashboard | Access Requirement | Primary Purpose |
|---|---|---|
| LIMITED | PENDING_REVIEW + DISABLED | Account and registration |
| AHBAB | FULL + AHBAB role | Personal Juhud workspace |
| ADMIN | FULL + ADMIN role | Operational administration |
| SUPER_ADMIN | FULL + SUPER_ADMIN role | System governance |

A user with multiple roles may receive additional navigation capabilities according to their assigned roles.

Access Level and Role must remain separate authorization concepts.

---

## 4. LIMITED Dashboard

### 4.1 Purpose

The LIMITED Dashboard is for users who have successfully verified their email and are waiting for Admin registration review.

### 4.2 Dashboard Content

- Welcome message
- Registration status
- Email verification status
- Admin review status
- My Profile
- Change Password
- Active Sessions
- Logout

### 4.3 Registration Status Display

The dashboard should communicate:

- Email Verified
- Awaiting Admin Review
- Approved, where applicable
- Rejected, where applicable

A rejected registration must not receive operational access.

### 4.4 Navigation

| Menu | Access |
|---|---|
| Dashboard | Allow |
| My Profile | Allow |
| Change Password | Allow |
| Active Sessions | Allow |
| Logout | Allow |
| My Jemaah | Deny |
| My Takaza | Deny |
| Rekod Amal | Deny |
| Progress Overview | Deny |
| Juhud Reports | Deny |
| Administration | Deny |

---

## 5. AHBAB Dashboard

### 5.1 Purpose

The AHBAB Dashboard provides a personal workspace for approved Ahbab.

The dashboard focuses on the user's own Jemaah, Takaza participation, Rekod Amal and relevant activities.

It also provides access to approved overall Juhud progress information and published shared reports.

### 5.2 Main Dashboard Sections

#### A. Personal Overview

- My Jemaah
- My Takaza
- My Rekod Amal
- My Activities
- Notifications

#### B. Progress Overview

Provides an approved system-generated overview of overall Juhud progress.

Possible information includes:

- Total active Jemaah
- Total active Takaza
- Completed Takaza
- Ongoing Takaza
- Approved progress indicators
- Progress summaries by permitted category

Progress Overview must not expose:

- Private individual Rekod Amal
- Personal National ID or WhatsApp information
- Private user information
- Internal administrative notes
- Restricted operational records

The displayed information must follow the approved visibility and aggregation rules.

#### C. Juhud Reports

Provides access to reports published for the AHBAB audience.

Possible content:

- Monthly Juhud Progress
- Takaza Progress Highlights
- Special Reports
- Announcements
- Archived Reports

Only published reports whose visibility includes the current user may be displayed.

#### D. Amer Workspace

Visible only to an AHBAB with an active Amer appointment.

Functions:

- Takaza under leadership
- Create Progress Report
- My Progress Reports
- Edit own Progress Reports
- Comment on relevant Takaza

Amer retains participant rights in the Takaza.

### 5.3 AHBAB Navigation

| Menu | Visibility |
|---|---|
| Dashboard | All AHBAB |
| My Jemaah | All AHBAB |
| My Takaza | All AHBAB |
| Rekod Amal | All AHBAB |
| Progress Overview | All AHBAB |
| Juhud Reports | All AHBAB |
| Notifications | All AHBAB |
| Amer Workspace | Active Amer only |
| My Profile | All AHBAB |
| Change Password | All AHBAB |
| Active Sessions | All AHBAB |
| Logout | All AHBAB |

Resource-level authorization applies to My Jemaah, My Takaza, Rekod Amal and Amer Workspace.

---

## 6. ADMIN Dashboard

### 6.1 Purpose

The ADMIN Dashboard provides operational administration capabilities.

ADMIN is responsible for managing registration reviews, Jemaah, Takaza, Tafakut and shared reporting content.

### 6.2 Dashboard Overview

Possible summary indicators:

- Pending Registrations
- Active Jemaah
- Active Takaza
- Completed Takaza
- Ongoing Takaza
- Published Reports

The dashboard must use actual system data. Placeholder values must not be presented as real statistics.

### 6.3 Administration Modules

#### A. Registration Review

- View pending registrations
- View registration details
- Approve registration
- Reject registration
- Provide mandatory rejection reason
- Review registration history

Registration decisions must follow the registration review workflow and database constraints.

#### B. Jemaah Management

- View Jemaah
- Manage Jemaah information
- Manage membership
- View relevant participation details

Exact management permissions must follow the Jemaah business rules.

#### C. Takaza Management

- View Takaza
- Create and manage Takaza
- Manage Takaza status
- Manage Amer appointment
- Manage participant relationships

Changing an Amer appointment must preserve the participant status of the appointed Amer.

#### D. Tafakut Management

Tafakut has two layers:

1. Common Tafakut — shared criteria across Takaza.
2. Specific Tafakut — criteria tailored to individual Takaza.

ADMIN manages both layers according to the Tafakut specification.

#### E. Progress Overview

ADMIN may access operational progress information within the permitted administrative scope.

#### F. Juhud Reports CMS

ADMIN may create, edit, publish and archive shared reports.

#### G. Announcements

ADMIN may prepare and publish announcements for permitted audiences.

### 6.4 ADMIN Navigation

| Menu | Visibility |
|---|---|
| Dashboard | ADMIN |
| Registration Review | ADMIN |
| Jemaah Management | ADMIN |
| Takaza Management | ADMIN |
| Tafakut Management | ADMIN |
| Progress Overview | ADMIN |
| Juhud Reports CMS | ADMIN |
| Announcements | ADMIN |
| My Profile | ADMIN |
| Change Password | ADMIN |
| Active Sessions | ADMIN |
| Logout | ADMIN |

ADMIN access remains subject to backend permission and administrative scope checks.

### 6.5 ADMIN Restrictions

- ADMIN cannot create Takaza progress reports on behalf of Amer.
- ADMIN cannot edit another user's progress report.
- ADMIN cannot edit another user's comment.
- ADMIN cannot alter another user's Rekod Amal.
- ADMIN does not automatically become a participant or Amer.
- Sensitive administrative actions must be audited.

---

## 7. SUPER_ADMIN Dashboard

### 7.1 Purpose

The SUPER_ADMIN Dashboard provides system governance and highest-level administrative control.

Its primary responsibilities are system security, account governance, role management and configuration.

SUPER_ADMIN is not required to perform ordinary operational administration.

### 7.2 Dashboard Overview

Possible summary indicators:

- Total Users
- Active Accounts
- Administrators
- Suspended Accounts
- Security Events
- System Health

### 7.3 System Administration Modules

#### A. User Management

- View user accounts
- Manage account status
- Review account information
- Perform authorized account administration

#### B. Role Management

- View role assignments
- Assign permitted roles
- Revoke role assignments
- Review role assignment history

Role changes must be audited.

#### C. System Configuration

- Manage approved system configuration
- Manage system-level settings
- Review configuration changes

#### D. System Data Management

- Monitor data integrity
- Review system data status
- Perform authorized data administration

Destructive operations require separately defined safeguards.

#### E. Audit Logs

- View administrative audit logs
- View registration review audit records
- View role assignment changes
- View security-related events

#### F. System Monitoring

- Monitor system health
- Monitor authentication events
- Monitor security events
- Review operational issues

#### G. Operational Visibility

- Jemaah Overview
- Takaza Overview
- Progress Overview
- Juhud Reports Overview

Visibility does not automatically grant participant, Amer or report-author privileges.

### 7.4 SUPER_ADMIN Navigation

| Menu | Visibility |
|---|---|
| Dashboard | SUPER_ADMIN |
| User Management | SUPER_ADMIN |
| Role Management | SUPER_ADMIN |
| System Configuration | SUPER_ADMIN |
| System Data Management | SUPER_ADMIN |
| Audit Logs | SUPER_ADMIN |
| System Monitoring | SUPER_ADMIN |
| Jemaah Overview | SUPER_ADMIN |
| Takaza Overview | SUPER_ADMIN |
| Progress Overview | SUPER_ADMIN |
| Juhud Reports Overview | SUPER_ADMIN |
| My Profile | SUPER_ADMIN |
| Change Password | SUPER_ADMIN |
| Active Sessions | SUPER_ADMIN |
| Logout | SUPER_ADMIN |

### 7.5 SUPER_ADMIN Restrictions

- SUPER_ADMIN does not automatically become an AHBAB or Takaza participant.
- SUPER_ADMIN does not automatically become an Amer.
- SUPER_ADMIN cannot claim ownership of another user's report or comment.
- System-level authority must not silently bypass business-level ownership rules.
- Administrative actions must be auditable.

---

## 8. Progress Overview Module

### 8.1 Purpose

Progress Overview provides a system-generated view of Juhud development.

It is intended for monitoring and understanding progress without exposing unrestricted internal records.

### 8.2 Audiences

| Audience | Visibility |
|---|---|
| LIMITED | No access |
| AHBAB | Approved overall progress |
| ADMIN | Operational progress within administrative scope |
| SUPER_ADMIN | System-wide overview |

### 8.3 Possible Information

- Active Jemaah count
- Active Takaza count
- Completed Takaza count
- Ongoing Takaza count
- Progress by approved category
- Historical progress trends
- Approved achievement summaries

### 8.4 Data Protection

Progress Overview must use approved aggregation and visibility rules.

It must not expose private Rekod Amal or sensitive personal information.

The system must distinguish between:

- System-generated progress indicators
- Operational Takaza reports
- Published Juhud Reports

These are separate data and presentation layers.

---

## 9. Juhud Reports CMS

### 9.1 Purpose

Juhud Reports is the shared-content module for publishing progress reports, achievements and announcements to selected audiences.

It is separate from the operational Takaza progress-report function.

### 9.2 Report Management

ADMIN may:

- Create reports
- Edit reports
- Save drafts
- Publish reports
- Archive reports

SUPER_ADMIN may access reports for system governance and oversight.

SUPER_ADMIN approval is not required before ADMIN publishes a report.

### 9.3 Publication Workflow

The approved baseline workflow is:

`DRAFT → PUBLISHED → ARCHIVED`

No SUPER_ADMIN approval stage is required.

### 9.4 Report Fields

Proposed report fields:

- Report ID
- Title
- Summary
- Content
- Category
- Cover Image
- Attachments
- Author
- Publication Date
- Visibility
- Status
- Created At
- Updated At

### 9.5 Visibility Options

Proposed audience options:

- All AHBAB
- Selected Jemaah
- Selected Takaza participants
- ADMIN and SUPER_ADMIN
- SUPER_ADMIN only

Visibility must be enforced by the backend, not merely by frontend filtering.

### 9.6 Report Content

Reports may include:

- Text
- Images
- PDF attachments
- Supporting documents
- Approved progress summaries

Published reports must not expose private information or unauthorized operational records.

### 9.7 Audit Requirements

The system must record:

- Report creation
- Report edits
- Publication
- Archiving
- Changes to visibility

---

## 10. Navigation and Authorization Rules

1. Navigation visibility must be derived from authenticated user access and assigned roles.
2. The backend remains the final authorization authority.
3. Direct API requests must receive the same authorization checks as normal UI navigation.
4. Resource-specific permissions must be enforced for every relevant operation.
5. A user with multiple roles may receive combined navigation capabilities.
6. A role assignment must not bypass Access Level requirements.
7. A suspended or disabled account must not retain operational access.
8. Published report visibility must be checked on every request.

---

## 11. Shared Navigation Components

The following components may be shared across dashboards:

- Application Header
- Main Navigation
- Notification Center
- User Profile Menu
- Breadcrumb Navigation
- Dashboard Summary Cards
- Search
- Responsive Mobile Navigation

The dashboard content and available navigation items must remain role-aware.

---

## 12. Items Requiring Separate Specification

The following items require detailed specifications before implementation:

1. Exact dashboard metrics and calculation formulas.
2. Exact field-level profile editing permissions.
3. Jemaah and Takaza administration workflows.
4. Detailed Tafakut management workflow.
5. Progress Overview aggregation and data visibility rules.
6. Juhud Reports CMS database schema and attachment handling.
7. Report visibility and audience targeting rules.
8. Notification delivery and preference management.
9. Detailed SUPER_ADMIN system configuration permissions.

Until these are defined, implementation must not assume broader permissions.

---

## 13. Relationship to UAC Matrix

This document must be read together with:

`UAC_MATRIX.md`

If a navigation or dashboard requirement appears to conflict with UAC, the backend authorization rules and approved UAC decisions take precedence.

Dashboard navigation is a presentation of permissions, not the source of permissions.

---

## 14. Baseline Summary

JuhudManager V2 provides four dashboard experiences:

| Dashboard | Primary Focus |
|---|---|
| LIMITED | Registration and personal account |
| AHBAB | Personal Juhud workspace and shared progress |
| ADMIN | Operational administration and publishing |
| SUPER_ADMIN | System governance and security |

Two distinct progress and reporting modules are provided:

- **Progress Overview** — system-generated progress information.
- **Juhud Reports** — curated reports published for selected audiences.

ADMIN may publish Juhud Reports directly without SUPER_ADMIN approval.

All dashboard and navigation functions must follow the UAC Matrix and resource-level authorization rules.

**End of Document.**


# JuhudManager
## Project, Task, Activity & Participant Management Workflow

**Document:** Workflow Requirements – Draft v1
**Status:** Draft – Requirements Gathering
**Development Branch:** `develop`
**Last Updated:** 13 November 2026

---

## 1. Purpose

This document defines the proposed business workflow and functional requirements for the JuhudManager Project, Task, Activity, Group and Participant Management modules.

The objective is to establish a flexible management system that supports:

- Project and Sub Project management.
- Task and Activity publication.
- Individual and Employer participation.
- Participant selection and allocation.
- Group creation and management.
- Supervisor and Group Leader responsibilities.
- Background assessment and eligibility checking.
- Participant transfers and concurrent assignments.
- Communication, notifications and audit history.

**Important:** This is a working requirements document. The workflow and policies may be revised as business requirements become clearer during development and testing.

## 2. Core Concepts

The system should distinguish between the following entities:

| Entity | Description |
|---|---|
| Project | Main business project or programme. |
| Sub Project | Secondary or additional project assignment, including temporary participation alongside a Main Project. |
| Task | A defined piece of work issued by Admin. |
| Activity | An operational activity or work step under a Task or Project. |
| Participant | An individual taking part in a Project or Task. |
| Employer | An organisation that can manage participation on behalf of its employees. |
| Group | A collection of Participants assigned to a Task or Project. |
| Supervisor | A person responsible for monitoring one or more Groups. |
| Group Leader | A Participant or appointed person responsible for coordinating Group activities. |
| Assessment | Evaluation of Participant background and eligibility against defined criteria. |

## 3. User and Employer Participation

JuhudManager shall support two participation methods.

### 3.1 Individual User

An Individual User can:

- Log in using their own account.
- Browse available Tasks.
- Review Task descriptions and requirements.
- Commit to a Task voluntarily.
- View their commitment status.
- View their Group and Project assignments.
- Receive notifications and updates.

### 3.2 Employer Account

An Employer can:

- Log in using an Employer account.
- Maintain employee information.
- Select employees for available Tasks.
- Submit commitments on behalf of employees.
- Monitor employee participation and assignment status.
- Request withdrawal on behalf of an employee.

### 3.3 Participant Records

Every participating individual must have an individual Participant record.

An employee may have a Participant record even if they do not have an individual login account.

The system must distinguish between:

- Individual User participation.
- Employer-managed employee participation.

This allows Admin and Supervisor to assess and monitor each Participant individually.

## 4. Task Management Workflow

### 4.1 Task Creation

Admin creates a Task and defines its requirements, including:

- Task title and description.
- Related Project or Sub Project.
- Eligibility requirements.
- Background assessment criteria.
- Required qualifications and experience.
- Additional requirements.
- Commitment opening and closing dates.
- Relevant deadlines and schedules.
- Supporting documents, where applicable.

### 4.2 Task Publication

Admin publishes the Task.

Once published, eligible Individual Users and Employers can view the Task and submit their commitments.

### 4.3 Commitment

Participants can be submitted through either:

1. Individual User self-commitment.
2. Employer commitment on behalf of employees.

The system records each commitment and its source.

### 4.4 Participant Screening

The system checks Participant information against the criteria defined for the Task.

Admin can review the results before selecting Participants.

### 4.5 Participant Selection

Admin reviews the committed Participants and decides who will be selected.

Participants who have not been selected may remain in a pending or waiting status.

### 4.6 Group Formation

Admin can create one or more Groups for a Task.

There is no predefined maximum number of Participants per Group.

Admin can select Participants and assign them to the relevant Groups.

## 5. Commitment Withdrawal Policy

**Agreed policy: Admin approval is required.**

Individual Users and Employers may request withdrawal from a commitment.

The proposed process is:

1. User or Employer submits a withdrawal request.
2. Commitment status changes to `Withdrawal Requested`.
3. Admin reviews the request.
4. Admin approves or rejects the request.
5. The system records the decision.

Possible statuses:

- Active
- Withdrawal Requested
- Withdrawal Approved
- Withdrawal Rejected

Employers may request withdrawal on behalf of their employees.

All withdrawal requests and decisions must remain in the historical record.

## 6. Group Management

### 6.1 Official Group Creation

Admin or Supervisor may create Groups.

They can:

- Define the Group name.
- Select the related Task or Project.
- Select Participants.
- Assign one or more Supervisors.
- Appoint a Group Leader.

### 6.2 Proposed Group Creation

Individual Users and Employers may propose their own Groups.

A proposal may include:

- Proposed Group name.
- Related Task or Project.
- Proposed Participants.
- Proposed Group Leader.
- Additional information or justification.

The proposal must be reviewed by Admin.

Admin may:

- Approve the proposal.
- Reject the proposal.
- Request modification.
- Modify the proposed membership.
- Change the proposed Group Leader.

A proposed Participant cannot be added without their consent or an appropriate commitment to the relevant Task.

A proposed Group only becomes an official Group after approval.

### 6.3 Group Supervisor

A Group may have one or more Supervisors.

A Supervisor may also be responsible for multiple Groups.

Supervisors can monitor Participant backgrounds, eligibility, progress and other relevant information within their assigned Groups.

### 6.4 Group Leader

A Group Leader may:

- View Group Members.
- Send Group announcements.
- Submit attendance information.
- Update Group progress.
- Report problems or issues.
- Propose new Participants.
- Propose Participant transfers.

Official membership changes require Admin approval.

### 6.5 Group Membership Changes

Admin is authorised to:

- Transfer Participants between Groups.
- Remove Participants from Groups.
- Change Group Leaders.
- Modify Group membership.

Every change must include a reason and be recorded in the Audit Trail.

Removing a Participant from a Group must not delete their historical participation record.

## 7. Participant Background Assessment

The system shall support criteria-based background assessment.

### 7.1 Assessment Criteria

Admin defines the criteria relevant to each Task or Project.

Examples include:

- Education and qualifications.
- Relevant work experience.
- Employment status.
- Skills and certifications.
- Previous participation records.
- Outstanding assignments.
- Other project-specific requirements.

### 7.2 Automated Assessment

The system checks available Participant information against the configured criteria.

Possible assessment results:

- Meets Criteria.
- Does Not Meet Criteria.
- Needs Verification.
- Information Missing.
- Not Applicable.

### 7.3 Automatic Comments

The system generates comments based on its findings.

Example:

> Participant meets the experience and employment requirements. Qualification requires verification. An outstanding previous assignment was detected.

### 7.4 Human Review

Admin or Supervisor reviews the assessment results.

Automated assessment is intended to assist decision-making. It does not replace the final decision of authorised personnel.

Assessment results and subsequent decisions must be retained for reference.

## 8. Project and Participant Allocation

A Participant may be allocated to a Main Project and, where necessary, another Sub Project during the same period.

### 8.1 Main Project

The Main Project represents the Participant's primary assignment.

Example:

- Project A
- Duration: Four months.
- Participant: 001.

### 8.2 Sub Project

A Sub Project represents an additional or secondary assignment.

Example:

- Main Project: Project A.
- Sub Project: Project C19.
- Additional assignment duration: Ten days.

The Participant continues to belong to Project A while temporarily participating in Project C19.

After completing the Sub Project, the Participant returns to the Main Project if it remains active.

Sub Project assignments must have their own:

- Start date.
- End date.
- Assignment reason.
- Approval record.
- Relevant Supervisor information.
- Assignment status.

### 8.3 Concurrent Assignment Policy

The system may allow a Participant to have one Main Project and multiple Sub Project assignments.

Admin approval is required.

Both the Main Project Supervisor and Sub Project Supervisor must be notified.

Potential scheduling conflicts and overlapping commitments must be visible to Admin.

### 8.4 Participant Transfer Between Projects

Participants may be transferred from one Project to another.

Example:

- Project B5 is placed On Hold.
- Its Participants are transferred to Project D11.
- Project D11 conducts its own assessment based on its requirements.
- The original Project B5 participation history remains available.

The system must record:

- Original Project.
- Destination Project.
- Transfer date.
- Transfer reason.
- Approving Admin.
- Relevant assignment status.

Project B5 may be placed On Hold if its Participants have been transferred and the Project cannot continue.

Participant history must never be deleted simply because of a transfer.

## 9. Communication and Notifications

The system should support communication at different levels.

### 9.1 Task Announcement

Admin communicates Task information to relevant Users and Employers.

### 9.2 Group Announcement

Admin, Supervisor and Group Leader may communicate with Group Members according to their permissions.

### 9.3 Individual Notification

Notifications may relate to:

- Commitment status.
- Withdrawal requests.
- Participant selection.
- Group assignments.
- Assessment results.
- Project transfers.
- Activity updates.
- Required actions.

### 9.4 Activity Updates

Participants and authorised personnel may submit updates and progress information.

Communication history should remain available for future reference.

## 10. Activity Management

Activities represent operational work and progress under a Task or Project.

The proposed Activity functionality includes:

- Activity creation and publication.
- Activity assignment.
- Attendance recording.
- Progress updates.
- Submission of supporting documents.
- Issue and problem reporting.
- Supervisor review.
- Admin assessment.
- Completion verification.

The detailed Activity workflow and approval requirements will be refined separately.

## 11. Task Lifecycle and Status Management

The following statuses are proposed for the Task lifecycle:

| Status | Description |
|---|---|
| Draft | Task is being prepared. |
| Published | Task has been published. |
| Commitment Open | Users and Employers may submit commitments. |
| Selection | Admin reviews and selects Participants. |
| Group Formation | Participants are organised into Groups. |
| In Progress | Task execution has started. |
| On Hold | Task is temporarily suspended. |
| Completed | Task work has been completed. |
| Closed | All administrative processes are finalised. |
| Cancelled | Task has been cancelled. |

Additional statuses may be introduced where necessary.

Admin must be able to place a Task or Project On Hold and resume it later without losing its historical information.

## 12. Audit Trail and Historical Records

The system must maintain an audit history for important operations.

Examples include:

- Task creation and modification.
- Task publication.
- Participant commitment.
- Withdrawal requests and decisions.
- Participant selection.
- Group creation.
- Group membership changes.
- Group Leader changes.
- Supervisor assignments.
- Participant transfers.
- Project status changes.
- Assessment decisions.
- Activity updates.

Where applicable, records should include:

- Previous value.
- New value.
- Action performed.
- User who performed the action.
- Date and time.
- Reason or remarks.

Historical participation records must be retained even when Participants are withdrawn, transferred or removed from Groups.

## 13. Roles and Responsibilities

| Role | Main Responsibilities |
|---|---|
| Super Admin | Overall system administration and configuration. |
| Admin | Task publication, Participant selection, Group management, approvals and Project administration. |
| Supervisor | Participant monitoring, assessment review and Group supervision. |
| Group Leader | Group coordination, announcements, attendance and progress updates. |
| Individual User | Self-commitment and participation. |
| Employer | Employee management and commitment submission on behalf of employees. |
| Participant | Individual participation in Projects, Tasks and Activities. |

Actual permissions will be defined in a separate Role-Based Access Control specification.

## 14. Important Business Rules

The following rules have been agreed as the current working requirements:

1. Individual Users can commit to Tasks themselves.
2. Employers can submit commitments on behalf of employees.
3. Every Participant has an individual record.
4. A Task may have multiple Groups.
5. Groups have no predefined maximum number of Participants.
6. Commitment withdrawal requires Admin approval.
7. Admin can transfer or remove Participants from Groups.
8. Group membership changes must be recorded.
9. Users and Employers may propose Groups and Participants.
10. Admin approval is required before a proposed Group becomes official.
11. Users and Employers may propose a Group Leader.
12. Admin retains final authority over Group Leader appointments.
13. Groups may have multiple Supervisors.
14. Supervisors may supervise multiple Groups.
15. Group Leaders can manage day-to-day Group coordination.
16. Official membership changes require Admin approval.
17. Automated background assessment assists human decision-making.
18. Participants may have a Main Project and additional Sub Project assignments.
19. Admin approves additional Project assignments.
20. Both relevant Supervisors must be notified.
21. Project transfers must preserve historical records.
22. Important operations must be recorded in the Audit Trail.

## 15. Outstanding Requirements for Further Discussion

The following areas still require further discussion before final database and application design:

- Detailed Project creation and approval workflow.
- Project ownership and hierarchy.
- Task and Activity relationships.
- Participant eligibility and assessment rule configuration.
- Assessment scoring and weighting, if required.
- Commitment closing and late applications.
- Waiting list and replacement Participants.
- Group merging and splitting.
- Group Leader replacement.
- Supervisor reassignment.
- Participant availability and scheduling conflicts.
- Sub Project approval and completion workflow.
- Attendance and absence management.
- Activity submission and verification.
- Task and Project completion approval.
- Employer employee verification.
- Communication channels and notification preferences.
- Reports, dashboards and performance indicators.
- Detailed permissions for each role.

## 16. Development Approach

The development process should follow these stages:

### Phase 1 – Workflow Finalisation

Review and confirm the business processes, policies and exceptional scenarios.

### Phase 2 – System Architecture

Define modules, entities, relationships and permissions.

### Phase 3 – Database Design

Prepare the database schema based on the approved workflow.

### Phase 4 – Backend Development

Implement API endpoints, business rules, validations and approval workflows.

### Phase 5 – Frontend Development

Develop the Project, Task, Activity, Participant, Group and Assessment interfaces.

### Phase 6 – Testing

Test normal workflows, exceptional scenarios, permissions, historical records and audit logging.

### Phase 7 – Staging Preparation

Prepare separate staging resources and validate the complete system before production deployment.

---

## 17. Document Governance

This document is a working requirements specification, not a final technical specification.

Changes to business processes may be made as requirements evolve.

The approved workflow should be reflected in the database design, backend implementation, frontend interfaces and test cases.

**Current status:** Requirements gathering and workflow refinement.

**No database schema changes or new module implementation should begin until the relevant workflow requirements have been reviewed and sufficiently agreed.**


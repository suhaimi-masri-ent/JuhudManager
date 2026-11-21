
# JuhudManager V2 — User Access Control Matrix (UAC)

**Document:** User Access Control Matrix (UAC) V2  
**Status:** Baseline approved for V2 design  
**Scope:** Authentication, access levels, role permissions, and resource-level authorization  
**Applies to:** JuhudManager V2  
**Last updated:** 21 November 2026

---

## 1. Purpose

This document defines the baseline User Access Control (UAC) model for JuhudManager V2.

The model separates authorization into three independent dimensions:

1. **Access Level** — determines what an account may access based on its registration and account status.
2. **Role** — determines which functional responsibilities are assigned to the user.
3. **Resource Permission** — determines which specific Jemaah, Takaza, and records the user may access or modify.

A user must pass all applicable authorization checks before an API performs an action.

## 2. Core Authorization Principles

- A valid authenticated session is required for all non-public functions.
- Access Level is derived from trusted account and registration data in the database.
- Role assignments are read from `user_roles` joined to `roles`; client-supplied role values must never be trusted.
- Resource access is checked against actual relationships and ownership in the database.
- Having a role does not automatically grant access to every resource.
- Administrative authority does not automatically make an administrator an Ahbab, participant, or Amer in a Jemaah or Takaza.
- A user's own record ownership and authorship restrictions must be enforced by the API.
- The frontend may hide unavailable functions for usability, but backend authorization is authoritative.

## 3. Access Levels

| Access Level | Account / Registration Condition | Baseline Access |
|---|---|---|
| `PUBLIC` | No authenticated session | Public registration and authentication endpoints only |
| `LIMITED` | Email verified; registration is `PENDING_REVIEW`; account is `DISABLED` | Own profile, registration status, password and session functions |
| `FULL` | Registration is `APPROVED`; account is `ACTIVE` | Functions permitted by assigned role and resource relationships |

### 3.1 LIMITED Access

A user with LIMITED access may:

- View their own profile.
- Update permitted fields in their own profile.
- View their own registration status.
- Change their password.
- View and manage their own active sessions, where supported.

A LIMITED user may not:

- Access Jemaah operational functions.
- Access Takaza operational functions.
- Create or update Rekod Amal.
- Access administrative functions.
- Access another user's private information or records.

### 3.2 FULL Access

FULL is an account access level, not a role.

A FULL user must still have the relevant role and resource permission for each operation. For example, FULL access alone does not grant AHBAB, ADMIN, or SUPER_ADMIN capabilities.

## 4. Roles

The baseline roles are:

- `AHBAB`
- `ADMIN`
- `SUPER_ADMIN`

Roles are additive database assignments. The authorization layer must not infer a role from a user's name, registration status, UI selection, or request payload.

### 4.1 Role and Access Matrix

Legend:

- **Allow** — baseline permission.
- **Conditional** — only when the relevant resource relationship, assignment, or administrative scope is satisfied.
- **Administer** — administrative management capability; it does not imply participant or author privileges.
- **—** — not permitted.

| Function | PUBLIC | LIMITED | AHBAB | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| Start registration | Allow | — | — | — | — |
| Request / verify registration email OTP | Allow | — | — | — | — |
| Login | Allow | Allow | Allow | Allow | Allow |
| View own registration status | — | Allow | Allow | Allow | Allow |
| View own profile | — | Allow | Allow | Allow | Allow |
| Update own profile | — | Allow | Allow | Allow | Allow |
| Change own password | — | Allow | Allow | Allow | Allow |
| Manage own sessions | — | Allow | Allow | Allow | Allow |
| Access Jemaah functions | — | — | Conditional | Administer | Administer |
| Access Takaza functions | — | — | Conditional | Administer | Administer |
| Update Rekod Amal | — | — | Conditional | — | — |
| View relevant Tafakut criteria | — | — | Conditional | Conditional | Conditional |
| Manage Tafakut | — | — | — | Administer | Administer |
| Create Takaza progress report | — | — | Amer only | — | — |
| View Takaza progress reports | — | — | Conditional | Conditional | Conditional |
| Comment on Takaza | — | — | Conditional | Conditional | Conditional |
| Review registrations | — | — | — | Administer | Administer |
| Manage users | — | — | — | Conditional | Administer |
| Manage role assignments | — | — | — | Conditional | Administer |
| Manage system configuration | — | — | — | Conditional | Administer |
| Access audit logs | — | — | — | Conditional | Administer |

**Important:** The table describes baseline capability categories. Conditional access must be implemented using explicit resource relationships and administrative scope. It must not be interpreted as unrestricted access to all records.

## 5. Resource-Level Permissions

Role and Access Level checks are not sufficient on their own for Jemaah and Takaza data.

### 5.1 AHBAB

An AHBAB may:

- Access Jemaah records in which they are a participant.
- Access Takaza records in which they are a participant.
- Update their own Rekod Amal, subject to the applicable business rules.
- Comment on Takaza in which they participate.
- View reports for Takaza in which they participate.

An AHBAB must not access another Jemaah's or Takaza's private records merely because their account has FULL access.

### 5.2 Amer Jemaah

An Amer Jemaah retains their participant/member status. Appointment as Amer adds leadership responsibilities; it does not remove or replace participant rights.

In addition to participant permissions, the appointed Amer may:

- Create Takaza progress reports.
- Edit only progress reports authored by themselves.
- Comment on the Takaza, subject to participant and system rules.

The Amer may not edit another author's progress report.

### 5.3 ADMIN

An ADMIN may, within the applicable administrative scope:

- Manage Tafakut.
- Review registrations.
- View Takaza progress reports.
- Comment on Takaza.
- Perform permitted administrative management tasks.

An ADMIN:

- Must not create a Takaza progress report on behalf of an Amer.
- Must not edit another user's progress report.
- Must not edit another user's comment.
- Does not become a Takaza participant or Amer by virtue of the ADMIN role.

### 5.4 SUPER_ADMIN

A SUPER_ADMIN has the highest system-administration authority, subject to audit and security controls.

A SUPER_ADMIN:

- May perform authorized system-level administration.
- Does not automatically become an AHBAB, Takaza participant, or Amer.
- Must not impersonate an author's ownership of a report or comment.
- Must not bypass business-level authorship rules through ordinary application endpoints.

Any exceptional break-glass capability, if introduced in the future, must be separately specified, permission-controlled, and audited.

## 6. Three-Layer Authorization Flow

Every protected API must apply the following checks in order.

### Layer 1 — Authentication

Verify that:

- The session exists and is valid.
- The session has not expired or been revoked.
- The session is obtained through the server-side session authentication function.

Never accept a client-supplied `user_id`, role, access level, or session object as proof of identity.

### Layer 2 — Access Level and Role

Verify that:

- The account and registration statuses permit the requested access level.
- The required role is assigned in the database.
- Administrative roles are checked using `user_roles` joined to `roles`.
- The caller has the required permission for the requested operation.

### Layer 3 — Resource Permission

Verify that:

- The user belongs to, or is otherwise authorized for, the target Jemaah or Takaza.
- The user has the required participant or leadership relationship.
- The user is the author when an edit is restricted to the original author.
- The requested record is within the administrator's permitted scope, where applicable.

Only after all applicable checks pass may the API allow the operation.

## 7. Registration and Account-State Relationship

The current registration lifecycle is:

1. Registration is submitted.
2. Email OTP is verified.
3. Registration status becomes `PENDING_REVIEW`.
4. The user sets an initial password.
5. The user may log in with LIMITED access while awaiting review.
6. ADMIN or SUPER_ADMIN approves or rejects the registration.
7. Approval changes the account to `ACTIVE` and grants FULL access according to assigned roles.
8. Rejection leaves the account `DISABLED` and blocks login/access.

The current account status values remain:

- `DISABLED`
- `ACTIVE`
- `SUSPENDED`

Do not introduce a `REJECTED` account status. Rejection is represented by `registration_status = 'REJECTED'`, while the account remains `DISABLED`.

## 8. API Implementation Requirements

- All protected routes must authenticate the session server-side.
- All access-level checks must use trusted session/account data.
- All role checks must query database role assignments.
- All resource checks must be performed server-side.
- The API must deny by default when a required permission or relationship cannot be established.
- Do not rely on frontend menu visibility as an authorization control.
- Sensitive administrative actions must create audit records.
- Registration review actions must follow the database transition rules and audit requirements already defined for V2.
- Error responses should not disclose private information about resources the caller is not authorized to access.

## 9. Decisions and Items Requiring Separate Specification

This document establishes the baseline matrix. The following details must be specified before the related features are implemented:

1. Whether every approved registration automatically receives the `AHBAB` role, or whether an administrator assigns that role through a controlled workflow.
2. The exact administrative scope for ADMIN user management, role assignment, and audit-log access.
3. The complete field-level rules for which profile attributes a LIMITED user may update.
4. The exact resource-level rules for each Jemaah and Takaza operation.
5. Any exceptional break-glass procedure for SUPER_ADMIN, if required.

Until these details are explicitly decided, implementation must not assume broader permissions.

## 10. Baseline Approval

This UAC matrix is the approved baseline for V2 design and API planning. It may be extended through explicit project decisions, but implementation must preserve the separation between:

- Access Level
- Role
- Resource Permission

**End of document.**

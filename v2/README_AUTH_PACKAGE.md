
# JUHUDMANAGER V2 — AUTHENTICATION PACKAGE NOTES

**Document ID:** JMV2-AUTH-PACKAGE  
**Version:** 1.1 — Consolidated Authentication Technical Notes  
**Status:** SUPPORTING TECHNICAL DOCUMENTATION  
**Scope:** V2 Authentication Package, Configuration and Verification  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/README_AUTH_PACKAGE.md`

---

## 1. Purpose

This document provides supporting technical notes for the JuhudManager V2 authentication package.

It records the authentication foundation, known implementation scope, security configuration, outstanding work and verification requirements.

This document is not the authoritative source for authentication policy.

The authoritative documents are:

- `v2/docs/AUTH.md` — Authentication and account-security requirements.
- `v2/docs/V2_IMPLEMENTATION_STATUS.md` — Actual implementation status and roadmap.
- `v2/docs/UAC_MATRIX.md` — Authorization requirements.

If this document conflicts with an authoritative specification or implementation-status record, the authoritative document takes precedence.

The existence of an authentication API, database table or configuration variable does not prove that the complete authentication workflow is implemented.

## 2. Implementation Overview

The V2 authentication foundation has been developed within:

- `v2/src/`
- `v2/migrations/`
- `v2/test/`
- `v2/wrangler.jsonc`

The implementation foundation includes authentication-related database structures and backend functionality.

The following capabilities have been reported as implemented at their respective scopes:

- Registration draft creation.
- Email OTP verification.
- Identity reservation.
- Initial password setup.
- Password login.
- Session creation and validation.
- Logout and logout-all.
- Session listing and revocation.
- Authentication event recording.
- Rate limiting.
- Password change.

These capabilities do not establish that every authentication workflow has passed full production integration and security testing.

Refer to `V2_IMPLEMENTATION_STATUS.md` for the current status of each capability.

## 3. Registration and Identity

### 3.1 Registration

The registration design includes:

1. Collection of the required registration information.
2. Creation of the registration record.
3. Identity reservation.
4. Email OTP verification.
5. Registration review where required.
6. Initial password establishment.
7. Account activation according to the approved workflow.

Registration status and account status must remain separate.

A pending registration must not automatically receive FULL operational access.

### 3.2 Identity Types

The identity model includes:

- NATIONAL_ID.
- PASSPORT.
- EMAIL.
- WHATSAPP.

Identity uniqueness and scope must follow the approved identity rules.

The system must distinguish:

- PENDING identity reservation.
- VERIFIED identity.
- UNVERIFIED identity claim.
- EXPIRED reservation.
- Revoked identity.

Identity verification must follow an authorized process.

No identity claim may be treated as verified merely because the value exists in the database.

### 3.3 Identity Reservation

The approved temporary email identity reservation period is 15 minutes.

Expired reservations must not remain valid claims.

Verified identities must remain protected by uniqueness and authorized revocation rules.

Identity reservation and identity verification are separate operations.

## 4. OTP Policy

The approved standard OTP policy is:

| Requirement | Policy |
|---|---|
| OTP length | 6 digits |
| Validity | 5 minutes |
| Maximum verification attempts | 5 |
| Resend cooldown | 60 seconds |
| Identity reservation | 15 minutes |

OTP handling must enforce:

- Purpose separation.
- Transaction or challenge binding.
- Expiry validation.
- Attempt limits.
- Resend restrictions.
- Single-use verification.
- Protection against replay.
- Rate limiting.
- Secure OTP storage or verification handling.

An OTP issued for registration must not automatically be accepted for password reset, login or another security purpose.

### 4.1 Email OTP

Email OTP is the established registration verification channel.

The configured authenticated sender is:

`noreply@m.juhud.run.place`

Email delivery must be verified in the relevant production environment.

### 4.2 WhatsApp OTP

WhatsApp OTP verification must not be represented as operational merely because WhatsApp-related configuration or an adapter exists.

Implementation and end-to-end delivery verification remain separate requirements.

## 5. Password Policy

The approved password requirements include:

| Requirement | Policy |
|---|---|
| Minimum length | 12 characters |
| Maximum UTF-8 length | 1024 bytes |
| Password hashing | Argon2id |

Password handling must ensure:

- Secure password hashing.
- No plaintext password storage.
- Appropriate credential verification.
- Protection against unauthorized credential changes.
- Audit recording for relevant security events.

Password setup, password change and Password Reset are distinct operations.

## 6. Login and Session Management

### 6.1 Login

Login must require:

- A valid authentication identity.
- A verified identity where required.
- An ACTIVE account.
- A valid password credential.
- A valid authentication state.

A DISABLED or SUSPENDED account must not obtain normal operational access.

Authentication failures should use appropriate generic responses to reduce account enumeration.

### 6.2 Session Policy

The approved session policy is:

| Requirement | Policy |
|---|---|
| Idle timeout | 30 minutes |
| Maximum session lifetime | 12 hours |
| Session revocation | Required |
| Logout | Revoke current session |
| Logout-all | Revoke all active sessions |

The backend must validate session state and account status during protected operations.

Session validity must not override account suspension, disablement or authorization restrictions.

### 6.3 Session Revocation

Relevant security operations must revoke affected sessions and tokens.

These include:

- Account disablement.
- Account suspension.
- Logout.
- Logout-all.
- Password Reset after successful implementation.
- Other approved security recovery actions.

The exact revocation scope must follow the applicable authentication requirements.

## 7. Password Change and Password Reset

### 7.1 Password Change

Authenticated password change is separate from Password Reset.

It must require an authenticated and authorized user.

The applicable session revocation behaviour must follow `AUTH.md`.

### 7.2 Password Reset

**Status: NOT IMPLEMENTED — REQUIRED**

Password Reset is a required V2 feature.

The required workflow must:

1. Use the registered and verified email address.
2. Issue a purpose-bound OTP.
3. Apply the standard OTP policy.
4. Validate the OTP before accepting a new password.
5. Enforce the minimum password length.
6. Revoke all existing sessions and related tokens after successful reset.
7. Record an audit event.
8. Send a security notification.

Password Reset must not reactivate a DISABLED or SUSPENDED account.

Password Reset must not be represented as available until implementation and verification are complete.

### 7.3 Admin-Assisted Account Recovery

Admin-Assisted Account Recovery is a separate process for users who no longer have access to their verified email.

It must not be treated as ordinary Password Reset.

The workflow requires approved identity verification, administrative authority, audit records and appropriate safeguards.

Do not invent recovery permissions or bypass identity verification.

## 8. Bootstrap SUPER_ADMIN

**Status: NEEDS VERIFICATION — BLOCKING FOR INITIAL ADMIN SETUP**

The initial Super Admin bootstrap process previously encountered eligibility and owner-verification errors.

The bootstrap process must be resolved and verified before:

- Treating initial administration as ready.
- Creating Country ADMIN accounts.
- Performing subsequent administrative tests.

Required verification includes:

1. Designated bootstrap owner identity.
2. Owner email identity.
3. Email verification eligibility.
4. Password credential establishment.
5. SUPER_ADMIN role assignment.
6. Account status.
7. Bootstrap status.
8. Successful login.
9. Global authorization.
10. Relevant audit records.

Do not create duplicate bootstrap owners or bypass owner verification and authorization controls.

The previously reported database state is historical evidence and must be checked against the current remote database before any corrective action.

## 9. Authorization Relationship

Authentication establishes the identity and session of the user.

Authorization determines what the authenticated user may access or perform.

These are separate responsibilities.

Authorization must consider:

- Account status.
- Registration status where relevant.
- Access level.
- Core role.
- Functional appointment.
- Delegation.
- Administrative scope.
- Relationship to the requested resource.
- Resource-level permission.

The approved core roles are:

- `SUPER_ADMIN`
- `ADMIN`
- `AHBAB`

Functional appointments must not automatically grant unrelated permissions.

Frontend navigation must not replace backend authorization.

Refer to `UAC_MATRIX.md` for the authorization baseline.

## 10. Runtime Configuration

### 10.1 Worker Configuration

V2 Worker configuration is maintained in:

`v2/wrangler.jsonc`

The configured Worker is:

`juhudmanager-v2-api`

The D1 binding is:

`DB`

The dedicated database is:

`juhudmanager-v2-db`

### 10.2 Email Configuration

The authenticated sender is:

`noreply@m.juhud.run.place`

The email provider configuration must follow the current V2 Worker configuration and deployment environment.

Provider secrets must never be committed to GitHub.

### 10.3 Secrets and Sensitive Configuration

Authentication-related secrets must be maintained through the appropriate Cloudflare secret-management mechanism.

Examples of sensitive configuration include:

- HMAC secrets.
- OTP hashing secrets.
- Encryption keys.
- Email provider API keys.
- WhatsApp provider credentials.

Never include actual secret values in:

- Source files.
- Documentation.
- GitHub commits.
- Test output.
- Public logs.
- Screenshots shared for debugging.

The exact variable names and required configuration must be checked against the current Worker implementation before deployment.

## 11. Database and Migration

Authentication-related database structures are maintained through V2 migrations.

Migration directory:

`v2/migrations/`

Database:

`juhudmanager-v2-db`

Binding:

`DB`

Migration safety requirements:

1. Confirm the target database.
2. Inspect migration history.
3. Verify whether the migration has already been applied.
4. Never modify an already-applied migration as a substitute for a new migration.
5. Use a new migration for approved schema changes.
6. Preserve existing data and audit history.
7. Verify remote database state separately from repository files.
8. Never apply V2 migrations to the V1 database.

A successful migration does not prove that the associated authentication workflow is complete.

## 12. Testing Requirements

Automated tests are maintained under:

`v2/test/`

Previous reported test results include:

- `npm test`: 94/94 tests passed.
- GitHub Actions build and test: success.

These results are historical reported evidence, not a fresh test run performed by this document.

Authentication testing must cover:

1. Registration start.
2. Email OTP request.
3. OTP verification.
4. OTP expiry.
5. OTP attempt limits.
6. Resend cooldown.
7. Identity reservation expiry.
8. Identity uniqueness.
9. Password setup.
10. Login success and failure.
11. Session creation.
12. Session expiry.
13. Session revocation.
14. Logout and logout-all.
15. Account disablement.
16. Account suspension.
17. Authorization after account-state changes.
18. Password change.
19. Password Reset after implementation.
20. Bootstrap SUPER_ADMIN.
21. Audit event creation.
22. Rate limiting.
23. Production email delivery.
24. Relevant frontend and backend integration.

A passing unit-test suite does not establish that all production authentication workflows are operational.

## 13. Deployment and Verification

The V2 Worker is maintained separately from V1.

Deployment configuration:

`v2/wrangler.jsonc`

Dedicated Worker:

`juhudmanager-v2-api`

Worker deployment and D1 migration are separate operations.

A successful Worker deployment does not automatically apply database migrations.

Before production deployment:

- Review the complete change set.
- Confirm the target branch.
- Confirm the Worker configuration.
- Confirm the D1 database binding.
- Confirm required environment variables and secrets.
- Review migration requirements.
- Obtain explicit deployment approval.

After deployment, verify:

- Worker health.
- Database connectivity.
- Authentication endpoints.
- Email delivery where applicable.
- Session behaviour.
- Account-state enforcement.
- Authorization behaviour.
- Relevant audit events.

Do not treat historical health results as fresh verification.

## 14. Outstanding Work

The following items remain subject to implementation or verification:

| Item | Status |
|---|---|
| Registration workflow | PARTIALLY IMPLEMENTED |
| Email OTP production verification | NEEDS VERIFICATION |
| Login and session security | PARTIALLY IMPLEMENTED |
| Email change | NEEDS VERIFICATION |
| Password Reset | NOT IMPLEMENTED — REQUIRED |
| Admin-Assisted Account Recovery | PENDING IMPLEMENTATION / POLICY DETAIL |
| WhatsApp OTP | NOT IMPLEMENTED / NEEDS VERIFICATION |
| Bootstrap SUPER_ADMIN | NEEDS VERIFICATION — BLOCKING |
| Full authorization enforcement | NEEDS VERIFICATION |
| Full authentication integration testing | NEEDS VERIFICATION |
| Production security review | NEEDS VERIFICATION |

The authoritative and current status must be maintained in:

`v2/docs/V2_IMPLEMENTATION_STATUS.md`

## 15. Related Documents

This document must remain consistent with:

- `v2/docs/AUTH.md`
- `v2/docs/UAC_MATRIX.md`
- `v2/docs/MASTER_DECISION_REGISTER.md`
- `v2/docs/OPEN_DECISIONS_REGISTER.md`
- `v2/docs/MODULE_REQUIREMENTS.md`
- `v2/docs/V2_IMPLEMENTATION_STATUS.md`
- `v2/docs/V2_DESIGN_CHECKPOINT.md`
- `v2/README.md`

`AUTH.md` defines authentication and account-security requirements.

`UAC_MATRIX.md` defines authorization requirements.

`V2_IMPLEMENTATION_STATUS.md` records actual implementation progress and verification evidence.

This README is supporting technical documentation only.

---

**Document Status:** SUPPORTING TECHNICAL DOCUMENTATION  
**Version:** 1.1  
**Last Updated:** 28 November 2026  
**Next Review:** After bootstrap resolution, Password Reset implementation and authentication integration verification.

**End of Document.**

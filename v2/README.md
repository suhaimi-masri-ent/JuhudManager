
# JuhudManager V2

JuhudManager V2 is the next-generation implementation of JuhudManager. It is developed independently from the legacy V1 application to provide a controlled architecture for authentication, database operations and business modules.

All V2 application files are maintained inside the `v2/` directory.

## 1. Project Principles

- V2 must remain isolated from the existing V1 application.
- V2 uses its own Cloudflare Worker and dedicated D1 database.
- Existing V1 files, deployment configuration, database and workflows must not be modified.
- Business rules must follow approved JuhudManager requirements and decisions.
- Unresolved business rules must remain explicitly unresolved until confirmed.
- Security, auditability, data integrity and access control must be considered throughout implementation.

## 2. Current Directory Structure

```text
v2/
├── README.md
├── README_AUTH_PACKAGE.md
├── migrations/
│   ├── 0001_foundation.sql
│   ├── 0002_authentication.sql
│   ├── 0003_account_activation.sql
│   └── 0004_auth_rate_limits.sql
├── src/
│   ├── index.js
│   ├── auth/
│   ├── domain/
│   ├── lib/
│   └── routes/
├── test/
├── package.json
└── wrangler.jsonc
```

The directory structure may expand as additional modules are implemented. All new V2 application files must remain inside `v2/`.

## 3. Implementation Status

### 3.1 Foundation

- [x] Independent V2 Worker configuration.
- [x] Dedicated V2 D1 database configuration.
- [x] Foundation database migration.
- [x] Authentication database migration.
- [x] Account activation migration.
- [x] Authentication rate-limit migration.
- [x] Initial domain implementation for Amer Jemaah appointment rules.
- [x] Initial automated domain tests.

### 3.2 Authentication

The current backend implementation includes:

- Registration draft creation.
- Disabled account creation pending verification.
- NATIONAL_ID, EMAIL and WHATSAPP identity reservations.
- Country-scoped NATIONAL_ID and PASSPORT identities.
- Temporary 15-minute PENDING reservations for email identities.
- Email registration OTP verification. WhatsApp is collected as an unverified identity claim; WhatsApp OTP verification is not implemented yet.
- Account activation token issuance and verification.
- Initial password setup using Argon2id.
- Password login using NATIONAL_ID or PASSPORT.
- Authenticated password change.
- Session creation, authentication and sliding expiry.
- Logout and logout-all.
- Session listing and individual session revocation.
- Authentication event recording.
- IP and identity-based rate limiting.
- Scheduled cleanup of expired rate-limit records.

Authentication remains under development and has not completed production integration testing.

Refer to `README_AUTH_PACKAGE.md` for authentication details, route definitions, security policies and outstanding blockers.

### 3.3 Business Modules

The following business requirements have been established and guide subsequent implementation:

- Jemaah and Jemaah membership.
- Takaza participation.
- Amer Jemaah appointment and replacement.
- Takaza progress reports and comments.
- Tafakut, including Common Tafakut and Specific Tafakut.
- Rekod Amal.

The initial Amer Jemaah appointment domain validation module exists. It is not yet connected to a complete business API workflow.

Business rules that have not been confirmed must not be implemented based on assumptions.

Case Management remains on hold as a separate module.

## 4. Database Environment

V2 uses a dedicated Cloudflare D1 database:

- Database name: `juhudmanager-v2-db`
- Binding: `DB`
- Migration directory: `v2/migrations/`

The following migrations have already been applied to the remote V2 database:

- `0001_foundation.sql`
- `0002_authentication.sql`
- `0003_account_activation.sql`
- `0004_auth_rate_limits.sql`

### Database rules

1. Never run V2 migrations against the V1 database.
2. Do not rerun migrations `0001` through `0004` against the existing remote V2 database.
3. Any future database changes require a new migration file.
4. SQL commands intended for Cloudflare D1 Console must be clearly identified.
5. Do not modify the database schema without an agreed requirement and migration plan.
6. Never expose database credentials or application secrets in source files.

## 5. Authentication Security Requirements

(DNS: Freedomain.one; OTP: Brevo)

The authentication implementation must follow these principles:

- One individual has one `user_id`, with multiple linked login identities permitted.
- Identity uniqueness is enforced by identity type and applicable scope.
- Email addresses and WhatsApp numbers must be normalized before identity lookup.
- National IDs and passports are scoped by issuing country.
- Sensitive identity values must be protected using keyed HMAC and encryption where appropriate.
- OTP values must never be returned in API responses.
- OTP verification must enforce expiry, attempt limits, resend cooldown and rate limits.
- Pending identities are reserved for 15 minutes.
- An unverified pending identity may be released after its reservation expires.
- Verified identities remain unique until revoked through an authorized process.
- National ID and passport verification must use an authorized verification process.
- Passwords must use Argon2id.
- Session tokens must be securely generated and stored as hashes.
- Sensitive account changes and administrative actions must be auditable.
- Authentication failures must not expose unnecessary account or identity information.

## 6. Amer Jemaah Appointment Rules

The Amer Jemaah appointment is associated with a specific Takaza, not a permanent Jemaah leadership position.

Approved rules:

- An Amer Jemaah must also be an active participant of the relevant Takaza.
- Appointment adds leadership responsibilities without removing participant status.
- The appointee must have confirmed eligibility.
- The initial appointment must be effective before the official Takaza start date.
- Only Admin can appoint or replace an Amer Jemaah.
- Replacing an existing Amer requires a reason.
- Previous appointment records must be retained.
- Former Amer access is controlled by Admin.
- Former Amer participant status is independent of their former leadership appointment.

## 7. Takaza Reports and Comments

Approved rules:

- Only the appointed Amer Jemaah creates Takaza progress reports.
- Multiple free-form reports are permitted throughout the Takaza lifecycle.
- Reports may still be created after a Takaza is marked `COMPLETED`.
- Admin does not create progress reports but may comment.
- Admin, Amer Jemaah and all Ahbab participating in the Takaza may comment.
- Only the report author may edit their report.
- Only the comment author may edit their comment.
- Report and comment history must be preserved.

## 8. Runtime Configuration

The V2 Worker configuration is maintained in:

`v2/wrangler.jsonc`

It defines:

- Worker entry point.
- Compatibility date.
- D1 database binding.
- Runtime variables.
- Scheduled cleanup trigger.

Production configuration must be established separately.

Secrets must be configured through Cloudflare Worker secrets and must never be committed to GitHub.

The email and WhatsApp delivery adapters are implemented, but production provider configuration and end-to-end delivery verification remain outstanding.

## 9. Testing

Automated tests are maintained under:

`v2/test/`

The repository includes tests for authentication, identity reservations, OTP flows, registration routes and Amer Jemaah appointment rules.

Static code review does not replace runtime testing.

Before production release, perform:

- Full automated test execution.
- D1 integration testing.
- Concurrent identity reservation testing.
- OTP resend and verification race-condition testing.
- Provider delivery failure testing.
- Session and authentication security testing.
- Full API security review.

## 10. Deployment Restrictions

- V2 is not part of the existing V1 deployment workflow.
- The V2 Worker has not yet been created or deployed.
- Deployment must use `v2/wrangler.jsonc`.
- Do not deploy V2 through the existing V1 Worker workflow.
- Do not modify root deployment configuration or V1 files.
- Do not rerun migrations `0001` through `0004`.
- Do not deploy without explicit approval.

Production readiness must be assessed separately from successful static review or local tests.

## 11. Development Workflow

1. Review existing implementation and approved requirements.
2. Identify the specific file or database change required.
3. Prepare complete replacement files rather than partial code fragments.
4. Review imports, dependencies, paths and compatibility.
5. Perform static/manual review and available tests.
6. Provide complete files for manual upload to GitHub.
7. Verify uploaded files against the actual GitHub branch.
8. Provide database SQL separately when required, clearly identifying commands intended for Cloudflare D1 Console.
9. Review test and database execution results before proceeding.

All changes must remain confined to `v2/` unless an explicit decision authorizes otherwise.

---

**Project rule:** Preserve existing approved decisions. Do not silently change established business rules, database assumptions, security requirements or project structure.

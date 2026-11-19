JuhudManager V2

JuhudManager V2 is the next-generation implementation of JuhudManager. It is developed independently from the legacy V1 application to allow the system architecture, database design, authentication, and business modules to be rebuilt in a controlled manner.

All V2 application files are maintained inside the "v2/" directory.

1. Project Principles

- V2 must remain isolated from the existing V1 application.
- V2 must use its own Cloudflare Worker and D1 database.
- Existing V1 files, deployment configuration, database, and workflows must not be modified.
- Business rules must follow the approved JuhudManager requirements and decisions.
- Unresolved business rules must remain explicitly unresolved until confirmed.
- Security, auditability, data integrity, and access control must be considered throughout implementation.

2. Current Directory Structure

v2/
├── README.md
├── README_AUTH_PACKAGE.md
├── migrations/
│   ├── 0001_foundation.sql
│   └── 0002_authentication.sql
├── src/
│   ├── index.js
│   ├── auth/
│   │   ├── crypto.js
│   │   └── otp.js
│   ├── domain/
│   │   └── amer-appointments.js
│   ├── lib/
│   │   └── http.js
│   └── routes/
│       └── auth.js
├── test/
│   ├── amer-appointments.test.js
│   └── auth-otp.test.js
└── wrangler.jsonc

The directory structure may expand as additional modules are implemented. New V2 files must remain inside "v2/".

3. Implementation Status

Foundation

- [x] Independent V2 Cloudflare Worker configuration.
- [x] Independent V2 D1 database configuration.
- [x] Foundation database migration.
- [x] Authentication database migration.
- [x] Initial domain implementation for Amer Jemaah appointment rules.
- [x] Initial automated domain tests.

Authentication

The first authentication implementation package provides:

- Registration OTP request and verification endpoints.
- Email and WhatsApp destination support.
- Six-digit OTP.
- Five-minute OTP validity.
- Maximum five verification attempts.
- Sixty-second resend cooldown.
- Per-destination request throttling.
- HMAC-based destination and OTP protection.
- AES-GCM encryption for stored destination values.
- Provider-neutral OTP delivery interface.

Authentication is still under development. The complete authentication specification includes additional work such as:

- Pending identity reservation and expiry.
- Account creation and identity linking.
- National ID and passport verification.
- Password authentication using Argon2id.
- Session management and device management.
- Password recovery and account recovery.
- Admin-assisted registration and recovery.
- Security events, audit records, and account lockout controls.

The current OTP implementation must not be considered a complete or production-ready authentication system.

Refer to "README_AUTH_PACKAGE.md" for the current authentication package details.

Business Modules

The following business requirements have been established and will guide subsequent implementation:

- Jemaah and Jemaah membership.
- Takaza participation.
- Amer Jemaah appointment and replacement.
- Takaza progress reports and comments.
- Tafakut, including Common Tafakut and Specific Tafakut.
- Rekod Amal.

Business rules that have not yet been confirmed must not be implemented based on assumptions.

Case Management remains on hold as a separate module.

4. Database Environment

V2 uses a dedicated Cloudflare D1 database:

- Database name: "juhudmanager-v2-db"
- Migration directory: "v2/migrations/"

The following migrations have already been applied to the dedicated V2 remote database:

- "0001_foundation.sql"
- "0002_authentication.sql"

Important database rules:

1. Never run V2 migrations against the V1 database.
2. Do not rerun migrations "0001" or "0002" against the existing V2 remote database.
3. Any future database changes must be delivered as new migration files.
4. SQL commands intended for the Cloudflare D1 Console must be clearly identified.
5. Do not modify the database schema without an agreed requirement and an explicit migration plan.
6. Never expose database credentials or application secrets in source files.

5. Authentication Security Requirements

The authentication implementation must follow these principles:

- One individual has one "user_id", with multiple login identities permitted.
- Identity uniqueness is enforced by identity type and applicable scope.
- Email addresses are normalized before identity lookup.
- WhatsApp numbers use E.164 normalization.
- National IDs and passports are scoped by issuing country.
- Sensitive identity values must be protected using keyed HMAC and encryption where appropriate.
- OTP values must never be returned in API responses.
- OTP verification must enforce expiry, attempt limits, resend cooldown, and rate limits.
- Pending identities are reserved for 15 minutes.
- An unverified pending identity may be released after its reservation expires.
- Verified identities remain unique until revoked through an authorized process.
- Passwords must use Argon2id when password authentication is implemented.
- Session tokens must be securely generated and stored as hashes.
- Sensitive account changes and administrative actions must be auditable.
- Authentication failures must not expose unnecessary account or identity information.

6. Amer Jemaah Appointment Rules

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

7. Takaza Reports and Comments

Approved rules:

- Only the appointed Amer Jemaah creates Takaza progress reports.
- Multiple free-form reports are permitted throughout the Takaza lifecycle.
- Reports may still be created after a Takaza is marked COMPLETED.
- Admin does not create progress reports but may comment.
- Admin, Amer Jemaah, and all Ahbab participating in the Takaza may comment.
- Only the report author may edit their report.
- Only the comment author may edit their comment.
- Report and comment history must be preserved.

8. Development and Testing

Run automated tests from the repository root:

node --test v2/test/*.test.js

Run the V2 Worker locally:

npx wrangler dev --config v2/wrangler.jsonc

These commands are for local development and testing.

Database changes must follow the approved migration process. Do not use remote migration commands unless explicitly instructed.

9. Required Runtime Configuration

The authentication package requires the following runtime secrets and service binding:

- "HMAC_SECRET"
- "OTP_HASH_SECRET"
- "ENCRYPTION_KEY"
- "OTP_DELIVERY"

These values must be configured securely in the appropriate Cloudflare environment.

Never commit secrets into GitHub or include them in source files, documentation, screenshots, or API responses.

The OTP delivery service must be implemented and tested before authentication endpoints can be considered operational.

10. Deployment Restrictions

- V2 is not part of the existing V1 deployment workflow.
- Do not deploy V2 automatically as part of development or file updates.
- Do not modify the root deployment configuration or V1 Worker.
- Deployment must only take place after explicit approval.
- Production readiness must be assessed separately from successful local tests.

11. Development Workflow

The V2 development workflow follows these steps:

1. Review the existing implementation and approved requirements.
2. Identify the specific file or database change required.
3. Prepare complete replacement files rather than partial code fragments.
4. Review imports, dependencies, paths, and compatibility with the existing V2 structure.
5. Run relevant automated tests.
6. Provide complete files for manual upload to the GitHub repository.
7. Provide database SQL separately when required, clearly identifying commands intended for the Cloudflare D1 Console.
8. Review test results and database execution results before proceeding.

All changes must remain confined to "v2/" unless an explicit decision authorizes otherwise.

---

Project rule: Preserve existing approved decisions. Do not silently change established business rules, database assumptions, security requirements, or project structure.

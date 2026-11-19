# JuhudManager V2

JuhudManager V2 is the next-generation implementation of JuhudManager. It is developed independently from the legacy V1 application to allow the system architecture, database design, authentication, and business modules to be rebuilt in a controlled manner.

All V2 application files are maintained inside the `v2/` directory.

## 1. Project Principles

- V2 must remain isolated from the existing V1 application.
- V2 must use its own Cloudflare Worker and D1 database.
- Existing V1 files, deployment configuration, database, and workflows must not be modified.
- Business rules must follow the approved JuhudManager requirements and decisions.
- Unresolved business rules must remain explicitly unresolved until confirmed.
- Security, auditability, data integrity, and access control must be considered throughout implementation.

## 2. Current Directory Structure

```text
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

# JuhudManager V2 Authentication

Target branch: `develop`
Target directory: `v2/`

## 1. Current implementation

The current V2 authentication package includes:

- Registration draft creation.
- Disabled account creation pending verification.
- Identity reservation for NATIONAL_ID, EMAIL and WHATSAPP.
- Country-scoped NATIONAL_ID identity uniqueness.
- Global EMAIL and WHATSAPP identity uniqueness.
- Temporary PENDING identity reservations lasting 15 minutes.
- Expired reservation cleanup and release.
- EMAIL and WHATSAPP OTP request and verification.
- Six-digit cryptographically generated OTP.
- Five-minute OTP validity.
- Maximum five verification attempts.
- Sixty-second resend cooldown.
- Per-destination request throttling.
- HMAC-SHA256 identity and OTP hashes.
- AES-GCM encryption for recoverable identity values.
- HTTP routes for registration and OTP operations.
- Unit tests for crypto, identity reservations, registration and HTTP routes.

## 2. Registration lifecycle

1. User submits full name, issuing country, National ID, email and WhatsApp.
2. System creates a DISABLED user account.
3. System reserves the three required identities as PENDING.
4. Each PENDING identity reservation expires after 15 minutes.
5. User requests email and WhatsApp OTP verification.
6. Successful OTP verification changes the corresponding identity to VERIFIED.
7. Verified email is written to `users.email`.
8. Account remains DISABLED until the remaining account activation and credential setup process is implemented.

A PENDING identity cannot be claimed by another account while its reservation is valid.

A VERIFIED identity remains unique until revoked through an authorized process.

## 3. Current HTTP endpoints

### POST /auth/register/start

Creates a disabled registration draft.

Required JSON fields:

- `fullName`
- `countryCode`
- `nationalId`
- `email`
- `whatsapp`

Returns HTTP 201 when successful.

### POST /auth/otp/request

Requests an OTP for a pending EMAIL or WHATSAPP identity.

Required JSON fields:

- `userId`
- `identityId`
- `destinationType`
- `destination`

Supported destination types:

- `EMAIL`
- `WHATSAPP`

Returns HTTP 202 when the OTP request is accepted.

### POST /auth/otp/verify

Verifies a registration OTP.

Required JSON fields:

- `userId`
- `identityId`
- `destinationType`
- `destination`
- `otp`

The OTP must contain exactly six digits.

## 4. Security configuration

Required Worker secrets:

- `HMAC_SECRET`: high-entropy secret for identity and destination HMAC.
- `OTP_HASH_SECRET`: high-entropy secret for OTP HMAC.
- `ENCRYPTION_KEY`: base64url-encoded 32-byte AES-256 key.

Never put secrets in source files, `wrangler.jsonc`, GitHub, screenshots or chat.

The implementation does not return OTP values in API responses.

## 5. OTP delivery integration blocker

The current implementation expects:

`env.OTP_DELIVERY.send({ destinationType, destination, purpose, otp, expiresInMinutes })`

This is an application-level adapter interface, not a standard Cloudflare Worker binding by itself.

A production adapter must be implemented using the selected email and WhatsApp delivery providers. The adapter must expose the expected interface to the authentication module.

Provider selection, credentials, delivery error handling and security review are still required.

Do not deploy the OTP endpoints as production-ready until this integration is complete.

## 6. Outstanding authentication work

The following specification areas are not yet implemented:

- Password creation and login.
- Argon2id password hashing and verification.
- Account activation after all required verification steps.
- Session creation, renewal, expiration and revocation.
- Logout and logout-all.
- Device/session management.
- Password change and password reset.
- Email and WhatsApp identity change workflows.
- National ID and Passport authorized verification workflows.
- Admin-assisted registration and account recovery.
- Identity revocation and replacement workflows.
- Authentication event coverage and security audit review.
- Route-level abuse protection, including registration abuse and IP-based rate limiting.

Argon2id must not be replaced with PBKDF2 or bcrypt without an explicit architecture decision. A maintained Argon2id implementation compatible with Cloudflare Workers must be selected and tested before password endpoints are added.

## 7. Testing

Test files currently include:

- `v2/test/auth-otp.test.js`
- `v2/test/auth-identity-reservations.test.js`
- `v2/test/auth-registration.test.js`
- `v2/test/auth-routes.test.js`

The tests cover crypto helpers, reservation rules, registration behavior and HTTP route validation.

Unit tests using mocked D1 do not replace integration testing against the dedicated V2 D1 database.

Before production release, perform:

- Full automated test execution.
- D1 integration tests.
- Concurrent identity reservation tests.
- OTP resend and verification race-condition tests.
- Email uniqueness and atomic verification tests.
- Provider delivery failure tests.
- Security and abuse-protection review.

## 8. Deployment boundary

This package is for V2 only.

- Do not modify V1 files or database.
- Do not rerun migrations `0001` or `0002`; they have already been applied.
- Do not deploy until outstanding production blockers are resolved.
- Use the dedicated JuhudManager V2 D1 database for all V2 testing.

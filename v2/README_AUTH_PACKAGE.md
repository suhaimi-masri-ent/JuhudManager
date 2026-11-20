
# JuhudManager V2 Authentication

Target branch: `develop`  
Target directory: `v2/`

## 1. Implementation Status

The V2 authentication backend currently includes:

- Registration draft creation.
- Disabled account creation pending verification.
- NATIONAL_ID, EMAIL and WHATSAPP identity reservations.
- Country-scoped NATIONAL_ID and PASSPORT identities.
- Globally unique EMAIL and WHATSAPP identities.
- Temporary PENDING identity reservations lasting 15 minutes.
- Expired reservation handling.
- Email and WhatsApp registration OTP verification.
- Account activation token issuance and verification.
- Initial password setup using Argon2id.
- Password login using NATIONAL_ID or PASSPORT.
- Authenticated password change.
- Session creation and authentication.
- Sliding 30-day session inactivity expiry.
- Logout and logout-all.
- Active session listing and individual session revocation.
- Authentication event recording.
- IP and identity-based rate limiting.
- Scheduled cleanup of expired rate-limit records.

This implementation has undergone static code review. It has not yet completed full production integration testing.

## 2. Registration Lifecycle

1. User submits full name, issuing country, National ID, email and WhatsApp.
2. System creates a DISABLED user account.
3. System reserves NATIONAL_ID, EMAIL and WHATSAPP identities as PENDING.
4. Each PENDING identity reservation expires after 15 minutes.
5. User requests email and WhatsApp OTP verification.
6. Successful OTP verification changes the corresponding identity to VERIFIED.
7. Verified email is written to `users.email`.
8. NATIONAL_ID/PASSPORT requires a separately authorized verification process.
9. Account activation is permitted only after all required identities are VERIFIED.
10. User receives an activation link and establishes an initial password.
11. Successful credential creation activates the account.

PENDING identities cannot be claimed by another account while their reservations remain valid.

VERIFIED identities remain unique until revoked through an authorized process.

## 3. OTP Policy

- OTP purpose implemented: REGISTER.
- OTP length: 6 digits.
- OTP validity: 5 minutes.
- Maximum verification attempts: 5.
- Resend cooldown: 60 seconds.
- Maximum requests: 5 per destination within 15 minutes.
- Registration OTP delivery supports EMAIL and WHATSAPP adapters.
- OTP values are never returned in API responses.

LOGIN OTP, password reset OTP and other OTP purposes are not implemented by the registration OTP module.

## 4. Password and Login

### Password policy

- Minimum length: 12 characters.
- Maximum UTF-8 length: 1024 bytes.
- Password hashing: Argon2id.
- Argon2id version: 19.
- Memory cost: 19456 KiB.
- Time cost: 3.
- Parallelism: 1.

### Login

Supported login identity types:

- NATIONAL_ID
- PASSPORT

Login requires:

- VERIFIED identity.
- ACTIVE account.
- Active password credential.

Login failures use generic responses to reduce account enumeration.

Login OTP is a separate future feature and must not reuse registration OTP.

## 5. Session Policy

- Session token: cryptographically generated random token.
- Raw token is returned once and retained by the client.
- D1 stores only the token hash.
- Inactivity expiry: 30 days.
- Valid activity extends session expiry.
- Logout revokes the current session.
- Logout-all revokes all active sessions.
- Individual sessions can be revoked by their owner.
- Password change revokes other active sessions while retaining the current session.

## 6. Current HTTP Routes

### Registration and activation

- `POST /auth/register/start`
- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `POST /auth/activation/request`
- `POST /auth/password/setup`

### Password login and account security

- `POST /auth/login`
- `POST /auth/password/change`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `GET /auth/sessions`
- `POST /auth/sessions/:sessionId/revoke`

### Service health

- `GET /health`

## 7. Database

Dedicated V2 D1 database:

- Database: `juhudmanager-v2-db`
- Binding: `DB`
- Migration directory: `v2/migrations/`

Migrations:

- `0001_foundation.sql`
- `0002_authentication.sql`
- `0003_account_activation.sql`
- `0004_auth_rate_limits.sql`

All four migrations have already been applied to the remote V2 database.

Do not rerun these migrations.

Any future schema changes require a new migration file.

## 8. Runtime Configuration

### Worker variables

- `APP_ENV`
- `ALLOWED_ORIGIN`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

### Worker secrets

- `HMAC_SECRET`
- `OTP_HASH_SECRET`
- `ENCRYPTION_KEY`
- `RESEND_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_OTP_TEMPLATE_NAME`
- `WHATSAPP_OTP_TEMPLATE_LANGUAGE`

`ENCRYPTION_KEY` must represent exactly 32 bytes using Base64URL encoding.

Email and WhatsApp delivery adapters are implemented, but production provider configuration and end-to-end delivery verification remain outstanding.

Never commit secrets to GitHub.

## 9. Outstanding Work and Production Blockers

The following items remain outstanding:

1. Authorized NATIONAL_ID/PASSPORT verification workflow.
2. Admin-assisted identity verification and account recovery.
3. Password reset workflow.
4. Login OTP workflow, if required.
5. Identity change and revocation workflows.
6. Production email and WhatsApp provider configuration.
7. Provider delivery integration testing.
8. D1 integration and concurrency testing.
9. Full authentication security review.
10. Production Worker configuration and deployment.

The backend must not be considered production-ready until these items have been assessed and resolved.

## 10. Testing and Deployment

Automated tests are maintained under `v2/test/`.

Static review does not replace runtime testing.

The V2 Worker has not yet been created or deployed.

Deployment must use the dedicated V2 configuration:

`v2/wrangler.jsonc`

Do not deploy through the existing V1 Worker workflow.

Do not modify V1 files, V1 database or root deployment configuration.

Do not deploy without explicit approval.

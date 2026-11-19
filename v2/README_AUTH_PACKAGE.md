# JuhudManager V2 Authentication — staged package

Target branch: `develop`  
Target directory: `v2/`

This package adds a first, deliberately limited authentication slice:
- registration OTP request and verification for EMAIL and WHATSAPP destinations
- 6-digit OTP, 5-minute expiry, 5 attempts, 60-second resend cooldown
- per-destination request throttling
- HMAC hashes and AES-GCM encryption for stored destinations
- provider-neutral OTP delivery binding
- automated tests for normalization and crypto helpers

## Important scope boundary

This is **not** the complete authentication specification implementation. It does not yet implement account creation, identity linking, password login, Argon2id password storage, sessions, recovery, admin-assisted registration, or country-specific National ID verification. Those must not be represented as complete or production-ready.

Argon2id is intentionally not replaced with PBKDF2/bcrypt. A compatible, maintained Argon2id WASM dependency and its Cloudflare Workers compatibility must be selected and tested in a separate step before password endpoints are added.

The OTP endpoints are not production-ready until:
1. The Worker has the required secrets configured.
2. An `OTP_DELIVERY` service binding is implemented by the host Worker environment or injected by tests.
3. The delivery adapter has been security-reviewed.
4. Integration tests are run against the dedicated V2 D1 database.

The code fails closed if OTP delivery or required secrets are absent. It never returns the OTP in the API response.

## Required secrets / bindings

- `HMAC_SECRET`: high-entropy secret used to HMAC destination values.
- `OTP_HASH_SECRET`: high-entropy secret used to HMAC OTP values.
- `ENCRYPTION_KEY`: base64url-encoded 32-byte AES-256 key.
- `OTP_DELIVERY`: runtime service object exposing `send({ destinationType, destination, purpose, otp, expiresInMinutes })`.

Do not put secrets in `wrangler.jsonc`, source files, GitHub, screenshots, or chat.

## Install

Copy the package files into the matching paths under `v2/`, replacing `v2/src/index.js` and adding the new files. Keep existing domain files and tests.

Run from repository root:

```bash
node --test v2/test/*.test.js
```

Do not deploy as part of this package installation.

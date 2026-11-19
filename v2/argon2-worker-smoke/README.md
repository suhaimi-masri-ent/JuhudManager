
# JuhudManager V2 - Argon2id Worker Smoke Test

## Purpose

This isolated Worker checks whether `@hallaxius/argon2w`
can run under the Cloudflare Workers runtime.

It tests:

1. WASM module loading.
2. Argon2id password hashing.
3. Verification using the correct password.
4. Rejection using an incorrect password.

This is a compatibility test only. It is not a production
password security configuration.

## Requirements

- Node.js and npm
- Internet connection for dependency installation

## Run locally

Open a terminal at the repository root:

```bash
cd v2/argon2-worker-smoke
npm install
npx wrangler dev
```

## Expected result

Open the local address shown by Wrangler, normally:

http://localhost:8787/

A successful response should return JSON similar to:

```json
{
  "ok": true,
  "algorithm": "Argon2id",
  "hashFormat": "$argon2id$v=19",
  "correctPasswordAccepted": true,
  "wrongPasswordRejected": true,
  "profile": "experimental",
  "purpose": "Cloudflare Workers compatibility smoke test only"
}
```

The exact hash value is not returned. Only its format prefix is shown.

## Important notes

- This test uses the experimental Argon2 profile.
- It is intended only to check Cloudflare Workers runtime compatibility.
- Do not use the test password for any real account.
- Do not deploy this smoke-test Worker to production.
- Do not add this test Worker to the main JuhudManager V2 application.
- A successful smoke test does not, by itself, establish production password-hashing parameters or security readiness.

## If the test fails

If Wrangler reports an error or the endpoint returns `ok: false`,
keep the complete error output.

Do not change the main JuhudManager V2 Worker or its dependencies
until the compatibility issue has been reviewed.

## Deployment trigger

Cloudflare Workers Builds deployment configuration.

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

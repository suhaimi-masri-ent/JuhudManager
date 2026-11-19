# JuhudManager V2

V2 is developed independently from the legacy V1 application. Nothing in this directory is part of the existing V1 Worker deployment.

## Current implementation slice

- Isolated Cloudflare Worker entry point and Wrangler configuration.
- Independent D1 migration history.
- Foundation schema for users, roles, Jemaah, Jemaah membership, Takaza participation and Amer Jemaah appointment history.
- Domain services for appointment eligibility and replacement rules.
- Automated domain tests using Node's built-in test runner.

## Safety

- Do not run V2 migrations against the V1 D1 database.
- The D1 database ID in `wrangler.jsonc` is a local-development placeholder. Replace it only after creating a dedicated V2 D1 database.
- V2 is not deployed by the existing V1 GitHub Actions workflow.
- Authentication, full API CRUD, UI screens and remaining business modules are subsequent implementation slices.

## Local development

From the repository root:

```bash
node --test v2/test/*.test.js
npx wrangler dev --config v2/wrangler.jsonc
```

Apply migrations locally only:

```bash
npx wrangler d1 migrations apply juhudmanager-v2-db --local --config v2/wrangler.jsonc
```

Do not use `--remote` until a separate V2 D1 database has been created and its ID configured.

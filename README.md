# JuhudManager

JuhudManager is maintained in two separate application versions.

## Project Structure

| Path | Purpose |
|---|---|
| `v1/` | JuhudManager V1 application and original documentation |
| `v2/` | JuhudManager V2 application, Worker, web frontend, migrations and documentation |
| `docs/` | Shared project documentation |
| `.github/workflows/` | Build, test, Pages deployment, Worker deployment and migration workflows |

## Version 1 (V1)

V1 is preserved under [`v1/`](v1/).

- Frontend: `v1/public/`
- Source: `v1/src/`
- Cloudflare Worker: `v1/worker/`
- Wrangler configuration: `v1/wrangler.jsonc`
- Original documentation: [`v1/README.md`](v1/README.md)

V1 retains its existing Cloudflare Worker configuration and database. Keep V1 deployment and data separate from V2.

## Version 2 (V2)

V2 is maintained under [`v2/`](v2/).

- Cloudflare Worker: `v2/src/`
- Web frontend: `v2/web/`
- D1 migrations: `v2/migrations/`
- Wrangler configuration: `v2/wrangler.jsonc`
- Documentation: `v2/docs/`

V2 uses its own Cloudflare Worker configuration and D1 database. Apply database migrations only through the dedicated V2 migration workflow and only after reviewing the migration.

## Deployment and Workflows

GitHub Actions workflows are located in `.github/workflows/`.

- `deploy.yml` — publishes the V1 frontend at the Pages root and the V2 frontend under `/v2/web/`.
- `deploy-v1-worker.yml` — deploys the V1 Cloudflare Worker from `v1/`.
- `deploy-v2-worker.yml` — deploys the V2 Cloudflare Worker from `v2/`.
- `migrate-v2-d1.yml` — manually applies V2 D1 migrations after explicit confirmation.
- `build-test.yml` — automatically runs V2 tests and build checks on the integration branch and pull requests to `develop` or `main`; can also be started manually.

A Worker deployment does not apply database migrations. Database migration and Worker deployment are separate operations.

Deployment workflows are manual-only. Repository pushes, pull requests and merges must not automatically deploy Workers or publish Pages. Start a deployment deliberately through GitHub Actions after reviewing the changes.

## Important Separation Rules

1. Keep V1 and V2 source code, Wrangler configurations, Workers and databases separate.
2. Do not point either version at the other version's database.
3. Do not run V2 migrations against the V1 database.
4. Do not deploy or migrate production resources as part of repository folder restructuring.
5. Keep local dependencies such as `node_modules/` out of Git.

## Development Notes

- Review the relevant version's documentation before changing its application.
- Shared project-level documentation belongs in `docs/`.
- Version-specific documentation belongs with that version.
- Check the applicable build and test workflow before merging changes.

# JuhudManager

JuhudManager is maintained as two separate application versions: V1 and V2. Both versions are kept in this repository, but their application code, Cloudflare Workers, Wrangler configurations and databases must remain separate.

## Project Structure

Path| Purpose
"v1/"| JuhudManager V1 application and its version-specific documentation
"v2/"| JuhudManager V2 application, Worker, web frontend, D1 migrations and documentation
"docs/"| Shared project-level documentation
".github/workflows/"| Build, test, Pages deployment, Worker deployment and database migration workflows

Version 1 (V1)

V1 is preserved under ""v1/"" (v1/).

Component| Location
Frontend| "v1/public/"
Application source| "v1/src/"
Cloudflare Worker| "v1/worker/"
Wrangler configuration| "v1/wrangler.jsonc"
Version-specific README| ""v1/README.md"" (v1/README.md)

V1 retains its own Cloudflare Worker configuration and D1 database.

V1 must remain operationally and technically separate from V2. Changes to V2 must not unintentionally modify V1 application behaviour, database resources or deployment configuration.

Version 2 (V2)

V2 is maintained under ""v2/"" (v2/).

Component| Location
Cloudflare Worker source| "v2/src/"
Web frontend| "v2/web/"
D1 migrations| "v2/migrations/"
Wrangler configuration| "v2/wrangler.jsonc"
Version-specific documentation| "v2/docs/"

V2 uses its own Cloudflare Worker configuration and D1 database.

Database changes must be managed through reviewed migration files. Production migrations are performed separately from Worker deployment through the dedicated migration workflow.

V2 Documentation

Version-specific design and implementation documents are maintained in "v2/docs/".

Important documents include:

- "Auth.md" — authentication, account security and password recovery requirements.
- "UAC_MATRIX.md" — User Access Control and authorization rules.
- "DASHBOARD_NAVIGATION_SPEC_V2.md" — dashboard and navigation specification.
- "JMV2001-Ahbab-Profile-Account-Management.md" — Ahbab profile and account management.
- "JMV2002-Organization-Structure-Governance.md" — organization structure and governance.
- "JMV2003-Syukbah-Management.md" — Syukbah management.
- "JMV2004-Takaza-Management.md" — Takaza management and operational processes.
- "V2_DESIGN_CHECKPOINT.md" — consolidated design decisions and outstanding decisions.
- "V2_IMPLEMENTATION_STATUS.md" — implementation progress and verification status.

A documented requirement does not necessarily mean that the feature has already been implemented. Refer to the implementation status document and verify the actual code before treating a feature as available.

Shared Project Documentation

Project-wide documentation belongs in the root "docs/" directory.

This includes development roadmaps, system-level design references, database guidance and historical project records.

Version-specific implementation details should remain in the corresponding version directory.

GitHub Actions Workflows

All workflows are located in ".github/workflows/".

Workflow| Purpose| Trigger
"build-test.yml"| Runs V2 tests and build checks| Push to integration branch, Pull Request to "develop" or "main", or manual
"deploy.yml"| Publishes V1 and V2 frontends to GitHub Pages| Manual
"deploy-v1-worker.yml"| Deploys the V1 Cloudflare Worker| Manual
"deploy-v2-worker.yml"| Deploys the V2 Cloudflare Worker| Manual
"migrate-v2-d1.yml"| Applies V2 production D1 migrations| Manual with explicit confirmation

GitHub Pages

The Pages workflow prepares a combined site:

- V1 frontend is published at the Pages root.
- V2 frontend is published under "/v2/web/".

The workflow must be started manually through GitHub Actions.

Cloudflare Workers

V1 and V2 Worker deployments are independent operations.

- V1 deployment uses the configuration under "v1/".
- V2 deployment uses the configuration under "v2/".

A Worker deployment does not automatically apply database migrations.

V2 Database Migrations

The V2 migration workflow requires the confirmation value "APPLY" before it proceeds.

Before applying production migrations:

1. Review the migration files.
2. Confirm the target database and Wrangler configuration.
3. Confirm that the migration is appropriate for the current production schema.
4. Start the migration workflow deliberately.
5. Review the workflow result.

Do not run V2 migrations against the V1 database.

Important Separation Rules

1. Keep V1 and V2 application source code separate.
2. Keep their Wrangler configurations, Cloudflare Workers and D1 databases separate.
3. Never point one version's Worker at the other version's database.
4. Never apply V2 migrations to the V1 database.
5. Do not combine V1 and V2 deployment operations into an unintended shared deployment.
6. Do not deploy production resources or apply database migrations as a side effect of repository restructuring.
7. Keep local dependencies such as "node_modules/" out of Git.
8. Preserve historical documentation and migration records unless there is an explicit decision to archive or remove them.

Development and Verification

Before making changes:

- Identify whether the change belongs to V1, V2 or shared project documentation.
- Review the relevant version-specific documentation.
- Check the applicable database schema and migration history before changing data structures.
- Review authorization and account-security requirements before changing authentication or access-control behaviour.

For V2 development, use the build and test workflow to verify changes.

The V2 build and test workflow currently performs:

1. Dependency installation using the lockfile.
2. Unit tests using "npm test".
3. Wrangler build dry-run using "npm run build".

A successful build or test run does not by itself establish that production deployment, database migration, bootstrap setup or every documented feature has been verified.

Deployment Safety

Production deployment and database migration are deliberate operations.

Do not assume that a successful GitHub Actions build means the application has been deployed.

After deployment, verify the relevant application endpoint, Worker health and database connectivity. For database changes, verify the migration result separately.

Keep deployment records and implementation status documentation accurate and distinguish between:

- Implemented
- Partially implemented
- Not implemented
- Needs verification
- Deployed
- Reported test result

Project Direction

JuhudManager V1 is preserved as a separate application version.

JuhudManager V2 is developed as the next application version with its own architecture, authorization model, database migrations, frontend and operational workflows.

The separation is intended to protect the existing V1 application while allowing V2 to evolve independently.


# JuhudManager V2 – Implementation Status

**Branch:** `develop`  
**Status:** Initial V2 foundation uploaded to the repository and under review.  
**Last Updated:** 19 November 2026

## Implemented in the current foundation

- Isolated `v2/` application directory.
- Separate Wrangler configuration and D1 migration directory.
- Initial V2 schema for users, roles, Jemaah, Jemaah memberships, Takaza, Takaza participation, Amer appointments and audit logs.
- Composite database constraint ensuring an Amer appointment references the same participant, user and Takaza.
- Domain validation for Amer appointment and replacement.
- Former Amer access policy is Admin-controlled.
- Worker health endpoint.
- Node built-in tests for Amer appointment rules.

## Design rules reflected

- Amer Jemaah is appointed per Takaza, not as a permanent Jemaah role.
- Initial appointment must be effective before the Takaza official start date.
- Amer is also an active Takaza participant; the appointment references that same user's participation record in the same Takaza.
- Only confirmed eligible participants can be appointed. The eligibility reference is retained.
- Admin can replace the Amer; replacement requires a reason and retains the former appointment.
- Former Amer access is controlled by Admin.
- V1 remains untouched.

## Intentionally not implemented yet

- Authentication and account provisioning.
- Full Jemaah and membership APIs.
- Takaza creation/release and participation application APIs.
- Kawaif/Tafakut assessment engine and actual eligibility calculation.
- Takaza Reports, Comments and version history.
- Case Management (ON HOLD).
- Frontend screens and production deployment.

These are subsequent slices. The eligibility engine must not be guessed before the agreed Kawaif/Tafakut criteria are reconciled.

## Safety and deployment

The placeholder D1 database ID in `v2/wrangler.jsonc` is for local development only. Create a dedicated V2 D1 database before configuring remote deployment. Never point V2 at the V1 database.

**Verification note:** This status records repository inspection and schema-level changes. It does not claim that the migration has been applied to a remote D1 database or that production deployment has occurred.

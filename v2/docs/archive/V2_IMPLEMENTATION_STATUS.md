# JuhudManager V2 – Implementation Status

**Branch target:** `develop`  
**Status:** Initial foundation package prepared; not yet uploaded to the repository.  
**Date:** 19 November 2026

## Implemented in this package

- Isolated `v2/` application directory.
- Separate Wrangler configuration and D1 migration directory.
- Initial V2 schema for users, roles, Jemaah, Jemaah memberships, Takaza, Takaza participation, Amer appointments and audit logs.
- Domain validation for Amer appointment and replacement.
- Former Amer access policy is Admin-controlled.
- Worker health endpoint.
- Node built-in tests for Amer appointment rules.

## Design rules reflected

- Amer Jemaah is appointed per Takaza, not as a permanent Jemaah role.
- Initial appointment must be effective before the Takaza official start date.
- Amer is also an active Takaza participant; the appointment references the participation record.
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

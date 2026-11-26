
# JuhudManager V2 – Implementation Status

**Branch:** `develop`
**Status:** V2 foundation and initial authentication backend are implemented; integration and business modules remain in progress.
**Last Updated:** 23 November 2026

## Implemented in the current foundation

- Isolated `v2/` application directory.
- Separate Wrangler configuration and D1 migration directory.
- Initial V2 schema for users, roles, Jemaah, Jemaah memberships, Takaza, Takaza participation, Amer appointments and audit logs.
- Composite database constraint ensuring an Amer appointment references the same participant, user and Takaza.
- Domain validation for Amer appointment and replacement.
- Former Amer access policy is Admin-controlled.
- Worker health endpoint.
- Authentication backend for registration, email OTP, activation, login and sessions.
- Automated tests for the currently implemented domain and authentication flows.
- Worker dry-run build.

## Design rules reflected

- Amer Jemaah is appointed per Takaza, not as a permanent Jemaah role.
- Initial appointment must be effective before the Takaza official start date.
- Amer is also an active Takaza participant; the appointment references that same user's participation record in the same Takaza.
- Only confirmed eligible participants can be appointed. The eligibility reference is retained.
- Admin can replace the Amer; replacement requires a reason and retains the former appointment.
- Former Amer access is controlled by Admin.
- V1 remains untouched.

## Intentionally not implemented yet

- Full Jemaah and membership APIs.
- Takaza creation/release and participation application APIs.
- WhatsApp OTP verification and production delivery integration.
- Authorized National ID/Passport verification workflow.
- Kawaif/Tafakut assessment engine and actual eligibility calculation.
- Takaza Reports, Comments and version history.
- Case Management (ON HOLD).
- Frontend screens and production integration verification.

These are subsequent slices. The eligibility engine must not be guessed before the agreed Kawaif/Tafakut criteria are reconciled.

## Safety and deployment

V2 must use a dedicated D1 database and must never point to the V1 database. The remote schema has been inspected read-only; migration history and full production integration have not been independently verified.

**Verification note:** `npm test` and the Wrangler dry-run build pass locally. No remote migration or deployment was performed as part of this verification.

12. V2 Decision and Documentation Reconciliation

Reconciliation Date: 28 November 2026
Applies To: JuhudManager V2
Authority: V2 Master Decision Register, Module Requirements and current module specifications

This section clarifies how the historical project roadmap must be interpreted against the current approved V2 requirements.

12.1 Authority of V2 Documentation

For V2 requirements and decisions, use the following authoritative documents:

- "v2/docs/MASTER_DECISION_REGISTER.md" — approved decisions.
- "v2/docs/OPEN_DECISIONS_REGISTER.md" — unresolved decisions.
- "v2/docs/MODULE_REQUIREMENTS.md" — consolidated functional requirements.
- "v2/docs/V2_IMPLEMENTATION_STATUS.md" — implementation status and V2 development roadmap.
- Relevant V2 module specifications under "v2/docs/".

This root roadmap remains the shared project-level continuity document for V1 and V2. It must not maintain a competing V2 implementation status or override approved V2 decisions.

12.2 Project Member and Takaza Participation

The historical V1 term Project Member remains relevant to V1 documentation and historical development context.

For V2:

- Jemaah Membership and Takaza Participation are separate concepts.
- Takaza Participation is the authoritative V2 record of an Ahbab's participation in a Takaza.
- Relevant V1 Project Member records map to V2 Takaza Participation where appropriate.
- V2 must not introduce a separate Project Member entity.
- V2 participation status, withdrawal, removal, appeal, transfer and rejoining follow the current JMV2004 specification.

Accordingly, references in this roadmap to defining a separate V2 Project Member entity, terminology or lifecycle must not be treated as outstanding V2 requirements.

The historical V1 Project Member workflow remains within V1 scope.

12.3 Amer Appointment

The V2 Amer appointment prerequisite is confirmed:

- An Amer candidate must already be a confirmed participant in the same Takaza before the appointment becomes effective.
- If the candidate is not yet a confirmed participant, the normal participation process must first be completed.
- Appointment may take effect before the official Takaza start date.
- Appointment requires the applicable Admin and candidate consent.
- Appointment, replacement, expiry and history follow the current JMV2004 specification.

The existence of foundation-level Amer code must not be treated as proof that the complete user-facing workflow is implemented.

12.4 Password Reset

Password Reset is a required V2 feature but is not implemented.

The approved baseline requires:

- Use of the registered and verified email address.
- OTP containing six digits.
- Five-minute OTP validity.
- Maximum five verification attempts.
- Sixty-second resend cooldown.
- New password meeting the minimum twelve-character requirement.
- Revocation of all existing sessions and tokens after successful reset.
- Audit event and security notification.

Admin-Assisted Account Recovery is a separate process and must not be represented as ordinary Password Reset.

12.5 Case Management

Full Case Management remains ON HOLD.

A cancellation-related Requires Attention record does not mean that the complete Case Management module is implemented or approved for activation.

The detailed scope and status must follow the current V2 decision and implementation documents.

12.6 Interpretation of Historical Roadmap Sections

The following sections retain their historical and project-continuity purpose:

- V1 assessment and Project Member proposals.
- Historical V1 implementation snapshots.
- V1 development sequence.
- Historical V1 Activities and assessment concepts.

They must not automatically become V2 requirements.

Where an older V2 statement conflicts with a later approved V2 decision, the current authoritative V2 documents take precedence.

12.7 Current V2 Implementation Status

The V2 implementation position must be read exclusively from:

"v2/docs/V2_IMPLEMENTATION_STATUS.md"

That document records current implementation evidence, blockers, verification limitations, development phases and release gates.

Historical status snapshots in this root roadmap must not be interpreted as current production verification.

In particular:

- A successful test result applies only to the tested scope.
- A successful build does not prove complete functional implementation.
- A migration record does not by itself prove every production feature is operational.
- A deployed Worker does not prove all frontend and business workflows are complete.
- Design approval does not constitute implementation approval.

12.8 Maintenance Rule

When V2 requirements or decisions change:

1. Update the relevant V2 authoritative document first.
2. Update the V2 Implementation Status if implementation progress or evidence changes.
3. Review this root roadmap for conflicting or outdated project-level statements.
4. Preserve historical V1 context.
5. Do not silently promote pending decisions into approved requirements.

---

Reconciliation Status: Added as the current V2 interpretation layer for this project-level roadmap.

Last Updated: 28 November 2026

JuhudManager V2 — Implementation Status and Roadmap

Document ID: JMV2-IMP-001
Roadmap ID: JMV2-ROADMAP-001
Version: 1.0
Date: 27 November 2026
Status: Working Baseline — Implementation Tracking

---

PART A — IMPLEMENTATION STATUS

1. Purpose

This document records the implementation status of JuhudManager V2 and establishes the development roadmap.

It separates:

- Approved requirements.
- Reported implementation.
- Verified implementation.
- Outstanding implementation.
- Known blockers.
- Deferred work.

A successful build or test run does not prove that every functional requirement is implemented.

2. Status Definitions

Status| Meaning
IMPLEMENTED — VERIFIED| Code and relevant tests have been reviewed and verified
REPORTED SUCCESS| Success was reported, but this document has not independently revalidated it
PARTIALLY IMPLEMENTED| Some functionality exists, but the complete requirement is not satisfied
NOT IMPLEMENTED| Required feature has not yet been implemented
NEEDS VERIFICATION| Existing implementation or behavior needs inspection and testing
BLOCKED| Work cannot proceed safely until a blocker is resolved
ON HOLD| Work is intentionally deferred
PENDING DECISION| Implementation depends on an unresolved decision

3. Technical Environment

3.1 Repository Structure

Repository: "suhaimi-masri-ent/JuhudManager"

Current development branch context:

"integration/v1-v2-separation-develop"

Relevant structure:

- "v1/" — Legacy V1 application.
- "v2/" — V2 application.
- "v2/src/" — V2 backend.
- "v2/web/" — V2 frontend.
- "v2/migrations/" — V2 database migrations.
- "v2/docs/" — V2 documentation.

V1 and V2 must remain separate applications with separate deployment configurations.

3.2 V2 Worker and Database

Item| Recorded configuration
Worker| "juhudmanager-v2-api"
Worker entry point| "src/index.js"
Configuration| "v2/wrangler.jsonc"
D1 binding| "DB"
Database| "juhudmanager-v2-db"
Migration directory| "v2/migrations/"

3.3 Migration Status

Recorded project state:

- Migrations 0001 through 0021 exist.
- Migration "0021_super_admin_owner_verification.sql" was reported applied remotely on 26 November 2026.
- The database was reported to contain 33 tables after migration 0021.

These are recorded project results and must be rechecked against the remote database before a new production change.

No migration should be applied merely because it appears in this document.

3.4 Health and Build Results

Previously reported results:

- Worker health endpoint returned "status: ok".
- Database connection returned successfully.
- GitHub Actions build and test completed successfully.
- Test suite reported 94/94 passing.

These results do not independently prove:

- Correct bootstrap ownership.
- Complete authorization enforcement.
- Correct production configuration.
- Complete feature implementation.
- Correct behavior across all user roles.
- Successful deployment of every latest source change.

4. Critical Blocker — Bootstrap SUPER_ADMIN

<PRIVATE_PERSON> Status: NEEDS VERIFICATION — BLOCKING

The bootstrap SUPER_ADMIN setup remains unresolved.

Previously observed database state:

- Bootstrap user "JUHUD MANAGER" exists.
- Email identity "al.masri.ent@gmail.com" exists.
- Account status was "DISABLED".
- Bootstrap status was "PENDING".
- No active password was recorded.
- No "user_roles" assignment was recorded.
- Counts for owner role, super_admin role, password and verified email identity were zero in the inspected state.

A separate user record named "SUPER ADMIN JUHUD MANAGER" was also observed with:

- Null email.
- DISABLED account.
- Pending global email identity.
- Previous expired identity record.
- Registration status "AWAITING_EMAIL_VERIFICATION".

Reported application errors:

- Login or registration: "Network error interceptor".
- Owner verification: "The designated bootstrap owner is not eligible for email verification."

4.1 Required Resolution

Before treating the system as operational:

1. Inspect the current bootstrap user and identity records.
2. Confirm the designated owner identity.
3. Resolve the eligibility checks.
4. Verify the owner email identity.
5. Establish valid authentication credentials.
6. Confirm the SUPER_ADMIN role assignment.
7. Confirm account status and bootstrap status.
8. Test SUPER_ADMIN login.
9. Test global authorization.
10. Record the final state and audit evidence.

Do not create duplicate bootstrap owners or manually bypass authorization checks without an approved recovery procedure.

4.2 Release Impact

Bootstrap is a release blocker.

Country ADMIN creation and subsequent profile-update testing should follow only after the bootstrap SUPER_ADMIN has been successfully established and verified.

5. Authentication and Account Management

Feature| Status| Notes
Email OTP registration| PARTIALLY IMPLEMENTED| Existing implementation and end-to-end behavior need verification
OTP expiry and attempt limits| NEEDS VERIFICATION| Confirm all policy limits in actual runtime
Identity reservation| NEEDS VERIFICATION| Confirm expiry and uniqueness behavior
Password minimum length| NEEDS VERIFICATION| Confirm server-side enforcement
Login and sessions| PARTIALLY IMPLEMENTED| Verify idle and maximum lifetime rules
Email change OTP| NEEDS VERIFICATION| Confirm all account states and identity rules
Password Reset| NOT IMPLEMENTED| Required feature; verified email and OTP
Admin-assisted recovery| PENDING DECISION| Separate from normal Password Reset
Account disablement| NEEDS VERIFICATION| Confirm session and token revocation
Account appeal| NEEDS VERIFICATION| Confirm reviewer scope and separation
Reactivation| NEEDS VERIFICATION| Confirm mandatory new password and audit
WhatsApp OTP| NEEDS VERIFICATION| Verify whether any implementation exists and confirm its actual runtime status
Two-factor authentication| NOT IMPLEMENTED| Not currently available
Passport login| PENDING| Separate login capability

5.1 Password Reset Implementation Requirements

Password Reset must:

- Use the registered and verified email.
- Follow six-digit OTP policy.
- Use five-minute validity.
- Allow no more than five attempts.
- OTP must be bound to the specific Password Reset transaction. OTP issued for registration or another purpose must not be accepted.  
- Enforce sixty-second resend cooldown.
- Allow a new password only after successful verification.
- Revoke every existing session and token.
- Record an audit event.
- Send a security notification.

A user who cannot access the verified email must use a separate Admin-assisted recovery process.

6. Profile Management

Status: NEEDS VERIFICATION

Required behavior:

- Separate profile data from credentials and account status.
- Protect National ID and Passport identity fields.
- Prevent direct ordinary profile editing of protected identity information.
- Record profile changes and verification history.
- Preserve previous and new values where applicable.
- Record verifier and timestamp.

The complete profile-update workflow must be tested after bootstrap recovery.

7. Authorization and UAC

Status: NEEDS VERIFICATION

The system must enforce authorization on the backend.

Required checks:

- SUPER_ADMIN global scope.
- Country ADMIN country scope.
- Admin Markaz scope.
- Admin Syukbah scope.
- Admin Takaza scope.
- Separation between administrative roles and organizational leadership.
- Cross-organization support consent and scope.
- Protection against cross-country access.
- Account status enforcement.
- Separation of account status and access level.

The UAC Matrix is the permission baseline.

Frontend visibility is not a substitute for server-side authorization.

8. Organization Structure

Status: DESIGN BASELINE — IMPLEMENTATION NEEDS VERIFICATION

Requirements include:

- Country-specific organizational hierarchy.
- Markaz Negara supervisory relationship.
- Separate country records.
- Chief Admin and Deputy structure.
- Faisalah title for Markaz Negeri Chief Admin.
- Administrative scope and cross-organization support.

Final Markaz Negara governance and country hierarchy remain pending.

9. Syukbah Management

Status: DESIGN BASELINE — IMPLEMENTATION NEEDS VERIFICATION

Required functionality:

- Global Baseline Syukbah.
- Country Syukbah configuration.
- Admin Syukbah.
- Deputy and acting delegation.
- Moderator management.
- Discussion permissions.
- Soft deletion and audit.
- Separation from CMS.

Additional country Syukbah approval and delegation details remain pending.

10. Jemaah and Takaza

Status: DESIGN BASELINE — IMPLEMENTATION NEEDS VERIFICATION

Required functionality:

- Separate Jemaah membership and Takaza participation.
- Main and Sub Takaza.
- Maximum two levels.
- Same-country rule.
- Independent Main and Sub lifecycle.
- Configurable participation methods.
- Admin confirmation.
- Capacity management.
- Withdrawal.
- Removal.
- Appeal.
- Transfer.
- Rejoining with linked history.

V2 must not create a separate Project Member entity.

11. Amer Appointment

Status: PARTIALLY IMPLEMENTED — FULL WORKFLOW NEEDS VERIFICATION

A foundation for Amer appointment has previously been reported.

The complete workflow must verify:

- Amer must already be a confirmed participant in the same Takaza.
- Both Admin and candidate consent.
- Appointment may occur before official start date.
- Appointment start and end dates.
- Early termination.
- Extension.
- Expiry behavior.
- Replacement justification.
- Audit history.
- Notification behavior.

The participation prerequisite is mandatory.

An Amer candidate who is not yet a confirmed participant must first complete the normal participation process.

12. Supervisor Appointment

Status: NEEDS VERIFICATION / PENDING DECISION

Supervisor appointment requires:

- Admin consent.
- Candidate consent.
- Appointment record.
- Duration management.
- Audit history.

Supervisor authority, scope and participant eligibility remain pending.

No special Supervisor permission may be assumed.

13. KAWAIF

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Ahbab qualification and experience records.
- User submission.
- Pending edits.
- Admin verification.
- Admin correction of outdated or missing information.
- Source and basis.
- Previous and new values.
- Actor and timestamp.
- Higher-scope configuration of categories and criteria.

14. TAFAKUT

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Exactly two independent assessors per round.
- PASS/PASS and FAIL/FAIL decisions.
- Third Admin when assessors disagree.
- Two new assessors for each additional round.
- Assessor replacement without restarting completed work.
- Immutable submitted assessments.
- Versioned forms.
- Ahbab draft and submission workflow.
- Admin correction process.
- Final managing Admin decision with justification.
- Notifications and decision visibility.
- SUSPEND and ON_HOLD handling.

15. Events and Attendance

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Flexible event scheduling.
- Reuse of existing Aktiviti Khidmat records.
- Creation of new events.
- Takaza-linked events.
- Attendance.
- Remarks.
- Separation of attendance from Takaza lifecycle status.

Event templates remain pending.

16. Percha

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Generate after Bayan Hidayat.
- Required Percha fields.
- Admin-proposed amendment.
- Approval by a different Admin.
- Rejection retains original.
- Resubmission.
- Version and audit history.

17. Kharguzari

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Due one day before Bayan Wapsi.
- Individual Ahbab records.
- Admin recording within scope.
- Amer access for reporting.
- Immutable original record.
- Separate follow-up comments.
- Author editing of own comment.

18. Amer Report and Completion

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Full Amer report.
- Report due-date management.
- OVERDUE status.
- Admin extension with history.
- Preservation of original due date.
- No automatic completion while report is missing.

Takaza may become COMPLETED only when all approved completion conditions are met, including the Amer report.

19. Cancellation and Case Management

Status: PARTIALLY DEFINED — FULL CASE MANAGEMENT ON HOLD

Required immediate behavior:

- Cancellation creates a "Requires Attention" case.
- Case identifies affected Takaza.
- Case identifies affected Ahbab.
- Participation is not automatically cancelled.
- Admin handles each affected participant individually.

Full Case Management workflow remains ON HOLD.

20. Annual Archive and Annual Summary

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Required functionality:

- Automatic archive.
- Scope-based Admin access.
- Ahbab access only to Takaza they participated in.
- Main and Sub Takaza statistics.
- Participant statistics.
- Year and status filters.
- Admin-added information with audit.
- Annual Summary for country, Main and Sub Takaza.
- DRAFT, INTERIM and FINAL summary states.
- Separation from operational transactions.

PDF and Excel export are not included in the current baseline.

21. Juhud Reports

Status: SEPARATE MODULE — IMPLEMENTATION NEEDS VERIFICATION

Juhud Reports is a publication module.

It is not the same as Takaza operational reports or Annual Archive.

22. Notification and Audit

Status: NEEDS VERIFICATION

Verify:

- User-language notifications.
- Authentication notifications.
- Account security notifications.
- TAFAKUT notifications.
- Participation notifications.
- Appointment notifications.
- Removal and appeal notifications.
- Audit actor and timestamps.
- Previous and new values.
- Required reasons and justifications.

23. Test and Quality Status

Previously reported:

- Test suite: 94/94 passed.
- GitHub Actions build and test: success.
- Worker health: success.
- D1 connection: success.

These are reported results, not a substitute for the following verification:

1. Full authentication integration tests.
2. Bootstrap SUPER_ADMIN tests.
3. Server-side authorization tests.
4. Cross-country access tests.
5. Account disablement and session revocation tests.
6. OTP abuse and rate-limit tests.
7. Password Reset tests after implementation.
8. Database migration consistency.
9. Frontend and API integration tests.
10. Production smoke tests.
11. V1 and V2 deployment separation tests.

---

PART B — IMPLEMENTATION ROADMAP

24. Roadmap Principles

Development must follow these principles:

- Resolve critical blockers before expanding functionality.
- Enforce authorization before exposing administrative operations.
- Keep V1 and V2 separated.
- Preserve historical data.
- Avoid unapproved schema changes.
- Maintain migration discipline.
- Implement backend validation before relying on frontend controls.
- Update tests and documentation with every major change.
- Do not claim a feature is complete without evidence.

25. Phase 0 — Repository and Environment Stabilization

Priority: CRITICAL

Tasks:

1. Confirm V1 and V2 directory separation.
2. Confirm separate Wrangler configurations.
3. Confirm separate Worker names.
4. Confirm separate D1 database bindings and IDs.
5. Verify GitHub Actions deployment workflows.
6. Verify Pages deployment paths.
7. Confirm migration history.
8. Confirm production health.
9. Preserve historical packages and documentation until audited.

Exit criteria:

- V1 and V2 remain independently deployable.
- No accidental V1 deployment from V2 workflow.
- No accidental V2 deployment from V1 workflow.
- Database and Worker configuration are confirmed.

26. Phase 1 — Bootstrap and Authentication

Priority: CRITICAL

Tasks:

1. Resolve bootstrap SUPER_ADMIN.
2. Verify owner email identity.
3. Verify password and role assignment.
4. Verify SUPER_ADMIN login.
5. Verify global authorization.
6. Verify Country ADMIN creation.
7. Verify account status enforcement.
8. Verify OTP policy.
9. Verify session lifetime and revocation.
10. Implement Password Reset.
11. Define separate Admin-assisted recovery.
12. Verify profile update and protected identity fields.

Exit criteria:

- Bootstrap SUPER_ADMIN works.
- Country ADMIN can be created within authorized scope.
- Account and session controls pass tests.
- Password Reset passes its full security tests.
- Profile changes preserve verification and audit history.

27. Phase 2 — Authorization and Organization

Priority: HIGH

Tasks:

1. Complete UAC enforcement.
2. Implement country scope.
3. Implement organization hierarchy.
4. Implement Chief Admin and Deputy structure.
5. Implement cross-organization support.
6. Resolve pending governance decisions.
7. Implement Admin Markaz scope.
8. Verify Dashboard navigation against permissions.

Exit criteria:

- No unauthorized cross-country access.
- Administrative roles remain distinct.
- Organization scope is enforced by the backend.
- Dashboard actions match actual authorization.

28. Phase 3 — Syukbah Management

Priority: HIGH

Tasks:

1. Implement Global Baseline Syukbah.
2. Implement country Syukbah activation.
3. Implement Admin Syukbah.
4. Implement Deputy and acting assignment.
5. Implement moderator management.
6. Implement discussion permissions.
7. Implement soft deletion and audit.
8. Resolve additional Syukbah approval rules.

Exit criteria:

- Syukbah is independent of organization hierarchy.
- Admin and moderator permissions are enforced.
- Discussion and CMS remain separate.

29. Phase 4 — Jemaah and Takaza Participation

Priority: HIGH

Tasks:

1. Implement Jemaah membership.
2. Implement Main and Sub Takaza.
3. Enforce two-level hierarchy.
4. Implement Takaza lifecycle.
5. Implement four participation methods.
6. Implement Admin confirmation.
7. Implement capacity rules.
8. Implement withdrawal.
9. Implement removal and appeal.
10. Implement transfer.
11. Implement rejoining and linked history.
12. Ensure no separate V2 Project Member entity exists.

Exit criteria:

- Membership and participation remain separate.
- Every participant has a valid participation record.
- Main and Sub Takaza operate independently.
- Participation history is retained.

30. Phase 5 — KAWAIF and TAFAKUT

Priority: HIGH

Tasks:

1. Implement KAWAIF records.
2. Implement Admin verification.
3. Implement KAWAIF configuration.
4. Implement TAFAKUT form types.
5. Implement template versioning.
6. Implement assessor assignment.
7. Enforce two independent assessors.
8. Implement disagreement and third Admin.
9. Implement new assessors for additional rounds.
10. Implement immutable submission.
11. Implement Ahbab and assessor form workflows.
12. Implement final Admin decision and justification.
13. Implement notifications.

Exit criteria:

- Assessment independence is enforced.
- Old assessment versions remain available.
- Decisions and justifications are auditable.
- KAWAIF does not automatically determine TAFAKUT outcome.

31. Phase 6 — Amer, Supervisor and Events

Priority: HIGH

Tasks:

1. Complete Amer appointment workflow.
2. Enforce confirmed participation prerequisite.
3. Implement Admin and candidate consent.
4. Implement appointment duration and replacement.
5. Implement expiry and notification.
6. Resolve Supervisor authority and eligibility.
7. Implement Supervisor appointment.
8. Implement flexible event scheduling.
9. Implement event reuse and creation.
10. Implement attendance and remarks.

Exit criteria:

- Amer must be a confirmed participant in the same Takaza before appointment becomes effective.
- Appointment may occur before the official start date.
- Consent and audit rules are enforced.
- Supervisor permissions follow approved decisions.
- Events and attendance are linked to the correct Takaza.

32. Phase 7 — Percha, Kharguzari and Reporting

Priority: HIGH

Tasks:

1. Generate Percha after Bayan Hidayat.
2. Implement amendment proposal and independent approval.
3. Implement Kharguzari.
4. Implement individual Kharguzari access.
5. Implement immutable original records.
6. Implement follow-up comments.
7. Implement Amer report.
8. Implement overdue and extension behavior.
9. Enforce completion conditions.
10. Implement Annual Archive.
11. Implement Annual Summary.
12. Keep Juhud Reports separate.

Exit criteria:

- Percha amendments are independently approved.
- Original Kharguzari records remain preserved.
- Amer report is mandatory for completion.
- Archive access is scope-controlled.
- Annual Summary remains separate from operational records.

33. Phase 8 — Case Management and Hardening

Priority: AFTER CORE WORKFLOWS

Tasks:

1. Define full Case Management specification.
2. Implement case ownership and assignment.
3. Implement case status and resolution.
4. Implement escalation and notifications.
5. Implement case audit.
6. Review security controls.
7. Review rate limits.
8. Review database integrity.
9. Run full regression tests.
10. Perform production smoke tests.
11. Update operational documentation.

Exit criteria:

- Case Management follows an approved specification.
- No unresolved critical security defect.
- All release gates pass.

34. Release Gates

A production release must not be considered complete until the relevant gates are satisfied.

Gate A — Identity and Bootstrap

- Bootstrap owner verified.
- SUPER_ADMIN role verified.
- Login tested.
- No duplicate or ambiguous bootstrap identity.

Gate B — Authorization

- Backend role checks verified.
- Country scope verified.
- Administrative scope verified.
- Cross-scope denial tested.
- Account disablement enforcement tested.

Gate C — Database

- Migrations reviewed.
- Migration order confirmed.
- Production database state verified.
- Backup and recovery plan considered.
- No unauthorized schema change.

Gate D — Security

- OTP limits tested.
- Session revocation tested.
- Password handling reviewed.
- Protected identity fields verified.
- Audit records verified.

Gate E — Deployment

- V1 Worker remains separate.
- V2 Worker remains separate.
- Pages paths are correct.
- Production environment variables are correct.
- Health endpoint and database connectivity verified.

Gate F — Functional Tests

- Required workflows tested.
- Negative authorization tests passed.
- Relevant integration tests passed.
- Regression tests passed.

35. Non-Negotiable Requirements

The following must not be violated during implementation:

1. No separate V2 Project Member entity.
2. Jemaah membership and Takaza participation remain separate.
3. Amer must already be a confirmed participant in the same Takaza before appointment becomes effective.
4. Amer appointment may occur before the official Takaza start date.
5. Supervisor authority must not be invented.
6. "WITHDRAWN" and "REMOVED" remain distinct.
7. Account "DISABLED" cannot be overridden by LIMITED access.
8. Password Reset requires verified email OTP and revocation of all existing sessions and tokens.
9. No Takaza completion without the required Amer report.
10. Main and Sub Takaza lifecycle remain independent.
11. Historical records must be preserved.
12. Frontend visibility is not authorization.
13. No implementation status may be overstated without evidence.
14. No production migration or deployment is authorized by this document alone.

36. Maintenance

Update this document whenever:

- A feature is implemented.
- A test result changes.
- A deployment is verified.
- A migration is applied.
- A blocker is resolved.
- A requirement changes.
- A decision is approved or superseded.

Record the date and evidence for every status change.

---

End of Document

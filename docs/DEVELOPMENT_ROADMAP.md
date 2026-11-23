
# JuhudManager – Development Roadmap

**Last Updated:** 23 November 2026

---

## 1. Project Direction

JuhudManager is being developed in two distinct tracks:

- **V1:** Existing application. Its current operation and deployment must remain undisturbed.
- **V2:** New application architecture, developed separately under the `v2/` directory and the `develop` branch.

V2 is the forward development track. It must not reuse or modify the V1 database, deployment configuration, or production resources.

---

## 2. V1 – Existing Application

V1 remains operational as the existing application.

Development work on V2 must not:

- Modify V1 application files unnecessarily.
- Change V1 database structures.
- Replace V1 deployment configuration.
- Point V2 to the V1 D1 database.
- Disrupt existing V1 users or operations.

Any future V1 maintenance should be handled separately from V2 development.

---

## 3. V2 – Development Roadmap

### Phase 1: Foundation and Core Domain

**Status:** Initial foundation implemented; current unit tests and Worker dry-run build pass. Remote migration history and end-to-end integration still need verification.

- [x] Establish isolated `v2/` application directory.
- [x] Create separate Wrangler configuration.
- [x] Create initial D1 foundation migration.
- [x] Define core entities:
  - Users
  - Roles
  - Jemaah
  - Jemaah Memberships
  - Takaza
  - Takaza Participation
  - Amer Appointments
  - Audit Logs
- [x] Define Amer appointment domain validation.
- [x] Define Amer replacement rules.
- [x] Define Admin-controlled former Amer access.
- [ ] Validate migration against a dedicated V2 D1 database.
- [x] Run automated unit tests.
- [ ] Complete local Worker verification.

### Phase 2: Authentication and User Management

- [x] Initial authentication and session backend (registration, email OTP, activation and login).
- [x] Initial user account provisioning and registration review workflow.
- [ ] Complete email delivery and Worker/D1 integration testing.
- [ ] Define and implement authorized National ID/Passport verification and recovery workflows.
- [ ] Role and permission management.
- [ ] Admin user management.
- [ ] User profile management.

### Phase 3: Jemaah Management

- [ ] Create and manage Jemaah.
- [ ] Manage Jemaah membership.
- [ ] Define membership status and lifecycle.
- [ ] Implement membership-related permissions.
- [ ] Provide Admin management interfaces.

### Phase 4: Takaza Management

- [ ] Create and manage Takaza.
- [ ] Define Takaza lifecycle and status transitions.
- [ ] Manage Takaza participation applications.
- [ ] Confirm participant membership.
- [ ] Appoint the initial Amer Jemaah.
- [ ] Support Amer replacement with reason and appointment history.
- [ ] Apply Admin-controlled access for former Amer.

### Phase 5: Rekod Amal and Tafakut

- [ ] Design Rekod Amal management.
- [ ] Allow Ahbab to update their Rekod Amal.
- [ ] Define Common Tafakut.
- [ ] Define Specific Tafakut for individual Takaza.
- [ ] Provide Admin interface to administer Tafakut.
- [ ] Implement the agreed criteria-selection process.
- [ ] Generate relevant Rekod Amal reports for each Takaza.

**Important:** Do not implement or assume eligibility rules until the Kawaif/Tafakut criteria and related business rules have been agreed.

### Phase 6: Takaza Reports and Comments

- [ ] Allow Amer Jemaah to create multiple free-form progress reports.
- [ ] Allow reports throughout the Takaza lifecycle, including after completion.
- [ ] Allow Admin, Amer Jemaah and participating Ahbab to comment.
- [ ] Restrict report editing to the report author.
- [ ] Restrict comment editing to the comment author.
- [ ] Preserve report and comment history where required.

### Phase 7: Frontend and User Experience

- [ ] Admin dashboard.
- [ ] Ahbab dashboard.
- [ ] Jemaah management screens.
- [ ] Takaza management screens.
- [ ] Rekod Amal and Tafakut screens.
- [ ] Reports and comments interface.
- [ ] Responsive mobile-friendly layout.

### Phase 8: Verification and Deployment

- [ ] Complete automated tests.
- [ ] Verify database migrations.
- [ ] Verify API authorization and access control.
- [ ] Conduct end-to-end testing.
- [ ] Create dedicated V2 production D1 database.
- [ ] Configure V2 production environment.
- [ ] Deploy V2 independently.
- [ ] Perform final operational verification.

---

## 4. Deferred Scope

### Case Management

**Status: ON HOLD**

Case Management is intentionally excluded from the current V2 implementation sequence. It should only be revisited when its requirements and relationship with the core JuhudManager workflow are clarified.

---

## 5. Development Rules

1. V1 and V2 remain isolated.
2. All V2 development takes place on the `develop` branch until a release is approved.
3. Do not deploy V2 against the V1 database or production resources.
4. Do not invent business rules where requirements have not been agreed.
5. Preserve historical records for important role and appointment changes.
6. Enforce authorization at the backend, not only in the frontend.
7. Complete and verify each development slice before moving to the next.
8. Update implementation status and documentation when a development milestone is completed.

---

## 6. Current Development Position

The V2 foundation, Amer appointment domain rules and initial authentication backend are implemented. Email OTP is supported; WhatsApp OTP is not. Current automated tests and the Wrangler dry-run build pass locally.

The next priority is controlled end-to-end testing of email registration, activation and login, including delivery-provider configuration. D1 has been inspected read-only, but migration history, concurrency behavior and production integration remain unverified. No remote migration or deployment was performed for this verification.

No V2 production deployment is claimed at this stage.

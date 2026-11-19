JuhudManager V2

Authentication & User Registration Specification

Version: 0.1 – Draft for Review
Date: 20 November 2026
Status: Design Phase

---

1. Objectives

Membangunkan sistem Authentication yang menyokong pengguna Malaysia dan antarabangsa dengan pelbagai kaedah login, pengesahan identiti, pendaftaran sendiri dan pendaftaran berbantukan Admin.

Prinsip utama:

- One individual = One User ID.
- Multiple login identities may belong to one user.
- Identity uniqueness must be enforced.
- Authentication and user profile are separate concerns.
- All sensitive administrative actions must be auditable.

2. Registration Methods

2.1 Self-Registration

Pengguna boleh mendaftar sendiri.

Maklumat wajib:

- Full name
- National ID / NRIC / equivalent national identity document
- Country code
- Email address
- WhatsApp number

Pengesahan:

- Email OTP
- WhatsApp OTP
- Identity uniqueness check

Akaun hanya diaktifkan selepas proses pengesahan yang ditetapkan selesai.

2.2 Foreign Users

Warga asing menggunakan proses yang sama.

National ID mengikut negara masing-masing.

Contoh:

- Malaysia: NATIONAL_ID + MY
- Indonesia: NATIONAL_ID + ID
- Singapore: NATIONAL_ID + SG

Email dan WhatsApp diwajibkan untuk self-registration.

Passport ialah identiti tambahan atau backup, bukan pengganti wajib kepada National ID dalam aliran pendaftaran ini.

2.3 Admin-Assisted Registration

Admin boleh membantu mendaftarkan individu yang tidak mempunyai email atau WhatsApp.

Ciri-ciri:

- Admin memasukkan maklumat pengguna.
- Admin mengesahkan identiti berdasarkan dokumen yang sesuai.
- Akaun menggunakan password authentication.
- Pengguna boleh menambah email atau WhatsApp kemudian.
- Permanent password tidak boleh diketahui atau dilihat oleh Admin.
- Gunakan temporary setup credential atau proses penetapan password yang selamat.

Semua tindakan direkodkan dalam audit log.

3. Login Methods

Method| Authentication
Email| OTP
WhatsApp| OTP
National ID / NRIC| Password
Passport| Password

Password merupakan pilihan tambahan untuk semua pengguna.

Pengguna OTP-only tidak diwajibkan menetapkan password.

Semua login methods mesti merujuk kepada satu "user_id".

4. Identity Management

Cadangan jadual: "user_auth_identities".

Column| Description
identity_id| Primary key
user_id| FK to users
identity_type| NATIONAL_ID, EMAIL, WHATSAPP, PASSPORT
country_code| Country of identity
identity_hash| Keyed hash for lookup
encrypted_value| Encrypted original value, where required
verification_status| PENDING, VERIFIED, REVOKED
verified_at| Verification timestamp
created_at| Creation timestamp
updated_at| Last update timestamp

4.1 Uniqueness

- National ID: unique by identity type, issuing country and identity hash.
- Passport: unique by identity type, issuing country and identity hash.
- Email: globally unique after normalization.
- WhatsApp: globally unique using E.164 normalization.

An identity already associated with another account cannot be registered again.

4.2 National ID Changes

- User cannot change National ID directly.
- User submits a request to Admin.
- Admin verifies the replacement document.
- Old identity is marked REVOKED.
- New identity is linked to the same "user_id".
- Change is recorded in "audit_logs".

4.3 Email and WhatsApp Changes

- User can initiate changes independently.
- New identity must pass OTP verification.
- Existing identity remains active until verification succeeds.
- Old identity is deactivated only after successful verification.
- Changes are recorded in "audit_logs".

4.4 Passport Changes

Passport can be added, replaced or revoked without changing the user's "user_id".

5. Password Policy

- Minimum 12 characters.
- Optional for all users.
- Password stored using a suitable password hashing algorithm, preferably Argon2id.
- No administrator can view a user's permanent password.
- Admin-assisted accounts use a secure temporary setup process.

6. OTP Policy

Setting| Initial Value
OTP length| 6 digits
Expiry| 5 minutes
Maximum attempts| 5
Resend cooldown| 60 seconds
Repeated failures| Temporary cooldown
New OTP issued| Previous OTP invalidated

OTP values must be stored as hashes.

Rate limiting and abuse prevention are required.

7. Session Policy

Setting| Policy
Idle timeout| 30 minutes
Maximum lifetime| 12 hours
Logout| Revoke current session
Logout all devices| Supported
Password change| Revoke other sessions
Account suspended| Revoke all sessions

Users can view active sessions/devices and terminate unfamiliar sessions.

8. Account Recovery

If a user loses access to all registered login methods:

- Admin becomes the final recovery channel.
- Admin verifies the user's identity.
- Recovery action must be auditable.
- Recovery must not expose or disclose the existing password.
- A secure credential reset or setup process is required.

9. Proposed Database Structure

Existing foundation tables remain unchanged.

Proposed new tables:

Table| Responsibility
user_auth_identities| Login and identity records
user_credentials| Password hashes and credential status
auth_otp_requests| OTP lifecycle and verification
user_sessions| Active and revoked sessions
auth_events| Authentication and security events

Existing "users" remains the main user account table.

Existing "audit_logs" remains the audit record for administrative and business changes.

10. Proposed API Endpoints

Endpoint| Purpose
POST /auth/register| Self-registration
POST /auth/otp/request| Request OTP
POST /auth/otp/verify| Verify OTP
POST /auth/login/otp| OTP login initiation
POST /auth/login/password| Password login
POST /auth/logout| Logout
POST /auth/logout-all| Revoke all sessions
POST /auth/refresh| Refresh session
GET /auth/sessions| View active sessions
DELETE /auth/sessions/:id| Revoke selected session
POST /auth/recovery| Account recovery request
POST /auth/identity/change| Request identity/contact change
POST /admin/users/register| Admin-assisted registration
POST /admin/users/:id/recovery| Admin-assisted account recovery

All protected endpoints must enforce authentication and authorization.

11. Security Requirements

- Use HTTPS.
- Store passwords using secure password hashing.
- Use keyed HMAC for sensitive identity lookup.
- Encrypt sensitive identity values that must be recoverable.
- Never store plaintext OTP.
- Use cryptographically secure random tokens.
- Store session token hashes rather than raw tokens.
- Implement rate limits and temporary lockouts.
- Prevent account enumeration.
- Record important authentication and identity events.
- Apply least-privilege access controls.
- Never expose sensitive identity values in logs or API responses.

12. Implementation Sequence

1. Finalize database schema.
2. Review and approve SQL design.
3. Create "0002_authentication.sql".
4. Apply migration to V2 D1 only when explicitly approved.
5. Implement Authentication API.
6. Implement registration and login workflows.
7. Implement session management.
8. Implement account recovery.
9. Test using dummy accounts and data.
10. Security review before production readiness.

13. Scope Restrictions

- V1 remains untouched.
- Existing V2 foundation migration remains unchanged.
- Existing V2 API is not deployed as part of this design approval.
- No real user information is to be inserted during development.
- No production activation without explicit approval.

---

End of Draft Specification

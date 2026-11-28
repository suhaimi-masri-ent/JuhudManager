import { json } from "../../lib/http.js";
import { decryptValue } from "../../auth/crypto.js";

export async function getProfile({
  db,
  env,
  userId,
  accessLevel
}) {
  const user = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name AS account_full_name,
       u.email,
       u.account_status,
       u.created_at,
       u.updated_at,

       p.full_name AS profile_full_name,
       p.date_of_birth,
       p.gender,
       p.marital_status,
       p.employment_status,

       p.address_line1,
       p.address_line2,
       p.city,
       p.state_region,
       p.postal_code,
       p.country_id,

       c.country_name,

       p.created_at AS profile_created_at,
       p.updated_at AS profile_updated_at

     FROM users u

     LEFT JOIN user_profiles p
       ON p.user_id = u.user_id

     LEFT JOIN countries c
       ON c.country_id = p.country_id

     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (!user) {
    const error = new Error("User account not found.");
    error.status = 404;
    throw error;
  }

  const whatsapp = await db.prepare(
    `SELECT encrypted_value
     FROM user_auth_identities
     WHERE user_id = ?1
       AND identity_type = 'WHATSAPP'
       AND verification_status = 'VERIFIED'
     ORDER BY verified_at DESC, created_at DESC
     LIMIT 1`
  ).bind(userId).first();

  let verifiedWhatsApp = null;

  if (whatsapp?.encrypted_value) {
    verifiedWhatsApp = await decryptValue(
      env.ENCRYPTION_KEY,
      whatsapp.encrypted_value
    );
  }

  return json({
    ok: true,
    profile: {
      userId: user.user_id,

      fullName:
        user.profile_full_name ?? user.account_full_name,

      dateOfBirth: user.date_of_birth ?? null,

      gender: user.gender ?? null,
      maritalStatus: user.marital_status ?? null,
      employmentStatus: user.employment_status ?? null,

      email: user.email,
      whatsapp: verifiedWhatsApp,
      accountStatus: user.account_status,
      accessLevel,

      addressLine1: user.address_line1 ?? null,
      addressLine2: user.address_line2 ?? null,
      city: user.city ?? null,
      stateRegion: user.state_region ?? null,
      postalCode: user.postal_code ?? null,
      countryId: user.country_id ?? null,
      countryName: user.country_name ?? null,

      createdAt:
        user.profile_created_at ?? user.created_at,

      updatedAt:
        user.profile_updated_at ?? user.updated_at
    }
  });
}

export async function getProfileCountries(db) {
  const result = await db.prepare(
    `SELECT
       country_id,
       country_code,
       country_name
     FROM countries
     WHERE country_status = 'ACTIVE'
     ORDER BY country_name COLLATE NOCASE`
  ).all();

  return json({
    ok: true,
    countries: result?.results ?? []
  });
}

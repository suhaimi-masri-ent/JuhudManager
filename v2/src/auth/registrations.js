
import {
  encryptValue,
  hashValue,
  normalizeDestination
} from "./crypto.js";

import {
  reservePendingIdentity
} from "./identity-reservations.js";

const REGISTRATION_RESERVATION_MINUTES = 15;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeNationalId(value) {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (!normalized || normalized.length > 100) {
    throw httpError("A valid National ID is required.", 400);
  }

  return normalized;
}

function validateRegistrationInput({
  fullName,
  countryCode,
  nationalId,
  email,
  whatsapp
}) {
  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    fullName.trim().length > 150
  ) {
    throw httpError("A valid full name is required.", 400);
  }

  if (
    typeof countryCode !== "string" ||
    !/^[A-Za-z]{2}$/.test(countryCode.trim())
  ) {
    throw httpError(
      "A valid two-letter issuing country code is required.",
      400
    );
  }

  normalizeNationalId(nationalId);

  try {
    normalizeDestination("EMAIL", email);
  } catch (error) {
    throw httpError(error.message, 400);
  }

  try {
    normalizeDestination("WHATSAPP", whatsapp);
  } catch (error) {
    throw httpError(error.message, 400);
  }
}

async function prepareDurableIdentity({
  env,
  userId,
  identityType,
  identityValue,
  countryCode
}) {
  const identityScope = identityType === "NATIONAL_ID"
    ? countryCode
    : "GLOBAL";

  const normalized = identityType === "NATIONAL_ID"
    ? normalizeNationalId(identityValue)
    : normalizeDestination("WHATSAPP", identityValue);

  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `${identityType}:${identityScope}:${normalized}`
  );

  const encryptedValue = await encryptValue(
    env.ENCRYPTION_KEY,
    normalized
  );

  return {
    detailId: crypto.randomUUID(),
    userId,
    identityType,
    countryCode: identityType === "NATIONAL_ID"
      ? countryCode
      : null,
    identityScope,
    identityHash,
    encryptedValue
  };
}

async function cleanupFailedRegistration(db, userId) {
  await db.batch([
    db.prepare(
      `DELETE FROM user_auth_identities
       WHERE user_id = ?1`
    ).bind(userId),

    db.prepare(
      `DELETE FROM user_registration_identity_details
       WHERE user_id = ?1`
    ).bind(userId),

    db.prepare(
      `DELETE FROM user_registration_reviews
       WHERE user_id = ?1`
    ).bind(userId),

    db.prepare(
      `DELETE FROM users
       WHERE user_id = ?1
         AND account_status = 'DISABLED'`
    ).bind(userId)
  ]);
}

/**
 * Create a provisional registration.
 *
 * Registration requirements:
 * - Full name
 * - Issuing country
 * - National ID
 * - Email
 * - WhatsApp
 *
 * Identity handling:
 * - Email: temporary 15-minute PENDING reservation.
 * - National ID: durable encrypted UNVERIFIED claim.
 * - WhatsApp: durable encrypted UNVERIFIED claim.
 *
 * Only email OTP verification is enabled.
 * Account remains DISABLED until Admin approval.
 */
export async function createRegistrationDraft({
  db,
  env,
  fullName,
  countryCode,
  nationalId,
  email,
  whatsapp
}) {
  validateRegistrationInput({
    fullName,
    countryCode,
    nationalId,
    email,
    whatsapp
  });

  if (!env.HMAC_SECRET || !env.ENCRYPTION_KEY) {
    throw new Error(
      "Registration security secrets are not configured."
    );
  }

  const userId = crypto.randomUUID();
  const normalizedCountry = countryCode.trim().toUpperCase();
  const normalizedEmail = normalizeDestination("EMAIL", email);
  const normalizedWhatsApp = normalizeDestination(
    "WHATSAPP",
    whatsapp
  );
  const normalizedNationalId = normalizeNationalId(nationalId);

  const nationalIdDetail = await prepareDurableIdentity({
    env,
    userId,
    identityType: "NATIONAL_ID",
    identityValue: normalizedNationalId,
    countryCode: normalizedCountry
  });

  const whatsappDetail = await prepareDurableIdentity({
    env,
    userId,
    identityType: "WHATSAPP",
    identityValue: normalizedWhatsApp,
    countryCode: null
  });

  try {
    // Create the user, review lifecycle and durable identity
    // claims together before creating the temporary email claim.
    await db.batch([
      db.prepare(
        `INSERT INTO users (
           user_id,
           full_name,
           email,
           account_status
         )
         VALUES (?1, ?2, NULL, 'DISABLED')`
      ).bind(
        userId,
        fullName.trim()
      ),

      db.prepare(
        `INSERT INTO user_registration_reviews (
           user_id,
           registration_status
         )
         VALUES (?1, 'AWAITING_EMAIL_VERIFICATION')`
      ).bind(userId),

      db.prepare(
        `INSERT INTO user_registration_identity_details (
           detail_id,
           user_id,
           identity_type,
           country_code,
           identity_scope,
           identity_hash,
           hash_key_version,
           encrypted_value,
           identity_status
         )
         VALUES (
           ?1, ?2, 'NATIONAL_ID', ?3, ?4, ?5, 1, ?6, 'UNVERIFIED'
         )`
      ).bind(
        nationalIdDetail.detailId,
        userId,
        nationalIdDetail.countryCode,
        nationalIdDetail.identityScope,
        nationalIdDetail.identityHash,
        nationalIdDetail.encryptedValue
      ),

      db.prepare(
        `INSERT INTO user_registration_identity_details (
           detail_id,
           user_id,
           identity_type,
           country_code,
           identity_scope,
           identity_hash,
           hash_key_version,
           encrypted_value,
           identity_status
         )
         VALUES (
           ?1, ?2, 'WHATSAPP', NULL, 'GLOBAL', ?3, 1, ?4, 'UNVERIFIED'
         )`
      ).bind(
        whatsappDetail.detailId,
        userId,
        whatsappDetail.identityHash,
        whatsappDetail.encryptedValue
      )
    ]);

    // Email is the only identity using the temporary
    // 15-minute reservation mechanism.
    const emailReservation = await reservePendingIdentity({
      db,
      env,
      userId,
      identityType: "EMAIL",
      identityValue: normalizedEmail
    });

    return {
      userId,
      accountStatus: "DISABLED",
      registrationStatus: "AWAITING_EMAIL_VERIFICATION",
      reservationMinutes: REGISTRATION_RESERVATION_MINUTES,
      identities: {
        nationalId: {
          detailId: nationalIdDetail.detailId,
          status: "UNVERIFIED",
          expiresAt: null
        },
        email: {
          identityId: emailReservation.identityId,
          status: emailReservation.status,
          expiresAt: emailReservation.expiresAt
        },
        whatsapp: {
          detailId: whatsappDetail.detailId,
          status: "UNVERIFIED",
          expiresAt: null
        }
      },
      nextStep: "REQUEST_EMAIL_OTP"
    };
  } catch (error) {
    await cleanupFailedRegistration(db, userId);

    const message = String(error?.message ?? "");

    if (
      message.includes("UNIQUE constraint failed") ||
      message.includes("constraint failed")
    ) {
      throw httpError(
        "One of the supplied identities is already registered or reserved.",
        409
      );
    }

    throw error;
  }
}

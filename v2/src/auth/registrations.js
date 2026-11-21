
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

function normalizeFullName(value) {
  return String(value ?? "").trim().toUpperCase();
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
 * Email uses a temporary 15-minute reservation.
 * National ID and WhatsApp use durable UNVERIFIED claims.
 * Only email OTP verification is enabled.
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
  const normalizedName = normalizeFullName(fullName);
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
        normalizedName
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

/**
 * Resume an incomplete registration.
 *
 * All submitted details must match the original registration.
 * This function never creates a new user or replaces an email.
 *
 * The email must already exist in user_auth_identities for
 * the same user, with PENDING or EXPIRED status.
 *
 * An expired email reservation can be renewed for 15 minutes.
 * Durable National ID and WhatsApp claims are never released.
 */
export async function resumeRegistrationDraft({
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

  const normalizedCountry = countryCode.trim().toUpperCase();
  const normalizedName = normalizeFullName(fullName);
  const normalizedNationalId = normalizeNationalId(nationalId);
  const normalizedEmail = normalizeDestination("EMAIL", email);
  const normalizedWhatsApp = normalizeDestination(
    "WHATSAPP",
    whatsapp
  );

  const nationalIdHash = await hashValue(
    env.HMAC_SECRET,
    `NATIONAL_ID:${normalizedCountry}:${normalizedNationalId}`
  );

  const whatsappHash = await hashValue(
    env.HMAC_SECRET,
    `WHATSAPP:GLOBAL:${normalizedWhatsApp}`
  );

  const emailHash = await hashValue(
    env.HMAC_SECRET,
    `EMAIL:GLOBAL:${normalizedEmail}`
  );

  // Find the original draft only when every submitted identity
  // belongs to the same user and the review is still awaiting email.
  //
  // Name comparison is case-insensitive to support older drafts
  // whose names were saved before uppercase normalization.
  const draft = await db.prepare(
    `SELECT
       u.user_id
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE LOWER(TRIM(u.full_name)) = LOWER(TRIM(?1))
       AND u.account_status = 'DISABLED'
       AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'

       AND EXISTS (
         SELECT 1
         FROM user_registration_identity_details n
         WHERE n.user_id = u.user_id
           AND n.identity_type = 'NATIONAL_ID'
           AND n.identity_scope = ?2
           AND n.identity_hash = ?3
           AND n.identity_status = 'UNVERIFIED'
       )

       AND EXISTS (
         SELECT 1
         FROM user_registration_identity_details w
         WHERE w.user_id = u.user_id
           AND w.identity_type = 'WHATSAPP'
           AND w.identity_scope = 'GLOBAL'
           AND w.identity_hash = ?4
           AND w.identity_status = 'UNVERIFIED'
       )

       AND EXISTS (
         SELECT 1
         FROM user_auth_identities e
         WHERE e.user_id = u.user_id
           AND e.identity_type = 'EMAIL'
           AND e.identity_scope = 'GLOBAL'
           AND e.identity_hash = ?5
           AND e.verification_status IN ('PENDING', 'EXPIRED')
       )

     LIMIT 1`
  ).bind(
    normalizedName,
    normalizedCountry,
    nationalIdHash,
    whatsappHash,
    emailHash
  ).first();

  // Use the same generic response for every non-matching case.
  // Do not reveal whether any particular identity exists.
  if (!draft?.user_id) {
    throw httpError(
      "Unable to resume this registration. Please check the details or contact Admin.",
      404
    );
  }

  // Reuse an existing valid reservation or create a fresh
  // 15-minute reservation if the previous one has expired.
  // No durable identity or registration record is deleted here.
  let emailReservation;

  try {
    emailReservation = await reservePendingIdentity({
      db,
      env,
      userId: draft.user_id,
      identityType: "EMAIL",
      identityValue: normalizedEmail
    });
  } catch {
    throw httpError(
      "Unable to resume this registration. Please check the details or contact Admin.",
      404
    );
  }

  if (emailReservation.status !== "PENDING") {
    throw httpError(
      "Unable to resume this registration. Please check the details or contact Admin.",
      404
    );
  }

  return {
    userId: draft.user_id,
    accountStatus: "DISABLED",
    registrationStatus: "AWAITING_EMAIL_VERIFICATION",
    reservationMinutes: REGISTRATION_RESERVATION_MINUTES,
    identities: {
      email: {
        identityId: emailReservation.identityId,
        status: emailReservation.status,
        expiresAt: emailReservation.expiresAt
      }
    },
    nextStep: "REQUEST_EMAIL_OTP",
    resumed: true
  };
}

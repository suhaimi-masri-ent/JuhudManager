
import { reservePendingIdentity } from "./identity-reservations.js";

const REGISTRATION_RESERVATION_MINUTES = 15;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
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
    throw httpError(
      "A valid full name is required.",
      400
    );
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

  if (
    typeof nationalId !== "string" ||
    !nationalId.trim()
  ) {
    throw httpError(
      "National ID is required.",
      400
    );
  }

  if (
    typeof email !== "string" ||
    !email.trim()
  ) {
    throw httpError(
      "Email address is required.",
      400
    );
  }

  if (
    typeof whatsapp !== "string" ||
    !whatsapp.trim()
  ) {
    throw httpError(
      "WhatsApp number is required.",
      400
    );
  }
}

/**
 * Create a provisional registration.
 *
 * The user remains DISABLED until the complete registration
 * verification and account activation process is implemented.
 *
 * Required identities:
 * - NATIONAL_ID
 * - EMAIL
 * - WHATSAPP
 *
 * Each identity receives its own 15-minute reservation.
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

  const userId = crypto.randomUUID();
  const normalizedCountry = countryCode.trim().toUpperCase();

  // Do not populate users.email yet.
  // The email is stored on the identity reservation and
  // must only be assigned to users.email after verification.
  await db.prepare(
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
  ).run();

  try {
    const nationalIdReservation = await reservePendingIdentity({
      db,
      env,
      userId,
      identityType: "NATIONAL_ID",
      identityValue: nationalId,
      countryCode: normalizedCountry
    });

    const emailReservation = await reservePendingIdentity({
      db,
      env,
      userId,
      identityType: "EMAIL",
      identityValue: email
    });

    const whatsappReservation = await reservePendingIdentity({
      db,
      env,
      userId,
      identityType: "WHATSAPP",
      identityValue: whatsapp
    });

    return {
      userId,
      accountStatus: "DISABLED",
      reservationMinutes: REGISTRATION_RESERVATION_MINUTES,
      identities: {
        nationalId: {
          identityId: nationalIdReservation.identityId,
          status: nationalIdReservation.status,
          expiresAt: nationalIdReservation.expiresAt
        },
        email: {
          identityId: emailReservation.identityId,
          status: emailReservation.status,
          expiresAt: emailReservation.expiresAt
        },
        whatsapp: {
          identityId: whatsappReservation.identityId,
          status: whatsappReservation.status,
          expiresAt: whatsappReservation.expiresAt
        }
      },
      nextStep: "REQUEST_EMAIL_AND_WHATSAPP_OTP"
    };
  } catch (error) {
    // No OTP is sent by this function. Therefore, if any
    // reservation fails, the provisional user and its
    // pending identities can be safely removed.
    await db.batch([
      db.prepare(
        `DELETE FROM user_auth_identities
         WHERE user_id = ?
           AND verification_status = 'PENDING'`
      ).bind(userId),

      db.prepare(
        `DELETE FROM users
         WHERE user_id = ?
           AND account_status = 'DISABLED'
           AND email IS NULL`
      ).bind(userId)
    ]);

    throw error;
  }
}

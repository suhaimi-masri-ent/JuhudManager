
import {
  encryptValue,
  hashValue,
  normalizeDestination
} from "./crypto.js";

const PENDING_RESERVATION_MINUTES = 15;

const IDENTITY_TYPES = new Set([
  "NATIONAL_ID",
  "EMAIL",
  "WHATSAPP",
  "PASSPORT"
]);

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function reservationExpiry(now) {
  return new Date(
    now.getTime() + PENDING_RESERVATION_MINUTES * 60 * 1000
  ).toISOString();
}

function normalizeIdentity(type, value) {
  if (!IDENTITY_TYPES.has(type)) {
    throw httpError("Unsupported identity type.", 400);
  }

  if (type === "EMAIL" || type === "WHATSAPP") {
    try {
      return normalizeDestination(type, value);
    } catch (error) {
      throw httpError(error.message, 400);
    }
  }

  const normalized = String(value ?? "").trim().toUpperCase();

  if (!normalized || normalized.length > 100) {
    throw httpError("A valid identity value is required.", 400);
  }

  return normalized;
}

function resolveScope(type, countryCode) {
  if (type === "EMAIL" || type === "WHATSAPP") {
    if (countryCode) {
      throw httpError(
        "Email and WhatsApp identities must use GLOBAL scope.",
        400
      );
    }

    return {
      countryCode: null,
      identityScope: "GLOBAL"
    };
  }

  const country = String(countryCode ?? "").trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    throw httpError(
      "A valid two-letter issuing country code is required.",
      400
    );
  }

  return {
    countryCode: country,
    identityScope: country
  };
}

function requireIdentitySecrets(env) {
  if (!env.HMAC_SECRET || !env.ENCRYPTION_KEY) {
    throw new Error("Identity security secrets are not configured.");
  }
}

async function prepareIdentity({
  env,
  identityType,
  identityValue,
  countryCode
}) {
  requireIdentitySecrets(env);

  const normalized = normalizeIdentity(identityType, identityValue);
  const scope = resolveScope(identityType, countryCode);

  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `${identityType}:${scope.identityScope}:${normalized}`
  );

  const encryptedValue = await encryptValue(
    env.ENCRYPTION_KEY,
    normalized
  );

  return {
    identityType,
    identityScope: scope.identityScope,
    countryCode: scope.countryCode,
    normalized,
    identityHash,
    encryptedValue
  };
}

export async function expirePendingIdentityReservations({
  db,
  identityType,
  identityScope,
  identityHash
}) {
  const currentTime = nowIso();

  let query = `
    UPDATE user_auth_identities
    SET
      verification_status = 'EXPIRED',
      updated_at = ?1
    WHERE verification_status = 'PENDING'
      AND expires_at <= ?1
  `;

  const bindings = [currentTime];

  if (identityType) {
    query += " AND identity_type = ?";
    bindings.push(identityType);
  }

  if (identityScope) {
    query += " AND identity_scope = ?";
    bindings.push(identityScope);
  }

  if (identityHash) {
    query += " AND identity_hash = ?";
    bindings.push(identityHash);
  }

  const result = await db.prepare(query).bind(...bindings).run();

  return {
    expiredCount: result?.meta?.changes ?? 0
  };
}

/**
 * Reserve an identity for one user for 15 minutes.
 *
 * Email reservations also check users.email because
 * bootstrap accounts may have an email before an
 * EMAIL identity record exists.
 */
export async function reservePendingIdentity({
  db,
  env,
  userId,
  identityType,
  identityValue,
  countryCode
}) {
  if (!userId || typeof userId !== "string") {
    throw httpError("A valid user ID is required.", 400);
  }

  const identity = await prepareIdentity({
    env,
    identityType,
    identityValue,
    countryCode
  });

  const currentTime = new Date();
  const currentIso = currentTime.toISOString();
  const expiresAt = reservationExpiry(currentTime);

  await expirePendingIdentityReservations({
    db,
    identityType: identity.identityType,
    identityScope: identity.identityScope,
    identityHash: identity.identityHash
  });

  // Check the legacy/direct email field first.
  // A different user already owning this email blocks reservation.
  if (identity.identityType === "EMAIL") {
    const existingUserEmail = await db.prepare(
      `SELECT user_id
       FROM users
       WHERE lower(trim(email)) = lower(?1)
       LIMIT 1`
    ).bind(identity.normalized).first();

    if (
      existingUserEmail &&
      existingUserEmail.user_id !== userId
    ) {
      throw httpError(
        "This identity is already reserved or registered.",
        409
      );
    }
  }

  const existing = await db.prepare(
    `SELECT
       identity_id,
       user_id,
       verification_status,
       expires_at
     FROM user_auth_identities
     WHERE identity_type = ?1
       AND identity_scope = ?2
       AND identity_hash = ?3
       AND verification_status IN ('PENDING', 'VERIFIED')
     LIMIT 1`
  ).bind(
    identity.identityType,
    identity.identityScope,
    identity.identityHash
  ).first();

  if (existing) {
    if (existing.user_id !== userId) {
      throw httpError(
        "This identity is already reserved or registered.",
        409
      );
    }

    if (existing.verification_status === "VERIFIED") {
      return {
        identityId: existing.identity_id,
        status: "VERIFIED",
        expiresAt: null,
        alreadyVerified: true
      };
    }

    return {
      identityId: existing.identity_id,
      status: "PENDING",
      expiresAt: existing.expires_at,
      alreadyReserved: true
    };
  }

  const identityId = crypto.randomUUID();

  try {
    await db.prepare(
      `INSERT INTO user_auth_identities (
         identity_id,
         user_id,
         identity_type,
         country_code,
         identity_scope,
         identity_hash,
         hash_key_version,
         encrypted_value,
         verification_status,
         expires_at,
         created_at,
         updated_at
       )
       VALUES (
         ?1, ?2, ?3, ?4, ?5, ?6, 1, ?7, 'PENDING', ?8, ?9, ?9
       )`
    ).bind(
      identityId,
      userId,
      identity.identityType,
      identity.countryCode,
      identity.identityScope,
      identity.identityHash,
      identity.encryptedValue,
      expiresAt,
      currentIso
    ).run();
  } catch {
    throw httpError(
      "This identity is already reserved or registered.",
      409
    );
  }

  return {
    identityId,
    status: "PENDING",
    expiresAt,
    reservationMinutes: PENDING_RESERVATION_MINUTES
  };
}

export async function verifyPendingIdentity({
  db,
  identityId,
  userId
}) {
  if (!identityId || !userId) {
    throw httpError(
      "Identity ID and user ID are required.",
      400
    );
  }

  const currentTime = nowIso();

  const verified = await db.prepare(
    `UPDATE user_auth_identities
     SET
       verification_status = 'VERIFIED',
       verified_at = ?1,
       expires_at = NULL,
       updated_at = ?1
     WHERE identity_id = ?2
       AND user_id = ?3
       AND verification_status = 'PENDING'
       AND expires_at > ?1
     RETURNING identity_id`
  ).bind(
    currentTime,
    identityId,
    userId
  ).first();

  if (!verified) {
    throw httpError(
      "Identity reservation is invalid or expired.",
      409
    );
  }

  return {
    identityId: verified.identity_id,
    status: "VERIFIED",
    verifiedAt: currentTime
  };
}

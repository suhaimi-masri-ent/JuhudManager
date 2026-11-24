import { json } from "../lib/http.js";
import { authenticateSession } from "../auth/sessions.js";
import { decryptValue } from "../auth/crypto.js";

const MAX_BODY_BYTES = 4096;

const ADDRESS_FIELDS = [
  "addressLine1",
  "addressLine2",
  "city",
  "stateRegion",
  "postalCode",
  "countryId"
];

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization");

  if (typeof authorization !== "string") return null;

  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{43})$/);
  return match ? match[1] : null;
}

async function requireProfileSession(request, env) {
  const token = getBearerToken(request);

  if (!token) {
    throw httpError("A valid Bearer token is required.", 401);
  }

  const session = await authenticateSession({
    db: env.DB,
    env,
    token
  });

  if (!session) {
    throw httpError("Invalid or expired session.", 401);
  }

  if (!["FULL", "LIMITED"].includes(session.accessLevel)) {
    throw httpError("Profile access is not permitted.", 403);
  }

  return session;
}

async function readJson(request) {
  const raw = await request.text();

  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw httpError("Request body is too large.", 413);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }
}

function validateFullName(value) {
  if (typeof value !== "string") {
    throw httpError("Full name must be a string.", 400);
  }

  const fullName = value.trim();

  if (fullName.length < 2 || fullName.length > 150) {
    throw httpError(
      "Full name must contain between 2 and 150 characters.",
      400
    );
  }

  return fullName;
}

function validateDateOfBirth(value) {
  if (value === null) return null;

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw httpError(
      "Date of birth must use YYYY-MM-DD format or null.",
      400
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw httpError("Invalid date of birth.", 400);
  }

  if (value > new Date().toISOString().slice(0, 10)) {
    throw httpError("Date of birth cannot be in the future.", 400);
  }

  return value;
}

function normalizeAddressText(value, field, maxLength) {
  if (value === null || value === "") return null;

  if (typeof value !== "string") {
    throw httpError(`${field} must be a string or null.`, 400);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw httpError(`${field} is too long.`, 400);
  }

  return normalized || null;
}

function getAddressFromRow(row) {
  return {
    addressLine1: row.address_line1 ?? null,
    addressLine2: row.address_line2 ?? null,
    city: row.city ?? null,
    stateRegion: row.state_region ?? null,
    postalCode: row.postal_code ?? null,
    countryId: row.country_id ?? null
  };
}

function addressHasContent(address) {
  return ADDRESS_FIELDS.some(field => Boolean(address[field]));
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  return json({
    error: status === 500
      ? "Profile service unavailable."
      : error.message
  }, status);
}

/*
 * Existing profile write eligibility rules.
 * Do not simplify or remove the LIMITED assisted-recovery checks.
 */
function getWriteEligibilitySql(userIdParameter, accessLevel) {
  if (accessLevel === "FULL") {
    return `
      EXISTS (
        SELECT 1
        FROM users u
        WHERE u.user_id = ${userIdParameter}
          AND u.account_status = 'ACTIVE'
      )
    `;
  }

  return `
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN user_registration_reviews r
        ON r.user_id = u.user_id
      WHERE u.user_id = ${userIdParameter}
        AND u.account_status = 'DISABLED'
        AND r.registration_status IN (
          'AWAITING_EMAIL_VERIFICATION',
          'PENDING_REVIEW'
        )
        AND r.admin_assisted_recovery_at IS NOT NULL
        AND r.admin_assisted_recovery_by IS NOT NULL
        AND r.admin_assisted_recovery_method IS NOT NULL

        AND EXISTS (
          SELECT 1
          FROM user_auth_identities i
          WHERE i.user_id = u.user_id
            AND i.identity_type = 'EMAIL'
            AND i.identity_scope = 'GLOBAL'
            AND (
              (
                r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
                AND i.verification_status = 'PENDING'
                AND i.verified_at IS NULL
              )
              OR
              (
                r.registration_status = 'PENDING_REVIEW'
                AND i.verification_status = 'VERIFIED'
                AND i.verified_at IS NOT NULL
                AND i.expires_at IS NULL
              )
            )
        )

        AND EXISTS (
          SELECT 1
          FROM user_credentials c
          WHERE c.user_id = u.user_id
            AND c.credential_type = 'PASSWORD'
            AND c.revoked_at IS NULL
        )

        AND (
          SELECT COUNT(*)
          FROM user_registration_identity_details n
          WHERE n.user_id = u.user_id
            AND n.identity_type = 'NATIONAL_ID'
            AND n.identity_status = 'UNVERIFIED'
        ) = 1

        AND (
          SELECT COUNT(*)
          FROM user_registration_identity_details w
          WHERE w.user_id = u.user_id
            AND w.identity_type = 'WHATSAPP'
            AND w.identity_status = 'UNVERIFIED'
        ) = 1
    )
  `;
}

async function getProfile({ db, env, userId, accessLevel }) {
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
    throw httpError("User account not found.", 404);
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
      fullName: user.profile_full_name ?? user.account_full_name,
      dateOfBirth: user.date_of_birth,
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

      createdAt: user.profile_created_at ?? user.created_at,
      updatedAt: user.profile_updated_at ?? user.updated_at
    }
  });
}

async function getProfileCountries(db) {
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

async function updateProfile({
  db,
  userId,
  accessLevel,
  body
}) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw httpError("A valid JSON object is required.", 400);
  }

  const allowedFields = [
    "fullName",
    "dateOfBirth",
    ...ADDRESS_FIELDS
  ];

  const suppliedFields = Object.keys(body);

  if (
    suppliedFields.length === 0 ||
    suppliedFields.some(field => !allowedFields.includes(field))
  ) {
    throw httpError("One or more profile fields are invalid.", 400);
  }

  const hasAddressUpdate = ADDRESS_FIELDS.some(
    field => Object.hasOwn(body, field)
  );

  /*
   * Address changes are FULL-only.
   * LIMITED users retain their existing name/date-of-birth
   * update eligibility, but cannot update residential address.
   */
  if (hasAddressUpdate && accessLevel !== "FULL") {
    throw httpError(
      "Your account does not have permission to update its address.",
      403
    );
  }

  const current = await db.prepare(
    `SELECT
       u.full_name AS account_full_name,
       p.full_name AS profile_full_name,
       p.date_of_birth,
       p.address_line1,
       p.address_line2,
       p.city,
       p.state_region,
       p.postal_code,
       p.country_id
     FROM users u
     LEFT JOIN user_profiles p
       ON p.user_id = u.user_id
     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (!current) {
    throw httpError("User account not found.", 404);
  }

  const fullName = Object.hasOwn(body, "fullName")
    ? validateFullName(body.fullName)
    : current.profile_full_name ?? current.account_full_name;

  const dateOfBirth = Object.hasOwn(body, "dateOfBirth")
    ? validateDateOfBirth(body.dateOfBirth)
    : current.date_of_birth;

  const currentAddress = getAddressFromRow(current);

  const address = hasAddressUpdate
    ? {
        addressLine1: Object.hasOwn(body, "addressLine1")
          ? normalizeAddressText(body.addressLine1, "Address line 1", 200)
          : currentAddress.addressLine1,

        addressLine2: Object.hasOwn(body, "addressLine2")
          ? normalizeAddressText(body.addressLine2, "Address line 2", 200)
          : currentAddress.addressLine2,

        city: Object.hasOwn(body, "city")
          ? normalizeAddressText(body.city, "City", 100)
          : currentAddress.city,

        stateRegion: Object.hasOwn(body, "stateRegion")
          ? normalizeAddressText(body.stateRegion, "State / region", 100)
          : currentAddress.stateRegion,

        postalCode: Object.hasOwn(body, "postalCode")
          ? normalizeAddressText(body.postalCode, "Postal code", 20)
          : currentAddress.postalCode,

        countryId: Object.hasOwn(body, "countryId")
          ? normalizeAddressText(body.countryId, "Country ID", 2)
          : currentAddress.countryId
      }
    : currentAddress;

  if (address.countryId) {
    if (!/^[A-Z]{2}$/.test(address.countryId)) {
      throw httpError("Invalid country ID.", 400);
    }

    const country = await db.prepare(
      `SELECT country_id
       FROM countries
       WHERE country_id = ?1
         AND country_status = 'ACTIVE'
       LIMIT 1`
    ).bind(address.countryId).first();

    if (!country) {
      throw httpError("Selected country is not active.", 400);
    }
  }

  if (
    addressHasContent(address) &&
    (
      !address.addressLine1 ||
      !address.city ||
      !address.countryId
    )
  ) {
    throw httpError(
      "Address line 1, city and country are required when providing an address.",
      400
    );
  }

  const addressChanged =
    JSON.stringify(currentAddress) !== JSON.stringify(address);

  const now = new Date().toISOString();

  const before = {
    fullName: current.profile_full_name ?? current.account_full_name,
    dateOfBirth: current.date_of_birth
  };

  const after = {
    fullName,
    dateOfBirth
  };

  const profileEligibility = getWriteEligibilitySql(
    "?1",
    accessLevel
  );

  const userEligibility = getWriteEligibilitySql(
    "?3",
    accessLevel
  );

  const auditEligibility = getWriteEligibilitySql(
    "?2",
    accessLevel
  );

  const eligibilityCheck = await db.prepare(
    `SELECT CASE
       WHEN ${profileEligibility} THEN 1
       ELSE 0
     END AS allowed`
  ).bind(userId).first();

  if (eligibilityCheck?.allowed !== 1) {
    throw httpError(
      "This account is not eligible to update its profile.",
      403
    );
  }

  const statements = [];

  /*
   * Upsert profile data.
   * Existing fields are retained when not supplied.
   */
  statements.push(
    db.prepare(
      `INSERT INTO user_profiles (
         user_id,
         full_name,
         date_of_birth,
         address_line1,
         address_line2,
         city,
         state_region,
         postal_code,
         country_id,
         created_at,
         updated_at
       )
       SELECT
         ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10
       WHERE ${profileEligibility}
       ON CONFLICT(user_id) DO UPDATE SET
         full_name = excluded.full_name,
         date_of_birth = excluded.date_of_birth,
         address_line1 = excluded.address_line1,
         address_line2 = excluded.address_line2,
         city = excluded.city,
         state_region = excluded.state_region,
         postal_code = excluded.postal_code,
         country_id = excluded.country_id,
         updated_at = excluded.updated_at`
    ).bind(
      userId,
      fullName,
      dateOfBirth,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.stateRegion,
      address.postalCode,
      address.countryId,
      now
    )
  );

  let historyIndex = null;
  let addressAuditIndex = null;

  if (hasAddressUpdate && addressChanged) {
    const previousAddressJson = addressHasContent(currentAddress)
      ? JSON.stringify(currentAddress)
      : null;

    const newAddressJson = JSON.stringify(address);

    /*
     * Store address history only when the profile update
     * and the same eligibility condition are valid.
     */
    historyIndex = statements.length;

    statements.push(
      db.prepare(
        `INSERT INTO user_profile_address_history (
           history_id,
           user_id,
           changed_by,
           previous_address_json,
           new_address_json,
           changed_at
         )
         SELECT ?1, ?2, ?2, ?3, ?4, ?5
         WHERE ${profileEligibility}`
      ).bind(
        crypto.randomUUID(),
        userId,
        previousAddressJson,
        newAddressJson,
        now
      )
    );

    addressAuditIndex = statements.length;

    statements.push(
      db.prepare(
        `INSERT INTO audit_logs (
           audit_id,
           actor_user_id,
           action,
           entity_type,
           entity_id,
           before_json,
           after_json,
           created_at
         )
         SELECT
           ?1,
           ?2,
           'AHBAB_PROFILE_ADDRESS_UPDATED',
           'USER_PROFILE',
           ?2,
           ?3,
           ?4,
           ?5
         WHERE ${auditEligibility}`
      ).bind(
        crypto.randomUUID(),
        userId,
        previousAddressJson,
        newAddressJson,
        now
      )
    );
  }

  const userUpdateIndex = statements.length;

  statements.push(
    db.prepare(
      `UPDATE users
       SET
         full_name = ?1,
         updated_at = ?2
       WHERE user_id = ?3
         AND ${userEligibility}`
    ).bind(
      fullName,
      now,
      userId
    )
  );

  const profileAuditIndex = statements.length;

  statements.push(
    db.prepare(
      `INSERT INTO audit_logs (
         audit_id,
         actor_user_id,
         action,
         entity_type,
         entity_id,
         before_json,
         after_json,
         created_at
       )
       SELECT
         ?1,
         ?2,
         'AHBAB_PROFILE_UPDATED',
         'USER_PROFILE',
         ?2,
         ?3,
         ?4,
         ?5
       WHERE ${auditEligibility}`
    ).bind(
      crypto.randomUUID(),
      userId,
      JSON.stringify(before),
      JSON.stringify(after),
      now
    )
  );

  /*
   * D1 batch executes the statements transactionally.
   */
  const results = await db.batch(statements);

  const profileChanges = results?.[0]?.meta?.changes ?? 0;
  const userChanges =
    results?.[userUpdateIndex]?.meta?.changes ?? 0;
  const profileAuditChanges =
    results?.[profileAuditIndex]?.meta?.changes ?? 0;

  const historyChanges = historyIndex === null
    ? 1
    : results?.[historyIndex]?.meta?.changes ?? 0;

  const addressAuditChanges = addressAuditIndex === null
    ? 1
    : results?.[addressAuditIndex]?.meta?.changes ?? 0;

  if (
    profileChanges !== 1 ||
    userChanges !== 1 ||
    profileAuditChanges !== 1 ||
    historyChanges !== 1 ||
    addressAuditChanges !== 1
  ) {
    throw httpError(
      "Profile update could not be completed.",
      409
    );
  }

  return {
    userId,
    fullName,
    dateOfBirth,

    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    stateRegion: address.stateRegion,
    postalCode: address.postalCode,
    countryId: address.countryId,

    updatedAt: now
  };
}

export async function handleProfileRequest(request, env, url) {
  const isGetRequest =
    url.pathname === "/me/profile" &&
    request.method === "GET";

  const isPatchRequest =
    url.pathname === "/me/profile" &&
    request.method === "PATCH";

  const isCountriesRequest =
    url.pathname === "/me/profile/countries" &&
    request.method === "GET";

  if (!isGetRequest && !isPatchRequest && !isCountriesRequest) {
    return null;
  }

  try {
    const session = await requireProfileSession(request, env);

    if (isCountriesRequest) {
      return await getProfileCountries(env.DB);
    }

    if (isGetRequest) {
      return await getProfile({
        db: env.DB,
        env,
        userId: session.userId,
        accessLevel: session.accessLevel
      });
    }

    const body = await readJson(request);

    const profile = await updateProfile({
      db: env.DB,
      userId: session.userId,
      accessLevel: session.accessLevel,
      body
    });

    return json({
      ok: true,
      message: "Profile updated successfully.",
      profile
    });
  } catch (error) {
    return errorResponse(error);
  }
}

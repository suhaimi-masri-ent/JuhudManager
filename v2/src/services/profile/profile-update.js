import {
  ADDRESS_FIELDS,
  PERSONAL_PROFILE_FIELDS,
  httpError,
  validateFullName,
  validateDateOfBirth,
  validateGender,
  validateMaritalStatus,
  validateEmploymentStatus,
  normalizeAddressText,
  getAddressFromRow,
  addressHasContent
} from "./profile-validation.js";

import {
  getWriteEligibilitySql
} from "./profile-eligibility.js";

export async function updateProfile({
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
    ...PERSONAL_PROFILE_FIELDS,
    ...ADDRESS_FIELDS
  ];

  const suppliedFields = Object.keys(body);

  if (
    suppliedFields.length === 0 ||
    suppliedFields.some(field => !allowedFields.includes(field))
  ) {
    throw httpError(
      "One or more profile fields are invalid.",
      400
    );
  }

  const hasAddressUpdate = ADDRESS_FIELDS.some(
    field => Object.hasOwn(body, field)
  );

  const hasPersonalProfileUpdate =
    PERSONAL_PROFILE_FIELDS.some(
      field => Object.hasOwn(body, field)
    );

  /*
   * Address and additional personal profile fields
   * are FULL-only.
   *
   * LIMITED users retain their existing permission
   * to update name and date of birth only.
   */
  if (
    (
      hasAddressUpdate ||
      hasPersonalProfileUpdate
    ) &&
    accessLevel !== "FULL"
  ) {
    throw httpError(
      "Your account does not have permission to update these profile fields.",
      403
    );
  }

  const current = await db.prepare(
    `SELECT
       u.full_name AS account_full_name,

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
    : current.date_of_birth ?? null;

  const gender = Object.hasOwn(body, "gender")
    ? validateGender(body.gender)
    : current.gender ?? null;

  const maritalStatus = Object.hasOwn(body, "maritalStatus")
    ? validateMaritalStatus(body.maritalStatus)
    : current.marital_status ?? null;

  const employmentStatus = Object.hasOwn(body, "employmentStatus")
    ? validateEmploymentStatus(body.employmentStatus)
    : current.employment_status ?? null;

  const currentAddress = getAddressFromRow(current);

  const address = hasAddressUpdate
    ? {
        addressLine1: Object.hasOwn(body, "addressLine1")
          ? normalizeAddressText(
              body.addressLine1,
              "Address line 1",
              200
            )
          : currentAddress.addressLine1,

        addressLine2: Object.hasOwn(body, "addressLine2")
          ? normalizeAddressText(
              body.addressLine2,
              "Address line 2",
              200
            )
          : currentAddress.addressLine2,

        city: Object.hasOwn(body, "city")
          ? normalizeAddressText(
              body.city,
              "City",
              100
            )
          : currentAddress.city,

        stateRegion: Object.hasOwn(body, "stateRegion")
          ? normalizeAddressText(
              body.stateRegion,
              "State / region",
              100
            )
          : currentAddress.stateRegion,

        postalCode: Object.hasOwn(body, "postalCode")
          ? normalizeAddressText(
              body.postalCode,
              "Postal code",
              20
            )
          : currentAddress.postalCode,

        countryId: Object.hasOwn(body, "countryId")
          ? normalizeAddressText(
              body.countryId,
              "Country ID",
              2
            )
          : currentAddress.countryId
      }
    : currentAddress;

  /*
   * Validate the country only when:
   * - the address is being updated;
   * - a country has been supplied;
   * - the country differs from the saved country.
   */
  if (
    hasAddressUpdate &&
    address.countryId &&
    address.countryId !== currentAddress.countryId
  ) {
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
      throw httpError(
        "Selected country is not active.",
        400
      );
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
      "Street, city and country are required when providing an address.",
      400
    );
  }

  const addressChanged =
    JSON.stringify(currentAddress) !== JSON.stringify(address);

  const now = new Date().toISOString();

  const before = {
    fullName:
      current.profile_full_name ?? current.account_full_name,

    dateOfBirth: current.date_of_birth ?? null,
    gender: current.gender ?? null,
    maritalStatus: current.marital_status ?? null,
    employmentStatus: current.employment_status ?? null
  };

  const after = {
    fullName,
    dateOfBirth,
    gender,
    maritalStatus,
    employmentStatus
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
   * Existing values are retained when fields are not supplied.
   */
  statements.push(
    db.prepare(
      `INSERT INTO user_profiles (
         user_id,
         full_name,
         date_of_birth,
         gender,
         marital_status,
         employment_status,
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
         ?1, ?2, ?3, ?4, ?5, ?6,
         ?7, ?8, ?9, ?10, ?11, ?12,
         ?13, ?13
       WHERE ${profileEligibility}
       ON CONFLICT(user_id) DO UPDATE SET
         full_name = excluded.full_name,
         date_of_birth = excluded.date_of_birth,
         gender = excluded.gender,
         marital_status = excluded.marital_status,
         employment_status = excluded.employment_status,
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
      gender,
      maritalStatus,
      employmentStatus,
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
         WHERE ${getWriteEligibilitySql("?2", accessLevel)}`
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

  const profileChanges =
    results?.[0]?.meta?.changes ?? 0;

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
    gender,
    maritalStatus,
    employmentStatus,

    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    stateRegion: address.stateRegion,
    postalCode: address.postalCode,
    countryId: address.countryId,

    updatedAt: now
  };
}

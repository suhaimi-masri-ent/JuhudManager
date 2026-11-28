export const ADDRESS_FIELDS = [
  "addressLine1",
  "addressLine2",
  "city",
  "stateRegion",
  "postalCode",
  "countryId"
];

export const PERSONAL_PROFILE_FIELDS = [
  "gender",
  "maritalStatus",
  "employmentStatus"
];

const GENDER_VALUES = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY"
];

const MARITAL_STATUS_VALUES = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
  "SEPARATED"
];

const EMPLOYMENT_STATUS_VALUES = [
  "STUDENT",
  "EMPLOYED",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "HOMEMAKER",
  "PENSIONER",
  "RETIRED",
  "OTHER"
];

export function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function readProfileJson(request) {
  const maxBodyBytes = 8192;
  const reader = request.body?.getReader();

  if (!reader) {
    throw httpError("Invalid JSON request body.", 400);
  }

  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > maxBodyBytes) {
        await reader.cancel();
        throw httpError("Request body is too large.", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let raw;

  try {
    raw = new TextDecoder("utf-8", {
      fatal: true
    }).decode(body);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }
}

export function validateFullName(value) {
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

export function validateDateOfBirth(value) {
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

function validateOptionalEnum(value, field, allowedValues) {
  if (value === null || value === "") {
    return null;
  }

  if (
    typeof value !== "string" ||
    !allowedValues.includes(value)
  ) {
    throw httpError(`Invalid ${field}.`, 400);
  }

  return value;
}

export function validateGender(value) {
  return validateOptionalEnum(
    value,
    "gender",
    GENDER_VALUES
  );
}

export function validateMaritalStatus(value) {
  return validateOptionalEnum(
    value,
    "marital status",
    MARITAL_STATUS_VALUES
  );
}

export function validateEmploymentStatus(value) {
  return validateOptionalEnum(
    value,
    "employment status",
    EMPLOYMENT_STATUS_VALUES
  );
}

export function normalizeAddressText(value, field, maxLength) {
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

export function getAddressFromRow(row) {
  return {
    addressLine1: row.address_line1 ?? null,
    addressLine2: row.address_line2 ?? null,
    city: row.city ?? null,
    stateRegion: row.state_region ?? null,
    postalCode: row.postal_code ?? null,
    countryId: row.country_id ?? null
  };
}

export function addressHasContent(address) {
  return ADDRESS_FIELDS.some(field => Boolean(address[field]));
}

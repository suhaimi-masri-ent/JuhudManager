import test from "node:test";
import assert from "node:assert/strict";

import {
  ADDRESS_FIELDS,
  PERSONAL_PROFILE_FIELDS,
  httpError,
  readProfileJson,
  validateFullName,
  validateDateOfBirth,
  validateGender,
  validateMaritalStatus,
  validateEmploymentStatus,
  normalizeAddressText,
  getAddressFromRow,
  addressHasContent
} from "../src/services/profile/profile-validation.js";

function createRequest(body) {
  return new Request("https://example.test/me/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}

test("ADDRESS_FIELDS contains the expected address fields", () => {
  assert.deepEqual(ADDRESS_FIELDS, [
    "addressLine1",
    "addressLine2",
    "city",
    "stateRegion",
    "postalCode",
    "countryId"
  ]);
});

test("PERSONAL_PROFILE_FIELDS contains the expected fields", () => {
  assert.deepEqual(PERSONAL_PROFILE_FIELDS, [
    "gender",
    "maritalStatus",
    "employmentStatus"
  ]);
});

test("httpError creates an error with an HTTP status", () => {
  const error = httpError("Forbidden", 403);

  assert.equal(error.message, "Forbidden");
  assert.equal(error.status, 403);
});

test("readProfileJson parses valid JSON", async () => {
  const request = createRequest(
    JSON.stringify({
      fullName: "Test User"
    })
  );

  const result = await readProfileJson(request);

  assert.deepEqual(result, {
    fullName: "Test User"
  });
});

test("readProfileJson rejects invalid JSON", async () => {
  const request = createRequest("{invalid}");

  await assert.rejects(
    () => readProfileJson(request),
    error => error.status === 400
  );
});

test("readProfileJson rejects an empty body", async () => {
  const request = new Request(
    "https://example.test/me/profile",
    {
      method: "PATCH"
    }
  );

  await assert.rejects(
    () => readProfileJson(request),
    error => error.status === 400
  );
});

test("readProfileJson accepts a body within 8192 bytes", async () => {
  const body = JSON.stringify({
    fullName: "A".repeat(8000)
  });

  assert.ok(
    new TextEncoder().encode(body).byteLength <= 8192
  );

  const result = await readProfileJson(
    createRequest(body)
  );

  assert.equal(result.fullName, "A".repeat(8000));
});

test("readProfileJson rejects a body exceeding 8192 bytes", async () => {
  const body = JSON.stringify({
    fullName: "A".repeat(8200)
  });

  await assert.rejects(
    () => readProfileJson(createRequest(body)),
    error => error.status === 413
  );
});

test("validateFullName trims surrounding whitespace", () => {
  assert.equal(
    validateFullName("  Test User  "),
    "Test User"
  );
});

test("validateFullName rejects names shorter than 2 characters", () => {
  assert.throws(
    () => validateFullName("A"),
    error => error.status === 400
  );
});

test("validateFullName rejects names longer than 150 characters", () => {
  assert.throws(
    () => validateFullName("A".repeat(151)),
    error => error.status === 400
  );
});

test("validateFullName rejects non-string values", () => {
  assert.throws(
    () => validateFullName(123),
    error => error.status === 400
  );
});

test("validateDateOfBirth accepts a valid date", () => {
  assert.equal(
    validateDateOfBirth("2000-05-20"),
    "2000-05-20"
  );
});

test("validateDateOfBirth accepts null", () => {
  assert.equal(validateDateOfBirth(null), null);
});

test("validateDateOfBirth rejects an invalid calendar date", () => {
  assert.throws(
    () => validateDateOfBirth("2000-02-30"),
    error => error.status === 400
  );
});

test("validateDateOfBirth rejects an invalid format", () => {
  assert.throws(
    () => validateDateOfBirth("20-05-2000"),
    error => error.status === 400
  );
});

test("validateDateOfBirth rejects a future date", () => {
  const tomorrow = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  assert.throws(
    () => validateDateOfBirth(tomorrow),
    error => error.status === 400
  );
});

test("validateGender accepts all supported values", () => {
  for (const value of [
    "MALE",
    "FEMALE",
    "OTHER",
    "PREFER_NOT_TO_SAY"
  ]) {
    assert.equal(validateGender(value), value);
  }
});

test("validateGender accepts null and empty string", () => {
  assert.equal(validateGender(null), null);
  assert.equal(validateGender(""), null);
});

test("validateGender rejects unsupported values", () => {
  assert.throws(
    () => validateGender("UNKNOWN"),
    error => error.status === 400
  );
});

test("validateMaritalStatus accepts all supported values", () => {
  for (const value of [
    "SINGLE",
    "MARRIED",
    "DIVORCED",
    "WIDOWED",
    "SEPARATED"
  ]) {
    assert.equal(validateMaritalStatus(value), value);
  }
});

test("validateMaritalStatus accepts null and empty string", () => {
  assert.equal(validateMaritalStatus(null), null);
  assert.equal(validateMaritalStatus(""), null);
});

test("validateMaritalStatus rejects unsupported values", () => {
  assert.throws(
    () => validateMaritalStatus("ENGAGED"),
    error => error.status === 400
  );
});

test("validateEmploymentStatus accepts all supported values", () => {
  for (const value of [
    "STUDENT",
    "EMPLOYED",
    "SELF_EMPLOYED",
    "UNEMPLOYED",
    "HOMEMAKER",
    "PENSIONER",
    "RETIRED",
    "OTHER"
  ]) {
    assert.equal(validateEmploymentStatus(value), value);
  }
});

test("validateEmploymentStatus accepts null and empty string", () => {
  assert.equal(validateEmploymentStatus(null), null);
  assert.equal(validateEmploymentStatus(""), null);
});

test("validateEmploymentStatus rejects unsupported values", () => {
  assert.throws(
    () => validateEmploymentStatus("CONTRACTOR"),
    error => error.status === 400
  );
});

test("normalizeAddressText trims whitespace", () => {
  assert.equal(
    normalizeAddressText("  Kuala Lumpur  ", "City", 100),
    "Kuala Lumpur"
  );
});

test("normalizeAddressText converts empty values to null", () => {
  assert.equal(
    normalizeAddressText("", "City", 100),
    null
  );

  assert.equal(
    normalizeAddressText("   ", "City", 100),
    null
  );

  assert.equal(
    normalizeAddressText(null, "City", 100),
    null
  );
});

test("normalizeAddressText rejects non-string values", () => {
  assert.throws(
    () => normalizeAddressText(123, "City", 100),
    error => error.status === 400
  );
});

test("normalizeAddressText rejects values exceeding the limit", () => {
  assert.throws(
    () => normalizeAddressText("A".repeat(101), "City", 100),
    error => error.status === 400
  );
});

test("getAddressFromRow maps database fields correctly", () => {
  const result = getAddressFromRow({
    address_line1: "Unit 10",
    address_line2: "Jalan Ampang",
    city: "Kuala Lumpur",
    state_region: "Wilayah Persekutuan",
    postal_code: "50000",
    country_id: "MY"
  });

  assert.deepEqual(result, {
    addressLine1: "Unit 10",
    addressLine2: "Jalan Ampang",
    city: "Kuala Lumpur",
    stateRegion: "Wilayah Persekutuan",
    postalCode: "50000",
    countryId: "MY"
  });
});

test("getAddressFromRow handles missing database fields", () => {
  const result = getAddressFromRow({});

  assert.deepEqual(result, {
    addressLine1: null,
    addressLine2: null,
    city: null,
    stateRegion: null,
    postalCode: null,
    countryId: null
  });
});

test("addressHasContent returns false for an empty address", () => {
  assert.equal(
    addressHasContent({
      addressLine1: null,
      addressLine2: null,
      city: null,
      stateRegion: null,
      postalCode: null,
      countryId: null
    }),
    false
  );
});

test("addressHasContent returns true when an address field has content", () => {
  assert.equal(
    addressHasContent({
      addressLine1: null,
      addressLine2: "Jalan Ampang",
      city: null,
      stateRegion: null,
      postalCode: null,
      countryId: null
    }),
    true
  );
});

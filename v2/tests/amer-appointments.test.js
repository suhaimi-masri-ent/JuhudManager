import test from "node:test";
import assert from "node:assert/strict";
import {
  validateAmerAppointment,
  formerAmerAccess,
  APPOINTMENT_ERRORS
} from "../src/domain/amer-appointments.js";

const valid = {
  actorIsAdmin: true,
  takazaExists: true,
  isActiveParticipant: true,
  eligibilityStatus: "ELIGIBLE",
  eligibilityReference: "Kawaif assessment ref KWF-001",
  officialStartDate: "2027-01-01",
  effectiveAt: "2026-12-20T09:00:00.000Z",
  hasCurrentAppointment: false
};

test("eligible active participant can be appointed before Takaza starts", () => {
  assert.deepEqual(validateAmerAppointment(valid), { valid: true, errors: [] });
});

test("appointment requires Admin authority", () => {
  const result = validateAmerAppointment({ ...valid, actorIsAdmin: false });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(APPOINTMENT_ERRORS.NOT_ADMIN));
});

test("appointee must already be an active Takaza participant", () => {
  const result = validateAmerAppointment({ ...valid, isActiveParticipant: false });
  assert.ok(result.errors.includes(APPOINTMENT_ERRORS.NOT_PARTICIPANT));
});

test("eligibility must be confirmed and referenced", () => {
  const result = validateAmerAppointment({
    ...valid,
    eligibilityStatus: "PENDING",
    eligibilityReference: ""
  });
  assert.ok(result.errors.includes(APPOINTMENT_ERRORS.NOT_ELIGIBLE));
  assert.ok(result.errors.includes(APPOINTMENT_ERRORS.MISSING_ELIGIBILITY_REFERENCE));
});

test("first appointment cannot take effect on or after the official start date", () => {
  const result = validateAmerAppointment({
    ...valid,
    effectiveAt: "2027-01-01T00:00:00.000Z"
  });
  assert.ok(result.errors.includes(APPOINTMENT_ERRORS.TAKAZA_STARTED));
});

test("replacement requires a reason", () => {
  const result = validateAmerAppointment({
    ...valid,
    hasCurrentAppointment: true,
    changeReason: "  "
  });
  assert.ok(result.errors.includes(APPOINTMENT_ERRORS.REASON_REQUIRED));
});

test("former Amer access follows explicit Admin decision", () => {
  assert.equal(formerAmerAccess("ADMIN_CONTROLLED", "READ_ONLY"), "READ_ONLY");
  assert.equal(formerAmerAccess("ADMIN_CONTROLLED", "NO_ACCESS"), "NO_ACCESS");
  assert.equal(formerAmerAccess("ADMIN_CONTROLLED", null), "ADMIN_CONTROLLED");
});

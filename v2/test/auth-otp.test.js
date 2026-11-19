import test from "node:test";
import assert from "node:assert/strict";
import {
  constantTimeEqual,
  generateOtp,
  normalizeDestination
} from "../src/auth/crypto.js";

test("email destination is normalized to lowercase", () => {
  assert.equal(normalizeDestination("EMAIL", " User@Example.COM "), "user@example.com");
});

test("WhatsApp destination accepts E.164 and removes formatting", () => {
  assert.equal(normalizeDestination("WHATSAPP", "+60 12-345 6789"), "+60123456789");
});

test("invalid destination formats are rejected", () => {
  assert.throws(() => normalizeDestination("EMAIL", "not-an-email"));
  assert.throws(() => normalizeDestination("WHATSAPP", "0123456789"));
  assert.throws(() => normalizeDestination("SMS", "+60123456789"));
});

test("generated OTP is always six digits", () => {
  for (let count = 0; count < 100; count += 1) {
    assert.match(generateOtp(), /^\d{6}$/);
  }
});

test("constant-time comparison handles equal and unequal strings", () => {
  assert.equal(constantTimeEqual("abcdef", "abcdef"), true);
  assert.equal(constantTimeEqual("abcdef", "abcdeg"), false);
  assert.equal(constantTimeEqual("abc", "abcd"), false);
});

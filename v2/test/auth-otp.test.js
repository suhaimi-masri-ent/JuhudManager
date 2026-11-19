
import test from "node:test";
import assert from "node:assert/strict";
import {
  constantTimeEqual,
  encryptValue,
  generateOtp,
  hashOtp,
  hashValue,
  normalizeDestination
} from "../src/auth/crypto.js";

const HMAC_SECRET = "test-only-hmac-secret-with-sufficient-entropy";
const OTP_HASH_SECRET = "test-only-otp-secret-with-sufficient-entropy";
const ENCRYPTION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY";

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
  assert.equal(constantTimeEqual(null, "abc"), false);
});

test("destination HMAC is deterministic and does not expose the input", async () => {
  const first = await hashValue(HMAC_SECRET, "user@example.com");
  const second = await hashValue(HMAC_SECRET, "user@example.com");
  const different = await hashValue(HMAC_SECRET, "other@example.com");

  assert.equal(first, second);
  assert.notEqual(first, different);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first.includes("user@example.com"), false);
});

test("OTP HMAC is bound to purpose, destination and OTP", async () => {
  const valid = await hashOtp(OTP_HASH_SECRET, "REGISTER", "destination-hash", "123456");
  const wrongOtp = await hashOtp(OTP_HASH_SECRET, "REGISTER", "destination-hash", "123457");
  const wrongPurpose = await hashOtp(OTP_HASH_SECRET, "LOGIN", "destination-hash", "123456");
  const wrongDestination = await hashOtp(OTP_HASH_SECRET, "REGISTER", "other-destination", "123456");

  assert.match(valid, /^[a-f0-9]{64}$/);
  assert.notEqual(valid, wrongOtp);
  assert.notEqual(valid, wrongPurpose);
  assert.notEqual(valid, wrongDestination);
});

test("AES-GCM encrypts destination values with a fresh IV", async () => {
  const first = await encryptValue(ENCRYPTION_KEY, "user@example.com");
  const second = await encryptValue(ENCRYPTION_KEY, "user@example.com");

  assert.match(first, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.notEqual(first, second);
  assert.equal(first.includes("user@example.com"), false);
});

test("AES-GCM rejects an invalid encryption key", async () => {
  await assert.rejects(
    encryptValue("MDEyMzQ1Njc4OWFiY2RlZg", "user@example.com"),
    /ENCRYPTION_KEY must decode to exactly 32 bytes/
  );
});

import test from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

mock.module("../src/auth/credentials.js", {
  exports: {
    setInitialPassword: async () => ({})
  }
});

const { handleAuthRequest } = await import("../src/routes/auth.js");

const env = {
  HMAC_SECRET: "test-only-hmac-secret-with-sufficient-entropy",
  OTP_HASH_SECRET: "test-only-otp-secret-with-sufficient-entropy",
  ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY",
  DB: {
    prepare() {
      return {
        bind() {
          return this;
        },
        async first() {
          return { request_count: 1 };
        }
      };
    }
  }
};

async function send(path, body, method = "POST", testEnv = env) {
  const request = new Request(`https://example.test${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": "203.0.113.1"
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });

  return handleAuthRequest(
    request,
    testEnv,
    new URL(request.url)
  );
}

test("invalid JSON registration request returns HTTP 400", async () => {
  const response = await send(
    "/auth/register/start",
    "{invalid-json"
  );

  assert.equal(response.status, 400);
  assert.match(
    (await response.json()).error,
    /valid JSON/
  );
});

test("registration with missing fields returns HTTP 400", async () => {
  const response = await send(
    "/auth/register/start",
    { fullName: "Test User" }
  );

  assert.equal(response.status, 400);
  assert.match(
    (await response.json()).error,
    /country code|National ID|Email/i
  );
});

test("OTP request with missing identity fields returns HTTP 400", async () => {
  const response = await send(
    "/auth/otp/request",
    { userId: "user-1" }
  );

  assert.equal(response.status, 400);
  assert.match(
    (await response.json()).error,
    /identityId/
  );
});

test("OTP request rejects unsupported destination type", async () => {
  const response = await send(
    "/auth/otp/request",
    {
      userId: "user-1",
      identityId: "identity-1",
      destinationType: "SMS",
      destination: "+60123456789"
    }
  );

  assert.equal(response.status, 400);
});

test("OTP request returns HTTP 503 when delivery provider is absent", async () => {
  const response = await send(
    "/auth/otp/request",
    {
      userId: "user-1",
      identityId: "identity-1",
      destinationType: "EMAIL",
      destination: "user@example.com"
    }
  );

  assert.equal(response.status, 503);
  assert.match(
    (await response.json()).error,
    /delivery provider/i
  );
});

test("OTP verification rejects malformed OTP before database access", async () => {
  const response = await send(
    "/auth/otp/verify",
    {
      userId: "user-1",
      identityId: "identity-1",
      destinationType: "EMAIL",
      destination: "user@example.com",
      otp: "123"
    }
  );

  assert.equal(response.status, 400);
});

test("unmatched route returns null for the API router", async () => {
  const response = await send(
    "/auth/not-implemented",
    {},
    "POST"
  );

  assert.equal(response, null);
});

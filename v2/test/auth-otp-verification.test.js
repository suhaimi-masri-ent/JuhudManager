import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyRegistrationOtp
} from "../src/auth/otp.js";
import {
  hashOtp,
  hashValue
} from "../src/auth/crypto.js";

const env = {
  HMAC_SECRET: "test-only-hmac-secret-with-sufficient-entropy",
  OTP_HASH_SECRET: "test-only-otp-secret-with-sufficient-entropy",
  ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY"
};

const userId = "user-1";
const identityId = "identity-1";
const destination = "user@example.com";
const otp = "123456";

const destinationHashInput = "EMAIL:user@example.com";

class Statement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.args = [];
  }

  bind(...args) {
    this.args = args;
    return this;
  }

  async first() {
    if (
      this.sql.includes("UPDATE auth_otp_requests") &&
      this.sql.includes("RETURNING attempt_count")
    ) {
      const [time, requestId] = this.args;
      const row = this.db.request;

      if (
        !row ||
        row.otp_request_id !== requestId ||
        row.consumed_at !== null ||
        row.invalidated_at !== null ||
        row.expires_at <= time ||
        row.attempt_count >= row.max_attempts
      ) {
        return null;
      }

      row.attempt_count += 1;

      if (row.attempt_count >= row.max_attempts) {
        row.invalidated_at = time;
      }

      return {
        attempt_count: row.attempt_count,
        max_attempts: row.max_attempts
      };
    }

    if (this.sql.includes("FROM auth_otp_requests")) {
      const [requestedUserId, requestedIdentityId, type, hash] =
        this.args;

      const row = this.db.request;

      if (
        row &&
        row.user_id === requestedUserId &&
        row.identity_id === requestedIdentityId &&
        row.destination_type === type &&
        row.destination_hash === hash &&
        row.otp_purpose === "REGISTER" &&
        row.consumed_at === null &&
        row.invalidated_at === null
      ) {
        return {
          otp_request_id: row.otp_request_id,
          user_id: row.user_id,
          identity_id: row.identity_id,
          otp_hash: row.otp_hash,
          expires_at: row.expires_at,
          attempt_count: row.attempt_count,
          max_attempts: row.max_attempts
        };
      }

      return null;
    }

    throw new Error("Unexpected SELECT: " + this.sql);
  }

  async run() {
    const row = this.db.request;

    if (
      this.sql.includes("UPDATE auth_otp_requests") &&
      this.sql.includes("SET invalidated_at")
    ) {
      const [time, requestId] = this.args;

      if (
        row &&
        row.otp_request_id === requestId &&
        row.consumed_at === null &&
        row.invalidated_at === null
      ) {
        row.invalidated_at = time;
        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    if (
      this.sql.includes("UPDATE auth_otp_requests") &&
      this.sql.includes("SET consumed_at")
    ) {
      const [
        time,
        requestId,
        requestedUserId,
        requestedIdentityId,
        type,
        hash
      ] = this.args;

      if (
        row &&
        row.otp_request_id === requestId &&
        row.user_id === requestedUserId &&
        row.identity_id === requestedIdentityId &&
        row.destination_type === type &&
        row.destination_hash === hash &&
        row.consumed_at === null &&
        row.invalidated_at === null &&
        row.expires_at > time &&
        row.attempt_count < row.max_attempts
      ) {
        row.consumed_at = time;
        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    if (
      this.sql.includes("UPDATE user_auth_identities")
    ) {
      const [
        time,
        requestedIdentityId,
        requestedUserId,
        type,
        requestId
      ] = this.args;

      if (
        this.db.identity &&
        this.db.identity.identity_id === requestedIdentityId &&
        this.db.identity.user_id === requestedUserId &&
        this.db.identity.identity_type === type &&
        this.db.identity.verification_status === "PENDING" &&
        this.db.identity.expires_at > time &&
        row &&
        row.otp_request_id === requestId &&
        row.user_id === requestedUserId &&
        row.identity_id === requestedIdentityId &&
        row.consumed_at === time
      ) {
        this.db.identity.verification_status = "VERIFIED";
        this.db.identity.verified_at = time;
        this.db.identity.expires_at = null;
        this.db.identity.updated_at = time;

        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    if (this.sql.includes("UPDATE users")) {
      const [
        email,
        time,
        requestedUserId,
        requestedIdentityId
      ] = this.args;

      if (
        this.db.user &&
        this.db.user.user_id === requestedUserId &&
        this.db.user.account_status === "DISABLED" &&
        this.db.user.email === null &&
        this.db.identity &&
        this.db.identity.identity_id === requestedIdentityId &&
        this.db.identity.user_id === requestedUserId &&
        this.db.identity.identity_type === "EMAIL" &&
        this.db.identity.verification_status === "VERIFIED"
      ) {
        this.db.user.email = email;
        this.db.user.updated_at = time;

        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    throw new Error("Unexpected SQL: " + this.sql);
  }
}

class MockD1 {
  constructor() {
    this.request = null;
    this.identity = null;
    this.user = null;
  }

  prepare(sql) {
    return new Statement(this, sql);
  }

  async batch(statements) {
    const results = [];

    for (const statement of statements) {
      results.push(await statement.run());
    }

    return results;
  }
}

async function createDb(options = {}) {
  const db = new MockD1();

  const type = options.destinationType ?? "EMAIL";
  const value = options.destination ?? destination;
  const normalized = type === "EMAIL"
    ? value.trim().toLowerCase()
    : value;

  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `${type}:${normalized}`
  );

  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `${type}:GLOBAL:${normalized}`
  );

  const now = Date.now();

  db.user = {
    user_id: userId,
    account_status: "DISABLED",
    email: null
  };

  db.identity = {
    identity_id: identityId,
    user_id: userId,
    identity_type: type,
    identity_scope: "GLOBAL",
    identity_hash: identityHash,
    verification_status: "PENDING",
    expires_at: new Date(now + 10 * 60 * 1000).toISOString()
  };

  db.request = {
    otp_request_id: "otp-request-1",
    user_id: userId,
    identity_id: identityId,
    otp_purpose: "REGISTER",
    destination_type: type,
    destination_hash: destinationHash,
    otp_hash: await hashOtp(
      env.OTP_HASH_SECRET,
      "REGISTER",
      destinationHash,
      otp
    ),
    expires_at: new Date(now + 5 * 60 * 1000).toISOString(),
    attempt_count: 0,
    max_attempts: 5,
    created_at: new Date(now).toISOString(),
    consumed_at: null,
    invalidated_at: null
  };

  return db;
}

function verify(db, overrides = {}) {
  return verifyRegistrationOtp({
    db,
    env,
    userId,
    identityId,
    destinationType: "EMAIL",
    destination,
    otp,
    ...overrides
  });
}

test("correct email OTP verifies identity and updates users.email", async () => {
  const db = await createDb();

  const result = await verify(db);

  assert.equal(result.verified, true);
  assert.equal(result.destinationType, "EMAIL");
  assert.equal(result.identityStatus, "VERIFIED");
  assert.equal(result.emailUpdated, true);

  assert.equal(db.request.consumed_at !== null, true);
  assert.equal(db.identity.verification_status, "VERIFIED");
  assert.equal(db.identity.expires_at, null);
  assert.equal(db.user.email, destination);
});

test("correct WhatsApp OTP verifies identity without updating users.email", async () => {
  const whatsapp = "+60123456789";
  const db = await createDb({
    destinationType: "WHATSAPP",
    destination: whatsapp
  });

  const result = await verify(db, {
    destinationType: "WHATSAPP",
    destination: whatsapp
  });

  assert.equal(result.verified, true);
  assert.equal(result.destinationType, "WHATSAPP");
  assert.equal(result.emailUpdated, false);

  assert.equal(db.request.consumed_at !== null, true);
  assert.equal(db.identity.verification_status, "VERIFIED");
  assert.equal(db.user.email, null);
});

test("wrong OTP increments the attempt counter", async () => {
  const db = await createDb();

  await assert.rejects(
    verify(db, { otp: "999999" }),
    error => error.status === 400
  );

  assert.equal(db.request.attempt_count, 1);
  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
  assert.equal(db.user.email, null);
});

test("fifth incorrect OTP invalidates the request", async () => {
  const db = await createDb();

  for (let attempt = 1; attempt <= 5; attempt++) {
    await assert.rejects(
      verify(db, { otp: "999999" }),
      error => error.status === (attempt === 5 ? 429 : 400)
    );
  }

  assert.equal(db.request.attempt_count, 5);
  assert.notEqual(db.request.invalidated_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
});

test("expired OTP is invalidated and rejected", async () => {
  const db = await createDb();

  db.request.expires_at = "2000-01-01T00:00:00.000Z";

  await assert.rejects(
    verify(db),
    error => error.status === 400 &&
      /invalid or expired/i.test(error.message)
  );

  assert.notEqual(db.request.invalidated_at, null);
  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
});

test("OTP with fewer than six digits is rejected", async () => {
  const db = await createDb();

  await assert.rejects(
    verify(db, { otp: "12345" }),
    error => error.status === 400
  );

  assert.equal(db.request.attempt_count, 0);
  assert.equal(db.request.consumed_at, null);
});

test("consumed OTP cannot be reused", async () => {
  const db = await createDb();

  await verify(db);

  await assert.rejects(
    verify(db),
    error => error.status === 400
  );
});

test("OTP belonging to another user cannot verify the identity", async () => {
  const db = await createDb();

  await assert.rejects(
    verify(db, { userId: "another-user" }),
    error => error.status === 400
  );

  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
});

test("OTP cannot verify an identity with an expired reservation", async () => {
  const db = await createDb();

  db.identity.expires_at = "2000-01-01T00:00:00.000Z";

  await assert.rejects(
    verify(db),
    error => error.status === 409
  );

  assert.equal(db.identity.verification_status, "PENDING");
  assert.equal(db.user.email, null);
});

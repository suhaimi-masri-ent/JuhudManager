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
  OTP_HASH_SECRET: "test-only-otp-secret-with-sufficient-entropy"
};

const userId = "user-1";
const identityId = "identity-1";
const destination = "user@example.com";
const otp = "123456";

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

    if (this.sql.includes("FROM user_auth_identities i")) {
      const [requestedIdentityId, requestedUserId, identityHash, now] =
        this.args;
      const identity = this.db.identity;
      const user = this.db.user;
      const review = this.db.registrationReview;

      return identity?.identity_id === requestedIdentityId &&
        identity.user_id === requestedUserId &&
        identity.identity_type === "EMAIL" &&
        identity.identity_scope === "GLOBAL" &&
        identity.identity_hash === identityHash &&
        identity.verification_status === "PENDING" &&
        identity.expires_at > now &&
        user?.user_id === requestedUserId &&
        user.account_status === "DISABLED" &&
        user.email === null &&
        review?.user_id === requestedUserId &&
        review.registration_status === "AWAITING_EMAIL_VERIFICATION"
        ? { identity_id: requestedIdentityId }
        : null;
    }

    if (this.sql.includes("FROM auth_otp_requests")) {
      const [requestedUserId, requestedIdentityId, hash] =
        this.args;

      const row = this.db.request;

      if (
        row &&
        row.user_id === requestedUserId &&
        row.identity_id === requestedIdentityId &&
        row.destination_type === "EMAIL" &&
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
        hash
      ] = this.args;

      const identity = this.db.identity;
      const user = this.db.user;

      const identityEligible =
        identity &&
        identity.identity_id === requestedIdentityId &&
        identity.user_id === requestedUserId &&
        identity.identity_type === "EMAIL" &&
        identity.identity_scope === "GLOBAL" &&
        identity.verification_status === "VERIFIED" &&
        identity.expires_at === null;

      if (
        row &&
        row.otp_request_id === requestId &&
        row.user_id === requestedUserId &&
        row.identity_id === requestedIdentityId &&
        row.destination_type === "EMAIL" &&
        row.destination_hash === hash &&
        row.consumed_at === null &&
        row.invalidated_at === null &&
        row.expires_at > time &&
        row.attempt_count < row.max_attempts &&
        identityEligible &&
        user?.user_id === requestedUserId &&
        user.account_status === "DISABLED" &&
        user.email !== null &&
        this.db.registrationReview?.registration_status === "PENDING_REVIEW"
      ) {
        row.consumed_at = time;
        return { meta: { changes: 1 } };
      }

      throw new Error(
        "Email verification must be completed before registration review."
      );
    }

    if (this.sql.includes("UPDATE user_auth_identities")) {
      const [
        time,
        requestedIdentityId,
        requestedUserId,
        identityHash,
        requestId,
        destinationHash
      ] = this.args;

      const identity = this.db.identity;

      if (
        identity &&
        identity.identity_id === requestedIdentityId &&
        identity.user_id === requestedUserId &&
        identity.identity_type === "EMAIL" &&
        identity.identity_scope === "GLOBAL" &&
        identity.identity_hash === identityHash &&
        identity.verification_status === "PENDING" &&
        identity.expires_at > time &&
        row &&
        row.otp_request_id === requestId &&
        row.user_id === requestedUserId &&
        row.identity_id === requestedIdentityId &&
        row.destination_hash === destinationHash &&
        row.consumed_at === null
      ) {
        identity.verification_status = "VERIFIED";
        identity.verified_at = time;
        identity.expires_at = null;
        identity.updated_at = time;

        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    if (this.sql.includes("UPDATE users")) {
      const [
        email,
        time,
        requestedUserId,
        requestedIdentityId,
        identityHash,
        requestId,
        destinationHash
      ] = this.args;

      const user = this.db.user;
      const identity = this.db.identity;

      if (
        user &&
        user.user_id === requestedUserId &&
        user.account_status === "DISABLED" &&
        user.email === null &&
        identity &&
        identity.identity_id === requestedIdentityId &&
        identity.user_id === requestedUserId &&
        identity.identity_type === "EMAIL" &&
        identity.identity_hash === identityHash &&
        identity.verification_status === "VERIFIED" &&
        this.db.request.otp_request_id === requestId &&
        this.db.request.destination_hash === destinationHash &&
        this.db.request.consumed_at === null &&
        this.db.request.invalidated_at === null
      ) {
        user.email = email;
        user.updated_at = time;

        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    if (this.sql.includes("UPDATE user_registration_reviews")) {
      const [
        time,
        requestedUserId,
        email,
        requestedIdentityId,
        identityHash,
        requestId,
        destinationHash
      ] = this.args;
      const identity = this.db.identity;
      const user = this.db.user;
      const request = this.db.request;
      const review = this.db.registrationReview;

      if (
        review?.user_id === requestedUserId &&
        review.registration_status === "AWAITING_EMAIL_VERIFICATION" &&
        user?.user_id === requestedUserId &&
        user.email === email &&
        user.account_status === "DISABLED" &&
        identity?.identity_id === requestedIdentityId &&
        identity.user_id === requestedUserId &&
        identity.identity_hash === identityHash &&
        identity.verification_status === "VERIFIED" &&
        request?.otp_request_id === requestId &&
        request.destination_hash === destinationHash &&
        request.consumed_at === null &&
        request.invalidated_at === null
      ) {
        review.registration_status = "PENDING_REVIEW";
        review.updated_at = time;

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
    const snapshot = {
      request: structuredClone(this.request),
      identity: structuredClone(this.identity),
      user: structuredClone(this.user),
      registrationReview: structuredClone(this.registrationReview)
    };

    try {
      const results = [];

      for (const statement of statements) {
        results.push(await statement.run());
      }

      return results;
    } catch (error) {
      Object.assign(this, snapshot);
      throw error;
    }
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

  const now = Date.now();

  db.user = {
    user_id: userId,
    account_status: "DISABLED",
    email: null
  };

  db.registrationReview = {
    user_id: userId,
    registration_status: "AWAITING_EMAIL_VERIFICATION"
  };

  db.identity = {
    identity_id: identityId,
    user_id: userId,
    identity_type: type,
    identity_scope: "GLOBAL",
    identity_hash: await hashValue(
      env.HMAC_SECRET,
      `EMAIL:GLOBAL:${normalized}`
    ),
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
  assert.equal(result.registrationStatus, "PENDING_REVIEW");
  assert.equal(result.nextStep, "SET_PASSWORD");

  assert.ok(db.request.consumed_at);
  assert.equal(db.identity.verification_status, "VERIFIED");
  assert.equal(db.identity.expires_at, null);
  assert.equal(db.user.email, destination);
  assert.equal(
    db.registrationReview.registration_status,
    "PENDING_REVIEW"
  );
});

test("registration guard failures are returned as conflicts", async () => {
  const db = await createDb();
  db.batch = async () => {
    throw new Error(
      "Registration OTP completion state is incomplete."
    );
  };

  await assert.rejects(
    verify(db),
    error => error.status === 409
  );
});

test("WhatsApp OTP verification is not enabled", async () => {
  const whatsapp = "+60123456789";
  const db = await createDb();

  await assert.rejects(
    verify(db, {
      destinationType: "WHATSAPP",
      destination: whatsapp
    }),
    error => error.status === 400 &&
      /only email otp verification/i.test(error.message)
  );

  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
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
  assert.ok(db.request.invalidated_at);
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

  assert.ok(db.request.invalidated_at);
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

  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
  assert.equal(db.user.email, null);
});

test("email OTP cannot be consumed when user already has an email", async () => {
  const db = await createDb();
  db.user.email = "existing@example.com";

  await assert.rejects(
    verify(db),
    error => error.status === 409
  );

  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
  assert.equal(db.user.email, "existing@example.com");
  assert.equal(
    db.registrationReview.registration_status,
    "AWAITING_EMAIL_VERIFICATION"
  );
});

test("email OTP cannot be consumed when user is not DISABLED", async () => {
  const db = await createDb();
  db.user.account_status = "ACTIVE";

  await assert.rejects(
    verify(db),
    error => error.status === 409
  );

  assert.equal(db.request.consumed_at, null);
  assert.equal(db.identity.verification_status, "PENDING");
  assert.equal(db.user.email, null);
  assert.equal(
    db.registrationReview.registration_status,
    "AWAITING_EMAIL_VERIFICATION"
  );
});

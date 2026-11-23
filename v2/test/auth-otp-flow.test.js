import test from "node:test";
import assert from "node:assert/strict";
import {
  requestRegistrationOtp
} from "../src/auth/otp.js";
import { hashValue } from "../src/auth/crypto.js";

const env = {
  HMAC_SECRET: "test-only-hmac-secret-with-sufficient-entropy",
  OTP_HASH_SECRET: "test-only-otp-secret-with-sufficient-entropy",
  ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY"
};

const destination = "user@example.com";
const destinationHashInput = "EMAIL:user@example.com";
const identityHashInput = "EMAIL:GLOBAL:user@example.com";

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
    if (this.sql.includes("FROM user_auth_identities i")) {
      const [id, userId, hash, now] = this.args;

      return this.db.identity &&
        this.db.identity.identity_id === id &&
        this.db.identity.user_id === userId &&
        this.db.identity.identity_type === "EMAIL" &&
        this.db.identity.identity_hash === hash &&
        this.db.identity.verification_status === "PENDING" &&
        this.db.identity.expires_at > now &&
        this.db.user.account_status === "DISABLED" &&
        this.db.user.email === null &&
        this.db.registrationStatus === "AWAITING_EMAIL_VERIFICATION"
        ? { identity_id: id }
        : null;
    }

    throw new Error("Unexpected SELECT: " + this.sql);
  }

  async run() {
    if (
      this.sql.includes("UPDATE auth_otp_requests") &&
      this.sql.includes("destination_hash")
    ) {
      const [
        time,
        hash,
        windowStart,
        maxRequests,
        cooldownStart,
        identityId,
        userId,
        identityHash,
        identityCheckTime
      ] = this.args;
      const eligible = canCreateRequest(
        this.db,
        hash,
        windowStart,
        maxRequests,
        cooldownStart,
        identityId,
        userId,
        identityHash,
        identityCheckTime
      );
      let changes = 0;

      if (eligible) {
        for (const row of this.db.requests) {
          if (
            row.destination_type === "EMAIL" &&
            row.destination_hash === hash &&
            row.otp_purpose === "REGISTER" &&
            row.consumed_at === null &&
            row.invalidated_at === null
          ) {
            row.invalidated_at = time;
            changes++;
          }
        }
      }

      return { meta: { changes } };
    }

    if (
      this.sql.includes("UPDATE auth_otp_requests") &&
      this.sql.includes("otp_request_id")
    ) {
      const [time, id] = this.args;
      const row = this.db.requests.find(
        item => item.otp_request_id === id
      );

      if (row && row.consumed_at === null && row.invalidated_at === null) {
        row.invalidated_at = time;
        return { meta: { changes: 1 } };
      }

      return { meta: { changes: 0 } };
    }

    if (this.sql.includes("INSERT INTO auth_otp_requests")) {
      const [
        id,
        userId,
        identityId,
        hash,
        encrypted,
        otpHash,
        expiresAt,
        maxAttempts,
        sentAt,
        windowStart,
        maxRequests,
        cooldownStart,
        identityHash,
        identityCheckTime
      ] = this.args;

      if (!canCreateRequest(
        this.db,
        hash,
        windowStart,
        maxRequests,
        cooldownStart,
        identityId,
        userId,
        identityHash,
        identityCheckTime
      )) {
        return { meta: { changes: 0 } };
      }

      this.db.requests.push({
        otp_request_id: id,
        user_id: userId,
        identity_id: identityId,
        otp_purpose: "REGISTER",
        destination_type: "EMAIL",
        destination_hash: hash,
        destination_encrypted: encrypted,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempt_count: 0,
        max_attempts: maxAttempts,
        last_sent_at: sentAt,
        created_at: sentAt,
        consumed_at: null,
        invalidated_at: null
      });

      return { meta: { changes: 1 } };
    }

    throw new Error("Unexpected SQL: " + this.sql);
  }
}

function canCreateRequest(
  db,
  hash,
  windowStart,
  maxRequests,
  cooldownStart,
  identityId,
  userId,
  identityHash,
  identityCheckTime
) {
  const recentRequests = db.requests.filter(row =>
    row.destination_type === "EMAIL" &&
    row.destination_hash === hash &&
    row.otp_purpose === "REGISTER" &&
    row.created_at >= windowStart
  );
  const inCooldown = db.requests.some(row =>
    row.destination_type === "EMAIL" &&
    row.destination_hash === hash &&
    row.otp_purpose === "REGISTER" &&
    row.last_sent_at > cooldownStart
  );
  const identity = db.identity;

  return recentRequests.length < maxRequests &&
    !inCooldown &&
    identity?.identity_id === identityId &&
    identity.user_id === userId &&
    identity.identity_type === "EMAIL" &&
    identity.identity_hash === identityHash &&
    identity.verification_status === "PENDING" &&
    identity.expires_at > identityCheckTime &&
    db.user.account_status === "DISABLED" &&
    db.user.email === null &&
    db.registrationStatus === "AWAITING_EMAIL_VERIFICATION";
}

class MockD1 {
  constructor() {
    this.identity = null;
    this.user = {
      account_status: "DISABLED",
      email: null
    };
    this.registrationStatus = "AWAITING_EMAIL_VERIFICATION";
    this.requests = [];
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

async function createDb() {
  const db = new MockD1();

  db.identity = {
    identity_id: "identity-1",
    user_id: "user-1",
    identity_type: "EMAIL",
    identity_hash: await hashValue(
      env.HMAC_SECRET,
      identityHashInput
    ),
    verification_status: "PENDING",
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  };

  return db;
}

function request(db, overrides = {}, testEnv = env) {
  return requestRegistrationOtp({
    db,
    env: testEnv,
    userId: "user-1",
    identityId: "identity-1",
    destinationType: "EMAIL",
    destination,
    ...overrides
  });
}

test("OTP request rejects missing security secrets", async () => {
  const db = await createDb();

  await assert.rejects(
    request(db, {}, { ...env, HMAC_SECRET: "" }),
    /secrets are not configured/
  );

  assert.equal(db.requests.length, 0);
});

test("OTP request rejects when delivery provider is absent", async () => {
  const db = await createDb();

  await assert.rejects(
    request(db),
    error => error.status === 503
  );

  assert.equal(db.requests.length, 0);
});

test("OTP request rejects an identity that is not reserved by the user", async () => {
  const db = await createDb();
  db.identity.user_id = "another-user";

  await assert.rejects(
    request(db, {}, {
      ...env,
      OTP_DELIVERY: { async send() {} }
    }),
    error => error.status === 409
  );

  assert.equal(db.requests.length, 0);
});

test("OTP request rejects an expired identity reservation", async () => {
  const db = await createDb();
  db.identity.expires_at = "2000-01-01T00:00:00.000Z";

  await assert.rejects(
    request(db, {}, {
      ...env,
      OTP_DELIVERY: { async send() {} }
    }),
    error => error.status === 409
  );

  assert.equal(db.requests.length, 0);
});

test("OTP request stores a request and sends the OTP through the provider", async () => {
  const db = await createDb();
  let delivered = null;

  const result = await request(db, {}, {
    ...env,
    OTP_DELIVERY: {
      async send(payload) {
        delivered = payload;
      }
    }
  });

  assert.equal(result.destinationType, "EMAIL");
  assert.equal(result.resendAfterSeconds, 60);
  assert.ok(result.requestId);
  assert.ok(result.expiresAt);

  assert.equal(db.requests.length, 1);
  assert.equal(db.requests[0].user_id, "user-1");
  assert.equal(db.requests[0].identity_id, "identity-1");
  assert.equal(db.requests[0].attempt_count, 0);
  assert.equal(db.requests[0].max_attempts, 5);

  assert.equal(delivered.destinationType, "EMAIL");
  assert.equal(delivered.destination, destination);
  assert.equal(delivered.purpose, "REGISTER");
  assert.match(delivered.otp, /^\d{6}$/);
  assert.equal(delivered.expiresInMinutes, 5);

  assert.notEqual(db.requests[0].otp_hash, delivered.otp);
  assert.notEqual(
    db.requests[0].destination_encrypted,
    destination
  );
});

test("OTP request enforces the 60-second resend cooldown", async () => {
  const db = await createDb();

  const testEnv = {
    ...env,
    OTP_DELIVERY: { async send() {} }
  };

  await request(db, {}, testEnv);

  await assert.rejects(
    request(db, {}, testEnv),
    error => error.status === 429 &&
      /too many OTP requests|wait before requesting another OTP/i.test(
        error.message
      )
  );

  assert.equal(db.requests.length, 1);
});

test("OTP request enforces the five-request rate limit", async () => {
  const db = await createDb();
  const now = Date.now();

  for (let i = 0; i < 5; i++) {
    const time = new Date(now - (i + 2) * 60 * 1000).toISOString();

    db.requests.push({
      otp_request_id: `old-${i}`,
      destination_type: "EMAIL",
      destination_hash: await hashValue(
        env.HMAC_SECRET,
        destinationHashInput
      ),
      otp_purpose: "REGISTER",
      created_at: time,
      last_sent_at: time,
      consumed_at: null,
      invalidated_at: time
    });
  }

  await assert.rejects(
    request(db, {}, {
      ...env,
      OTP_DELIVERY: { async send() {} }
    }),
    error => error.status === 429 &&
      /too many OTP requests/i.test(error.message)
  );
});

test("failed delivery invalidates the newly created OTP request", async () => {
  const db = await createDb();

  await assert.rejects(
    request(db, {}, {
      ...env,
      OTP_DELIVERY: {
        async send() {
          throw new Error("Provider unavailable");
        }
      }
    }),
    error => error.status === 503 &&
      /could not be delivered/i.test(error.message)
  );

  assert.equal(db.requests.length, 1);
  assert.ok(db.requests[0].invalidated_at);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  expirePendingIdentityReservations,
  reservePendingIdentity,
  verifyPendingIdentity
} from "../src/auth/identity-reservations.js";

const env = {
  HMAC_SECRET: "test-only-hmac-secret-with-sufficient-entropy",
  ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY"
};

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
    if (this.sql.includes("RETURNING identity_id")) {
      const [now, id, user] = this.args;

      const row = this.db.rows.find(x =>
        x.identity_id === id &&
        x.user_id === user &&
        x.verification_status === "PENDING" &&
        x.expires_at > now
      );

      if (!row) return null;

      Object.assign(row, {
        verification_status: "VERIFIED",
        verified_at: now,
        expires_at: null,
        updated_at: now
      });

      return { identity_id: id };
    }

    const [type, scope, hash] = this.args;

    return this.db.rows.find(x =>
      x.identity_type === type &&
      x.identity_scope === scope &&
      x.identity_hash === hash &&
      ["PENDING", "VERIFIED"].includes(x.verification_status)
    ) ?? null;
  }

  async run() {
    if (this.sql.includes("UPDATE user_auth_identities")) {
      const [now, ...filters] = this.args;

      let i = 0;
      const type = this.sql.includes("identity_type = ?")
        ? filters[i++] : null;
      const scope = this.sql.includes("identity_scope = ?")
        ? filters[i++] : null;
      const hash = this.sql.includes("identity_hash = ?")
        ? filters[i++] : null;

      let changes = 0;

      for (const row of this.db.rows) {
        if (
          row.verification_status === "PENDING" &&
          row.expires_at <= now &&
          (!type || row.identity_type === type) &&
          (!scope || row.identity_scope === scope) &&
          (!hash || row.identity_hash === hash)
        ) {
          row.verification_status = "EXPIRED";
          row.updated_at = now;
          changes++;
        }
      }

      return { meta: { changes } };
    }

    const [
      id, user, type, country, scope,
      hash, encrypted, expires, created
    ] = this.args;

    const duplicate = this.db.rows.some(row =>
      row.identity_type === type &&
      row.identity_scope === scope &&
      row.identity_hash === hash &&
      ["PENDING", "VERIFIED"].includes(row.verification_status)
    );

    if (duplicate) {
      throw new Error("UNIQUE constraint");
    }

    this.db.rows.push({
      identity_id: id,
      user_id: user,
      identity_type: type,
      country_code: country,
      identity_scope: scope,
      identity_hash: hash,
      encrypted_value: encrypted,
      verification_status: "PENDING",
      expires_at: expires,
      created_at: created,
      updated_at: created
    });

    return { meta: { changes: 1 } };
  }
}

class MockD1 {
  constructor() {
    this.rows = [];
  }

  prepare(sql) {
    return new Statement(this, sql);
  }
}

test("creates a 15-minute pending reservation and encrypts its value", async () => {
  const db = new MockD1();

  const result = await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "User@Example.com"
  });

  assert.equal(result.status, "PENDING");
  assert.equal(result.reservationMinutes, 15);
  assert.equal(db.rows[0].identity_scope, "GLOBAL");
  assert.equal(
    db.rows[0].encrypted_value.includes("user@example.com"),
    false
  );
});

test("same user reuses the existing pending reservation", async () => {
  const db = new MockD1();

  const first = await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "user@example.com"
  });

  const second = await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "USER@example.com"
  });

  assert.equal(second.identityId, first.identityId);
  assert.equal(second.alreadyReserved, true);
  assert.equal(second.expiresAt, first.expiresAt);
  assert.equal(db.rows.length, 1);
});

test("another user cannot claim an active pending identity", async () => {
  const db = new MockD1();

  await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "user@example.com"
  });

  await assert.rejects(
    reservePendingIdentity({
      db,
      env,
      userId: "u2",
      identityType: "EMAIL",
      identityValue: "user@example.com"
    }),
    error => error.status === 409
  );
});

test("expired pending reservation is released to a new user", async () => {
  const db = new MockD1();

  const first = await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "user@example.com"
  });

  db.rows[0].expires_at = "2000-01-01T00:00:00.000Z";

  const second = await reservePendingIdentity({
    db,
    env,
    userId: "u2",
    identityType: "EMAIL",
    identityValue: "user@example.com"
  });

  assert.notEqual(first.identityId, second.identityId);
  assert.equal(db.rows[0].verification_status, "EXPIRED");
  assert.equal(db.rows[1].verification_status, "PENDING");
});

test("national ID reservations are scoped by issuing country", async () => {
  const db = new MockD1();

  await reservePendingIdentity({
    db,
    env,
    userId: "umy",
    identityType: "NATIONAL_ID",
    identityValue: "900101-10-1234",
    countryCode: "MY"
  });

  await reservePendingIdentity({
    db,
    env,
    userId: "uid",
    identityType: "NATIONAL_ID",
    identityValue: "900101-10-1234",
    countryCode: "ID"
  });

  assert.equal(db.rows.length, 2);
  assert.deepEqual(
    db.rows.map(row => row.identity_scope),
    ["MY", "ID"]
  );
});

test("only the owner can verify an active identity reservation", async () => {
  const db = new MockD1();

  const reservation = await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "WHATSAPP",
    identityValue: "+60 12-345 6789"
  });

  await assert.rejects(
    verifyPendingIdentity({
      db,
      identityId: reservation.identityId,
      userId: "u2"
    }),
    error => error.status === 409
  );

  const verified = await verifyPendingIdentity({
    db,
    identityId: reservation.identityId,
    userId: "u1"
  });

  assert.equal(verified.status, "VERIFIED");
  assert.equal(db.rows[0].expires_at, null);
});

test("expired reservation cannot be verified", async () => {
  const db = new MockD1();

  const reservation = await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "user@example.com"
  });

  db.rows[0].expires_at = "2000-01-01T00:00:00.000Z";

  await assert.rejects(
    verifyPendingIdentity({
      db,
      identityId: reservation.identityId,
      userId: "u1"
    }),
    error => error.status === 409
  );
});

test("expiry cleanup can target one identity", async () => {
  const db = new MockD1();

  await reservePendingIdentity({
    db,
    env,
    userId: "u1",
    identityType: "EMAIL",
    identityValue: "one@example.com"
  });

  await reservePendingIdentity({
    db,
    env,
    userId: "u2",
    identityType: "EMAIL",
    identityValue: "two@example.com"
  });

  db.rows.forEach(row => {
    row.expires_at = "2000-01-01T00:00:00.000Z";
  });

  const result = await expirePendingIdentityReservations({
    db,
    identityType: "EMAIL",
    identityScope: "GLOBAL",
    identityHash: db.rows[0].identity_hash
  });

  assert.equal(result.expiredCount, 1);
  assert.equal(db.rows[0].verification_status, "EXPIRED");
  assert.equal(db.rows[1].verification_status, "PENDING");
});

import test from "node:test";
import assert from "node:assert/strict";
import { createRegistrationDraft } from "../src/auth/registrations.js";

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
    const [type, scope, hash] = this.args;

    return this.db.identities.find(x =>
      x.identity_type === type &&
      x.identity_scope === scope &&
      x.identity_hash === hash &&
      ["PENDING", "VERIFIED"].includes(x.verification_status)
    ) ?? null;
  }

  async run() {
    if (this.sql.includes("INSERT INTO users")) {
      const [userId, fullName] = this.args;

      this.db.users.push({
        user_id: userId,
        full_name: fullName,
        email: null,
        account_status: "DISABLED"
      });

      return { meta: { changes: 1 } };
    }

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

      for (const x of this.db.identities) {
        if (
          x.verification_status === "PENDING" &&
          x.expires_at <= now &&
          (!type || x.identity_type === type) &&
          (!scope || x.identity_scope === scope) &&
          (!hash || x.identity_hash === hash)
        ) {
          x.verification_status = "EXPIRED";
          changes++;
        }
      }

      return { meta: { changes } };
    }

    if (this.sql.includes("INSERT INTO user_auth_identities")) {
      const [
        id, user, type, country, scope,
        hash, encrypted, expires, created
      ] = this.args;

      const duplicate = this.db.identities.some(x =>
        x.identity_type === type &&
        x.identity_scope === scope &&
        x.identity_hash === hash &&
        ["PENDING", "VERIFIED"].includes(x.verification_status)
      );

      if (duplicate) {
        throw new Error("Unique identity constraint");
      }

      this.db.identities.push({
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

    throw new Error("Unexpected SQL: " + this.sql);
  }
}

class MockD1 {
  constructor() {
    this.users = [];
    this.identities = [];
  }

  prepare(sql) {
    return new Statement(this, sql);
  }

  async batch(statements) {
    for (const statement of statements) {
      if (statement.sql.includes("DELETE FROM user_auth_identities")) {
        this.identities = this.identities.filter(x =>
          !(
            x.user_id === statement.args[0] &&
            x.verification_status === "PENDING"
          )
        );
      } else if (statement.sql.includes("DELETE FROM users")) {
        this.users = this.users.filter(x =>
          !(
            x.user_id === statement.args[0] &&
            x.account_status === "DISABLED" &&
            x.email === null
          )
        );
      }
    }

    return [];
  }
}

function validInput(overrides = {}) {
  return {
    fullName: "  Test User  ",
    countryCode: "my",
    nationalId: "900101-10-1234",
    email: "TEST@EXAMPLE.COM",
    whatsapp: "+60 12-345 6789",
    ...overrides
  };
}

test("creates a disabled draft with all three pending identities", async () => {
  const db = new MockD1();

  const result = await createRegistrationDraft({
    db,
    env,
    ...validInput()
  });

  assert.ok(result.userId);
  assert.equal(result.accountStatus, "DISABLED");
  assert.equal(result.reservationMinutes, 15);
  assert.equal(result.nextStep, "REQUEST_EMAIL_AND_WHATSAPP_OTP");

  assert.equal(db.users.length, 1);
  assert.equal(db.users[0].full_name, "Test User");
  assert.equal(db.users[0].email, null);
  assert.equal(db.users[0].account_status, "DISABLED");

  assert.equal(db.identities.length, 3);

  assert.deepEqual(
    db.identities.map(x => x.identity_type).sort(),
    ["EMAIL", "NATIONAL_ID", "WHATSAPP"]
  );

  assert.ok(db.identities.every(
    x => x.verification_status === "PENDING"
  ));

  assert.ok(db.identities.every(x => x.expires_at));
});

test("normalizes country, email and WhatsApp identity values", async () => {
  const db = new MockD1();

  await createRegistrationDraft({
    db,
    env,
    ...validInput()
  });

  const national = db.identities.find(
    x => x.identity_type === "NATIONAL_ID"
  );
  const email = db.identities.find(
    x => x.identity_type === "EMAIL"
  );
  const whatsapp = db.identities.find(
    x => x.identity_type === "WHATSAPP"
  );

  assert.equal(national.country_code, "MY");
  assert.equal(national.identity_scope, "MY");
  assert.equal(email.identity_scope, "GLOBAL");
  assert.equal(whatsapp.identity_scope, "GLOBAL");

  assert.notEqual(email.encrypted_value, "TEST@EXAMPLE.COM");
});

test("rejects missing required registration fields before creating a user", async () => {
  const db = new MockD1();

  await assert.rejects(
    createRegistrationDraft({
      db, env, ...validInput({ fullName: " " })
    }),
    e => e.status === 400
  );

  await assert.rejects(
    createRegistrationDraft({
      db, env, ...validInput({ countryCode: "MYS" })
    }),
    e => e.status === 400
  );

  await assert.rejects(
    createRegistrationDraft({
      db, env, ...validInput({ nationalId: " " })
    }),
    e => e.status === 400
  );

  await assert.rejects(
    createRegistrationDraft({
      db, env, ...validInput({ email: " " })
    }),
    e => e.status === 400
  );

  await assert.rejects(
    createRegistrationDraft({
      db, env, ...validInput({ whatsapp: " " })
    }),
    e => e.status === 400
  );

  assert.equal(db.users.length, 0);
});

test("invalid email causes draft and reservations to be cleaned up", async () => {
  const db = new MockD1();

  await assert.rejects(
    createRegistrationDraft({
      db,
      env,
      ...validInput({ email: "not-an-email" })
    }),
    e => e.status === 400
  );

  assert.equal(db.users.length, 0);
  assert.equal(db.identities.length, 0);
});

test("identity conflict cleans up the provisional user and pending identities", async () => {
  const db = new MockD1();

  await createRegistrationDraft({
    db,
    env,
    ...validInput({ email: "claimed@example.com" })
  });

  assert.equal(db.users.length, 1);
  assert.equal(db.identities.length, 3);

  await assert.rejects(
    createRegistrationDraft({
      db,
      env,
      ...validInput({
        fullName: "Second User",
        nationalId: "900202-10-5678",
        email: "CLAIMED@example.com"
      })
    }),
    e => e.status === 409
  );

  assert.equal(db.users.length, 1);
  assert.equal(db.identities.length, 3);

  assert.ok(db.identities.every(
    x => x.user_id === db.users[0].user_id
  ));
});

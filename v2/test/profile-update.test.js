import test from "node:test";
import assert from "node:assert/strict";

import {
  updateProfile
} from "../src/services/profile/profile-update.js";

const USER_ID = "user-profile-test-001";

const currentProfile = {
  account_full_name: "Original Name",
  profile_full_name: "Original Name",
  date_of_birth: "1990-01-01",
  gender: null,
  marital_status: null,
  employment_status: null,
  address_line1: null,
  address_line2: null,
  city: null,
  state_region: null,
  postal_code: null,
  country_id: null
};

class MockStatement {
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
    if (this.sql.includes("SELECT CASE")) {
      return {
        allowed: this.db.eligible ? 1 : 0
      };
    }

    if (this.sql.includes("FROM countries")) {
      return this.db.countryActive
        ? { country_id: this.args[0] }
        : null;
    }

    if (this.sql.includes("FROM users u")) {
      return this.db.current
        ? { ...this.db.current }
        : null;
    }

    throw new Error("Unexpected SELECT: " + this.sql);
  }
}

function createMockDb(options = {}) {
  return {
    current: options.current === undefined
      ? { ...currentProfile }
      : options.current,

    eligible: options.eligible ?? true,
    countryActive: options.countryActive ?? true,

    batchCalls: [],
    batchResults: null,

    prepare(sql) {
      return new MockStatement(this, sql);
    },

    async batch(statements) {
      this.batchCalls.push(statements);

      if (this.batchResults) {
        return this.batchResults;
      }

      return statements.map(() => ({
        meta: {
          changes: 1
        }
      }));
    }
  };
}

test("FULL user can update profile name", async () => {
  const db = createMockDb();

  const result = await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "FULL",
    body: {
      fullName: "Updated Name"
    }
  });

  assert.equal(result.userId, USER_ID);
  assert.equal(result.fullName, "Updated Name");
  assert.equal(db.batchCalls.length, 1);
  assert.equal(db.batchCalls[0].length, 3);
});

test("FULL user can update gender, marital status and employment status", async () => {
  const db = createMockDb();

  const result = await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "FULL",
    body: {
      gender: "MALE",
      maritalStatus: "MARRIED",
      employmentStatus: "EMPLOYED"
    }
  });

  assert.equal(result.gender, "MALE");
  assert.equal(result.maritalStatus, "MARRIED");
  assert.equal(result.employmentStatus, "EMPLOYED");

  const profileStatement = db.batchCalls[0][0];

  assert.equal(profileStatement.args[3], "MALE");
  assert.equal(profileStatement.args[4], "MARRIED");
  assert.equal(profileStatement.args[5], "EMPLOYED");
});

test("FULL user can clear optional personal profile fields", async () => {
  const db = createMockDb({
    current: {
      ...currentProfile,
      gender: "MALE",
      marital_status: "MARRIED",
      employment_status: "EMPLOYED"
    }
  });

  const result = await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "FULL",
    body: {
      gender: null,
      maritalStatus: "",
      employmentStatus: null
    }
  });

  assert.equal(result.gender, null);
  assert.equal(result.maritalStatus, null);
  assert.equal(result.employmentStatus, null);
});

test("FULL user can update a complete address without Unit or Lot number", async () => {
  const db = createMockDb();

  const result = await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "FULL",
    body: {
      addressLine1: null,
      addressLine2: "Jalan Ampang",
      city: "Kuala Lumpur",
      countryId: "MY"
    }
  });

  assert.equal(result.addressLine1, null);
  assert.equal(result.addressLine2, "Jalan Ampang");
  assert.equal(result.city, "Kuala Lumpur");
  assert.equal(result.countryId, "MY");

  assert.equal(db.batchCalls.length, 1);
  assert.equal(db.batchCalls[0].length, 5);

  assert.ok(
    db.batchCalls[0].some(statement =>
      statement.sql.includes("user_profile_address_history")
    )
  );

  assert.ok(
    db.batchCalls[0].some(statement =>
      statement.sql.includes("AHBAB_PROFILE_ADDRESS_UPDATED")
    )
  );
});

test("LIMITED user cannot update address", async () => {
  const db = createMockDb();

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "LIMITED",
      body: {
        addressLine2: "Jalan Ampang"
      }
    }),
    error => error.status === 403
  );

  assert.equal(db.batchCalls.length, 0);
});

test("LIMITED user cannot update additional personal profile fields", async () => {
  const db = createMockDb();

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "LIMITED",
      body: {
        gender: "MALE"
      }
    }),
    error => error.status === 403
  );

  assert.equal(db.batchCalls.length, 0);
});

test("LIMITED user can update name when eligible", async () => {
  const db = createMockDb();

  const result = await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "LIMITED",
    body: {
      fullName: "Limited User"
    }
  });

  assert.equal(result.fullName, "Limited User");
  assert.equal(db.batchCalls.length, 1);
});

test("Ineligible account cannot update profile", async () => {
  const db = createMockDb({
    eligible: false
  });

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        fullName: "Updated Name"
      }
    }),
    error => error.status === 403
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Missing user cannot update profile", async () => {
  const db = createMockDb({
    current: null
  });

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        fullName: "Updated Name"
      }
    }),
    error => error.status === 404
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Inactive country cannot be selected", async () => {
  const db = createMockDb({
    countryActive: false
  });

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        addressLine2: "Jalan Ampang",
        city: "Kuala Lumpur",
        countryId: "MY"
      }
    }),
    error => error.status === 400
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Address without Street is rejected", async () => {
  const db = createMockDb();

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        addressLine1: "Unit 10",
        city: "Kuala Lumpur",
        countryId: "MY"
      }
    }),
    error => error.status === 400
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Address without City is rejected", async () => {
  const db = createMockDb();

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        addressLine2: "Jalan Ampang",
        countryId: "MY"
      }
    }),
    error => error.status === 400
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Unknown profile fields are rejected", async () => {
  const db = createMockDb();

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        fullName: "Updated Name",
        accountStatus: "ACTIVE"
      }
    }),
    error => error.status === 400
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Email and WhatsApp cannot be updated through profile", async () => {
  for (const field of ["email", "whatsapp", "phone"]) {
    const db = createMockDb();

    await assert.rejects(
      () => updateProfile({
        db,
        userId: USER_ID,
        accessLevel: "FULL",
        body: {
          [field]: "changed-value"
        }
      }),
      error => error.status === 400
    );

    assert.equal(db.batchCalls.length, 0);
  }
});

test("Empty profile update is rejected", async () => {
  const db = createMockDb();

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {}
    }),
    error => error.status === 400
  );

  assert.equal(db.batchCalls.length, 0);
});

test("Unchanged address does not create address history", async () => {
  const db = createMockDb({
    current: {
      ...currentProfile,
      address_line1: null,
      address_line2: "Jalan Ampang",
      city: "Kuala Lumpur",
      country_id: "MY"
    }
  });

  await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "FULL",
    body: {
      addressLine1: null,
      addressLine2: "Jalan Ampang",
      city: "Kuala Lumpur",
      countryId: "MY"
    }
  });

  const statements = db.batchCalls[0];

  assert.equal(
    statements.some(statement =>
      statement.sql.includes("user_profile_address_history")
    ),
    false
  );

  assert.equal(statements.length, 3);
});

test("Address update records previous and new address", async () => {
  const db = createMockDb({
    current: {
      ...currentProfile,
      address_line1: "Unit 2",
      address_line2: "Old Street",
      city: "Old City",
      country_id: "MY"
    }
  });

  await updateProfile({
    db,
    userId: USER_ID,
    accessLevel: "FULL",
    body: {
      addressLine1: null,
      addressLine2: "New Street",
      city: "New City",
      countryId: "MY"
    }
  });

  const historyStatement = db.batchCalls[0].find(
    statement =>
      statement.sql.includes("user_profile_address_history")
  );

  assert.ok(historyStatement);

  assert.equal(
    JSON.parse(historyStatement.args[2]).addressLine2,
    "Old Street"
  );

  assert.equal(
    JSON.parse(historyStatement.args[3]).addressLine1,
    null
  );

  assert.equal(
    JSON.parse(historyStatement.args[3]).addressLine2,
    "New Street"
  );

  assert.equal(historyStatement.args[1], USER_ID);
  assert.notEqual(historyStatement.args[2], null);
});

test("D1 batch failure is propagated", async () => {
  const db = createMockDb();

  db.batch = async () => {
    throw new Error("Simulated D1 batch failure");
  };

  await assert.rejects(
    () => updateProfile({
      db,
      userId: USER_ID,
      accessLevel: "FULL",
      body: {
        fullName: "Updated Name"
      }
    }),
    /Simulated D1 batch failure/
  );
});

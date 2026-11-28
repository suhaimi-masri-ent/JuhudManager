
import test from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

let authenticatedSession = {
  userId: "super-admin-1",
  authenticated: true,
  accessLevel: "FULL"
};

let authenticationResult = true;
let authorizationError = null;
let sqlCalls = [];

mock.module("../src/auth/sessions.js", {
  exports: {
    authenticateSession: async () =>
      authenticationResult ? authenticatedSession : null
  }
});

mock.module("../src/auth/authorization.js", {
  exports: {
    requireSuperAdminRole: async () => {
      if (authorizationError) {
        throw authorizationError;
      }

      return {
        userId: authenticatedSession.userId,
        roleCode: "SUPER_ADMIN",
        isGlobal: true
      };
    }
  }
});

const {
  handleSuperAdminAuditTrailRequest
} = await import("../src/routes/super-admin-audit-trail.js");

const auditRows = [
  {
    audit_id: "audit-1",
    action: "REGISTRATION_CANCELLED",
    entity_type: "USER_REGISTRATION",
    entity_id: "user-2",
    actor_user_id: "super-admin-1",
    actor_name: "Super Admin",
    target_name: "Test User",
    target_email: "test@example.com",
    reason: "Duplicate registration",
    before_json: '{"status":"PENDING"}',
    after_json: '{"status":"CANCELLED"}',
    created_at: "2026-11-28T00:00:00.000Z",
    country_id: null
  }
];

const env = {
  DB: {
    prepare(sql) {
      sqlCalls.push({
        sql,
        bindings: []
      });

      const call = sqlCalls[sqlCalls.length - 1];

      return {
        bind(...values) {
          call.bindings = values;
          return this;
        },

        async first() {
          return { total: auditRows.length };
        },

        async all() {
          return {
            results: auditRows
          };
        }
      };
    }
  }
};

function createRequest(
  path = "/super-admin/audit-trail",
  method = "GET",
  token = "A".repeat(43)
) {
  const headers = new Headers();

  if (token !== null) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return new Request(`https://example.test${path}`, {
    method,
    headers
  });
}

async function send(
  path = "/super-admin/audit-trail",
  method = "GET",
  token = "A".repeat(43)
) {
  const request = createRequest(path, method, token);

  return handleSuperAdminAuditTrailRequest(
    request,
    env,
    new URL(request.url)
  );
}

function resetState() {
  authenticatedSession = {
    userId: "super-admin-1",
    authenticated: true,
    accessLevel: "FULL"
  };

  authenticationResult = true;
  authorizationError = null;
  sqlCalls = [];
}

test("rejects requests without a Bearer token", async () => {
  resetState();

  const response = await send(
    "/super-admin/audit-trail",
    "GET",
    null
  );

  assert.equal(response.status, 401);
  assert.equal(sqlCalls.length, 0);
});

test("rejects invalid or expired sessions", async () => {
  resetState();
  authenticationResult = false;

  const response = await send();

  assert.equal(response.status, 401);
  assert.equal(sqlCalls.length, 0);
});

test("rejects users without Super Admin authorization", async () => {
  resetState();

  authorizationError = Object.assign(
    new Error("Super Admin access required."),
    { status: 403 }
  );

  const response = await send();

  assert.equal(response.status, 403);
  assert.equal(sqlCalls.length, 0);
});

test("returns audit records to an authorized Super Admin", async () => {
  resetState();

  const response = await send();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.readOnly, true);
  assert.equal(body.total, 1);
  assert.equal(body.count, 1);
  assert.equal(body.records[0].auditId, "audit-1");
  assert.equal(
    body.records[0].action,
    "REGISTRATION_CANCELLED"
  );
  assert.equal(
    body.records[0].actorName,
    "Super Admin"
  );
  assert.equal(
    body.records[0].targetEmail,
    "test@example.com"
  );

  assert.equal(sqlCalls.length, 2);

  for (const call of sqlCalls) {
    assert.match(
      call.sql.trim(),
      /^SELECT/i
    );

    assert.doesNotMatch(
      call.sql,
      /\b(INSERT|UPDATE|DELETE|REPLACE)\b/i
    );
  }
});

test("applies search, action, date and pagination filters", async () => {
  resetState();

  const response = await send(
    "/super-admin/audit-trail" +
    "?search=Test User" +
    "&action=registration_cancelled" +
    "&entityType=user_registration" +
    "&dateFrom=2026-11-01" +
    "&dateTo=2026-11-28" +
    "&limit=10" +
    "&offset=5"
  );

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.limit, 10);
  assert.equal(body.offset, 5);

  const recordsQuery = sqlCalls.find(
    call => /ORDER BY audit\.created_at/i.test(call.sql)
  );

  assert.ok(recordsQuery);
  assert.deepEqual(
    recordsQuery.bindings,
    [
      "Test User",
      "REGISTRATION_CANCELLED",
      "USER_REGISTRATION",
      "2026-11-01T00:00:00.000Z",
      "2026-11-28T23:59:59.999Z",
      10,
      5
    ]
  );
});

test("rejects invalid date filters", async () => {
  resetState();

  const response = await send(
    "/super-admin/audit-trail?dateFrom=2026-02-30"
  );

  assert.equal(response.status, 400);
  assert.equal(sqlCalls.length, 0);
});

test("rejects unsupported HTTP methods without querying the database", async () => {
  resetState();

  const response = await send(
    "/super-admin/audit-trail",
    "POST"
  );

  assert.equal(response, null);
  assert.equal(sqlCalls.length, 0);
});

test("returns null for unrelated routes", async () => {
  resetState();

  const response = await send(
    "/super-admin/users",
    "GET"
  );

  assert.equal(response, null);
  assert.equal(sqlCalls.length, 0);
});

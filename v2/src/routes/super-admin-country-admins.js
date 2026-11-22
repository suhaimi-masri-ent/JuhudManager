
import { json } from "../lib/http.js";
import { authenticateSession } from "../auth/sessions.js";
import { requireSuperAdminRole } from "../auth/authorization.js";

const MAX_BODY_BYTES = 4096;
const MAX_REASON_LENGTH = 1000;
const MAX_LIMIT = 100;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization");

  if (typeof authorization !== "string") {
    return null;
  }

  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{43})$/);
  return match ? match[1] : null;
}

async function requireSuperAdmin(request, env) {
  const token = getBearerToken(request);

  if (!token) {
    throw httpError("A valid Bearer token is required.", 401);
  }

  const session = await authenticateSession({
    db: env.DB,
    env,
    token
  });

  if (!session) {
    throw httpError("Invalid or expired session.", 401);
  }

  await requireSuperAdminRole({
    db: env.DB,
    session
  });

  return session;
}

async function readJson(request) {
  const raw = await request.text();

  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw httpError("Request body is too large.", 413);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }
}

function validateCountryId(value) {
  const countryId = String(value ?? "").trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryId)) {
    throw httpError("A valid country code is required.", 400);
  }

  return countryId;
}

function validateUserId(value) {
  const userId = String(value ?? "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw httpError("A valid user ID is required.", 400);
  }

  return userId;
}

function validateReason(value) {
  const reason = typeof value === "string" ? value.trim() : "";

  if (!reason || reason.length > MAX_REASON_LENGTH) {
    throw httpError(
      `A reason is required and must not exceed ${MAX_REASON_LENGTH} characters.`,
      400
    );
  }

  return reason;
}

function parseLimit(value) {
  if (value === null) {
    return 50;
  }

  if (!/^\d+$/.test(value)) {
    throw httpError("Invalid limit.", 400);
  }

  const limit = Number(value);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw httpError(`Limit must be between 1 and ${MAX_LIMIT}.`, 400);
  }

  return limit;
}

async function listAssignments({ db, url }) {
  const countryId = validateCountryId(
    url.searchParams.get("country")
  );

  const status = (
    url.searchParams.get("status") ?? "ACTIVE"
  ).trim().toUpperCase();

  if (!["ACTIVE", "REVOKED", "ALL"].includes(status)) {
    throw httpError("Invalid assignment status.", 400);
  }

  const limit = parseLimit(url.searchParams.get("limit"));

  const country = await db.prepare(
    `SELECT country_id, country_name, country_status
     FROM countries
     WHERE country_id = ?1
     LIMIT 1`
  ).bind(countryId).first();

  if (!country) {
    throw httpError("Country not found.", 404);
  }

  const result = await db.prepare(
    `SELECT
       a.assignment_id,
       a.user_id,
       u.full_name,
       u.email,
       u.account_status,
       a.country_id,
       c.country_name,
       a.assignment_role_code,
       a.assignment_status,
       a.assigned_by,
       assigned_by_user.full_name AS assigned_by_name,
       a.assigned_at,
       a.revoked_by,
       revoked_by_user.full_name AS revoked_by_name,
       a.revoked_at,
       a.revocation_reason,
       (
         SELECT COUNT(*)
         FROM user_country_assignments active_assignment
         WHERE active_assignment.user_id = a.user_id
           AND active_assignment.assignment_role_code = 'ADMIN'
           AND active_assignment.assignment_status = 'ACTIVE'
       ) AS active_country_count
     FROM user_country_assignments a
     INNER JOIN users u
       ON u.user_id = a.user_id
     INNER JOIN countries c
       ON c.country_id = a.country_id
     LEFT JOIN users assigned_by_user
       ON assigned_by_user.user_id = a.assigned_by
     LEFT JOIN users revoked_by_user
       ON revoked_by_user.user_id = a.revoked_by
     WHERE a.country_id = ?1
       AND (?2 = 'ALL' OR a.assignment_status = ?2)
     ORDER BY
       CASE WHEN a.assignment_status = 'ACTIVE' THEN 0 ELSE 1 END,
       a.assigned_at DESC
     LIMIT ?3`
  ).bind(countryId, status, limit).all();

  const assignments = (result?.results ?? []).map(row => ({
    assignmentId: row.assignment_id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    accountStatus: row.account_status,
    countryId: row.country_id,
    countryName: row.country_name,
    roleCode: row.assignment_role_code,
    assignmentStatus: row.assignment_status,
    assignedBy: row.assigned_by,
    assignedByName: row.assigned_by_name,
    assignedAt: row.assigned_at,
    revokedBy: row.revoked_by,
    revokedByName: row.revoked_by_name,
    revokedAt: row.revoked_at,
    revocationReason: row.revocation_reason,
    activeCountryCount: row.active_country_count
  }));

  return json({
    ok: true,
    country: {
      countryId: country.country_id,
      countryName: country.country_name,
      countryStatus: country.country_status
    },
    status,
    count: assignments.length,
    assignments
  });
}

async function listCandidates({ db, url }) {
  const countryId = validateCountryId(
    url.searchParams.get("country")
  );

  const search = (
    url.searchParams.get("search") ?? ""
  ).trim().slice(0, 100);

  const limit = parseLimit(url.searchParams.get("limit"));

  const country = await db.prepare(
    `SELECT country_id, country_name
     FROM countries
     WHERE country_id = ?1
       AND country_status = 'ACTIVE'
     LIMIT 1`
  ).bind(countryId).first();

  if (!country) {
    throw httpError("Country not found or inactive.", 404);
  }

  const result = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.account_status,
       r.registration_status,
       EXISTS (
         SELECT 1
         FROM user_roles ur
         INNER JOIN roles role
           ON role.role_id = ur.role_id
         WHERE ur.user_id = u.user_id
           AND role.role_code = 'ADMIN'
       ) AS has_admin_role,
       (
         SELECT COUNT(*)
         FROM user_country_assignments a
         WHERE a.user_id = u.user_id
           AND a.assignment_role_code = 'ADMIN'
           AND a.assignment_status = 'ACTIVE'
       ) AS active_country_count,
       EXISTS (
         SELECT 1
         FROM user_country_assignments existing
         WHERE existing.user_id = u.user_id
           AND existing.country_id = ?1
           AND existing.assignment_role_code = 'ADMIN'
           AND existing.assignment_status = 'ACTIVE'
       ) AS already_assigned
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.account_status = 'ACTIVE'
       AND r.registration_status = 'APPROVED'
       AND NOT EXISTS (
         SELECT 1
         FROM user_roles super_role
         INNER JOIN roles sr
           ON sr.role_id = super_role.role_id
         WHERE super_role.user_id = u.user_id
           AND sr.role_code = 'SUPER_ADMIN'
       )
       AND (
         ?2 = ''
         OR u.full_name LIKE '%' || ?2 || '%'
         OR u.email LIKE '%' || ?2 || '%'
       )
     ORDER BY u.full_name COLLATE NOCASE, u.user_id
     LIMIT ?3`
  ).bind(countryId, search, limit).all();

  const candidates = (result?.results ?? []).map(row => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    accountStatus: row.account_status,
    registrationStatus: row.registration_status,
    hasAdminRole: row.has_admin_role === 1,
    activeCountryCount: row.active_country_count,
    alreadyAssigned: row.already_assigned === 1,
    eligible: row.already_assigned !== 1
  }));

  return json({
    ok: true,
    country: {
      countryId: country.country_id,
      countryName: country.country_name
    },
    count: candidates.length,
    candidates
  });
}

async function createAssignment({
  db,
  administratorId,
  body
}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  const userId = validateUserId(body.userId);
  const countryId = validateCountryId(body.countryId);
  const reason = validateReason(body.reason);

  const country = await db.prepare(
    `SELECT country_id, country_name
     FROM countries
     WHERE country_id = ?1
       AND country_status = 'ACTIVE'
     LIMIT 1`
  ).bind(countryId).first();

  if (!country) {
    throw httpError("Country not found or inactive.", 404);
  }

  const candidate = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.user_id = ?1
       AND u.account_status = 'ACTIVE'
       AND r.registration_status = 'APPROVED'
       AND NOT EXISTS (
         SELECT 1
         FROM user_roles ur
         INNER JOIN roles role
           ON role.role_id = ur.role_id
         WHERE ur.user_id = u.user_id
           AND role.role_code = 'SUPER_ADMIN'
       )
     LIMIT 1`
  ).bind(userId).first();

  if (!candidate) {
    throw httpError(
      "Only active users with approved registration can become Country Admins.",
      409
    );
  }

  const existing = await db.prepare(
    `SELECT assignment_id
     FROM user_country_assignments
     WHERE user_id = ?1
       AND country_id = ?2
       AND assignment_role_code = 'ADMIN'
       AND assignment_status = 'ACTIVE'
     LIMIT 1`
  ).bind(userId, countryId).first();

  if (existing) {
    throw httpError("This user is already assigned to this country.", 409);
  }

  const now = new Date().toISOString();
  const assignmentId = crypto.randomUUID();
  const auditId = crypto.randomUUID();

  const results = await db.batch([
    db.prepare(
      `INSERT INTO user_roles (
         user_id,
         role_id,
         assigned_by,
         assigned_at
       )
       SELECT
         ?1,
         'role-admin',
         ?2,
         ?3
       WHERE EXISTS (
         SELECT 1
         FROM users u
         INNER JOIN user_registration_reviews r
           ON r.user_id = u.user_id
         WHERE u.user_id = ?1
           AND u.account_status = 'ACTIVE'
           AND r.registration_status = 'APPROVED'
       )
       ON CONFLICT(user_id, role_id) DO NOTHING`
    ).bind(userId, administratorId, now),

    db.prepare(
      `INSERT INTO user_country_assignments (
         assignment_id,
         user_id,
         country_id,
         assignment_role_code,
         assignment_status,
         assigned_by,
         assigned_at
       )
       VALUES (
         ?1,
         CASE
           WHEN EXISTS (
             SELECT 1
             FROM user_roles ur
             INNER JOIN roles role
               ON role.role_id = ur.role_id
             INNER JOIN users u
               ON u.user_id = ur.user_id
             INNER JOIN user_registration_reviews r
               ON r.user_id = u.user_id
             WHERE ur.user_id = ?2
               AND role.role_code = 'ADMIN'
               AND u.account_status = 'ACTIVE'
               AND r.registration_status = 'APPROVED'
           )
           THEN ?2
           ELSE NULL
         END,
         ?3,
         'ADMIN',
         'ACTIVE',
         ?4,
         ?5
       )`
    ).bind(
      assignmentId,
      userId,
      countryId,
      administratorId,
      now
    ),

    db.prepare(
      `INSERT INTO audit_logs (
         audit_id,
         actor_user_id,
         action,
         entity_type,
         entity_id,
         before_json,
         after_json,
         reason,
         created_at,
         country_id
       )
       SELECT
         ?1,
         ?2,
         'COUNTRY_ADMIN_ASSIGNED',
         'USER_COUNTRY_ASSIGNMENT',
         ?3,
         NULL,
         ?4,
         ?5,
         ?6,
         ?7
       WHERE EXISTS (
         SELECT 1
         FROM user_country_assignments
         WHERE assignment_id = ?3
           AND user_id = ?8
           AND country_id = ?7
           AND assignment_status = 'ACTIVE'
       )`
    ).bind(
      auditId,
      administratorId,
      assignmentId,
      JSON.stringify({
        userId,
        countryId,
        assignmentRole: "ADMIN",
        assignmentStatus: "ACTIVE"
      }),
      reason,
      now,
      countryId,
      userId
    )
  ]);

  if (
    (results?.[1]?.meta?.changes ?? 0) !== 1 ||
    (results?.[2]?.meta?.changes ?? 0) !== 1
  ) {
    throw httpError(
      "Country Admin assignment could not be completed.",
      409
    );
  }

  return json({
    ok: true,
    message: "Country Admin assigned successfully.",
    assignment: {
      assignmentId,
      userId,
      fullName: candidate.full_name,
      email: candidate.email,
      countryId,
      countryName: country.country_name,
      assignmentRole: "ADMIN",
      assignmentStatus: "ACTIVE",
      assignedBy: administratorId,
      assignedAt: now
    }
  }, 201);
}

async function revokeAssignment({
  db,
  administratorId,
  assignmentId,
  body
}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  const reason = validateReason(body.reason);

  const current = await db.prepare(
    `SELECT
       assignment_id,
       user_id,
       country_id,
       assignment_status
     FROM user_country_assignments
     WHERE assignment_id = ?1
     LIMIT 1`
  ).bind(assignmentId).first();

  if (!current) {
    throw httpError("Country Admin assignment not found.", 404);
  }

  if (current.assignment_status !== "ACTIVE") {
    throw httpError("This assignment has already been revoked.", 409);
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();

  const results = await db.batch([
    db.prepare(
      `UPDATE user_country_assignments
       SET
         assignment_status = 'REVOKED',
         revoked_by = ?1,
         revoked_at = ?2,
         revocation_reason = ?3
       WHERE assignment_id = ?4
         AND assignment_status = 'ACTIVE'`
    ).bind(
      administratorId,
      now,
      reason,
      assignmentId
    ),

    db.prepare(
      `DELETE FROM user_roles
       WHERE user_id = ?1
         AND role_id = 'role-admin'
         AND EXISTS (
           SELECT 1
           FROM user_country_assignments
           WHERE assignment_id = ?2
             AND user_id = ?1
             AND assignment_status = 'REVOKED'
             AND revoked_by = ?3
             AND revoked_at = ?4
         )
         AND NOT EXISTS (
           SELECT 1
           FROM user_country_assignments
           WHERE user_id = ?1
             AND assignment_role_code = 'ADMIN'
             AND assignment_status = 'ACTIVE'
         )`
    ).bind(
      current.user_id,
      assignmentId,
      administratorId,
      now
    ),

    db.prepare(
      `INSERT INTO audit_logs (
         audit_id,
         actor_user_id,
         action,
         entity_type,
         entity_id,
         before_json,
         after_json,
         reason,
         created_at,
         country_id
       )
       SELECT
         ?1,
         ?2,
         'COUNTRY_ADMIN_REVOKED',
         'USER_COUNTRY_ASSIGNMENT',
         ?3,
         ?4,
         ?5,
         ?6,
         ?7,
         ?8
       WHERE EXISTS (
         SELECT 1
         FROM user_country_assignments
         WHERE assignment_id = ?3
           AND assignment_status = 'REVOKED'
           AND revoked_by = ?2
           AND revoked_at = ?7
       )`
    ).bind(
      auditId,
      administratorId,
      assignmentId,
      JSON.stringify({
        userId: current.user_id,
        countryId: current.country_id,
        assignmentStatus: "ACTIVE"
      }),
      JSON.stringify({
        userId: current.user_id,
        countryId: current.country_id,
        assignmentStatus: "REVOKED"
      }),
      reason,
      now,
      current.country_id
    )
  ]);

  if (
    (results?.[0]?.meta?.changes ?? 0) !== 1 ||
    (results?.[2]?.meta?.changes ?? 0) !== 1
  ) {
    throw httpError(
      "Country Admin assignment could not be revoked.",
      409
    );
  }

  const remaining = await db.prepare(
    `SELECT COUNT(*) AS total
     FROM user_country_assignments
     WHERE user_id = ?1
       AND assignment_role_code = 'ADMIN'
       AND assignment_status = 'ACTIVE'`
  ).bind(current.user_id).first();

  return json({
    ok: true,
    message: "Country Admin assignment revoked successfully.",
    revocation: {
      assignmentId,
      userId: current.user_id,
      countryId: current.country_id,
      assignmentStatus: "REVOKED",
      revokedBy: administratorId,
      revokedAt: now,
      remainingActiveCountryAssignments: remaining?.total ?? 0,
      adminRoleRetained: (remaining?.total ?? 0) > 0
    }
  });
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  if (status === 500) {
    console.error("SUPER_ADMIN_COUNTRY_ADMIN_ERROR", {
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status === 500
      ? "Country Admin management service unavailable."
      : error.message
  }, status);
}

export async function handleSuperAdminCountryAdminRequest(
  request,
  env,
  url
) {
  const basePath = "/super-admin/country-admins";

  const isListRequest =
    url.pathname === basePath &&
    request.method === "GET";

  const isCandidateRequest =
    url.pathname === `${basePath}/candidates` &&
    request.method === "GET";

  const isCreateRequest =
    url.pathname === basePath &&
    request.method === "POST";

  const revokeMatch = url.pathname.match(
    /^\/super-admin\/country-admins\/([0-9a-f-]{36})\/revoke$/i
  );

  const isRevokeRequest =
    Boolean(revokeMatch) &&
    request.method === "POST";

  if (
    !isListRequest &&
    !isCandidateRequest &&
    !isCreateRequest &&
    !isRevokeRequest
  ) {
    return null;
  }

  try {
    const session = await requireSuperAdmin(request, env);

    if (isListRequest) {
      return await listAssignments({
        db: env.DB,
        url
      });
    }

    if (isCandidateRequest) {
      return await listCandidates({
        db: env.DB,
        url
      });
    }

    if (isCreateRequest) {
      const body = await readJson(request);

      return await createAssignment({
        db: env.DB,
        administratorId: session.userId,
        body
      });
    }

    const body = await readJson(request);

    return await revokeAssignment({
      db: env.DB,
      administratorId: session.userId,
      assignmentId: revokeMatch[1],
      body
    });
  } catch (error) {
    return errorResponse(error);
  }
}

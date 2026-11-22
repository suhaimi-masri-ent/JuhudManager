
import { json } from "../lib/http.js";
import { authenticateSession } from "../auth/sessions.js";
import { requireSuperAdminRole } from "../auth/authorization.js";

const MAX_BODY_BYTES = 2048;

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

  const administrator = await requireSuperAdminRole({
    db: env.DB,
    session
  });

  return {
    session,
    administrator
  };
}

async function readJson(request) {
  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_BODY_BYTES
    ) {
      throw httpError("Request body is too large.", 413);
    }
  }

  const raw = await request.text();

  if (
    new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES
  ) {
    throw httpError("Request body is too large.", 413);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }
}

function validateCountryInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  const countryCode = typeof body.countryCode === "string"
    ? body.countryCode.trim().toUpperCase()
    : "";

  const countryName = typeof body.countryName === "string"
    ? body.countryName.trim()
    : "";

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw httpError(
      "Country code must contain exactly two letters.",
      400
    );
  }

  if (
    countryName.length < 2 ||
    countryName.length > 100
  ) {
    throw httpError(
      "Country name must contain between 2 and 100 characters.",
      400
    );
  }

  return {
    countryCode,
    countryName
  };
}

async function listCountries(db) {
  const result = await db.prepare(
    `SELECT
       c.country_id,
       c.country_code,
       c.country_name,
       c.country_status,
       c.created_at,
       c.updated_at,
       (
         SELECT COUNT(*)
         FROM user_country_assignments a
         WHERE a.country_id = c.country_id
           AND a.assignment_status = 'ACTIVE'
           AND a.assignment_role_code = 'ADMIN'
       ) AS active_admin_count,
       (
         SELECT COUNT(*)
         FROM jemaah j
         WHERE j.country_id = c.country_id
           AND j.status = 'ACTIVE'
       ) AS active_jemaah_count
     FROM countries c
     ORDER BY c.country_name COLLATE NOCASE, c.country_code`
  ).all();

  const countries = (result?.results ?? []).map(row => ({
    countryId: row.country_id,
    countryCode: row.country_code,
    countryName: row.country_name,
    countryStatus: row.country_status,
    activeAdminCount: row.active_admin_count,
    activeJemaahCount: row.active_jemaah_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return json({
    ok: true,
    count: countries.length,
    countries
  });
}

async function createCountry({
  db,
  administratorId,
  body
}) {
  const input = validateCountryInput(body);
  const now = new Date().toISOString();

  const auditId = crypto.randomUUID();

  try {
    const results = await db.batch([
      db.prepare(
        `INSERT INTO countries (
           country_id,
           country_code,
           country_name,
           country_status,
           created_at,
           updated_at
         )
         VALUES (?1, ?1, ?2, 'ACTIVE', ?3, ?3)`
      ).bind(
        input.countryCode,
        input.countryName,
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
           'COUNTRY_CREATED',
           'COUNTRY',
           ?3,
           NULL,
           ?4,
           'Country created by SUPER_ADMIN.',
           ?5,
           ?3
         WHERE EXISTS (
           SELECT 1
           FROM countries
           WHERE country_id = ?3
             AND country_status = 'ACTIVE'
         )`
      ).bind(
        auditId,
        administratorId,
        input.countryCode,
        JSON.stringify({
          countryCode: input.countryCode,
          countryName: input.countryName,
          countryStatus: "ACTIVE"
        }),
        now
      )
    ]);

    if (
      (results?.[0]?.meta?.changes ?? 0) !== 1 ||
      (results?.[1]?.meta?.changes ?? 0) !== 1
    ) {
      throw httpError(
        "Country could not be created.",
        409
      );
    }
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    if (/UNIQUE constraint|constraint failed/i.test(error?.message ?? "")) {
      throw httpError(
        "This country code already exists.",
        409
      );
    }

    throw error;
  }

  return json({
    ok: true,
    message: "Country created successfully.",
    country: {
      countryId: input.countryCode,
      countryCode: input.countryCode,
      countryName: input.countryName,
      countryStatus: "ACTIVE",
      createdAt: now
    }
  }, 201);
}

async function updateCountryStatus({
  db,
  administratorId,
  countryId,
  body
}) {
  if (!/^[A-Z]{2}$/.test(countryId)) {
    throw httpError("Invalid country code.", 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  const newStatus = typeof body.countryStatus === "string"
    ? body.countryStatus.trim().toUpperCase()
    : "";

  if (!["ACTIVE", "INACTIVE"].includes(newStatus)) {
    throw httpError(
      "Country status must be ACTIVE or INACTIVE.",
      400
    );
  }

  const current = await db.prepare(
    `SELECT
       country_id,
       country_name,
       country_status
     FROM countries
     WHERE country_id = ?1
     LIMIT 1`
  ).bind(countryId).first();

  if (!current) {
    throw httpError("Country not found.", 404);
  }

  if (current.country_status === newStatus) {
    return json({
      ok: true,
      message: "Country already has the requested status.",
      country: {
        countryId,
        countryName: current.country_name,
        countryStatus: current.country_status
      }
    });
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();

  const before = {
    countryCode: countryId,
    countryName: current.country_name,
    countryStatus: current.country_status
  };

  const after = {
    countryCode: countryId,
    countryName: current.country_name,
    countryStatus: newStatus
  };

  const results = await db.batch([
    db.prepare(
      `UPDATE countries
       SET
         country_status = ?1,
         updated_at = ?4
       WHERE country_id = ?2
         AND country_status = ?3
         AND (
           ?1 = 'ACTIVE'
           OR (
             NOT EXISTS (
               SELECT 1
               FROM user_country_assignments
               WHERE country_id = ?2
                 AND assignment_status = 'ACTIVE'
             )
             AND NOT EXISTS (
               SELECT 1
               FROM jemaah
               WHERE country_id = ?2
                 AND status = 'ACTIVE'
             )
           )
         )`
    ).bind(
      newStatus,
      countryId,
      current.country_status,
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
         'COUNTRY_STATUS_CHANGED',
         'COUNTRY',
         ?3,
         ?4,
         ?5,
         'Country status changed by SUPER_ADMIN.',
         ?6,
         ?3
       WHERE EXISTS (
         SELECT 1
         FROM countries
         WHERE country_id = ?3
           AND country_status = ?7
           AND updated_at = ?6
       )`
    ).bind(
      auditId,
      administratorId,
      countryId,
      JSON.stringify(before),
      JSON.stringify(after),
      now,
      newStatus
    )
  ]);

  const updateChanges = results?.[0]?.meta?.changes ?? 0;
  const auditChanges = results?.[1]?.meta?.changes ?? 0;

  if (updateChanges !== 1 || auditChanges !== 1) {
    throw httpError(
      "Country status could not be changed. Check active Country Admin assignments and Jemaah records.",
      409
    );
  }

  return json({
    ok: true,
    message: "Country status updated successfully.",
    country: {
      countryId,
      countryName: current.country_name,
      countryStatus: newStatus,
      updatedAt: now
    }
  });
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  if (status === 500) {
    console.error("SUPER_ADMIN_COUNTRY_ERROR", {
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status === 500
      ? "Country management service unavailable."
      : error.message
  }, status);
}

export async function handleSuperAdminCountryRequest(
  request,
  env,
  url
) {
  const basePath = "/super-admin/countries";

  const isListRequest =
    url.pathname === basePath &&
    request.method === "GET";

  const isCreateRequest =
    url.pathname === basePath &&
    request.method === "POST";

  const statusMatch = url.pathname.match(
    /^\/super-admin\/countries\/([A-Z]{2})\/status$/
  );

  const isStatusRequest =
    Boolean(statusMatch) &&
    request.method === "POST";

  if (
    !isListRequest &&
    !isCreateRequest &&
    !isStatusRequest
  ) {
    return null;
  }

  try {
    const { session } = await requireSuperAdmin(
      request,
      env
    );

    if (isListRequest) {
      return await listCountries(env.DB);
    }

    if (isCreateRequest) {
      const body = await readJson(request);

      return await createCountry({
        db: env.DB,
        administratorId: session.userId,
        body
      });
    }

    const body = await readJson(request);

    return await updateCountryStatus({
      db: env.DB,
      administratorId: session.userId,
      countryId: statusMatch[1],
      body
    });
  } catch (error) {
    return errorResponse(error);
  }
}

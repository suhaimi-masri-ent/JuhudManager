
import { json } from "../lib/http.js";
import { authenticateSession } from "../auth/sessions.js";
import { requireSuperAdminRole } from "../auth/authorization.js";

const BASE_PATH = "/super-admin/audit-trail";
const MAX_LIMIT = 100;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization");

  if (typeof authorization !== "string") return null;

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

function parseLimit(value) {
  if (value === null) return 50;

  if (!/^\d+$/.test(value)) {
    throw httpError("Invalid limit.", 400);
  }

  const limit = Number(value);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw httpError(`Limit must be between 1 and ${MAX_LIMIT}.`, 400);
  }

  return limit;
}

function parseOffset(value) {
  if (value === null) return 0;

  if (!/^\d+$/.test(value)) {
    throw httpError("Invalid offset.", 400);
  }

  const offset = Number(value);

  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw httpError("Invalid offset.", 400);
  }

  return offset;
}

function parseDate(value, fieldName, endOfDay = false) {
  if (!value) return "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw httpError(`Invalid ${fieldName}. Use YYYY-MM-DD.`, 400);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw httpError(`Invalid ${fieldName}.`, 400);
  }

  return endOfDay
    ? `${value}T23:59:59.999Z`
    : `${value}T00:00:00.000Z`;
}

async function listAuditTrail({ db, url }) {
  const search = (url.searchParams.get("search") ?? "")
    .trim()
    .slice(0, 100);

  const action = (url.searchParams.get("action") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 100);

  const entityType = (url.searchParams.get("entityType") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 100);

  const dateFrom = parseDate(
    url.searchParams.get("dateFrom"),
    "start date"
  );

  const dateTo = parseDate(
    url.searchParams.get("dateTo"),
    "end date",
    true
  );

  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw httpError("Start date must not be after end date.", 400);
  }

  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const where = `
    WHERE (
      ?1 = ''
      OR audit.action LIKE '%' || ?1 || '%'
      OR audit.entity_type LIKE '%' || ?1 || '%'
      OR audit.entity_id LIKE '%' || ?1 || '%'
      OR audit.reason LIKE '%' || ?1 || '%'
      OR actor.full_name LIKE '%' || ?1 || '%'
      OR actor.user_id = ?1
      OR target.full_name LIKE '%' || ?1 || '%'
      OR target.email LIKE '%' || ?1 || '%'
    )
      AND (?2 = '' OR audit.action = ?2)
      AND (?3 = '' OR audit.entity_type = ?3)
      AND (?4 = '' OR audit.created_at >= ?4)
      AND (?5 = '' OR audit.created_at <= ?5)
  `;

  const [countResult, recordsResult] = await Promise.all([
    db.prepare(
      `SELECT COUNT(*) AS total
       FROM audit_logs audit
       LEFT JOIN users actor
         ON actor.user_id = audit.actor_user_id
       LEFT JOIN users target
         ON target.user_id = audit.entity_id
       ${where}`
    ).bind(
      search,
      action,
      entityType,
      dateFrom,
      dateTo
    ).first(),

    db.prepare(
      `SELECT
         audit.audit_id,
         audit.action,
         audit.entity_type,
         audit.entity_id,
         audit.actor_user_id,
         actor.full_name AS actor_name,
         target.full_name AS target_name,
         target.email AS target_email,
         audit.reason,
         audit.before_json,
         audit.after_json,
         audit.created_at,
         audit.country_id
       FROM audit_logs audit
       LEFT JOIN users actor
         ON actor.user_id = audit.actor_user_id
       LEFT JOIN users target
         ON target.user_id = audit.entity_id
       ${where}
       ORDER BY audit.created_at DESC, audit.audit_id DESC
       LIMIT ?6 OFFSET ?7`
    ).bind(
      search,
      action,
      entityType,
      dateFrom,
      dateTo,
      limit,
      offset
    ).all()
  ]);

  const records = (recordsResult?.results ?? []).map(row => ({
    auditId: row.audit_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    targetName: row.target_name,
    targetEmail: row.target_email,
    reason: row.reason,
    beforeJson: row.before_json,
    afterJson: row.after_json,
    createdAt: row.created_at,
    countryId: row.country_id
  }));

  const total = Number(countResult?.total ?? 0);

  return json({
    ok: true,
    readOnly: true,
    total,
    count: records.length,
    limit,
    offset,
    hasMore: offset + records.length < total,
    records
  });
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  if (status === 500) {
    console.error("SUPER_ADMIN_AUDIT_TRAIL_ERROR", {
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status === 500
      ? "Audit Trail service unavailable."
      : error.message
  }, status);
}

export async function handleSuperAdminAuditTrailRequest(
  request,
  env,
  url
) {
  if (
    url.pathname !== BASE_PATH ||
    request.method !== "GET"
  ) {
    return null;
  }

  try {
    await requireSuperAdmin(request, env);

    return await listAuditTrail({
      db: env.DB,
      url
    });
  } catch (error) {
    return errorResponse(error);
  }
}

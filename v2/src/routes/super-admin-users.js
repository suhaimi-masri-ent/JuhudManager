
import { json } from "../lib/http.js";
import { authenticateSession } from "../auth/sessions.js";
import { requireSuperAdminRole } from "../auth/authorization.js";

const BASE_PATH = "/super-admin/users";
const MAX_BODY_BYTES = 4096;
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

function validateUserId(value) {
  const userId = String(value ?? "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw httpError("A valid user ID is required.", 400);
  }

  return userId;
}

function validateReason(value) {
  const reason = typeof value === "string" ? value.trim() : "";

  if (reason.length < 10 || reason.length > 1000) {
    throw httpError(
      "Reason must contain between 10 and 1000 characters.",
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

function parseOffset(value) {
  if (value === null) {
    return 0;
  }

  if (!/^\d+$/.test(value)) {
    throw httpError("Invalid offset.", 400);
  }

  const offset = Number(value);

  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw httpError("Invalid offset.", 400);
  }

  return offset;
}

async function listUsers({ db, url }) {
  const search = (url.searchParams.get("search") ?? "").trim().slice(0, 100);
  const role = (url.searchParams.get("role") ?? "ALL").trim().toUpperCase();
  const accountStatus = (url.searchParams.get("accountStatus") ?? "ALL").trim().toUpperCase();
  const registrationStatus = (url.searchParams.get("registrationStatus") ?? "ALL").trim().toUpperCase();
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  if (!["ALL", "SUPER_ADMIN", "ADMIN", "AHBAB", "NO_ROLE"].includes(role)) {
    throw httpError("Invalid role filter.", 400);
  }

  if (!["ALL", "ACTIVE", "DISABLED", "SUSPENDED"].includes(accountStatus)) {
    throw httpError("Invalid account status filter.", 400);
  }

  if (![
    "ALL",
    "AWAITING_EMAIL_VERIFICATION",
    "PENDING_REVIEW",
    "APPROVED",
    "REJECTED",
    "CANCELLED"
  ].includes(registrationStatus)) {
    throw httpError("Invalid registration status filter.", 400);
  }

  const result = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.account_status,
       u.created_at,
       u.updated_at,
       r.registration_status,
       COALESCE(
         (
           SELECT GROUP_CONCAT(role.role_code, ',')
           FROM user_roles ur
           INNER JOIN roles role
             ON role.role_id = ur.role_id
           WHERE ur.user_id = u.user_id
         ),
         ''
       ) AS roles,
       (
         SELECT COUNT(*)
         FROM user_country_assignments a
         WHERE a.user_id = u.user_id
           AND a.assignment_status = 'ACTIVE'
       ) AS active_country_count,
       EXISTS (
         SELECT 1
         FROM user_account_archives ar
         WHERE ar.user_id = u.user_id
           AND ar.restored_at IS NULL
       ) AS is_archived
     FROM users u
     LEFT JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE (
       ?1 = ''
       OR u.full_name LIKE '%' || ?1 || '%'
       OR u.email LIKE '%' || ?1 || '%'
       OR u.user_id = ?1
     )
       AND (
         ?2 = 'ALL'
         OR EXISTS (
           SELECT 1
           FROM user_roles ur
           INNER JOIN roles role
             ON role.role_id = ur.role_id
           WHERE ur.user_id = u.user_id
             AND role.role_code = ?2
         )
         OR (
           ?2 = 'NO_ROLE'
           AND NOT EXISTS (
             SELECT 1
             FROM user_roles ur
             WHERE ur.user_id = u.user_id
           )
         )
       )
       AND (?3 = 'ALL' OR u.account_status = ?3)
       AND (
         ?4 = 'ALL'
         OR COALESCE(r.registration_status, '-') = ?4
       )
     ORDER BY
       CASE WHEN u.account_status = 'ACTIVE' THEN 0
            WHEN u.account_status = 'DISABLED' THEN 1
            ELSE 2 END,
       u.full_name COLLATE NOCASE,
       u.user_id
     LIMIT ?5 OFFSET ?6`
  ).bind(
    search,
    role,
    accountStatus,
    registrationStatus,
    limit,
    offset
  ).all();

  const users = (result?.results ?? []).map(row => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    accountStatus: row.account_status,
    registrationStatus: row.registration_status,
    roles: row.roles ? row.roles.split(",") : [],
    activeCountryCount: row.active_country_count,
    isArchived: Boolean(row.is_archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return json({
    ok: true,
    count: users.length,
    limit,
    offset,
    users
  });
}

async function getUserDetail({ db, userId }) {
  const user = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.account_status,
       u.created_at,
       u.updated_at,
       r.registration_status,
       r.reviewed_by,
       reviewer.full_name AS reviewed_by_name,
       r.reviewed_at,
       r.rejection_reason,
       r.cancellation_reason
     FROM users u
     LEFT JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     LEFT JOIN users reviewer
       ON reviewer.user_id = r.reviewed_by
     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (!user) {
    throw httpError("User not found.", 404);
  }

  const [
    rolesResult,
    assignmentsResult,
    archiveResult,
    identityResult,
    registrationIdentityResult
  ] = await Promise.all([
    db.prepare(
      `SELECT
         role.role_code,
         role.role_name,
         ur.assigned_at,
         ur.assigned_by,
         assigner.full_name AS assigned_by_name
       FROM user_roles ur
       INNER JOIN roles role
         ON role.role_id = ur.role_id
       LEFT JOIN users assigner
         ON assigner.user_id = ur.assigned_by
       WHERE ur.user_id = ?1
       ORDER BY role.role_code`
    ).bind(userId).all(),

    db.prepare(
      `SELECT
         a.assignment_id,
         a.country_id,
         c.country_name,
         a.assignment_role_code,
         a.assignment_status,
         a.assigned_at,
         a.assigned_by,
         assigner.full_name AS assigned_by_name,
         a.revoked_at,
         a.revoked_by,
         revoker.full_name AS revoked_by_name,
         a.revocation_reason
       FROM user_country_assignments a
       INNER JOIN countries c
         ON c.country_id = a.country_id
       LEFT JOIN users assigner
         ON assigner.user_id = a.assigned_by
       LEFT JOIN users revoker
         ON revoker.user_id = a.revoked_by
       WHERE a.user_id = ?1
       ORDER BY a.assigned_at DESC`
    ).bind(userId).all(),

    db.prepare(
      `SELECT
         archive_id,
         previous_account_status,
         archived_by,
         archived_at,
         archive_reason,
         restored_by,
         restored_at,
         restore_reason
       FROM user_account_archives
       WHERE user_id = ?1
       ORDER BY archived_at DESC`
    ).bind(userId).all(),

    db.prepare(
      `SELECT
         identity_type,
         verification_status,
         country_code,
         expires_at,
         verified_at,
         revoked_at,
         created_at
       FROM user_auth_identities
       WHERE user_id = ?1
       ORDER BY created_at DESC`
    ).bind(userId).all(),

    db.prepare(
      `SELECT
         identity_type,
         identity_status,
         country_code,
         released_at,
         released_by,
         release_reason,
         created_at,
         updated_at
       FROM user_registration_identity_details
       WHERE user_id = ?1
       ORDER BY created_at DESC`
    ).bind(userId).all()
  ]);

  const activeArchive = (archiveResult?.results ?? [])
    .find(row => row.restored_at === null);

  return json({
    ok: true,
    user: {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      accountStatus: user.account_status,
      registrationStatus: user.registration_status,
      reviewedBy: user.reviewed_by,
      reviewedByName: user.reviewed_by_name,
      reviewedAt: user.reviewed_at,
      rejectionReason: user.rejection_reason,
      cancellationReason: user.cancellation_reason,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isArchived: Boolean(activeArchive),
      roles: rolesResult?.results ?? [],
      countryAssignments: assignmentsResult?.results ?? [],
      archiveHistory: archiveResult?.results ?? [],
      authenticationIdentities: identityResult?.results ?? [],
      registrationIdentityHistory: registrationIdentityResult?.results ?? []
    }
  });
}

async function getUserActivity({ db, userId, url }) {
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const exists = await db.prepare(
    "SELECT user_id FROM users WHERE user_id = ?1 LIMIT 1"
  ).bind(userId).first();

  if (!exists) {
    throw httpError("User not found.", 404);
  }

  const result = await db.prepare(
    `SELECT
       activity.source,
       activity.activity_id,
       activity.activity_type,
       activity.entity_type,
       activity.entity_id,
       activity.actor_user_id,
       activity.actor_name,
       activity.reason,
       activity.activity_created_at
     FROM (
       SELECT
         'AUDIT' AS source,
         audit_logs.audit_id AS activity_id,
         audit_logs.action AS activity_type,
         audit_logs.entity_type AS entity_type,
         audit_logs.entity_id AS entity_id,
         audit_logs.actor_user_id AS actor_user_id,
         actor.full_name AS actor_name,
         audit_logs.reason AS reason,
         audit_logs.created_at AS activity_created_at
       FROM audit_logs
       LEFT JOIN users actor
         ON actor.user_id = audit_logs.actor_user_id
       WHERE audit_logs.entity_id = ?1
          OR audit_logs.actor_user_id = ?1

       UNION ALL

       SELECT
         'AUTH' AS source,
         auth_events.event_id AS activity_id,
         auth_events.event_type AS activity_type,
         'AUTHENTICATION' AS entity_type,
         auth_events.user_id AS entity_id,
         auth_events.user_id AS actor_user_id,
         actor.full_name AS actor_name,
         NULL AS reason,
         auth_events.created_at AS activity_created_at
       FROM auth_events
       LEFT JOIN users actor
         ON actor.user_id = auth_events.user_id
       WHERE auth_events.user_id = ?1
     ) AS activity
     ORDER BY activity.activity_created_at DESC
     LIMIT ?2 OFFSET ?3`
  ).bind(userId, limit, offset).all();

  const activities = (result?.results ?? []).map(row => ({
    source: row.source,
    activityId: row.activity_id,
    activityType: row.activity_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    reason: row.reason,
    createdAt: row.activity_created_at
  }));

  return json({
    ok: true,
    userId,
    count: activities.length,
    limit,
    offset,
    activities
  });
}

async function archiveUser({
  db,
  userId,
  administratorId,
  body,
  request
}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  const reason = validateReason(body.reason);

  if (userId === administratorId) {
    throw httpError("Self-archiving is not permitted.", 403);
  }

  const current = await db.prepare(
    `SELECT user_id, account_status
     FROM users
     WHERE user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (!current) {
    throw httpError("User not found.", 404);
  }

  if (!["ACTIVE", "DISABLED"].includes(current.account_status)) {
    throw httpError("This account cannot be archived.", 409);
  }

  const now = new Date().toISOString();
  const archiveId = crypto.randomUUID();
  const eventId = crypto.randomUUID();

  const ipAddress = request.headers.get("CF-Connecting-IP");
  const userAgent = request.headers.get("User-Agent");

  try {
    const results = await db.batch([
      db.prepare(
        `INSERT INTO user_account_archives (
           archive_id,
           user_id,
           previous_account_status,
           archived_by,
           archive_reason,
           archived_at
         )
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
      ).bind(
        archiveId,
        userId,
        current.account_status,
        administratorId,
        reason,
        now
      ),

      db.prepare(
        `UPDATE user_sessions
         SET
           revoked_at = ?1,
           revocation_reason = 'ACCOUNT_SUSPENDED'
         WHERE user_id = ?2
           AND revoked_at IS NULL`
      ).bind(
        now,
        userId
      ),

      db.prepare(
        `INSERT INTO auth_events (
           event_id,
           user_id,
           session_id,
           event_type,
           event_status,
           ip_address,
           user_agent,
           event_details,
           created_at
         )
         SELECT
           ?1,
           ?2,
           NULL,
           'ADMIN_ACCOUNT_SESSIONS_REVOKED',
           'SUCCESS',
           ?3,
           ?4,
           ?5,
           ?6
         WHERE EXISTS (
           SELECT 1
           FROM user_account_archives
           WHERE archive_id = ?7
             AND user_id = ?2
             AND restored_at IS NULL
         )`
      ).bind(
        eventId,
        userId,
        ipAddress,
        userAgent,
        JSON.stringify({
          reason: "ACCOUNT_SUSPENDED",
          archiveId
        }),
        now,
        archiveId
      )
    ]);

    const archiveChanges = results?.[0]?.meta?.changes ?? 0;
    const sessionChanges = results?.[1]?.meta?.changes ?? 0;
    const eventChanges = results?.[2]?.meta?.changes ?? 0;

    if (archiveChanges !== 1 || eventChanges !== 1) {
      throw httpError(
        "Account archive and session revocation could not be completed.",
        409
      );
    }

    return json({
      ok: true,
      message: "Account archived successfully. All active sessions have been revoked.",
      archiveId,
      userId,
      accountStatus: "SUSPENDED",
      revokedSessionCount: sessionChanges,
      archivedAt: now
    });
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    if (/constraint failed|already archived|SUPER_ADMIN|country assignments/i.test(error?.message ?? "")) {
      throw httpError(
        "Account could not be archived. Check its role, country assignments and archive status.",
        409
      );
    }

    throw error;
  }
}

async function restoreUser({ db, userId, administratorId, body }) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  const reason = validateReason(body.reason);

  const archive = await db.prepare(
    `SELECT archive_id
     FROM user_account_archives
     WHERE user_id = ?1
       AND restored_at IS NULL
     LIMIT 1`
  ).bind(userId).first();

  if (!archive) {
    throw httpError("Active archive record not found.", 404);
  }

  const now = new Date().toISOString();

  const result = await db.prepare(
    `UPDATE user_account_archives
     SET
       restored_by = ?1,
       restored_at = ?2,
       restore_reason = ?3
     WHERE archive_id = ?4
       AND user_id = ?5
       AND restored_at IS NULL`
  ).bind(
    administratorId,
    now,
    reason,
    archive.archive_id,
    userId
  ).run();

  if ((result?.meta?.changes ?? 0) !== 1) {
    throw httpError("Account could not be restored.", 409);
  }

  return json({
    ok: true,
    message: "Account restored successfully. The previous account status has been reinstated.",
    archiveId: archive.archive_id,
    userId,
    restoredAt: now
  });
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  if (status === 500) {
    console.error("SUPER_ADMIN_USER_ERROR", {
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status === 500
      ? "User management service unavailable."
      : error.message
  }, status);
}

export async function handleSuperAdminUserRequest(request, env, url) {
  const isListRequest =
    url.pathname === BASE_PATH &&
    request.method === "GET";

  const detailMatch = url.pathname.match(
    /^\/super-admin\/users\/([0-9a-f-]{36})$/i
  );

  const activityMatch = url.pathname.match(
    /^\/super-admin\/users\/([0-9a-f-]{36})\/activity$/i
  );

  const archiveMatch = url.pathname.match(
    /^\/super-admin\/users\/([0-9a-f-]{36})\/archive$/i
  );

  const restoreMatch = url.pathname.match(
    /^\/super-admin\/users\/([0-9a-f-]{36})\/restore$/i
  );

  const isDetailRequest = Boolean(detailMatch) && request.method === "GET";
  const isActivityRequest = Boolean(activityMatch) && request.method === "GET";
  const isArchiveRequest = Boolean(archiveMatch) && request.method === "POST";
  const isRestoreRequest = Boolean(restoreMatch) && request.method === "POST";

  if (
    !isListRequest &&
    !isDetailRequest &&
    !isActivityRequest &&
    !isArchiveRequest &&
    !isRestoreRequest
  ) {
    return null;
  }

  try {
    const session = await requireSuperAdmin(request, env);

    if (isListRequest) {
      return await listUsers({
        db: env.DB,
        url
      });
    }

    if (isDetailRequest) {
      return await getUserDetail({
        db: env.DB,
        userId: validateUserId(detailMatch[1])
      });
    }

    if (isActivityRequest) {
      return await getUserActivity({
        db: env.DB,
        userId: validateUserId(activityMatch[1]),
        url
      });
    }

    const body = await readJson(request);

    if (isArchiveRequest) {
      return await archiveUser({
        db: env.DB,
        userId: validateUserId(archiveMatch[1]),
        administratorId: session.userId,
        body,
        request
      });
    }

    return await restoreUser({
      db: env.DB,
      userId: validateUserId(restoreMatch[1]),
      administratorId: session.userId,
      body
    });
  } catch (error) {
    return errorResponse(error);
  }
}

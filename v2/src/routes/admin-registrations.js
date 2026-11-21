 
import { json } from "../lib/http.js";

import {
  authenticateSession
} from "../auth/sessions.js";

import {
  requireAdminRole
} from "../auth/authorization.js";

import {
  decryptValue
} from "../auth/crypto.js";

const ALLOWED_STATUSES = [
  "AWAITING_EMAIL_VERIFICATION",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED"
];

const MAX_LIMIT = 50;
const MAX_REASON_LENGTH = 1000;
const MAX_BODY_BYTES = 4096;

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

  const match = authorization.match(
    /^Bearer ([A-Za-z0-9_-]{43})$/
  );

  return match ? match[1] : null;
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  if (status === 500) {
    console.error("ADMIN_REGISTRATION_ERROR", {
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status === 500
      ? "Admin service unavailable."
      : error.message
  }, status);
}

async function requireAdminSession(request, env) {
  const token = getBearerToken(request);

  if (!token) {
    throw httpError(
      "A valid Bearer token is required.",
      401
    );
  }

  const session = await authenticateSession({
    db: env.DB,
    env,
    token
  });

  if (!session) {
    throw httpError(
      "Invalid or expired session.",
      401
    );
  }

  const administrator = await requireAdminRole({
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

  if (raw.length > MAX_BODY_BYTES) {
    throw httpError("Request body is too large.", 413);
  }

  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }
}

function parseLimit(value) {
  if (value === null) {
    return 20;
  }

  if (!/^\d+$/.test(value)) {
    throw httpError("Invalid limit.", 400);
  }

  const limit = Number(value);

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    throw httpError(
      `Limit must be between 1 and ${MAX_LIMIT}.`,
      400
    );
  }

  return limit;
}

function validUserId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(value);
}

async function listRegistrations({ db, url }) {
  const status = (
    url.searchParams.get("status") ??
    "PENDING_REVIEW"
  ).trim().toUpperCase();

  if (!ALLOWED_STATUSES.includes(status)) {
    throw httpError(
      "Invalid registration status.",
      400
    );
  }

  const limit = parseLimit(
    url.searchParams.get("limit")
  );

  const result = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.account_status,
       r.registration_status,
       r.created_at,
       r.updated_at
     FROM user_registration_reviews r
     INNER JOIN users u
       ON u.user_id = r.user_id
     WHERE r.registration_status = ?1
     ORDER BY r.created_at ASC, u.user_id ASC
     LIMIT ?2`
  ).bind(
    status,
    limit
  ).all();

  const registrations = (result?.results ?? []).map(row => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    accountStatus: row.account_status,
    registrationStatus: row.registration_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  return json({
    ok: true,
    status,
    count: registrations.length,
    registrations
  });
}

async function getRegistrationDetails({ db, env, userId }) {
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
       r.reviewed_at,
       r.rejection_reason,
       r.cancellation_reason
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (!user) {
    throw httpError("Registration not found.", 404);
  }

  const identityResult = await db.prepare(
    `SELECT
       detail_id,
       identity_type,
       country_code,
       identity_status,
       encrypted_value,
       created_at,
       updated_at
     FROM user_registration_identity_details
     WHERE user_id = ?1
     ORDER BY identity_type`
  ).bind(userId).all();

  const identities = [];

  for (const item of identityResult?.results ?? []) {
    const value = await decryptValue(
      env.ENCRYPTION_KEY,
      item.encrypted_value
    );

    identities.push({
      detailId: item.detail_id,
      type: item.identity_type,
      countryCode: item.country_code,
      value,
      status: item.identity_status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    });
  }

  return json({
    ok: true,
    registration: {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      accountStatus: user.account_status,
      registrationStatus: user.registration_status,
      reviewedBy: user.reviewed_by,
      reviewedAt: user.reviewed_at,
      rejectionReason: user.rejection_reason,
      cancellationReason: user.cancellation_reason,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    },
    identities
  });
}

async function reviewRegistration({
  db,
  userId,
  reviewerId,
  decision,
  reason
}) {
  const now = new Date().toISOString();

  const rejectionReason = decision === "REJECTED"
    ? reason
    : null;

  const result = await db.prepare(
    `UPDATE user_registration_reviews
     SET
       registration_status = ?1,
       reviewed_by = ?2,
       reviewed_at = ?3,
       rejection_reason = ?4,
       updated_at = ?3
     WHERE user_id = ?5
       AND registration_status = 'PENDING_REVIEW'
       AND reviewed_by IS NULL
       AND reviewed_at IS NULL
       AND EXISTS (
         SELECT 1
         FROM users u
         WHERE u.user_id = ?5
           AND u.account_status = 'DISABLED'
       )`
  ).bind(
    decision,
    reviewerId,
    now,
    rejectionReason,
    userId
  ).run();

  const changes = result?.meta?.changes ?? 0;

  if (changes !== 1) {
    throw httpError(
      "Registration is not pending review or has already been processed.",
      409
    );
  }

  return {
    userId,
    registrationStatus: decision,
    reviewedAt: now
  };
}

export async function handleAdminRegistrationRequest(
  request,
  env,
  url
) {
  const isListRequest =
    url.pathname === "/admin/registrations" &&
    request.method === "GET";

  const detailMatch = url.pathname.match(
    /^\/admin\/registrations\/([0-9a-f-]{36})$/i
  );

  const isDetailRequest =
    Boolean(detailMatch) &&
    request.method === "GET";

  const reviewMatch = url.pathname.match(
    /^\/admin\/registrations\/([0-9a-f-]{36})\/(approve|reject)$/i
  );

  const isReviewRequest =
    Boolean(reviewMatch) &&
    request.method === "POST";

  if (
    !isListRequest &&
    !isDetailRequest &&
    !isReviewRequest
  ) {
    return null;
  }

  try {
    const { session } = await requireAdminSession(
      request,
      env
    );

    if (isListRequest) {
      return await listRegistrations({
        db: env.DB,
        url
      });
    }

    if (isDetailRequest) {
      const userId = detailMatch[1];

      if (!validUserId(userId)) {
        throw httpError("Invalid user ID.", 400);
      }

      return await getRegistrationDetails({
        db: env.DB,
        env,
        userId
      });
    }

    const userId = reviewMatch[1];

    if (!validUserId(userId)) {
      throw httpError("Invalid user ID.", 400);
    }

    const decision = reviewMatch[2].toLowerCase() === "approve"
      ? "APPROVED"
      : "REJECTED";

    let reason = null;

    if (decision === "REJECTED") {
      const body = await readJson(request);

      if (
        typeof body?.reason !== "string" ||
        !body.reason.trim() ||
        body.reason.trim().length > MAX_REASON_LENGTH
      ) {
        throw httpError(
          `A rejection reason is required and must not exceed ${MAX_REASON_LENGTH} characters.`,
          400
        );
      }

      reason = body.reason.trim();
    }

    const result = await reviewRegistration({
      db: env.DB,
      userId,
      reviewerId: session.userId,
      decision,
      reason
    });

    return json({
      ok: true,
      message: decision === "APPROVED"
        ? "Registration approved."
        : "Registration rejected.",
      review: result
    });
  } catch (error) {
    return errorResponse(error);
  }
}

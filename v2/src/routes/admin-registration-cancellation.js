import { json } from "../lib/http.js";

import {
  authenticateSession
} from "../auth/sessions.js";

import {
  requireSuperAdminRole
} from "../auth/authorization.js";

const MAX_REASON_LENGTH = 1000;
const MAX_BODY_BYTES = 4096;

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

function errorResponse(error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;

  if (status === 500) {
    console.error("ADMIN_REGISTRATION_CANCELLATION_ERROR", {
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status === 500
      ? "Registration cancellation service unavailable."
      : error.message
  }, status);
}

async function requireAdminSession(request, env) {
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

  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw httpError("Request body is too large.", 413);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON request body.", 400);
  }
}

function validUserId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getCancellationEligibility(db, userId) {
  const row = await db.prepare(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.account_status,
       r.registration_status,

       (SELECT COUNT(*)
        FROM user_registration_identity_details d
        WHERE d.user_id = u.user_id
          AND d.identity_status = 'UNVERIFIED') AS unverified_detail_count,

       (SELECT COUNT(*)
        FROM user_registration_identity_details d
        WHERE d.user_id = u.user_id
          AND d.identity_status = 'VERIFIED') AS verified_detail_count,

       (SELECT COUNT(*)
        FROM user_auth_identities i
        WHERE i.user_id = u.user_id
          AND i.verification_status = 'PENDING') AS pending_auth_count,

       (SELECT COUNT(*)
        FROM user_auth_identities i
        WHERE i.user_id = u.user_id
          AND i.verification_status = 'VERIFIED') AS verified_auth_count,

       (SELECT COUNT(*)
        FROM auth_otp_requests o
        WHERE o.user_id = u.user_id
          AND o.consumed_at IS NULL
          AND o.invalidated_at IS NULL) AS active_otp_count,

       (SELECT COUNT(*)
        FROM user_credentials c
        WHERE c.user_id = u.user_id) AS credential_count

     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (!row) {
    throw httpError("Registration not found.", 404);
  }

  const blockers = [];

  if (row.registration_status !== "AWAITING_EMAIL_VERIFICATION") {
    blockers.push("Registration is not awaiting email verification.");
  }

  if (row.account_status !== "DISABLED") {
    blockers.push("Account must remain disabled.");
  }

  if (row.email !== null && String(row.email).trim() !== "") {
    blockers.push("Registration email must be empty.");
  }

  if (Number(row.verified_detail_count) > 0) {
    blockers.push("A verified registration identity exists.");
  }

  if (Number(row.verified_auth_count) > 0) {
    blockers.push("A verified authentication identity exists.");
  }

  if (Number(row.credential_count) > 0) {
    blockers.push("A password credential exists.");
  }

  return {
    userId: row.user_id,
    fullName: row.full_name,
    registrationStatus: row.registration_status,
    accountStatus: row.account_status,
    eligible: blockers.length === 0,
    blockers,
    identitiesToRevoke: Number(row.unverified_detail_count),
    pendingAuthIdentitiesToRevoke: Number(row.pending_auth_count),
    activeOtpRequestsToInvalidate: Number(row.active_otp_count)
  };
}

async function getEligibility({ db, userId }) {
  const eligibility = await getCancellationEligibility(db, userId);

  return json({
    ok: true,
    cancellation: eligibility
  });
}

async function cancelRegistration({
  db,
  userId,
  administratorId,
  body
}) {
  const reason = typeof body?.reason === "string"
    ? body.reason.trim()
    : "";

  if (reason.length < 10 || reason.length > MAX_REASON_LENGTH) {
    throw httpError(
      `A cancellation reason of 10 to ${MAX_REASON_LENGTH} characters is required.`,
      400
    );
  }

  const eligibility = await getCancellationEligibility(db, userId);

  if (!eligibility.eligible) {
    throw httpError(
      `Registration cannot be cancelled: ${eligibility.blockers.join(" ")}`,
      409
    );
  }

  const now = new Date().toISOString();

  const results = await db.batch([
    db.prepare(
      `UPDATE user_registration_identity_details
       SET
         identity_status = 'REVOKED',
         released_at = ?1,
         released_by = ?2,
         release_reason = ?3,
         updated_at = ?1
       WHERE user_id = ?4
         AND identity_status = 'UNVERIFIED'`
    ).bind(now, administratorId, reason, userId),

    db.prepare(
      `UPDATE user_auth_identities
       SET
         verification_status = 'REVOKED',
         revoked_at = ?1,
         revoked_by = ?2,
         updated_at = ?1
       WHERE user_id = ?3
         AND verification_status = 'PENDING'`
    ).bind(now, administratorId, userId),

    db.prepare(
      `UPDATE auth_otp_requests
       SET invalidated_at = ?1
       WHERE user_id = ?2
         AND consumed_at IS NULL
         AND invalidated_at IS NULL`
    ).bind(now, userId),

    db.prepare(
      `UPDATE user_registration_reviews
       SET
         registration_status = 'CANCELLED',
         reviewed_by = ?1,
         reviewed_at = ?2,
         cancellation_reason = ?3,
         updated_at = ?2
       WHERE user_id = ?4
         AND registration_status = 'AWAITING_EMAIL_VERIFICATION'
         AND reviewed_by IS NULL
         AND reviewed_at IS NULL
         AND EXISTS (
           SELECT 1
           FROM users u
           WHERE u.user_id = ?4
             AND u.account_status = 'DISABLED'
             AND (u.email IS NULL OR length(trim(u.email)) = 0)
         )`
    ).bind(administratorId, now, reason, userId)
  ]);

  const detailChanges = results?.[0]?.meta?.changes ?? 0;
  const authChanges = results?.[1]?.meta?.changes ?? 0;
  const otpChanges = results?.[2]?.meta?.changes ?? 0;
  const reviewChanges = results?.[3]?.meta?.changes ?? 0;

  if (
    detailChanges !== eligibility.identitiesToRevoke ||
    authChanges !== eligibility.pendingAuthIdentitiesToRevoke ||
    otpChanges !== eligibility.activeOtpRequestsToInvalidate ||
    reviewChanges !== 1
  ) {
    throw httpError(
      "Registration cancellation did not complete as expected. Refresh the registration before trying again.",
      409
    );
  }

  return {
    userId,
    registrationStatus: "CANCELLED",
    cancelledAt: now,
    identitiesRevoked: detailChanges,
    authenticationIdentitiesRevoked: authChanges,
    otpRequestsInvalidated: otpChanges
  };
}

export async function handleAdminRegistrationCancellationRequest(
  request,
  env,
  url
) {
  const eligibilityMatch = url.pathname.match(
    /^\/admin\/registrations\/([0-9a-f-]{36})\/cancellation-eligibility$/i
  );

  const cancelMatch = url.pathname.match(
    /^\/admin\/registrations\/([0-9a-f-]{36})\/cancel$/i
  );

  const isEligibilityRequest =
    Boolean(eligibilityMatch) && request.method === "GET";

  const isCancelRequest =
    Boolean(cancelMatch) && request.method === "POST";

  if (!isEligibilityRequest && !isCancelRequest) {
    return null;
  }

  try {
    const session = await requireAdminSession(request, env);
    const userId = (eligibilityMatch ?? cancelMatch)[1];

    if (!validUserId(userId)) {
      throw httpError("Invalid user ID.", 400);
    }

    if (isEligibilityRequest) {
      return await getEligibility({
        db: env.DB,
        userId
      });
    }

    const body = await readJson(request);

    const result = await cancelRegistration({
      db: env.DB,
      userId,
      administratorId: session.userId,
      body
    });

    return json({
      ok: true,
      message: "Incomplete registration cancelled. Identity claims were revoked and retained in history.",
      cancellation: result
    });
  } catch (error) {
    return errorResponse(error);
  }
}

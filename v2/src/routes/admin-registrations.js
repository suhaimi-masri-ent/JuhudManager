import { json } from "../lib/http.js";

import {
  authenticateSession
} from "../auth/sessions.js";

import {
  requireSuperAdminRole
} from "../auth/authorization.js";

import {
  encryptValue,
  hashValue,
  normalizeDestination
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
const ALLOWED_VERIFICATION_METHODS = [
  "ORIGINAL_DOCUMENT_CHECK",
  "DIRECT_CONTACT",
  "OTHER"
];

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

  const message = String(error?.message ?? "");

  if (
    status === 409 &&
    /UNIQUE constraint failed|constraint failed/i.test(message)
  ) {
    return json({
      error: "The corrected identity is already in use or the registration changed. Refresh and try again."
    }, 409);
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
  const actualBytes = new TextEncoder().encode(raw).byteLength;

  if (actualBytes > MAX_BODY_BYTES) {
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

function normalizeNationalId(value) {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (!normalized || normalized.length > 100) {
    throw httpError("A valid National ID is required.", 400);
  }

  return normalized;
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

/*
 * Identity values are deliberately never decrypted for the Admin detail
 * screen. Admin sees type, issuing country, status and dates only.
 */
async function getRegistrationDetails({ db, userId }) {
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
       created_at,
       updated_at,
       released_at,
       released_by,
       release_reason
     FROM user_registration_identity_details
     WHERE user_id = ?1
     ORDER BY identity_type, created_at DESC`
  ).bind(userId).all();

  const identities = (identityResult?.results ?? []).map(item => ({
    detailId: item.detail_id,
    type: item.identity_type,
    countryCode: item.country_code,
    maskedValue: "Hidden for security",
    status: item.identity_status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    releasedAt: item.released_at,
    releasedBy: item.released_by,
    releaseReason: item.release_reason
  }));

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

function validateRecoveryBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError("A valid JSON request body is required.", 400);
  }

  if (body.ownerVerified !== true) {
    throw httpError(
      "Admin must confirm that the registration owner was independently verified.",
      400
    );
  }

  const reason = typeof body.reason === "string"
    ? body.reason.trim()
    : "";

  if (reason.length < 10 || reason.length > MAX_REASON_LENGTH) {
    throw httpError(
      `A recovery reason of 10 to ${MAX_REASON_LENGTH} characters is required.`,
      400
    );
  }

  if (!ALLOWED_VERIFICATION_METHODS.includes(body.verificationMethod)) {
    throw httpError("Select a valid owner-verification method.", 400);
  }

  const hasNationalId =
    typeof body.nationalId === "string" &&
    body.nationalId.trim().length > 0;

  const hasWhatsApp =
    typeof body.whatsapp === "string" &&
    body.whatsapp.trim().length > 0;

  if (!hasNationalId && !hasWhatsApp) {
    throw httpError(
      "Enter at least one corrected identity.",
      400
    );
  }

  let countryCode = null;
  let nationalId = null;
  let whatsapp = null;

  if (hasNationalId) {
    if (
      typeof body.countryCode !== "string" ||
      !/^[A-Za-z]{2}$/.test(body.countryCode.trim())
    ) {
      throw httpError(
        "A valid two-letter National ID issuing country code is required.",
        400
      );
    }

    countryCode = body.countryCode.trim().toUpperCase();
    nationalId = normalizeNationalId(body.nationalId);
  }

  if (hasWhatsApp) {
    try {
      whatsapp = normalizeDestination("WHATSAPP", body.whatsapp);
    } catch {
      throw httpError(
        "WhatsApp must be supplied in international E.164 format, for example +60123456789.",
        400
      );
    }
  }

  return {
    reason,
    verificationMethod: body.verificationMethod,
    nationalId,
    countryCode,
    whatsapp
  };
}

async function prepareReplacement({
  env,
  userId,
  identityType,
  value,
  countryCode
}) {
  const identityScope = identityType === "NATIONAL_ID"
    ? countryCode
    : "GLOBAL";

  const normalized = identityType === "NATIONAL_ID"
    ? normalizeNationalId(value)
    : normalizeDestination("WHATSAPP", value);

  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `${identityType}:${identityScope}:${normalized}`
  );

  const encryptedValue = await encryptValue(
    env.ENCRYPTION_KEY,
    normalized
  );

  return {
    detailId: crypto.randomUUID(),
    userId,
    identityType,
    countryCode: identityType === "NATIONAL_ID" ? countryCode : null,
    identityScope,
    identityHash,
    encryptedValue
  };
}

async function recoverRegistrationIdentities({
  db,
  env,
  userId,
  administratorId,
  body
}) {
  if (!env?.HMAC_SECRET || !env?.ENCRYPTION_KEY) {
    throw new Error("Registration security secrets are not configured.");
  }

  const input = validateRecoveryBody(body);

  const registration = await db.prepare(
    `SELECT
       u.account_status,
       r.registration_status
     FROM users u
     INNER JOIN user_registration_reviews r
       ON r.user_id = u.user_id
     WHERE u.user_id = ?1
     LIMIT 1`
  ).bind(userId).first();

  if (
    !registration ||
    registration.registration_status !== "AWAITING_EMAIL_VERIFICATION" ||
    registration.account_status !== "DISABLED"
  ) {
    throw httpError(
      "Only registrations awaiting email verification can use this recovery process.",
      409
    );
  }

  const requested = [];

  if (input.nationalId) {
    requested.push(await prepareReplacement({
      env,
      userId,
      identityType: "NATIONAL_ID",
      value: input.nationalId,
      countryCode: input.countryCode
    }));
  }

  if (input.whatsapp) {
    requested.push(await prepareReplacement({
      env,
      userId,
      identityType: "WHATSAPP",
      value: input.whatsapp,
      countryCode: null
    }));
  }

  const statements = [];
  const now = new Date().toISOString();

  for (const replacement of requested) {
    const currentResult = await db.prepare(
      `SELECT
         detail_id,
         identity_hash,
         identity_scope,
         country_code
       FROM user_registration_identity_details
       WHERE user_id = ?1
         AND identity_type = ?2
         AND identity_status = 'UNVERIFIED'
       ORDER BY created_at DESC
       LIMIT 2`
    ).bind(userId, replacement.identityType).all();

    const currentRows = currentResult?.results ?? [];

    if (currentRows.length !== 1) {
      throw httpError(
        "A single current unverified identity could not be identified. Admin review is required.",
        409
      );
    }

    const current = currentRows[0];

    if (
      current.identity_hash === replacement.identityHash &&
      current.identity_scope === replacement.identityScope
    ) {
      throw httpError(
        `The corrected ${replacement.identityType === "NATIONAL_ID" ? "National ID" : "WhatsApp"} matches the existing value.`,
        409
      );
    }

    const claimed = await db.prepare(
      `SELECT user_id
       FROM user_registration_identity_details
       WHERE identity_type = ?1
         AND identity_scope = ?2
         AND identity_hash = ?3
         AND identity_status IN ('UNVERIFIED', 'VERIFIED')
         AND user_id <> ?4
       LIMIT 1`
    ).bind(
      replacement.identityType,
      replacement.identityScope,
      replacement.identityHash,
      userId
    ).first();

    if (claimed) {
      throw httpError(
        `The corrected ${replacement.identityType === "NATIONAL_ID" ? "National ID" : "WhatsApp"} is already claimed by another account.`,
        409
      );
    }

    // Retain the old encrypted row as REVOKED history.
    statements.push(
      db.prepare(
        `UPDATE user_registration_identity_details
         SET
           identity_status = 'REVOKED',
           released_at = ?1,
           released_by = ?2,
           release_reason = ?3,
           updated_at = ?1
         WHERE detail_id = ?4
           AND user_id = ?5
           AND identity_type = ?6
           AND identity_status = 'UNVERIFIED'
           AND EXISTS (
             SELECT 1
             FROM user_registration_reviews r
             INNER JOIN users u ON u.user_id = r.user_id
             WHERE r.user_id = ?5
               AND r.registration_status = 'AWAITING_EMAIL_VERIFICATION'
               AND u.account_status = 'DISABLED'
           )`
      ).bind(
        now,
        administratorId,
        input.reason,
        current.detail_id,
        userId,
        replacement.identityType
      )
    );

    // New identity is UNVERIFIED; no identity verification is implied.
    statements.push(
      db.prepare(
        `INSERT INTO user_registration_identity_details (
           detail_id,
           user_id,
           identity_type,
           country_code,
           identity_scope,
           identity_hash,
           hash_key_version,
           encrypted_value,
           identity_status
         )
         VALUES (
           CASE WHEN changes() = 1 THEN ?1 ELSE ?8 END,
           ?2, ?3, ?4, ?5, ?6, 1, ?7, 'UNVERIFIED'
         )`
      ).bind(
        replacement.detailId,
        userId,
        replacement.identityType,
        replacement.countryCode,
        replacement.identityScope,
        replacement.identityHash,
        replacement.encryptedValue,
        current.detail_id
      )
    );

    // The insert above is unconditional. If the preceding release UPDATE
    // changed zero rows, CASE reuses the old primary key and deliberately
    // raises a constraint error. D1 batch then rolls back every identity
    // replacement in this recovery request, including the other type.
    // Audit metadata contains identifiers and method only, never raw PII.
    statements.push(
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
           created_at
         )
         VALUES (
           ?1,
           ?2,
           'REGISTRATION_IDENTITY_CORRECTED',
           'USER_REGISTRATION',
           ?3,
           ?4,
           ?5,
           ?6,
           ?7
         )`
      ).bind(
        crypto.randomUUID(),
        administratorId,
        userId,
        JSON.stringify({
          identityType: replacement.identityType,
          previousDetailId: current.detail_id,
          previousCountryCode: current.country_code
        }),
        JSON.stringify({
          identityType: replacement.identityType,
          replacementDetailId: replacement.detailId,
          replacementCountryCode: replacement.countryCode,
          verificationMethod: input.verificationMethod
        }),
        input.reason,
        now
      )
    );
  }

  const results = await db.batch(statements);

  if (
    !Array.isArray(results) ||
    results.length !== requested.length * 3
  ) {
    throw new Error("Identity recovery transaction returned an unexpected result.");
  }

  for (let index = 0; index < results.length; index += 3) {
    const released = results[index]?.meta?.changes ?? 0;
    const inserted = results[index + 1]?.meta?.changes ?? 0;
    const audited = results[index + 2]?.meta?.changes ?? 0;

    if (released !== 1 || inserted !== 1 || audited !== 1) {
      throw httpError(
        "Identity recovery could not be completed. No changes were committed.",
        409
      );
    }
  }

  return {
    userId,
    correctedTypes: requested.map(item => item.identityType),
    correctedAt: now,
    identityStatus: "UNVERIFIED"
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

  const recoveryMatch = url.pathname.match(
    /^\/admin\/registrations\/([0-9a-f-]{36})\/recover-identities$/i
  );

  const isRecoveryRequest =
    Boolean(recoveryMatch) &&
    request.method === "POST";

  if (
    !isListRequest &&
    !isDetailRequest &&
    !isReviewRequest &&
    !isRecoveryRequest
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
        userId
      });
    }

    if (isRecoveryRequest) {
      const userId = recoveryMatch[1];

      if (!validUserId(userId)) {
        throw httpError("Invalid user ID.", 400);
      }

      const body = await readJson(request);

      const result = await recoverRegistrationIdentities({
        db: env.DB,
        env,
        userId,
        administratorId: session.userId,
        body
      });

      return json({
        ok: true,
        message: "Registration identity details corrected. The new identities remain unverified.",
        recovery: result
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

import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

async function checkReviewer(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return { error: auth.error };
  }

  const roleCheck = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR')
    LIMIT 1
  `).bind(auth.user.user_id).first();

  if (!roleCheck) {
    return {
      error: jsonResponse({ error: "Forbidden" }, 403)
    };
  }

  return { auth };
}

export async function adminSubmissionsHandler(request, env) {
  const access = await checkReviewer(request, env);

  if (access.error) {
    return access.error;
  }

  const result = await env.DB.prepare(`
    SELECT
      ar.record_id,
      ua.full_name,
      at.activity_name,
      ar.description,
      ar.activity_date,
      ar.start_time,
      ar.end_date,
      ar.end_time,
      ar.progress_status,
      ar.review_status,
      ar.reviewer_remarks,
      ar.submitted_at
    FROM activity_records ar
    LEFT JOIN user_accounts ua
      ON ua.user_id = ar.user_id
    LEFT JOIN activity_types at
      ON at.activity_type_id = ar.activity_type_id
    ORDER BY ar.submitted_at DESC
  `).all();

  return jsonResponse({
    submissions: result.results || []
  });
}

export async function adminReviewSubmissionHandler(
  request,
  env,
  recordId
) {
  const access = await checkReviewer(request, env);

  if (access.error) {
    return access.error;
  }

  const reviewerId = access.auth.user.user_id;

  // VALIDATE RECORD ID
  if (!recordId || recordId.includes("/")) {
    return jsonResponse({
      error: "Invalid record ID"
    }, 400);
  }

  // READ REQUEST BODY
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({
      error: "Invalid JSON request"
    }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({
      error: "Invalid request body"
    }, 400);
  }

  const reviewStatus = body.reviewStatus;
  const remarks = body.remarks;

  // VALIDATE REVIEW STATUS
  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "NEEDS_REVISION",
    "REJECTED"
  ];

  if (!allowedStatuses.includes(reviewStatus)) {
    return jsonResponse({
      error: "Invalid review status"
    }, 400);
  }

  // VALIDATE REMARKS
  if (
    remarks !== undefined &&
    remarks !== null &&
    typeof remarks !== "string"
  ) {
    return jsonResponse({
      error: "Invalid reviewer remarks"
    }, 400);
  }

  const cleanedRemarks = typeof remarks === "string"
    ? remarks.trim()
    : "";

  if (cleanedRemarks.length > 2000) {
    return jsonResponse({
      error: "Reviewer remarks cannot exceed 2000 characters"
    }, 400);
  }

  // CHECK SUBMISSION EXISTS
  const record = await env.DB.prepare(`
    SELECT record_id
    FROM activity_records
    WHERE record_id = ?
    LIMIT 1
  `).bind(recordId).first();

  if (!record) {
    return jsonResponse({
      error: "Submission not found"
    }, 404);
  }

  // SAVE REVIEW
  await env.DB.prepare(`
    UPDATE activity_records
    SET
      review_status = ?,
      reviewer_remarks = ?,
      reviewed_by = ?,
      reviewed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE record_id = ?
  `).bind(
    reviewStatus,
    cleanedRemarks || null,
    reviewerId,
    recordId
  ).run();

  // AUDIT: ACTIVITY REVIEWED
  await env.DB.prepare(`
    INSERT INTO audit_logs (
      audit_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      details_json
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    reviewerId,
    "ACTIVITY_REVIEWED",
    "ACTIVITY_RECORD",
    recordId,
    JSON.stringify({
      review_status: reviewStatus,
      client: await getRequestMetadata(request)
    })
  ).run();

  return jsonResponse({
    success: true,
    message: "Submission reviewed successfully",
    review_status: reviewStatus
  });
}

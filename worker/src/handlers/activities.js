import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

export async function activitiesHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  // GET: LOAD ACTIVITY TYPES AND USER RECORDS
  if (request.method === "GET") {
    const types = await env.DB.prepare(`
      SELECT
        activity_type_id,
        activity_name,
        description,
        frequency,
        requires_update,
        requires_attachment
      FROM activity_types
      WHERE status = 'ACTIVE'
      ORDER BY activity_name COLLATE NOCASE
    `).all();

    const records = await env.DB.prepare(`
      SELECT
        ar.record_id,
        ar.activity_type_id,
        at.activity_name,
        ar.activity_date,
        ar.start_time,
        ar.end_date,
        ar.end_time,
        ar.period_start,
        ar.period_end,
        ar.description,
        ar.progress_status,
        ar.review_status,
        ar.reviewer_remarks,
        ar.submitted_at,
        ar.reviewed_at,
        reviewer.full_name AS reviewer_name
      FROM activity_records ar
      JOIN activity_types at
        ON at.activity_type_id = ar.activity_type_id
      LEFT JOIN user_accounts reviewer
        ON reviewer.user_id = ar.reviewed_by
      WHERE ar.user_id = ?
      ORDER BY ar.activity_date DESC, ar.submitted_at DESC
    `).bind(auth.user.user_id).all();

    return jsonResponse({
      types: types.results || [],
      records: records.results || []
    });
  }

  // POST: SUBMIT NEW ACTIVITY
  if (request.method === "POST") {
    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({
        error: "Invalid JSON"
      }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({
        error: "Invalid request body"
      }, 400);
    }

    const activityTypeId = String(body.activityTypeId || "").trim();
    const activityDate = String(body.activityDate || "").trim();
    const startTime = String(body.startTime || "").trim();
    const endDate = String(body.endDate || "").trim();
    const endTime = String(body.endTime || "").trim();
    const description = String(body.description || "").trim();
    const progressStatus = String(
      body.progressStatus || "COMPLETED"
    ).trim();

    // REQUIRED FIELDS
    if (!activityTypeId || !activityDate || !startTime) {
      return jsonResponse({
        error: "Activity type, start date and start time are required"
      }, 400);
    }

    // PROGRESS VALIDATION
    if (!["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(progressStatus)) {
      return jsonResponse({
        error: "Invalid progress status"
      }, 400);
    }

    // DATE AND TIME FORMAT VALIDATION
    const validDate = value => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(value + "T00:00:00");

      return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
    };

    const validTime = value => {
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    };

    if (
      !validDate(activityDate) ||
      (endDate && !validDate(endDate)) ||
      !validTime(startTime) ||
      (endTime && !validTime(endTime))
    ) {
      return jsonResponse({
        error: "Invalid date or time format"
      }, 400);
    }

    // END TIME REQUIRES END DATE
    if (endTime && !endDate) {
      return jsonResponse({
        error: "Please enter End Date when End Time is provided"
      }, 400);
    }

    // END DATE CANNOT BE BEFORE START DATE
    if (endDate && endDate < activityDate) {
      return jsonResponse({
        error: "End Date cannot be earlier than Start Date"
      }, 400);
    }

    // IF SAME DATE, END TIME CANNOT BE BEFORE START TIME
    if (
      endDate &&
      endDate === activityDate &&
      endTime &&
      endTime < startTime
    ) {
      return jsonResponse({
        error: "End Time cannot be earlier than Start Time"
      }, 400);
    }

    // VERIFY ACTIVITY TYPE
    const activityType = await env.DB.prepare(`
      SELECT activity_type_id
      FROM activity_types
      WHERE activity_type_id = ?
        AND status = 'ACTIVE'
    `).bind(activityTypeId).first();

    if (!activityType) {
      return jsonResponse({
        error: "Activity type not found"
      }, 404);
    }

    // CREATE RECORD
    const recordId = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO activity_records (
        record_id,
        user_id,
        activity_type_id,
        activity_date,
        start_time,
        end_date,
        end_time,
        period_start,
        period_end,
        description,
        progress_status,
        review_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, 'PENDING')
    `).bind(
      recordId,
      auth.user.user_id,
      activityTypeId,
      activityDate,
      startTime,
      endDate || null,
      endTime || null,
      description,
      progressStatus
    ).run();

    // AUDIT: ACTIVITY SUBMITTED
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
      auth.user.user_id,
      "ACTIVITY_SUBMITTED",
      "ACTIVITY_RECORD",
      recordId,
      JSON.stringify({
        activity_type_id: activityTypeId,
        progress_status: progressStatus,
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Activity submitted successfully",
      record_id: recordId
    }, 201);
  }

  // PATCH: USER EDIT AND RESUBMIT ACTIVITY
  if (request.method === "PATCH") {
    const url = new URL(request.url);
    const recordId = url.pathname.split("/").pop();

    if (!recordId || recordId.includes("/")) {
      return jsonResponse({
        error: "Invalid record ID"
      }, 400);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({
        error: "Invalid JSON"
      }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({
        error: "Invalid request body"
      }, 400);
    }

    const activityDate = String(body.activityDate || "").trim();
    const startTime = String(body.startTime || "").trim();
    const endDate = String(body.endDate || "").trim();
    const endTime = String(body.endTime || "").trim();
    const description = String(body.description || "").trim();
    const progressStatus = String(body.progressStatus || "").trim();

    if (!activityDate || !startTime || !description) {
      return jsonResponse({
        error: "Activity date, start time and description are required"
      }, 400);
    }

    if (!["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(progressStatus)) {
      return jsonResponse({
        error: "Invalid progress status"
      }, 400);
    }

    const validDate = value => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

      const date = new Date(value + "T00:00:00");

      return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
    };

    const validTime = value =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

    if (
      !validDate(activityDate) ||
      (endDate && !validDate(endDate)) ||
      !validTime(startTime) ||
      (endTime && !validTime(endTime))
    ) {
      return jsonResponse({
        error: "Invalid date or time format"
      }, 400);
    }

    if (endTime && !endDate) {
      return jsonResponse({
        error: "End Date is required when End Time is provided"
      }, 400);
    }

    if (endDate && endDate < activityDate) {
      return jsonResponse({
        error: "End Date cannot be earlier than Start Date"
      }, 400);
    }

    if (
      endDate === activityDate &&
      endTime &&
      endTime < startTime
    ) {
      return jsonResponse({
        error: "End Time cannot be earlier than Start Time"
      }, 400);
    }

    const record = await env.DB.prepare(`
      SELECT record_id
      FROM activity_records
      WHERE record_id = ?
        AND user_id = ?
        AND review_status = 'NEEDS_REVISION'
      LIMIT 1
    `).bind(
      recordId,
      auth.user.user_id
    ).first();

    if (!record) {
      return jsonResponse({
        error: "Activity not found or is not available for revision"
      }, 404);
    }

    await env.DB.prepare(`
      UPDATE activity_records
      SET
        activity_date = ?,
        start_time = ?,
        end_date = ?,
        end_time = ?,
        description = ?,
        progress_status = ?,
        review_status = 'PENDING',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE record_id = ?
        AND user_id = ?
        AND review_status = 'NEEDS_REVISION'
    `).bind(
      activityDate,
      startTime,
      endDate || null,
      endTime || null,
      description,
      progressStatus,
      recordId,
      auth.user.user_id
    ).run();

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
      auth.user.user_id,
      "ACTIVITY_RESUBMITTED",
      "ACTIVITY_RECORD",
      recordId,
      JSON.stringify({
        activity_date: activityDate,
        progress_status: progressStatus,
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Activity updated and resubmitted successfully",
      review_status: "PENDING"
    });
  }
  
  return jsonResponse({
    error: "Method Not Allowed"
  }, 405);
}

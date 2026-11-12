
import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

async function checkAdmin(env, userId) {
  return await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('ADMIN', 'SUPER_ADMIN')
    LIMIT 1
  `).bind(userId).first();
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00");
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

export async function adminAssignmentsHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  const admin = await checkAdmin(env, auth.user.user_id);

  if (!admin) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  // GET: LIST ASSIGNMENTS
  if (request.method === "GET") {
    const result = await env.DB.prepare(`
      SELECT
        aa.assignment_id,
        aa.activity_type_id,
        at.activity_name,
        aa.user_id,
        ua.full_name AS user_name,
        aa.assigned_by,
        aa.assigned_at,
        aa.due_date,
        aa.status
      FROM activity_assignments aa
      LEFT JOIN activity_types at
        ON at.activity_type_id = aa.activity_type_id
      LEFT JOIN user_accounts ua
        ON ua.user_id = aa.user_id
      ORDER BY aa.assigned_at DESC
    `).all();

    return jsonResponse({
      assignments: result.results || []
    });
  }

  // POST: CREATE ASSIGNMENT(S)
  if (request.method === "POST") {
    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    const activityTypeId = String(
      body.activity_type_id || body.activityTypeId || ""
    ).trim();

    const assignToAll = body.assign_to_all === true ||
      body.assignToAll === true;

    const userId = String(body.user_id || body.userId || "").trim();
    const dueDate = body.due_date == null && body.dueDate == null
      ? null
      : String(body.due_date ?? body.dueDate).trim();

    if (!activityTypeId) {
      return jsonResponse({
        error: "Activity type is required"
      }, 400);
    }

    if (dueDate && !isValidDate(dueDate)) {
      return jsonResponse({
        error: "Invalid due date. Use YYYY-MM-DD"
      }, 400);
    }

    if (!assignToAll && !userId) {
      return jsonResponse({
        error: "Select a user or set assign_to_all to true"
      }, 400);
    }

    const activityType = await env.DB.prepare(`
      SELECT activity_type_id
      FROM activity_types
      WHERE activity_type_id = ?
        AND status = 'ACTIVE'
      LIMIT 1
    `).bind(activityTypeId).first();

    if (!activityType) {
      return jsonResponse({
        error: "Active activity type not found"
      }, 404);
    }

    let users;

    if (assignToAll) {
      const result = await env.DB.prepare(`
        SELECT DISTINCT ua.user_id
        FROM user_accounts ua
        JOIN user_roles ur ON ur.user_id = ua.user_id
        JOIN roles r ON r.role_id = ur.role_id
        WHERE ua.account_status = 'ACTIVE'
          AND r.role_name IN ('USER', 'EMPLOYEE')
        ORDER BY ua.user_id
      `).all();

      users = result.results || [];
    } else {
      const targetUser = await env.DB.prepare(`
        SELECT DISTINCT ua.user_id
        FROM user_accounts ua
        JOIN user_roles ur ON ur.user_id = ua.user_id
        JOIN roles r ON r.role_id = ur.role_id
        WHERE ua.user_id = ?
          AND ua.account_status = 'ACTIVE'
          AND r.role_name IN ('USER', 'EMPLOYEE')
        LIMIT 1
      `).bind(userId).first();

      if (!targetUser) {
        return jsonResponse({
          error: "User not found, inactive, or not eligible for assignments"
        }, 404);
      }

      users = [targetUser];
    }

    const statements = [];
    let skipped = 0;

    for (const user of users) {
      const existing = await env.DB.prepare(`
        SELECT assignment_id
        FROM activity_assignments
        WHERE activity_type_id = ?
          AND user_id = ?
          AND status = 'ACTIVE'
        LIMIT 1
      `).bind(activityTypeId, user.user_id).first();

      if (existing) {
        skipped++;
        continue;
      }

      statements.push(
        env.DB.prepare(`
          INSERT INTO activity_assignments (
            assignment_id,
            activity_type_id,
            user_id,
            assigned_by,
            due_date,
            status
          )
          SELECT ?, ?, ?, ?, ?, 'ACTIVE'
          WHERE NOT EXISTS (
            SELECT 1
            FROM activity_assignments
            WHERE activity_type_id = ?
              AND user_id = ?
              AND status = 'ACTIVE'
          )
        `).bind(
          crypto.randomUUID(),
          activityTypeId,
          user.user_id,
          auth.user.user_id,
          dueDate,
          activityTypeId,
          user.user_id
        )
      );
    }

    if (statements.length > 0) {
      await env.DB.batch(statements);
    }

    const created = statements.length;

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
      "ASSIGNMENTS_CREATED",
      "ACTIVITY_TYPE",
      activityTypeId,
      JSON.stringify({
        assign_to_all: assignToAll,
        requested_users: users.length,
        created,
        skipped,
        due_date: dueDate,
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Assignment processing completed",
      activity_type_id: activityTypeId,
      requested: users.length,
      created,
      skipped
    }, 201);
  }

  return jsonResponse({ error: "Method Not Allowed" }, 405);
}

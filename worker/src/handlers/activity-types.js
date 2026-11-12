import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

export async function adminActivityTypesHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  const admin = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(auth.user.user_id).first();

  if (!admin) {
    return jsonResponse({
      error: "Forbidden"
    }, 403);
  }

  // GET: LIST ACTIVITY TYPES
  if (request.method === "GET") {
    const result = await env.DB.prepare(`
      SELECT
        activity_type_id,
        activity_name,
        description,
        frequency,
        requires_update,
        requires_attachment,
        start_date,
        end_date,
        status
      FROM activity_types
      ORDER BY activity_name COLLATE NOCASE
    `).all();

    return jsonResponse({
      activity_types: result.results || []
    });
  }

  // POST: CREATE ACTIVITY TYPE
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

    const activityName = String(
      body.activityName || body.activity_name || ""
    ).trim();

    const description = String(
      body.description || ""
    ).trim();

    const frequency = String(
      body.frequency || ""
    ).trim();

    const requiresUpdate =
      body.requiresUpdate === false ||
      body.requires_update === 0 ||
      body.requires_update === false
        ? 0
        : 1;

    const requiresAttachment =
      body.requiresAttachment === true ||
      body.requires_attachment === 1 ||
      body.requires_attachment === true
        ? 1
        : 0;

    if (!activityName || !frequency) {
      return jsonResponse({
        error: "Activity name and frequency are required"
      }, 400);
    }

    const duplicate = await env.DB.prepare(`
      SELECT activity_type_id
      FROM activity_types
      WHERE LOWER(activity_name) = LOWER(?)
      LIMIT 1
    `).bind(activityName).first();

    if (duplicate) {
      return jsonResponse({
        error: "Activity type already exists"
      }, 409);
    }

    const activityTypeId = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO activity_types (
        activity_type_id,
        activity_name,
        description,
        frequency,
        requires_update,
        requires_attachment,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).bind(
      activityTypeId,
      activityName,
      description || null,
      frequency,
      requiresUpdate,
      requiresAttachment,
      auth.user.user_id
    ).run();

    // AUDIT: ACTIVITY TYPE CREATED
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
      "ACTIVITY_TYPE_CREATED",
      "ACTIVITY_TYPE",
      activityTypeId,
      JSON.stringify({
        activity_name: activityName,
        frequency,
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Activity Type created successfully",
      activity_type_id: activityTypeId
    }, 201);
  }

  return jsonResponse({
    error: "Method Not Allowed"
  }, 405);
}

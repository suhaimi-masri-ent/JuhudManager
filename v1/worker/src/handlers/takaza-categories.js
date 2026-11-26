
import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

export async function adminTakazaCategoriesHandler(request, env, categoryId = null) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  // ADMIN ACCESS ONLY
  const admin = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(auth.user.user_id).first();

  if (!admin) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  // GET: LIST CATEGORIES
  if (request.method === "GET" && !categoryId) {
    const result = await env.DB.prepare(`
      SELECT
        category_id,
        category_code,
        category_name,
        description,
        status,
        created_at,
        updated_at
      FROM takaza_categories
      ORDER BY category_name COLLATE NOCASE
    `).all();

    return jsonResponse({
      categories: result.results || []
    });
  }

  // PARSE REQUEST BODY
  let body;

  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }
  }

  // POST: CREATE CATEGORY
  if (request.method === "POST" && !categoryId) {
    const categoryCode = String(body.categoryCode || body.category_code || "")
      .trim()
      .toUpperCase();

    const categoryName = String(body.categoryName || body.category_name || "")
      .trim();

    const description = String(body.description || "").trim();

    const status = String(body.status || "ACTIVE").toUpperCase();

    if (!categoryCode || !categoryName) {
      return jsonResponse({
        error: "Category code and name are required"
      }, 400);
    }

    if (!/^[A-Z0-9_-]{2,20}$/.test(categoryCode)) {
      return jsonResponse({
        error: "Category code must contain 2-20 letters, numbers, hyphens or underscores"
      }, 400);
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return jsonResponse({ error: "Invalid status" }, 400);
    }

    const duplicate = await env.DB.prepare(`
      SELECT category_id
      FROM takaza_categories
      WHERE category_code = ?
      LIMIT 1
    `).bind(categoryCode).first();

    if (duplicate) {
      return jsonResponse({
        error: "Category code already exists"
      }, 409);
    }

    const newCategoryId = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO takaza_categories (
        category_id,
        category_code,
        category_name,
        description,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      newCategoryId,
      categoryCode,
      categoryName,
      description || null,
      status,
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
      "TAKAZA_CATEGORY_CREATED",
      "TAKAZA_CATEGORY",
      newCategoryId,
      JSON.stringify({
        category_code: categoryCode,
        category_name: categoryName,
        status,
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Takaza category created successfully",
      category_id: newCategoryId
    }, 201);
  }

  // PUT: UPDATE CATEGORY INFORMATION
  if (request.method === "PUT" && categoryId) {
    const categoryName = String(body.categoryName || body.category_name || "")
      .trim();

    const description = String(body.description || "").trim();

    if (!categoryName) {
      return jsonResponse({
        error: "Category name is required"
      }, 400);
    }

    const existing = await env.DB.prepare(`
      SELECT category_id, category_name, description
      FROM takaza_categories
      WHERE category_id = ?
    `).bind(categoryId).first();

    if (!existing) {
      return jsonResponse({ error: "Category not found" }, 404);
    }

    await env.DB.prepare(`
      UPDATE takaza_categories
      SET
        category_name = ?,
        description = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE category_id = ?
    `).bind(
      categoryName,
      description || null,
      categoryId
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
      "TAKAZA_CATEGORY_UPDATED",
      "TAKAZA_CATEGORY",
      categoryId,
      JSON.stringify({
        previous: existing,
        updated: {
          category_name: categoryName,
          description: description || null
        },
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Takaza category updated successfully"
    });
  }

  // PATCH: ACTIVATE / DEACTIVATE CATEGORY
  if (request.method === "PATCH" && categoryId) {
    const status = String(body.status || "").toUpperCase();

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return jsonResponse({ error: "Invalid status" }, 400);
    }

    const existing = await env.DB.prepare(`
      SELECT category_id, status
      FROM takaza_categories
      WHERE category_id = ?
    `).bind(categoryId).first();

    if (!existing) {
      return jsonResponse({ error: "Category not found" }, 404);
    }

    if (existing.status === status) {
      return jsonResponse({
        success: true,
        message: "Category status unchanged"
      });
    }

    await env.DB.prepare(`
      UPDATE takaza_categories
      SET
        status = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE category_id = ?
    `).bind(status, categoryId).run();

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
      "TAKAZA_CATEGORY_STATUS_CHANGED",
      "TAKAZA_CATEGORY",
      categoryId,
      JSON.stringify({
        previous_status: existing.status,
        new_status: status,
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Category status updated successfully"
    });
  }

  return jsonResponse({
    error: "Method Not Allowed"
  }, 405);
}

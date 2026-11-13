
import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

async function checkAdmin(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return { error: auth.error };
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
    return {
      error: jsonResponse({ error: "Forbidden" }, 403)
    };
  }

  return { auth };
}

export async function adminTakazasHandler(request, env) {
  const access = await checkAdmin(request, env);

  if (access.error) {
    return access.error;
  }

  const userId = access.auth.user.user_id;

  // GET: LIST TAKAZAS
  if (request.method === "GET") {
    const result = await env.DB.prepare(`
      SELECT
        t.takaza_id,
        t.takaza_code,
        t.category_id,
        c.category_code,
        c.category_name,
        t.takaza_name,
        t.description,
        t.parent_takaza_id,
        p.takaza_code AS parent_takaza_code,
        t.start_date,
        t.end_date,
        t.status,
        t.created_by,
        t.created_at,
        t.updated_at
      FROM takazas t
      JOIN takaza_categories c
        ON c.category_id = t.category_id
      LEFT JOIN takazas p
        ON p.takaza_id = t.parent_takaza_id
      ORDER BY t.created_at DESC
    `).all();

    return jsonResponse({
      takazas: result.results || []
    });
  }

  // POST: CREATE TAKAZA
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

    const categoryId = String(
      body.categoryId || body.category_id || ""
    ).trim();

    const takazaName = String(
      body.takazaName || body.takaza_name || ""
    ).trim();

    const description = String(body.description || "").trim();

    const parentTakazaId = String(
      body.parentTakazaId || body.parent_takaza_id || ""
    ).trim();

    const startDate = String(
      body.startDate || body.start_date || ""
    ).trim();

    const endDate = String(
      body.endDate || body.end_date || ""
    ).trim();

    if (!categoryId || !takazaName) {
      return jsonResponse({
        error: "Category and Takaza name are required"
      }, 400);
    }

    if (takazaName.length > 200 || description.length > 5000) {
      return jsonResponse({
        error: "Takaza name or description is too long"
      }, 400);
    }

    const validDate = value =>
      !value || /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (!validDate(startDate) || !validDate(endDate)) {
      return jsonResponse({
        error: "Dates must use YYYY-MM-DD format"
      }, 400);
    }

    if (startDate && endDate && startDate > endDate) {
      return jsonResponse({
        error: "End date cannot be earlier than start date"
      }, 400);
    }

    // CATEGORY MUST BE ACTIVE
    const category = await env.DB.prepare(`
      SELECT category_id, category_code
      FROM takaza_categories
      WHERE category_id = ?
        AND status = 'ACTIVE'
    `).bind(categoryId).first();

    if (!category) {
      return jsonResponse({
        error: "Active Takaza category not found"
      }, 400);
    }

    // CHECK OPTIONAL PARENT TAKAZA
    if (parentTakazaId) {
      const parent = await env.DB.prepare(`
        SELECT takaza_id
        FROM takazas
        WHERE takaza_id = ?
      `).bind(parentTakazaId).first();

      if (!parent) {
        return jsonResponse({
          error: "Parent Takaza not found"
        }, 404);
      }
    }

    const takazaId = crypto.randomUUID();
    const sequenceMonth = new Date()
      .toISOString()
      .slice(0, 7)
      .replace("-", "");

    // ATOMIC SEQUENCE UPDATE + TAKAZA INSERT
    const results = await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO takaza_code_sequences (
          category_code,
          sequence_month,
          last_number
        )
        VALUES (?, ?, 1)
        ON CONFLICT(category_code, sequence_month)
        DO UPDATE SET
          last_number = last_number + 1,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      `).bind(category.category_code, sequenceMonth),

      env.DB.prepare(`
        INSERT INTO takazas (
          takaza_id,
          takaza_code,
          category_id,
          takaza_name,
          description,
          parent_takaza_id,
          start_date,
          end_date,
          status,
          created_by
        )
        SELECT
          ?,
          'TKZ-' || category_code || '-' ||
            sequence_month || '-' ||
            printf('%05d', last_number),
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'DRAFT',
          ?
        FROM takaza_code_sequences
        WHERE category_code = ?
          AND sequence_month = ?
        RETURNING takaza_id, takaza_code
      `).bind(
        takazaId,
        categoryId,
        takazaName,
        description || null,
        parentTakazaId || null,
        startDate || null,
        endDate || null,
        userId,
        category.category_code,
        sequenceMonth
      )
    ]);

    const created = results[1]?.results?.[0];

    if (!created) {
      throw new Error("Takaza creation failed");
    }

    // AUDIT TRAIL
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
      userId,
      "TAKAZA_CREATED",
      "TAKAZA",
      takazaId,
      JSON.stringify({
        takaza_code: created.takaza_code,
        category_id: categoryId,
        takaza_name: takazaName,
        parent_takaza_id: parentTakazaId || null,
        status: "DRAFT",
        client: await getRequestMetadata(request)
      })
    ).run();

    return jsonResponse({
      success: true,
      message: "Takaza created successfully",
      takaza: {
        takaza_id: created.takaza_id,
        takaza_code: created.takaza_code,
        status: "DRAFT"
      }
    }, 201);
  }

  return jsonResponse({
    error: "Method Not Allowed"
  }, 405);
}

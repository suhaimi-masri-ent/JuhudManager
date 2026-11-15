
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


async function writeTakazaAudit(
  request,
  env,
  userId,
  action,
  takazaId,
  details
) {
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
    action,
    "TAKAZA",
    takazaId,
    JSON.stringify({
      ...details,
      client: await getRequestMetadata(request)
    })
  ).run();
}


export async function adminTakazasHandler(
  request,
  env,
  takazaId = null
) {
  const access = await checkAdmin(request, env);

  if (access.error) {
    return access.error;
  }

  const userId = access.auth.user.user_id;


  // GET: LIST TAKAZAS

  if (request.method === "GET" && !takazaId) {
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


  // GET: SINGLE TAKAZA

  if (request.method === "GET" && takazaId) {
    const takaza = await env.DB.prepare(`
      SELECT
        t.*,
        c.category_code,
        c.category_name,
        p.takaza_code AS parent_takaza_code
      FROM takazas t
      JOIN takaza_categories c
        ON c.category_id = t.category_id
      LEFT JOIN takazas p
        ON p.takaza_id = t.parent_takaza_id
      WHERE t.takaza_id = ?
    `).bind(takazaId).first();

    if (!takaza) {
      return jsonResponse({ error: "Takaza not found" }, 404);
    }

    return jsonResponse({ takaza });
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


  // POST: CREATE TAKAZA

  if (request.method === "POST" && !takazaId) {

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

    const newTakazaId = crypto.randomUUID();

    const sequenceMonth = new Date()
      .toISOString()
      .slice(0, 7)
      .replace("-", "");

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
        newTakazaId,
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

    await writeTakazaAudit(
      request,
      env,
      userId,
      "TAKAZA_CREATED",
      newTakazaId,
      {
        takaza_code: created.takaza_code,
        category_id: categoryId,
        takaza_name: takazaName,
        status: "DRAFT"
      }
    );

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


  // PUT: UPDATE TAKAZA INFORMATION

  if (request.method === "PUT" && takazaId) {

    const existing = await env.DB.prepare(`
      SELECT *
      FROM takazas
      WHERE takaza_id = ?
    `).bind(takazaId).first();

    if (!existing) {
      return jsonResponse({ error: "Takaza not found" }, 404);
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

    const category = await env.DB.prepare(`
      SELECT category_id
      FROM takaza_categories
      WHERE category_id = ?
    `).bind(categoryId).first();

    if (!category) {
      return jsonResponse({
        error: "Takaza category not found"
      }, 404);
    }

    if (parentTakazaId) {
      if (parentTakazaId === takazaId) {
        return jsonResponse({
          error: "A Takaza cannot be its own parent"
        }, 400);
      }

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

    await env.DB.prepare(`
      UPDATE takazas
      SET
        category_id = ?,
        takaza_name = ?,
        description = ?,
        parent_takaza_id = ?,
        start_date = ?,
        end_date = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE takaza_id = ?
    `).bind(
      categoryId,
      takazaName,
      description || null,
      parentTakazaId || null,
      startDate || null,
      endDate || null,
      takazaId
    ).run();

    await writeTakazaAudit(
      request,
      env,
      userId,
      "TAKAZA_UPDATED",
      takazaId,
      {
        takaza_code: existing.takaza_code,
        previous: existing,
        updated: {
          category_id: categoryId,
          takaza_name: takazaName,
          description: description || null,
          parent_takaza_id: parentTakazaId || null,
          start_date: startDate || null,
          end_date: endDate || null
        }
      }
    );

    return jsonResponse({
      success: true,
      message: "Takaza updated successfully",
      takaza_code: existing.takaza_code
    });
  }


  // PATCH: ARCHIVE TAKAZA

  if (request.method === "PATCH" && takazaId) {

    const action = String(body.action || "").toUpperCase();

    if (action !== "ARCHIVE") {
      return jsonResponse({
        error: "Unsupported Takaza action"
      }, 400);
    }

    const existing = await env.DB.prepare(`
      SELECT takaza_id, takaza_code, status
      FROM takazas
      WHERE takaza_id = ?
    `).bind(takazaId).first();

    if (!existing) {
      return jsonResponse({ error: "Takaza not found" }, 404);
    }

    if (existing.status === "ARCHIVED") {
      return jsonResponse({
        success: true,
        message: "Takaza is already archived"
      });
    }

    await env.DB.prepare(`
      UPDATE takazas
      SET
        status = 'ARCHIVED',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE takaza_id = ?
    `).bind(takazaId).run();

    await writeTakazaAudit(
      request,
      env,
      userId,
      "TAKAZA_ARCHIVED",
      takazaId,
      {
        takaza_code: existing.takaza_code,
        previous_status: existing.status,
        new_status: "ARCHIVED"
      }
    );

    return jsonResponse({
      success: true,
      message: "Takaza archived successfully",
      takaza_code: existing.takaza_code
    });
  }


  return jsonResponse({
    error: "Method Not Allowed"
  }, 405);
}

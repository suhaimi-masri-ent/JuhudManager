
import { jsonResponse } from "../utils/response.js";
import { requireAuth } from "../middleware/auth.js";

const PROFILE_FIELDS = [
  "date_of_birth",
  "gender",
  "marital_status",
  "nationality",
  "country",
  "state_province",
  "city_district",
  "postcode",
  "street_address",
  "building_number",
  "building_name",
  "address_line_2"
];

const MAX_LENGTH = 500;

export async function profileHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse(
      { error: "Unauthenticated or session expired" },
      401
    );
  }

  const user = await env.DB.prepare(`
    SELECT user_id, full_name, account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(session.user_id).first();

  if (!user || user.account_status !== "ACTIVE") {
    return jsonResponse(
      { error: "Account is not active" },
      403
    );
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare(`
      SELECT
        p.date_of_birth,
        p.gender,
        p.marital_status,
        p.nationality,
        p.country,
        p.state_province,
        p.city_district,
        p.postcode,
        p.street_address,
        p.building_number,
        p.building_name,
        p.address_line_2,
        p.updated_at,
        (
          SELECT masked_value
          FROM user_identifiers
          WHERE user_id = ?
            AND identifier_type = 'EMAIL'
            AND is_primary = 1
          LIMIT 1
        ) AS email
      FROM user_profiles p
      WHERE p.user_id = ?
    `).bind(user.user_id, user.user_id).first();

    const profile = result || {};

    return jsonResponse({
      success: true,
      profile: {
        full_name: user.full_name,
        account_status: user.account_status,
        email: profile.email || null,
        ...Object.fromEntries(
          PROFILE_FIELDS.map(field => [
            field,
            profile[field] || ""
          ])
        ),
        updated_at: profile.updated_at || null
      }
    });
  }

  if (request.method === "PUT") {
    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid profile data" }, 400);
    }

    for (const field of PROFILE_FIELDS) {
      const value = body[field];

      if (value !== undefined &&
          value !== null &&
          typeof value !== "string") {
        return jsonResponse(
          { error: `Invalid value for ${field}` },
          400
        );
      }

      if (typeof value === "string" && value.length > MAX_LENGTH) {
        return jsonResponse(
          { error: `${field} exceeds maximum length` },
          400
        );
      }
    }

    const values = PROFILE_FIELDS.map(field => {
      const value = body[field];
      return typeof value === "string" ? value.trim() : "";
    });

    await env.DB.prepare(`
      INSERT INTO user_profiles (
        user_id,
        date_of_birth,
        gender,
        marital_status,
        nationality,
        country,
        state_province,
        city_district,
        postcode,
        street_address,
        building_number,
        building_name,
        address_line_2,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        strftime('%Y-%m-%dT%H:%M:%fZ','now')
      )
      ON CONFLICT(user_id) DO UPDATE SET
        date_of_birth = excluded.date_of_birth,
        gender = excluded.gender,
        marital_status = excluded.marital_status,
        nationality = excluded.nationality,
        country = excluded.country,
        state_province = excluded.state_province,
        city_district = excluded.city_district,
        postcode = excluded.postcode,
        street_address = excluded.street_address,
        building_number = excluded.building_number,
        building_name = excluded.building_name,
        address_line_2 = excluded.address_line_2,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    `).bind(user.user_id, ...values).run();

    return jsonResponse({
      success: true,
      message: "Profile saved successfully"
    });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
}

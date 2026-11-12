import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

const PROFILE_FIELDS = [
  // Personal Information
  "date_of_birth",
  "gender",
  "marital_status",
  "nationality",

  // Address Information
  "country",
  "state_province",
  "city_district",
  "postcode",
  "street_address",
  "building_number",
  "building_name",
  "address_line_2",

  // Employment Information
  "employment_status",
  "employment_type",
  "employment_sector",
  "occupation",
  "employer_company",
  "department",
  "position_designation",
  "work_location"
];

export async function profileHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return auth.error;
  }

  const user = await env.DB.prepare(`
    SELECT user_id, full_name, account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(auth.user.user_id).first();

  if (!user || user.account_status !== "ACTIVE") {
    return jsonResponse({
      error: "Account is not active"
    }, 403);
  }

  // GET PROFILE
  if (request.method === "GET") {
    const result = await env.DB.prepare(`
      SELECT
        p.*,
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

  // UPDATE PROFILE
  if (request.method === "PUT") {
    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({
        error: "Invalid JSON body"
      }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({
        error: "Invalid profile data"
      }, 400);
    }

    for (const field of PROFILE_FIELDS) {
      const value = body[field];

      if (
        value !== undefined &&
        value !== null &&
        typeof value !== "string"
      ) {
        return jsonResponse({
          error: `Invalid value for ${field}`
        }, 400);
      }

      if (typeof value === "string" && value.length > 500) {
        return jsonResponse({
          error: `${field} exceeds maximum length`
        }, 400);
      }
    }

    const values = PROFILE_FIELDS.map(field => {
      const value = body[field];

      const cleaned = typeof value === "string"
        ? value.trim()
        : "";

      if (cleaned === "") return null;

      return (
        field === "gender" ||
        field === "marital_status"
      )
        ? cleaned.toUpperCase()
        : cleaned;
    });

    const columns = PROFILE_FIELDS.join(", ");
    const placeholders = PROFILE_FIELDS.map(() => "?").join(", ");

    const updates = PROFILE_FIELDS.map(
      field => `${field} = excluded.${field}`
    ).join(", ");

    await env.DB.prepare(`
      INSERT INTO user_profiles (
        user_id,
        ${columns},
        updated_at
      )
      VALUES (
        ?,
        ${placeholders},
        strftime('%Y-%m-%dT%H:%M:%fZ','now')
      )
      ON CONFLICT(user_id) DO UPDATE SET
        ${updates},
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    `).bind(
      user.user_id,
      ...values
    ).run();

    return jsonResponse({
      success: true,
      message: "Profile saved successfully"
    });
  }

  return jsonResponse({
    error: "Method not allowed"
  }, 405);
}

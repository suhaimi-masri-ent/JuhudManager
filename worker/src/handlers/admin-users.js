import {
  hashEmail,
  encryptEmail,
  derivePasswordBits,
  toHex
} from "../utils/crypto.js";

import { getRequestMetadata } from "../services/request-metadata.js";
import { requireAuth } from "../middleware/auth.js";
import { jsonResponse } from "../core/response.js";

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
  "address_line_2",
  "employment_status",
  "employment_type",
  "employment_sector",
  "occupation",
  "employer_company",
  "department",
  "position_designation",
  "work_location"
];

async function checkAdmin(request, env) {
  const auth = await requireAuth(request, env);

  if (auth.error) {
    return {
      error: auth.error
    };
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

  return {
    auth
  };
}

export async function adminUsersHandler(request, env) {
  const access = await checkAdmin(request, env);

  if (access.error) {
    return access.error;
  }

  const result = await env.DB.prepare(`
    SELECT
      ua.user_id,
      ua.full_name,
      ua.account_status,
      GROUP_CONCAT(
        DISTINCT ui.masked_value
      ) AS identifiers,
      GROUP_CONCAT(
        DISTINCT r.role_name
      ) AS roles
    FROM user_accounts ua
    LEFT JOIN user_identifiers ui
      ON ui.user_id = ua.user_id
    LEFT JOIN user_roles ur
      ON ur.user_id = ua.user_id
    LEFT JOIN roles r
      ON r.role_id = ur.role_id
    GROUP BY
      ua.user_id,
      ua.full_name,
      ua.account_status
    ORDER BY ua.full_name COLLATE NOCASE
  `).all();

  return jsonResponse({
    users: result.results || []
  });
}

export async function adminUserProfileHandler(
  request,
  env,
  targetUserId
) {
  const access = await checkAdmin(request, env);

  if (access.error) {
    return access.error;
  }

  const session = access.auth;

  if (request.method === "GET") {
    const user = await env.DB.prepare(`
      SELECT
        ua.user_id,
        ua.full_name,
        ua.account_status,
        p.*
      FROM user_accounts ua
      LEFT JOIN user_profiles p
        ON p.user_id = ua.user_id
      WHERE ua.user_id = ?
    `).bind(targetUserId).first();

    if (!user) {
      return jsonResponse({
        error: "User not found"
      }, 404);
    }

    return jsonResponse({ user });
  }

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
        error: "Invalid request body"
      }, 400);
    }

    const fullName = String(body.full_name || "").trim();

    if (!fullName || fullName.length > 200) {
      return jsonResponse({
        error: "Full name is required and must not exceed 200 characters."
      }, 400);
    }

    const updates = {};

    for (const field of PROFILE_FIELDS) {
      const value = body[field];

      if (value !== undefined) {
        if (typeof value !== "string" || value.length > 500) {
          return jsonResponse({
            error: `Invalid value for ${field}.`
          }, 400);
        }

        let cleanValue = value.trim();

        if (field === "gender" || field === "marital_status") {
          cleanValue = cleanValue.toUpperCase();
        }

        updates[field] = cleanValue;
      }
    }

    const target = await env.DB.prepare(`
      SELECT user_id
      FROM user_accounts
      WHERE user_id = ?
    `).bind(targetUserId).first();

    if (!target) {
      return jsonResponse({
        error: "User not found"
      }, 404);
    }

    const oldProfile = await env.DB.prepare(`
      SELECT *
      FROM user_profiles
      WHERE user_id = ?
    `).bind(targetUserId).first();

    const oldNameResult = await env.DB.prepare(`
      SELECT full_name
      FROM user_accounts
      WHERE user_id = ?
    `).bind(targetUserId).first();

    const changedFields = [];

    if (oldNameResult.full_name !== fullName) {
      changedFields.push("full_name");
    }

    for (const [field, value] of Object.entries(updates)) {
      const oldValue = oldProfile?.[field] ?? "";

      if (oldValue !== value) {
        changedFields.push(field);
      }
    }

    if (changedFields.length === 0) {
      return jsonResponse({
        message: "No changes detected.",
        changed_fields: []
      });
    }

    const statements = [];

    statements.push(
      env.DB.prepare(`
        UPDATE user_accounts
        SET full_name = ?
        WHERE user_id = ?
      `).bind(fullName, targetUserId)
    );

    const profileEntries = Object.entries(updates);

    if (profileEntries.length > 0) {
      const columns = profileEntries.map(([field]) => field);
      const values = profileEntries.map(([, value]) => value);

      const placeholders = columns.map(() => "?").join(", ");

      const assignments = columns
        .map(field => `${field} = excluded.${field}`)
        .join(", ");

      statements.push(
        env.DB.prepare(`
          INSERT INTO user_profiles (
            user_id,
            ${columns.join(", ")}
          )
          VALUES (?, ${placeholders})
          ON CONFLICT(user_id) DO UPDATE SET
            ${assignments},
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        `).bind(targetUserId, ...values)
      );
    }

    statements.push(
      env.DB.prepare(`
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
        session.user.user_id,
        "ADMIN_UPDATE_USER_PROFILE",
        "USER",
        targetUserId,
        JSON.stringify({
          changed_fields: changedFields,
          client: await getRequestMetadata(request)
        })
      )
    );

    await env.DB.batch(statements);

    return jsonResponse({
      message: "User profile updated successfully.",
      changed_fields: changedFields
    });
  }

  return jsonResponse({
    error: "Method not allowed"
  }, 405);
}

export async function createUserHandler(request, env) {
  const access = await checkAdmin(request, env);

  if (access.error) {
    return access.error;
  }

  const session = access.auth;

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

  const fullName = body.full_name;
  const email = body.email;
  const password = body.password;

  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return jsonResponse({
      error: "Name, email and password are required"
    }, 400);
  }

  const name = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!name || name.length > 200) {
    return jsonResponse({
      error: "Invalid full name"
    }, 400);
  }

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return jsonResponse({
      error: "Invalid email address"
    }, 400);
  }

  if (password.length < 12 || password.length > 1024) {
    return jsonResponse({
      error: "Password must contain at least 12 characters"
    }, 400);
  }

  const emailHash = await hashEmail(env, normalizedEmail);

  const existing = await env.DB.prepare(`
    SELECT identifier_id
    FROM user_identifiers
    WHERE identifier_type = 'EMAIL'
      AND lookup_hash = ?
    LIMIT 1
  `).bind(emailHash).first();

  if (existing) {
    return jsonResponse({
      error: "Email already registered"
    }, 409);
  }

  const userId = crypto.randomUUID();
  const identifierId = crypto.randomUUID();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePasswordBits(password, salt);

  const passwordHash =
    "pbkdf2-sha256$100000$" + toHex(derived);

  const passwordSalt = toHex(salt);

  const encryptedEmail = await encryptEmail(
    env,
    normalizedEmail
  );

  const emailParts = normalizedEmail.split("@");
  const localPart = emailParts[0];
  const domain = emailParts[1];

  const maskedEmail =
    localPart.substring(0, Math.min(3, localPart.length)) +
    "***@" + domain;

  const statements = [
    env.DB.prepare(`
      INSERT INTO user_accounts (
        user_id,
        full_name,
        password_hash,
        password_salt
      )
      VALUES (?, ?, ?, ?)
    `).bind(
      userId,
      name,
      passwordHash,
      passwordSalt
    ),

    env.DB.prepare(`
      INSERT INTO user_identifiers (
        identifier_id,
        user_id,
        identifier_type,
        lookup_hash,
        encrypted_value,
        masked_value,
        is_primary
      )
      VALUES (?, ?, 'EMAIL', ?, ?, ?, 1)
    `).bind(
      identifierId,
      userId,
      emailHash,
      encryptedEmail,
      maskedEmail
    ),

    env.DB.prepare(`
      INSERT INTO user_roles (
        user_id,
        role_id
      )
      VALUES (?, 'role_user')
    `).bind(userId),

    env.DB.prepare(`
      INSERT INTO audit_logs (
        audit_id,
        actor_user_id,
        action,
        target_type,
        target_id,
        details_json
      )
      VALUES (?, ?, 'USER_CREATED', 'USER', ?, ?)
    `).bind(
      crypto.randomUUID(),
      session.user.user_id,
      userId,
      JSON.stringify({
        full_name: name,
        role: "USER",
        client: await getRequestMetadata(request)
      })
    )
  ];

  await env.DB.batch(statements);

  return jsonResponse({
    success: true,
    message: "User created successfully",
    user: {
      user_id: userId,
      full_name: name,
      email: maskedEmail,
      role: "USER",
      account_status: "ACTIVE"
    }
  }, 201);
}

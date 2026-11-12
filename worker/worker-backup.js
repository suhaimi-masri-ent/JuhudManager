
const encoder = new TextEncoder();

/* =========================
   RESPONSE & CORS
========================= */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function addCors(response, headers) {
  const resultHeaders = new Headers(response.headers);

  for (const [key, value] of Object.entries(headers)) {
    resultHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: resultHeaders
  });
}

/* =========================
   CRYPTO
========================= */

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  if (
    typeof hex !== "string" ||
    !/^[0-9a-f]+$/i.test(hex) ||
    hex.length % 2 !== 0
  ) {
    throw new Error("Invalid hexadecimal value");
  }

  return new Uint8Array(
    hex.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );
}

async function sha256(value) {
  const result = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(value)
  );

  return toHex(result);
}

async function derivePasswordBits(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    key,
    256
  );
}

async function verifyPassword(password, saltHex, storedHash) {
  try {
    const parts = storedHash.split("$");

    if (
      parts.length !== 3 ||
      parts[0] !== "pbkdf2-sha256" ||
      parts[1] !== "100000"
    ) {
      return false;
    }

    const salt = fromHex(saltHex);
    const expectedHash = fromHex(parts[2]);

    if (salt.length !== 16 || expectedHash.length !== 32) {
      return false;
    }

    const derived = new Uint8Array(
      await derivePasswordBits(password, salt)
    );

    let difference = 0;

    for (let i = 0; i < expectedHash.length; i++) {
      difference |= derived[i] ^ expectedHash[i];
    }

    return difference === 0;
  } catch {
    return false;
  }
}

function generateSessionToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

async function hashEmail(env, email) {
  const keyBytes = fromHex(env.HASH_KEY);

  if (keyBytes.length !== 32) {
    throw new Error("HASH_KEY must be 32 bytes");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const normalizedEmail = email.trim().toLowerCase();

  const result = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(normalizedEmail)
  );

  return toHex(result);
}

async function encryptEmail(env, email) {
  const keyBytes = fromHex(env.EMAIL_ENCRYPTION_KEY);

  if (keyBytes.length !== 32) {
    throw new Error("EMAIL_ENCRYPTION_KEY must be 32 bytes");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const normalizedEmail = email.trim().toLowerCase();

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(normalizedEmail)
  );

  return "v2:" + toHex(iv) + ":" + toHex(encrypted);
}

/* =========================
   USER SERVICE
========================= */

async function getUserByEmail(env, email) {
  const emailHash = await hashEmail(env, email);

  return env.DB.prepare(`
    SELECT
      ua.user_id,
      ua.full_name,
      ua.password_hash,
      ua.password_salt,
      ua.account_status,
      ua.failed_login_attempts,
      ua.locked_until
    FROM user_accounts ua
    INNER JOIN user_identifiers ui
      ON ui.user_id = ua.user_id
    WHERE ui.identifier_type = 'EMAIL'
      AND ui.lookup_hash = ?
    LIMIT 1
  `).bind(emailHash).first();
}

async function getUserRoles(env, userId) {
  const result = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    INNER JOIN roles r
      ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
  `).bind(userId).all();

  return (result.results || []).map(row => row.role_name);
}

/* =========================
   REQUEST DEVICE METADATA
========================= */

async function getRequestMetadata(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const userAgent = request.headers.get("User-Agent") || "";

  let browser = "Unknown";
  let os = "Unknown";
  let device = "Unknown";

  // Browser detection
  if (/Edg\//i.test(userAgent)) {
    browser = "Edge";
  } else if (/OPR\//i.test(userAgent)) {
    browser = "Opera";
  } else if (/Firefox\//i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Chrome\//i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari\//i.test(userAgent)) {
    browser = "Safari";
  }

  // Operating system detection
  if (/Android/i.test(userAgent)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
  } else if (/Windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/Mac OS X|Macintosh/i.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
  }

  // Device detection
  if (/iPad|Tablet/i.test(userAgent)) {
    device = "Tablet";
  } else if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    device = "Mobile";
  } else {
    device = "Desktop";
  }

  return {
    ip_hash: ip ? await sha256(ip) : null,
    browser,
    os,
    device,
    country: request.headers.get("CF-IPCountry") || null,
    ray_id: request.headers.get("CF-Ray") || null
  };
}

/* =========================
   AUDIT LOG
========================= */

async function writeAudit(
  env,
  userId,
  action,
  details = {},
  targetId = userId,
  request = null
) {
  const client = request
    ? await getRequestMetadata(request)
    : null;

  const auditDetails = client
    ? {
        ...details,
        client
      }
    : details;

  await env.DB.prepare(`
    INSERT INTO audit_logs (
      audit_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      details_json
    )
    VALUES (?, ?, ?, 'USER', ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    action,
    targetId,
    JSON.stringify(auditDetails)
  ).run();
}

/* =========================
   SESSION SERVICE
========================= */

async function createSession(env, userId, token, request) {
  const sessionId = crypto.randomUUID();
  const tokenHash = await sha256(token);

  const expiresAt = new Date(
    Date.now() +
    Number(env.SESSION_DAYS || 0.5) * 86400000
  ).toISOString();

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = ip ? await sha256(ip) : null;
  const userAgent = request.headers.get("User-Agent") || null;

  await env.DB.prepare(`
    INSERT INTO user_sessions (
      session_id,
      user_id,
      token_hash,
      expires_at,
      ip_hash,
      user_agent
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    sessionId,
    userId,
    tokenHash,
    expiresAt,
    ipHash,
    userAgent
  ).run();

  return { sessionId, expiresAt };
}

async function getSession(env, token) {
  if (!token) return null;

  const tokenHash = await sha256(token);

  return env.DB.prepare(`
    SELECT
      session_id,
      user_id,
      expires_at,
      revoked_at
    FROM user_sessions
    WHERE token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first();
}

async function revokeSession(env, token) {
  if (!token) return false;

  const tokenHash = await sha256(token);

  await env.DB.prepare(`
    UPDATE user_sessions
    SET revoked_at = ?
    WHERE token_hash = ?
      AND revoked_at IS NULL
  `).bind(
    new Date().toISOString(),
    tokenHash
  ).run();

  return true;
}

/* =========================
   AUTH MIDDLEWARE
========================= */

async function requireAuth(request, env) {
  const authorization = request.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();

  if (!token) return null;

  const session = await getSession(env, token);

  if (!session) return null;

  // REJECT REVOKED SESSION
  if (session.revoked_at) {
    return null;
  }

  const now = new Date().toISOString();

// CHECK EXPIRED SESSION
if (session.expires_at <= now) {
  const expiredSession = await env.DB.prepare(`
    UPDATE user_sessions
    SET expired_audit_at = ?
    WHERE session_id = ?
      AND expired_audit_at IS NULL
      AND revoked_at IS NULL
      AND expires_at <= ?
    RETURNING session_id
  `).bind(
    now,
    session.session_id,
    now
  ).first();

  // WRITE AUDIT ONLY ONCE
  if (expiredSession) {
    await writeAudit(
      env,
      session.user_id,
      "SESSION_EXPIRED",
      { session_id: session.session_id },
      session.user_id,
      request
    );
  }

  return null;
}


  // UPDATE LAST SEEN
  await env.DB.prepare(`
    UPDATE user_sessions
    SET last_seen_at = ?
    WHERE session_id = ?
  `).bind(
    now,
    session.session_id
  ).run();

  return session;
}

/* =========================
   LOGIN
========================= */

async function loginHandler(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request" }, 400);
  }

  const email = body.email;
  const password = body.password;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    email.length > 254 ||
    password.length > 1024
  ) {
    return jsonResponse({
      error: "Email and password are required"
    }, 400);
  }

  const user = await getUserByEmail(env, email);

  if (!user) {
    await writeAudit(
      env,
      null,
      "LOGIN_FAILED_UNKNOWN_USER",
      { reason: "Unknown account" },
      null,
      request
    );

    return jsonResponse({
      error: "Invalid email or password"
    }, 401);
  }

  if (user.account_status !== "ACTIVE") {
    await writeAudit(
      env,
      user.user_id,
      "LOGIN_BLOCKED_INACTIVE",
      { reason: "Account inactive" },
      user.user_id,
      request
    );
    return jsonResponse({
      error: "Account is inactive"
    }, 403);
  }

  const now = new Date();

  if (
    user.locked_until &&
    new Date(user.locked_until).getTime() > now.getTime()
  ) {
    await writeAudit(
      env,
      user.user_id,
      "LOGIN_BLOCKED_LOCKED",
      { reason: "Account locked" },
      user.user_id,
      request
    );
    return jsonResponse({
      error: "Account temporarily locked. Please try again later."
    }, 423);
  }

  const validPassword = await verifyPassword(
    password,
    user.password_salt,
    user.password_hash
  );

  if (!validPassword) {
    const attempts = (user.failed_login_attempts || 0) + 1;

    const lockedUntil = attempts >= 5
      ? new Date(now.getTime() + 15 * 60 * 1000).toISOString()
      : null;

    await env.DB.prepare(`
      UPDATE user_accounts
      SET
        failed_login_attempts = ?,
        locked_until = ?,
        updated_at = ?
      WHERE user_id = ?
    `).bind(
      attempts,
      lockedUntil,
      now.toISOString(),
      user.user_id
    ).run();

    await writeAudit(
      env,
      user.user_id,
      "LOGIN_FAILED",
      { reason: "Invalid password", attempts },
      user.user_id,
      request
    );

    return jsonResponse({
      error: "Invalid email or password",
      attempts_remaining: Math.max(0, 5 - attempts)
    }, 401);
  }

  const token = generateSessionToken();

  const session = await createSession(
    env,
    user.user_id,
    token,
    request
  );

  const roles = await getUserRoles(env, user.user_id);

  await env.DB.prepare(`
    UPDATE user_accounts
    SET
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = ?,
      last_access_at = ?,
      updated_at = ?
    WHERE user_id = ?
  `).bind(
    now.toISOString(),
    now.toISOString(),
    now.toISOString(),
    user.user_id
  ).run();

  await writeAudit(
    env,
    user.user_id,
    "LOGIN_SUCCESS",
    { session_id: session.sessionId },
    user.user_id,
    request
  );

  return jsonResponse({
    success: true,
    message: "Login successful",
    token,
    token_type: "Bearer",
    expires_at: session.expiresAt,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      account_status: user.account_status
    },
    roles
  });
}

/* =========================
   GET CURRENT USER
========================= */

async function meHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({
      error: "Unauthenticated or session expired"
    }, 401);
  }

  const user = await env.DB.prepare(`
    SELECT user_id, full_name, account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(session.user_id).first();

  if (!user || user.account_status !== "ACTIVE") {
    return jsonResponse({
      error: "Account is not active"
    }, 403);
  }

  const roles = await getUserRoles(env, user.user_id);

  return jsonResponse({
    success: true,
    user,
    roles,
    session: {
      expires_at: session.expires_at
    }
  });
}

/* =========================
   LOGOUT
========================= */

async function logoutHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({
      error: "Unauthenticated or session expired"
    }, 401);
  }

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.slice(7).trim();

  await revokeSession(env, token);

  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE user_accounts
    SET last_logout_at = ?, updated_at = ?
    WHERE user_id = ?
  `).bind(
    now,
    now,
    session.user_id
  ).run();

  await writeAudit(
    env,
    session.user_id,
    "LOGOUT",
    { session_id: session.session_id },
    session.user_id,
    request
  );

  return jsonResponse({
    success: true,
    message: "Successfully logged out"
  });
}


/* =========================
   USER PROFILE
========================= */

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

async function profileHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({
      error: "Unauthenticated or session expired"
    }, 401);
  }

  const user = await env.DB.prepare(`
    SELECT user_id, full_name, account_status
    FROM user_accounts
    WHERE user_id = ?
    LIMIT 1
  `).bind(session.user_id).first();

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


/* =========================
   ADMIN: LIST USERS
========================= */

async function adminUsersHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const admin = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(session.user_id).first();

  if (!admin) {
    return jsonResponse({ error: "Forbidden" }, 403);
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

/* =========================
   ADMIN: PROFILE HANDLER
========================= */

async function adminUserProfileHandler(request, env, targetUserId) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const admin = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(session.user_id).first();

  if (!admin) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

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
      return jsonResponse({ error: "User not found" }, 404);
    }

    return jsonResponse({ user });
  }


  if (request.method === "PUT") {
    const body = await request.json();

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
      return jsonResponse({ error: "User not found" }, 404);
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
        session.user_id,
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

  return jsonResponse({ error: "Method not allowed" }, 405);
}


/* =========================
   ADMIN: CREATE USER
========================= */

async function createUserHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const admin = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(session.user_id).first();

  if (!admin) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request" }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ error: "Invalid request body" }, 400);
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
    return jsonResponse({ error: "Invalid full name" }, 400);
  }

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return jsonResponse({ error: "Invalid email address" }, 400);
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
    return jsonResponse({ error: "Email already registered" }, 409);
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
      session.user_id,
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


/* =========================
   ADMIN: MANAGE ACTIVITY TYPES
========================= */

async function adminActivityTypesHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const admin = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
    LIMIT 1
  `).bind(session.user_id).first();

  if (!admin) {
    return jsonResponse({ error: "Forbidden" }, 403);
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
      return jsonResponse({ error: "Invalid JSON" }, 400);
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

    const requiresUpdate = body.requiresUpdate === false ||
      body.requires_update === 0 ||
      body.requires_update === false ? 0 : 1;

    const requiresAttachment = body.requiresAttachment === true ||
      body.requires_attachment === 1 ||
      body.requires_attachment === true ? 1 : 0;

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
      session.user_id
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
      session.user_id,
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


/* =========================
   USER: LIST ACTIVITIES
========================= */


async function activitiesHandler(request, env) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
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
        ar.submitted_at
      FROM activity_records ar
      JOIN activity_types at
        ON at.activity_type_id = ar.activity_type_id
      WHERE ar.user_id = ?
      ORDER BY ar.activity_date DESC, ar.submitted_at DESC
    `).bind(session.user_id).all();

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
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    const activityTypeId = String(body.activityTypeId || "").trim();
    const activityDate = String(body.activityDate || "").trim();
    const startTime = String(body.startTime || "").trim();
    const endDate = String(body.endDate || "").trim();
    const endTime = String(body.endTime || "").trim();
    const description = String(body.description || "").trim();
    const progressStatus = String(body.progressStatus || "COMPLETED").trim();

    // REQUIRED FIELDS
    if (!activityTypeId || !activityDate || !startTime) {
      return jsonResponse({
        error: "Activity type, start date and start time are required"
      }, 400);
    }

    // PROGRESS VALIDATION
    if (!["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(progressStatus)) {
      return jsonResponse({ error: "Invalid progress status" }, 400);
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
      session.user_id,
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
      session.user_id,
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

  return jsonResponse({
    error: "Method Not Allowed"
  }, 405);
}


/* =========================
   ADMIN SUBMISSIONS
========================= */

async function adminSubmissionsHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const roleCheck = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR')
  `).bind(auth.user_id).first();

  if (!roleCheck) {
    return jsonResponse({ error: "Forbidden" }, 403);
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


/* =========================
   ADMIN: REVIEW SUBMISSION
========================= */

async function adminReviewSubmissionHandler(request, env, recordId) {
  const session = await requireAuth(request, env);

  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // CHECK REVIEWER ROLE
  const roleCheck = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR')
    LIMIT 1
  `).bind(session.user_id).first();

  if (!roleCheck) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  // VALIDATE RECORD ID
  if (!recordId || recordId.includes("/")) {
    return jsonResponse({ error: "Invalid record ID" }, 400);
  }

  // READ REQUEST BODY
  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request" }, 400);
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
    return jsonResponse({ error: "Invalid review status" }, 400);
  }

  // VALIDATE REMARKS
  if (
    remarks !== undefined &&
    remarks !== null &&
    typeof remarks !== "string"
  ) {
    return jsonResponse({ error: "Invalid reviewer remarks" }, 400);
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
    return jsonResponse({ error: "Submission not found" }, 404);
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
    session.user_id,
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
    session.user_id,
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


/* =========================
   ADMIN AUDIT TRAIL
========================= */

async function adminAuditLogsHandler(request, env) {
  const auth = await requireAuth(request, env);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const roleCheck = await env.DB.prepare(`
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = ?
      AND r.role_name IN ('SUPER_ADMIN', 'ADMIN')
  `).bind(auth.user_id).first();

  if (!roleCheck) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const result = await env.DB.prepare(`
    SELECT
      al.audit_id,
      al.actor_user_id,
      actor.full_name AS actor_name,
      al.action,
      al.target_type,
      al.target_id,
      target.full_name AS target_name,
      al.details_json,
      al.created_at
    FROM audit_logs al
    LEFT JOIN user_accounts actor
      ON actor.user_id = al.actor_user_id
    LEFT JOIN user_accounts target
      ON target.user_id = al.target_id
    ORDER BY al.created_at DESC
    LIMIT 100
  `).all();

  return jsonResponse({
    audit_logs: result.results || []
  });
}



/* =========================
   MAIN ROUTER
========================= */

export default {
  async fetch(request, env) {
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers
      });
    }

    const url = new URL(request.url);
    let response;

    try {
      if (
        url.pathname === "/health" &&
        request.method === "GET"
      ) {
        const result = await env.DB.prepare(`
          SELECT COUNT(*) AS total
          FROM sqlite_master
          WHERE type = 'table'
        `).first();

        response = jsonResponse({
          status: "ok",
          service: "juhudmanager-api-test",
          database: "connected",
          tables: result.total
        });

      } else if (
        url.pathname === "/api/auth/login" &&
        request.method === "POST"
      ) {
        response = await loginHandler(request, env);

      } else if (
        url.pathname === "/api/auth/me" &&
        request.method === "GET"
      ) {
        response = await meHandler(request, env);

      } else if (
        url.pathname === "/api/auth/logout" &&
        request.method === "POST"
      ) {
        response = await logoutHandler(request, env);
      
      } else if (
        url.pathname === "/api/profile" &&
        (request.method === "GET" || request.method === "PUT")
      ) {
        response = await profileHandler(request, env);


      } else if (
        /^\/api\/admin\/users\/[^/]+\/profile$/.test(url.pathname) &&
        (request.method === "GET" || request.method === "PUT")
      ) {
        const userId = decodeURIComponent(
          url.pathname.split("/")[4]
        );

        response = await adminUserProfileHandler(
          request,
          env,
          userId
        );

        
      } else if (
        url.pathname === "/api/admin/users" &&
        request.method === "GET"
      ) {
        response = await adminUsersHandler(request, env);

      } else if (
        url.pathname === "/api/admin/users" &&
        request.method === "POST"
      ) {
        response = await createUserHandler(request, env);

      } else if (
        url.pathname === "/api/admin/activity-types" &&
        (request.method === "GET" || request.method === "POST")
      ) {
        response = await adminActivityTypesHandler(request, env);

      } else if (
        url.pathname === "/api/activities" &&
        (request.method === "GET" || request.method === "POST")
      ) {
        response = await activitiesHandler(request, env);

      } else if (
        url.pathname === "/api/admin/submissions" &&
        request.method === "GET"
      ) {
        response = await adminSubmissionsHandler(request, env);

      } else if (
        url.pathname === "/api/admin/audit-logs" &&
        request.method === "GET"
      ) {
        response = await adminAuditLogsHandler(request, env);

      } else if (
        url.pathname.startsWith("/api/admin/submissions/") &&
        request.method === "PATCH"
      ) {
        const recordId = url.pathname.split("/").pop();

        response = await adminReviewSubmissionHandler(
          request,
          env,
          recordId
        );

      } else {

      response = jsonResponse({
      error: "Not Found",
      path: url.pathname,
      method: request.method,
      service: "juhudmanager-api-test"
      }, 404);
    }

    } catch (error) {
      console.error("API error:", error?.message || String(error));

      response = jsonResponse({
        error: "Internal server error"
      }, 500);
    }
    
    return addCors(response, headers);
  }
};

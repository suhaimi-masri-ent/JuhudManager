const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } });
}
function bad(message, status = 400) { return json({ error: message }, status); }
function uuid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function b64(bytes) {
  let s = "";
  bytes.forEach(b => s += String.fromCharCode(b));
  return btoa(s);
}
function fromB64(s) {
  const raw = atob(s);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
function hex(bytes) { return [...bytes].map(x => x.toString(16).padStart(2, "0")).join(""); }
async function digest(value) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
async function derivePassword(password, salt, pepper) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password + pepper), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" }, material, 256);
  return b64(new Uint8Array(bits));
}
async function encryptIdentifier(value, env) {
  const keyBytes = fromB64(env.ID_ENCRYPTION_KEY);
  if (keyBytes.length !== 32) throw new Error("ID_ENCRYPTION_KEY must decode to 32 bytes");
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return b64(new Uint8Array([...iv, ...new Uint8Array(ciphertext)]));
}
function normalizeIdentifier(type, value) {
  const v = String(value || "").trim();
  if (type === "EMAIL") return v.toLowerCase();
  if (type === "WHATSAPP") return v.replace(/[^\d+]/g, "");
  return v.replace(/\s+/g, "").toUpperCase();
}
function maskIdentifier(value) {
  const v = String(value);
  return v.length <= 4 ? "••••" : "••••••" + v.slice(-4);
}
function cookieValue(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const entry = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(name + "="));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}
function cookieHeader(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${maxAge}`;
}
function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = env.ALLOWED_ORIGIN;
  const headers = { "Vary": "Origin", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Bootstrap-Secret", "Access-Control-Allow-Credentials": "true" };
  if (origin && allowed && origin === allowed) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}
async function audit(env, actor, action, targetType = null, targetId = null, details = {}) {
  await env.DB.prepare(`INSERT INTO audit_logs(audit_id,actor_user_id,action,target_type,target_id,details_json) VALUES(?,?,?,?,?,?)`)
    .bind(uuid(), actor || null, action, targetType, targetId, JSON.stringify(details)).run();
}
async function getAuth(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearer || cookieValue(request, env.COOKIE_NAME || "juhud_session");
  if (!token) return null;
  const tokenHash = await digest(token);
  const row = await env.DB.prepare(`
    SELECT s.session_id,s.user_id,s.expires_at,a.full_name,a.account_status
    FROM user_sessions s JOIN user_accounts a ON a.user_id=s.user_id
    WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>?`)
    .bind(tokenHash, now()).first();
  if (!row || row.account_status !== "ACTIVE") return null;
  await env.DB.prepare("UPDATE user_sessions SET last_seen_at=? WHERE session_id=?").bind(now(), row.session_id).run();
  await env.DB.prepare("UPDATE user_accounts SET last_access_at=? WHERE user_id=?").bind(now(), row.user_id).run();
  const roles = await env.DB.prepare(`SELECT r.role_name FROM user_roles ur JOIN roles r ON r.role_id=ur.role_id WHERE ur.user_id=?`).bind(row.user_id).all();
  return { userId: row.user_id, fullName: row.full_name, roles: (roles.results || []).map(x => x.role_name), sessionId: row.session_id };
}
function hasRole(auth, ...roles) { return auth && roles.some(r => auth.roles.includes(r)); }
async function body(request) {
  try { return await request.json(); } catch { return null; }
}
async function createUser(env, data, roleName = "USER") {
  const fullName = String(data.fullName || "").trim();
  const password = String(data.password || "");
  if (!fullName || password.length < 12) throw new Error("Full name and password of at least 12 characters are required");
  const loginType = String(data.loginType || "").toUpperCase();
  const allowed = ["NRIC", "PASSPORT", "EMAIL", "WHATSAPP"];
  if (!allowed.includes(loginType)) throw new Error("Invalid loginType");
  const identifier = normalizeIdentifier(loginType, data.loginIdentifier);
  if (!identifier || identifier.length < 4) throw new Error("A valid login identifier is required");
  const lookupHash = await hmac(env.ID_LOOKUP_SECRET, loginType + ":" + identifier);
  const exists = await env.DB.prepare("SELECT identifier_id FROM user_identifiers WHERE lookup_hash=?").bind(lookupHash).first();
  if (exists) throw new Error("This login identifier is already registered");
  const userId = uuid();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await derivePassword(password, salt, env.PASSWORD_PEPPER);
  await env.DB.prepare(`INSERT INTO user_accounts(user_id,full_name,password_hash,password_salt) VALUES(?,?,?,?)`)
    .bind(userId, fullName, passwordHash, b64(salt)).run();
  await env.DB.prepare("INSERT INTO user_profiles(user_id) VALUES(?)").bind(userId).run();
  const encrypted = await encryptIdentifier(identifier, env);
  await env.DB.prepare(`INSERT INTO user_identifiers(identifier_id,user_id,identifier_type,lookup_hash,encrypted_value,masked_value,is_primary)
    VALUES(?,?,?,?,?,?,1)`).bind(uuid(), userId, loginType, lookupHash, encrypted, maskIdentifier(identifier)).run();
  if (data.email && loginType !== "EMAIL") await addIdentifier(env, userId, "EMAIL", data.email);
  if (data.whatsapp && loginType !== "WHATSAPP") await addIdentifier(env, userId, "WHATSAPP", data.whatsapp);
  const role = await env.DB.prepare("SELECT role_id FROM roles WHERE role_name=?").bind(roleName).first();
  await env.DB.prepare("INSERT INTO user_roles(user_id,role_id) VALUES(?,?)").bind(userId, role.role_id).run();
  return userId;
}
async function addIdentifier(env, userId, type, raw) {
  const value = normalizeIdentifier(type, raw);
  if (!value) return;
  const lookupHash = await hmac(env.ID_LOOKUP_SECRET, type + ":" + value);
  const exists = await env.DB.prepare("SELECT identifier_id FROM user_identifiers WHERE lookup_hash=?").bind(lookupHash).first();
  if (exists) throw new Error(`${type} is already registered`);
  const encrypted = await encryptIdentifier(value, env);
  await env.DB.prepare(`INSERT INTO user_identifiers(identifier_id,user_id,identifier_type,lookup_hash,encrypted_value,masked_value)
    VALUES(?,?,?,?,?,?)`).bind(uuid(), userId, type, lookupHash, encrypted, maskIdentifier(value)).run();
}
async function login(request, env) {
  const data = await body(request);
  if (!data) return bad("Invalid JSON");
  const type = String(data.loginType || "").toUpperCase();
  const allowed = ["NRIC", "PASSPORT", "EMAIL", "WHATSAPP"];
  if (!allowed.includes(type)) return bad("Unsupported login type");
  const identifier = normalizeIdentifier(type, data.loginIdentifier);
  const lookupHash = await hmac(env.ID_LOOKUP_SECRET, type + ":" + identifier);
  const row = await env.DB.prepare(`
    SELECT a.user_id,a.password_hash,a.password_salt,a.account_status,a.failed_login_attempts,a.locked_until
    FROM user_identifiers i JOIN user_accounts a ON a.user_id=i.user_id
    WHERE i.lookup_hash=?`).bind(lookupHash).first();
  if (!row || row.account_status !== "ACTIVE") return bad("Invalid credentials or inactive account", 401);
  if (row.locked_until && row.locked_until > now()) return bad("Account temporarily locked. Try again later.", 423);
  const candidate = await derivePassword(String(data.password || ""), fromB64(row.password_salt), env.PASSWORD_PEPPER);
  if (candidate !== row.password_hash) {
    const attempts = row.failed_login_attempts + 1;
    const lockUntil = attempts >= 8 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    await env.DB.prepare("UPDATE user_accounts SET failed_login_attempts=?,locked_until=?,updated_at=? WHERE user_id=?")
      .bind(attempts, lockUntil, now(), row.user_id).run();
    return bad("Invalid credentials", 401);
  }
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = b64(tokenBytes);
  const tokenHash = await digest(token);
  const sessionId = uuid();
  const days = Math.min(Math.max(Number(env.SESSION_DAYS || 7), 1), 30);
  const expires = new Date(Date.now() + days * 86400000).toISOString();
  await env.DB.prepare("INSERT INTO user_sessions(session_id,user_id,token_hash,expires_at,user_agent) VALUES(?,?,?,?,?)")
    .bind(sessionId, row.user_id, tokenHash, expires, request.headers.get("User-Agent") || null).run();
  await env.DB.prepare("UPDATE user_accounts SET failed_login_attempts=0,locked_until=NULL,last_login_at=?,last_access_at=?,updated_at=? WHERE user_id=?")
    .bind(now(), now(), now(), row.user_id).run();
  await audit(env, row.user_id, "LOGIN", "SESSION", sessionId);
  return json({ ok: true, token, expiresAt: expires }, 200, { "Set-Cookie": cookieHeader(env.COOKIE_NAME || "juhud_session", token, days * 86400) });
}
async function handle(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  if (method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  if (path === "/api/health" && method === "GET") return json({ ok: true, service: "JuhudManager API", database: "JuhudDB" });
  if (path === "/api/setup/bootstrap" && method === "POST") {
    if (!env.BOOTSTRAP_SECRET || request.headers.get("X-Bootstrap-Secret") !== env.BOOTSTRAP_SECRET) return bad("Forbidden", 403);
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM user_accounts").first();
    if (count.n > 0) return bad("Bootstrap is already completed", 409);
    const data = await body(request);
    if (!data) return bad("Invalid JSON");
    try {
      const id = await createUser(env, data, "SUPER_ADMIN");
      await audit(env, id, "BOOTSTRAP_SUPER_ADMIN_CREATED", "USER", id);
      return json({ ok: true, userId: id, message: "Super Admin created. Rotate/remove bootstrap secret." }, 201);
    } catch (e) { return bad(e.message); }
  }
  if (path === "/api/auth/login" && method === "POST") return login(request, env);
  const auth = await getAuth(request, env);
  if (path === "/api/auth/logout" && method === "POST") {
    if (!auth) return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(env.COOKIE_NAME || "juhud_session", "", 0) });
    await env.DB.prepare("UPDATE user_sessions SET revoked_at=? WHERE session_id=?").bind(now(), auth.sessionId).run();
    await env.DB.prepare("UPDATE user_accounts SET last_logout_at=? WHERE user_id=?").bind(now(), auth.userId).run();
    await audit(env, auth.userId, "LOGOUT", "SESSION", auth.sessionId);
    return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(env.COOKIE_NAME || "juhud_session", "", 0) });
  }
  if (!auth) return bad("Authentication required", 401);
  if (path === "/api/me" && method === "GET") {
    const profile = await env.DB.prepare("SELECT * FROM user_profiles WHERE user_id=?").bind(auth.userId).first();
    const identifiers = await env.DB.prepare("SELECT identifier_type,masked_value,is_primary,verified_at FROM user_identifiers WHERE user_id=?").bind(auth.userId).all();
    return json({ user: { userId: auth.userId, fullName: auth.fullName, roles: auth.roles }, profile, identifiers: identifiers.results || [] });
  }
  if (path === "/api/profile" && method === "PUT") {
    const d = await body(request); if (!d) return bad("Invalid JSON");
    const fields = ["date_of_birth","gender","marital_status","nationality","country","state_province","city_district","postcode","street_address","building_number","building_name","address_line_2"];
    const values = fields.map(k => d[k] === undefined ? null : String(d[k]).slice(0, 500));
    await env.DB.prepare(`UPDATE user_profiles SET date_of_birth=?,gender=?,marital_status=?,nationality=?,country=?,state_province=?,city_district=?,postcode=?,street_address=?,building_number=?,building_name=?,address_line_2=?,updated_at=? WHERE user_id=?`)
      .bind(...values, now(), auth.userId).run();
    await audit(env, auth.userId, "PROFILE_UPDATED", "USER_PROFILE", auth.userId);
    return json({ ok: true });
  }
  if (path === "/api/activities" && method === "GET") {
    const types = await env.DB.prepare("SELECT activity_type_id,activity_name,description,frequency,requires_attachment FROM activity_types WHERE status='ACTIVE' ORDER BY activity_name").all();
    const records = await env.DB.prepare(`SELECT ar.*,at.activity_name,at.frequency FROM activity_records ar JOIN activity_types at ON at.activity_type_id=ar.activity_type_id WHERE ar.user_id=? ORDER BY ar.submitted_at DESC LIMIT 100`).bind(auth.userId).all();
    return json({ types: types.results || [], records: records.results || [] });
  }
  if (path === "/api/activities" && method === "POST") {
    const d = await body(request); if (!d) return bad("Invalid JSON");
    const type = await env.DB.prepare("SELECT activity_type_id FROM activity_types WHERE activity_type_id=? AND status='ACTIVE'").bind(d.activityTypeId).first();
    if (!type) return bad("Activity type not found", 404);
    if (!String(d.description || "").trim()) return bad("Activity description is required");
    const id = uuid();
    await env.DB.prepare(`INSERT INTO activity_records(record_id,user_id,activity_type_id,activity_date,period_start,period_end,description,progress_status)
      VALUES(?,?,?,?,?,?,?,?)`).bind(id, auth.userId, d.activityTypeId, d.activityDate || now().slice(0,10), d.periodStart || null, d.periodEnd || null, String(d.description).slice(0,5000), d.progressStatus || "COMPLETED").run();
    await audit(env, auth.userId, "ACTIVITY_SUBMITTED", "ACTIVITY_RECORD", id);
    return json({ ok: true, recordId: id }, 201);
  }
  if (path === "/api/admin/users" && method === "GET") {
    if (!hasRole(auth, "SUPER_ADMIN", "ADMIN")) return bad("Forbidden", 403);
    const rows = await env.DB.prepare(`SELECT a.user_id,a.full_name,a.account_status,a.created_at,a.last_login_at,
      (SELECT GROUP_CONCAT(r.role_name) FROM user_roles ur JOIN roles r ON r.role_id=ur.role_id WHERE ur.user_id=a.user_id) AS roles,
      (SELECT GROUP_CONCAT(i.identifier_type || ':' || i.masked_value, ' | ') FROM user_identifiers i WHERE i.user_id=a.user_id) AS identifiers
      FROM user_accounts a ORDER BY a.created_at DESC LIMIT 500`).all();
    return json({ users: rows.results || [] });
  }
  if (path === "/api/admin/users" && method === "POST") {
    if (!hasRole(auth, "SUPER_ADMIN", "ADMIN")) return bad("Forbidden", 403);
    const d = await body(request); if (!d) return bad("Invalid JSON");
    try {
      const role = ["USER","SUPERVISOR","ADMIN"].includes(d.role) ? d.role : "USER";
      const id = await createUser(env, d, role);
      await audit(env, auth.userId, "USER_CREATED", "USER", id, { role });
      return json({ ok: true, userId: id }, 201);
    } catch (e) { return bad(e.message); }
  }
  if (path === "/api/admin/activity-types" && method === "GET") {
    if (!hasRole(auth, "SUPER_ADMIN", "ADMIN")) return bad("Forbidden", 403);
    const rows = await env.DB.prepare("SELECT * FROM activity_types ORDER BY created_at DESC").all();
    return json({ activityTypes: rows.results || [] });
  }
  if (path === "/api/admin/activity-types" && method === "POST") {
    if (!hasRole(auth, "SUPER_ADMIN", "ADMIN")) return bad("Forbidden", 403);
    const d = await body(request); if (!d) return bad("Invalid JSON");
    if (!String(d.activityName || "").trim()) return bad("Activity name required");
    const freq = ["DAILY","WEEKLY","MONTHLY","YEARLY","AD_HOC"].includes(d.frequency) ? d.frequency : "AD_HOC";
    const id = uuid();
    await env.DB.prepare(`INSERT INTO activity_types(activity_type_id,activity_name,description,frequency,requires_attachment,created_by)
      VALUES(?,?,?,?,?,?)`).bind(id, d.activityName.trim(), d.description || null, freq, d.requiresAttachment ? 1 : 0, auth.userId).run();
    await audit(env, auth.userId, "ACTIVITY_TYPE_CREATED", "ACTIVITY_TYPE", id);
    return json({ ok: true, activityTypeId: id }, 201);
  }
  if (path === "/api/admin/submissions" && method === "GET") {
    if (!hasRole(auth, "SUPER_ADMIN", "ADMIN", "SUPERVISOR")) return bad("Forbidden", 403);
    const rows = await env.DB.prepare(`SELECT ar.*,a.full_name,at.activity_name FROM activity_records ar
      JOIN user_accounts a ON a.user_id=ar.user_id JOIN activity_types at ON at.activity_type_id=ar.activity_type_id
      ORDER BY CASE ar.review_status WHEN 'PENDING' THEN 0 ELSE 1 END, ar.submitted_at DESC LIMIT 500`).all();
    return json({ submissions: rows.results || [] });
  }
  const reviewMatch = path.match(/^\/api\/admin\/submissions\/([a-f0-9-]+)$/i);
  if (reviewMatch && method === "PATCH") {
    if (!hasRole(auth, "SUPER_ADMIN", "ADMIN", "SUPERVISOR")) return bad("Forbidden", 403);
    const d = await body(request); if (!d) return bad("Invalid JSON");
    const status = ["APPROVED","REJECTED","NEEDS_REVISION"].includes(d.reviewStatus) ? d.reviewStatus : null;
    if (!status) return bad("Invalid reviewStatus");
    const result = await env.DB.prepare(`UPDATE activity_records SET review_status=?,reviewed_by=?,reviewed_at=?,reviewer_remarks=?,updated_at=? WHERE record_id=?`)
      .bind(status, auth.userId, now(), String(d.remarks || "").slice(0,2000), now(), reviewMatch[1]).run();
    if (!result.meta.changes) return bad("Submission not found", 404);
    await audit(env, auth.userId, "SUBMISSION_REVIEWED", "ACTIVITY_RECORD", reviewMatch[1], { status });
    return json({ ok: true });
  }
  return bad("Not found", 404);
}
export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    try {
      const response = await handle(request, env);
      const out = new Response(response.body, response);
      for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
      return out;
    } catch (error) {
      return json({ error: "Internal server error" }, 500, headers);
    }
  }
};

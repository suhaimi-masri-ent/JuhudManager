function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const ACCESS_LEVELS = [
  "LIMITED",
  "FULL"
];

const ADMIN_ROLES = [
  "ADMIN",
  "SUPER_ADMIN"
];

function validateDatabase(db) {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }
}

function validateUserId(userId) {
  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw httpError("A valid user ID is required.", 400);
  }

  return userId.trim();
}

function validateCountryId(countryId) {
  if (
    typeof countryId !== "string" ||
    !/^[A-Z]{2}$/.test(countryId.trim())
  ) {
    throw httpError("A valid country ID is required.", 400);
  }

  return countryId.trim();
}

function requireAuthenticatedSession(session) {
  if (
    !session ||
    session.authenticated !== true
  ) {
    throw httpError("Authentication required.", 401);
  }

  return true;
}

export function requireAccessLevel(session, requiredLevel) {
  requireAuthenticatedSession(session);

  if (!ACCESS_LEVELS.includes(requiredLevel)) {
    throw httpError("Invalid access policy.", 500);
  }

  if (session.accessLevel !== requiredLevel) {
    throw httpError("Insufficient access privileges.", 403);
  }

  return true;
}

export function requireAnyAccessLevel(session, allowedLevels) {
  requireAuthenticatedSession(session);

  if (
    !Array.isArray(allowedLevels) ||
    allowedLevels.length === 0 ||
    allowedLevels.some(level => !ACCESS_LEVELS.includes(level))
  ) {
    throw httpError("Invalid access policy.", 500);
  }

  if (!allowedLevels.includes(session.accessLevel)) {
    throw httpError("Insufficient access privileges.", 403);
  }

  return true;
}

export async function getUserRoleCodes({ db, userId }) {
  validateDatabase(db);

  const normalizedUserId = validateUserId(userId);

  const result = await db.prepare(
    `SELECT r.role_code
     FROM user_roles ur
     INNER JOIN roles r
       ON r.role_id = ur.role_id
     WHERE ur.user_id = ?1
     ORDER BY r.role_code`
  ).bind(normalizedUserId).all();

  return (result?.results ?? [])
    .map(row => row.role_code)
    .filter(code => typeof code === "string");
}

export async function requireAdminRole({ db, session }) {
  requireAuthenticatedSession(session);
  requireAccessLevel(session, "FULL");

  const roleCodes = await getUserRoleCodes({
    db,
    userId: session.userId
  });

  const adminRole = roleCodes.find(
    code => ADMIN_ROLES.includes(code)
  );

  if (!adminRole) {
    throw httpError("Administrator access required.", 403);
  }

  return {
    userId: session.userId,
    roleCode: adminRole
  };
}

export async function requireSuperAdminRole({ db, session }) {
  requireAuthenticatedSession(session);
  requireAccessLevel(session, "FULL");

  const roleCodes = await getUserRoleCodes({
    db,
    userId: session.userId
  });

  if (!roleCodes.includes("SUPER_ADMIN")) {
    throw httpError("Super Admin access required.", 403);
  }

  return {
    userId: session.userId,
    roleCode: "SUPER_ADMIN",
    isGlobal: true
  };
}

export async function getUserCountryScope({ db, session }) {
  requireAuthenticatedSession(session);
  requireAccessLevel(session, "FULL");
  validateDatabase(db);

  const roleCodes = await getUserRoleCodes({
    db,
    userId: session.userId
  });

  if (roleCodes.includes("SUPER_ADMIN")) {
    return {
      userId: session.userId,
      roleCode: "SUPER_ADMIN",
      isGlobal: true,
      countryIds: null
    };
  }

  if (!roleCodes.includes("ADMIN")) {
    throw httpError("Administrator access required.", 403);
  }

  const result = await db.prepare(
    `SELECT
       uca.country_id
     FROM user_country_assignments uca
     INNER JOIN countries c
       ON c.country_id = uca.country_id
     WHERE uca.user_id = ?1
       AND uca.assignment_role_code = 'ADMIN'
       AND uca.assignment_status = 'ACTIVE'
       AND c.country_status = 'ACTIVE'
     ORDER BY uca.country_id`
  ).bind(session.userId).all();

  return {
    userId: session.userId,
    roleCode: "ADMIN",
    isGlobal: false,
    countryIds: (result?.results ?? [])
      .map(row => row.country_id)
  };
}

export async function requireCountryAccess({
  db,
  session,
  countryId
}) {
  const normalizedCountryId = validateCountryId(countryId);

  const scope = await getUserCountryScope({
    db,
    session
  });

  const country = await db.prepare(
    `SELECT country_id
     FROM countries
     WHERE country_id = ?1
       AND country_status = 'ACTIVE'
     LIMIT 1`
  ).bind(normalizedCountryId).first();

  if (!country) {
    throw httpError("Country not found or inactive.", 404);
  }

  if (scope.isGlobal) {
    return {
      userId: scope.userId,
      roleCode: scope.roleCode,
      countryId: normalizedCountryId,
      isGlobal: true
    };
  }

  if (!scope.countryIds.includes(normalizedCountryId)) {
    throw httpError("Access to this country is not permitted.", 403);
  }

  return {
    userId: scope.userId,
    roleCode: scope.roleCode,
    countryId: normalizedCountryId,
    isGlobal: false
  };
}


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

/**
 * Enforce the required access level for a session.
 *
 * Example:
 * requireAccessLevel(session, "FULL");
 */
export function requireAccessLevel(session, requiredLevel) {
  if (
    !session ||
    session.authenticated !== true
  ) {
    throw httpError("Authentication required.", 401);
  }

  if (!ACCESS_LEVELS.includes(requiredLevel)) {
    throw httpError("Invalid access policy.", 500);
  }

  if (session.accessLevel !== requiredLevel) {
    throw httpError("Insufficient access privileges.", 403);
  }

  return true;
}

/**
 * Enforce one of the allowed access levels.
 *
 * Example:
 * requireAnyAccessLevel(session, ["LIMITED", "FULL"]);
 */
export function requireAnyAccessLevel(session, allowedLevels) {
  if (
    !session ||
    session.authenticated !== true
  ) {
    throw httpError("Authentication required.", 401);
  }

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

/**
 * Retrieve roles assigned to a user from the database.
 * Never trust role information supplied by the client.
 */
export async function getUserRoleCodes({ db, userId }) {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 database binding is unavailable.");
  }

  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw httpError("A valid user ID is required.", 400);
  }

  const result = await db.prepare(
    `SELECT r.role_code
     FROM user_roles ur
     INNER JOIN roles r
       ON r.role_id = ur.role_id
     WHERE ur.user_id = ?1
     ORDER BY r.role_code`
  ).bind(userId.trim()).all();

  return (result?.results ?? [])
    .map(row => row.role_code)
    .filter(code => typeof code === "string");
}

/**
 * Require ADMIN or SUPER_ADMIN role.
 *
 * Role assignment is always checked against D1.
 */
export async function requireAdminRole({ db, session }) {
  if (
    !session ||
    session.authenticated !== true
  ) {
    throw httpError("Authentication required.", 401);
  }

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


import { json } from "../lib/http.js";
import { authenticateSession } from "../auth/sessions.js";

import {
  httpError,
  readProfileJson
} from "../services/profile/profile-validation.js";

import {
  getProfile,
  getProfileCountries
} from "../services/profile/profile-read.js";

import {
  updateProfile
} from "../services/profile/profile-update.js";

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization");

  if (typeof authorization !== "string") return null;

  const match = authorization.match(
    /^Bearer ([A-Za-z0-9_-]{43})$/
  );

  return match ? match[1] : null;
}

async function requireProfileSession(request, env) {
  const token = getBearerToken(request);

  if (!token) {
    throw httpError(
      "A valid Bearer token is required.",
      401
    );
  }

  const session = await authenticateSession({
    db: env.DB,
    env,
    token
  });

  if (!session) {
    throw httpError(
      "Invalid or expired session.",
      401
    );
  }

  if (!["FULL", "LIMITED"].includes(session.accessLevel)) {
    throw httpError(
      "Profile access is not permitted.",
      403
    );
  }

  return session;
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  return json({
    error: status === 500
      ? "Profile service unavailable."
      : error.message
  }, status);
}

export async function handleProfileRequest(
  request,
  env,
  url
) {
  const isGetRequest =
    url.pathname === "/me/profile" &&
    request.method === "GET";

  const isPatchRequest =
    url.pathname === "/me/profile" &&
    request.method === "PATCH";

  const isCountriesRequest =
    url.pathname === "/me/profile/countries" &&
    request.method === "GET";

  if (
    !isGetRequest &&
    !isPatchRequest &&
    !isCountriesRequest
  ) {
    return null;
  }

  try {
    const session = await requireProfileSession(
      request,
      env
    );

    if (isCountriesRequest) {
      return await getProfileCountries(env.DB);
    }

    if (isGetRequest) {
      return await getProfile({
        db: env.DB,
        env,
        userId: session.userId,
        accessLevel: session.accessLevel
      });
    }

    const body = await readProfileJson(request);

    const profile = await updateProfile({
      db: env.DB,
      userId: session.userId,
      accessLevel: session.accessLevel,
      body
    });

    return json({
      ok: true,
      message: "Profile updated successfully.",
      profile
    });
  } catch (error) {
    return errorResponse(error);
  }
}

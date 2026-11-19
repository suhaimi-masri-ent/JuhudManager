
import { json } from "../lib/http.js";
import {
  requestRegistrationOtp,
  verifyRegistrationOtp
} from "../auth/otp.js";

const ALLOWED_DESTINATION_TYPES = ["EMAIL", "WHATSAPP"];

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  return json({
    error: status === 500
      ? "Authentication service unavailable."
      : error.message
  }, status);
}

function validRegistrationIdentity(body) {
  return Boolean(
    body &&
    typeof body.userId === "string" &&
    body.userId.trim() &&
    typeof body.identityId === "string" &&
    body.identityId.trim() &&
    ALLOWED_DESTINATION_TYPES.includes(body.destinationType) &&
    typeof body.destination === "string" &&
    body.destination.trim()
  );
}

export async function handleAuthRequest(request, env, url) {
  if (
    url.pathname === "/auth/otp/request" &&
    request.method === "POST"
  ) {
    const body = await readJson(request);

    if (!validRegistrationIdentity(body)) {
      return json({
        error: "userId, identityId, destinationType and destination are required."
      }, 400);
    }

    try {
      const result = await requestRegistrationOtp({
        db: env.DB,
        env,
        userId: body.userId.trim(),
        identityId: body.identityId.trim(),
        destinationType: body.destinationType,
        destination: body.destination
      });

      return json({
        ok: true,
        ...result
      }, 202);
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (
    url.pathname === "/auth/otp/verify" &&
    request.method === "POST"
  ) {
    const body = await readJson(request);

    if (
      !validRegistrationIdentity(body) ||
      typeof body.otp !== "string" ||
      !body.otp.trim()
    ) {
      return json({
        error: "userId, identityId, destinationType, destination and otp are required."
      }, 400);
    }

    try {
      const result = await verifyRegistrationOtp({
        db: env.DB,
        env,
        userId: body.userId.trim(),
        identityId: body.identityId.trim(),
        destinationType: body.destinationType,
        destination: body.destination,
        otp: body.otp.trim()
      });

      return json({
        ok: true,
        ...result
      });
    } catch (error) {
      return errorResponse(error);
    }
  }

  return null;
}

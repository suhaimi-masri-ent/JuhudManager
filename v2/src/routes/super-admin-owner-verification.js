
import { json } from "../lib/http.js";
import { enforceRateLimit } from "../lib/rate-limit.js";
import { createBrevoDelivery } from "../lib/brevo-email.js";

import {
  requestSuperAdminOwnerVerification,
  verifySuperAdminOwnerVerification
} from "../auth/super-admin-owner-verification.js";

const REQUEST_PATH =
  "/internal/super-admin/owner-verification/request";

const VERIFY_PATH =
  "/internal/super-admin/owner-verification/verify";

const TARGET_USER_ID =
  "6b3b4088-7e19-4efc-a942-387c7880460c";

const MAX_BODY_BYTES = 1024;

const RATE_LIMITS = {
  REQUEST_IP: {
    scope: "SA_OWNER_REQ_IP",
    limit: 5,
    windowSeconds: 900
  },

  REQUEST_TARGET: {
    scope: "SA_OWNER_REQ_TARGET",
    limit: 3,
    windowSeconds: 900
  },

  VERIFY_IP: {
    scope: "SA_OWNER_VERIFY_IP",
    limit: 10,
    windowSeconds: 900
  },

  VERIFY_TARGET: {
    scope: "SA_OWNER_VERIFY_TARGET",
    limit: 10,
    windowSeconds: 900
  }
};

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function errorResponse(error, stage) {
  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  if (status >= 500) {
    console.error("SUPER_ADMIN_OWNER_VERIFICATION_ERROR", {
      stage,
      name: error?.name ?? "Error",
      message: error?.message ?? "Unknown error"
    });
  }

  return json({
    error: status >= 500
      ? "Owner verification service is unavailable."
      : error.message
  }, status);
}

async function readJson(request) {
  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_BODY_BYTES
    ) {
      throw httpError("Request body is too large.", 413);
    }
  }

  if (!request.body) {
    return null;
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw httpError("Request body is too large.", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", {
      fatal: true
    }).decode(bytes);

    return JSON.parse(text);
  } catch {
    throw httpError("A valid JSON request body is required.", 400);
  }
}

async function applyRateLimit({
  request,
  env,
  config,
  key
}) {
  const result = await enforceRateLimit({
    db: env.DB,
    env,
    request,
    scope: config.scope,
    limit: config.limit,
    windowSeconds: config.windowSeconds,
    key
  });

  if (!result.allowed) {
    return json({
      error: "Too many requests. Please try again later.",
      retryAfterSeconds: result.retryAfterSeconds
    }, 429, {
      "Retry-After": String(result.retryAfterSeconds)
    });
  }

  return null;
}

async function applyBothRateLimits({
  request,
  env,
  ipConfig,
  targetConfig
}) {
  const ipLimited = await applyRateLimit({
    request,
    env,
    config: ipConfig
  });

  if (ipLimited) {
    return ipLimited;
  }

  const targetLimited = await applyRateLimit({
    request,
    env,
    config: targetConfig,
    key: `user:${TARGET_USER_ID}`
  });

  if (targetLimited) {
    return targetLimited;
  }

  return null;
}

function validOtpBody(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return false;
  }

  const keys = Object.keys(body);

  // Only the OTP is accepted.
  // No email, user ID or destination is accepted.
  if (
    keys.length !== 1 ||
    keys[0] !== "otp"
  ) {
    return false;
  }

  return (
    typeof body.otp === "string" &&
    /^\d{6}$/.test(body.otp)
  );
}

export async function handleSuperAdminOwnerVerificationRequest(
  request,
  env,
  url
) {
  const path = url.pathname;

  if (
    path !== REQUEST_PATH &&
    path !== VERIFY_PATH
  ) {
    return null;
  }

  if (request.method !== "POST") {
    return json({
      error: "Method not allowed."
    }, 405, {
      Allow: "POST"
    });
  }

  if (
    !env.DB ||
    !env.HMAC_SECRET ||
    !env.OTP_HASH_SECRET ||
    !env.ENCRYPTION_KEY
  ) {
    return json({
      error: "Owner verification is not configured."
    }, 503);
  }

  try {
    if (path === REQUEST_PATH) {
      const limited = await applyBothRateLimits({
        request,
        env,
        ipConfig: RATE_LIMITS.REQUEST_IP,
        targetConfig: RATE_LIMITS.REQUEST_TARGET
      });

      if (limited) {
        return limited;
      }

      const result =
        await requestSuperAdminOwnerVerification({
          db: env.DB,
          env,
          delivery: createBrevoDelivery(env)
        });

      return json({
        ok: true,
        message: "If the bootstrap owner is eligible, a verification code has been sent to the designated email address.",
        expiresInMinutes: result.expiresInMinutes
      }, 202);
    }

    if (path === VERIFY_PATH) {
      const limited = await applyBothRateLimits({
        request,
        env,
        ipConfig: RATE_LIMITS.VERIFY_IP,
        targetConfig: RATE_LIMITS.VERIFY_TARGET
      });

      if (limited) {
        return limited;
      }

      let body;

      try {
        body = await readJson(request);
      } catch (error) {
        return errorResponse(
          error,
          "VERIFY_READ_BODY"
        );
      }

      if (!validOtpBody(body)) {
        return json({
          error: "A valid six-digit verification code is required."
        }, 400);
      }

      const result =
        await verifySuperAdminOwnerVerification({
          db: env.DB,
          env,
          otp: body.otp,
          request
        });

      return json({
        ok: true,
        message: "The designated owner email address has been verified.",
        ...result
      }, 200);
    }

    return null;
  } catch (error) {
    return errorResponse(
      error,
      path === REQUEST_PATH
        ? "REQUEST_PROCESS"
        : "VERIFY_PROCESS"
    );
  }
}

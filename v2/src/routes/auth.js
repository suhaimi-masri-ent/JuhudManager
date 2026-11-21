
import { json } from "../lib/http.js";
import { enforceRateLimit } from "../lib/rate-limit.js";

import {
  requestRegistrationOtp,
  verifyRegistrationOtp
} from "../auth/otp.js";

import {
  createRegistrationDraft,
  resumeRegistrationDraft
} from "../auth/registrations.js";

import {
  issueActivationToken
} from "../auth/activation.js";

import {
  setInitialPassword
} from "../auth/credentials.js";

const ALLOWED_DESTINATION_TYPES = ["EMAIL"];
const MAX_REQUEST_BODY_BYTES = 16 * 1024;

const RATE_LIMITS = {
  REGISTER: {
    scope: "REGISTER",
    limit: 10,
    windowSeconds: 3600
  },
  REGISTER_RESUME: {
    scope: "REGISTER_RESUME",
    limit: 5,
    windowSeconds: 900
  },
  OTP_REQUEST: {
    scope: "OTP_REQUEST",
    limit: 10,
    windowSeconds: 900
  },
  OTP_VERIFY: {
    scope: "OTP_VERIFY",
    limit: 20,
    windowSeconds: 900
  },
  ACTIVATION_REQUEST: {
    scope: "ACTIVATION_REQUEST",
    limit: 10,
    windowSeconds: 900
  },
  PASSWORD_SETUP: {
    scope: "PASSWORD_SETUP",
    limit: 10,
    windowSeconds: 900
  }
};

function logAuthError(stage, error) {
  console.error("AUTH_DIAGNOSTIC", {
    stage,
    name: error?.name ?? "Error",
    message: error?.message ?? "Unknown error",
    status: error?.status ?? null
  });
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function errorResponse(error, stage = "UNKNOWN") {
  logAuthError(stage, error);

  const status = Number.isInteger(error?.status)
    ? error.status
    : 500;

  return json({
    error: status === 500
      ? "Authentication service unavailable."
      : error.message
  }, status);
}

async function checkRateLimit(request, env, config) {
  try {
    const result = await enforceRateLimit({
      db: env.DB,
      env,
      request,
      scope: config.scope,
      limit: config.limit,
      windowSeconds: config.windowSeconds
    });

    if (!result.allowed) {
      return new Response(JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfterSeconds: result.retryAfterSeconds
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": String(result.retryAfterSeconds)
        }
      });
    }

    return null;
  } catch (error) {
    return errorResponse(error, `RATE_LIMIT_${config.scope}`);
  }
}

async function readJson(request) {
  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_REQUEST_BODY_BYTES
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

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
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
    return null;
  }
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

function validResumeRegistration(body) {
  return Boolean(
    body &&
    typeof body.fullName === "string" &&
    body.fullName.trim() &&
    typeof body.countryCode === "string" &&
    /^[A-Za-z]{2}$/.test(body.countryCode.trim()) &&
    typeof body.nationalId === "string" &&
    body.nationalId.trim() &&
    typeof body.email === "string" &&
    body.email.trim() &&
    typeof body.whatsapp === "string" &&
    body.whatsapp.trim()
  );
}

export async function handleAuthRequest(request, env, url) {
  if (
    url.pathname === "/auth/register/start" &&
    request.method === "POST"
  ) {
    const limited = await checkRateLimit(
      request, env, RATE_LIMITS.REGISTER
    );

    if (limited) return limited;

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return errorResponse(error, "REGISTER_READ_BODY");
    }

    if (!body) {
      return json({
        error: "A valid JSON request body is required."
      }, 400);
    }

    try {
      const result = await createRegistrationDraft({
        db: env.DB,
        env,
        fullName: body.fullName,
        countryCode: body.countryCode,
        nationalId: body.nationalId,
        email: body.email,
        whatsapp: body.whatsapp
      });

      return json({ ok: true, ...result }, 201);
    } catch (error) {
      return errorResponse(error, "REGISTER_CREATE_DRAFT");
    }
  }

  // Resume an incomplete registration.
  // All submitted details must match the original draft.
  if (
    url.pathname === "/auth/register/resume" &&
    request.method === "POST"
  ) {
    const limited = await checkRateLimit(
      request, env, RATE_LIMITS.REGISTER_RESUME
    );

    if (limited) return limited;

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return errorResponse(error, "REGISTER_RESUME_READ_BODY");
    }

    if (!validResumeRegistration(body)) {
      return json({
        error: "All registration details are required."
      }, 400);
    }

    try {
      const result = await resumeRegistrationDraft({
        db: env.DB,
        env,
        fullName: body.fullName,
        countryCode: body.countryCode,
        nationalId: body.nationalId,
        email: body.email,
        whatsapp: body.whatsapp
      });

      return json({
        ok: true,
        ...result
      }, 200);
    } catch (error) {
      return errorResponse(error, "REGISTER_RESUME_PROCESS");
    }
  }

  if (
    url.pathname === "/auth/otp/request" &&
    request.method === "POST"
  ) {
    const limited = await checkRateLimit(
      request, env, RATE_LIMITS.OTP_REQUEST
    );

    if (limited) return limited;

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return errorResponse(error, "OTP_REQUEST_READ_BODY");
    }

    if (!validRegistrationIdentity(body)) {
      return json({
        error: "Valid userId, identityId, EMAIL destinationType and destination are required."
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

      return json({ ok: true, ...result }, 202);
    } catch (error) {
      return errorResponse(error, "OTP_REQUEST_PROCESS");
    }
  }

  if (
    url.pathname === "/auth/otp/verify" &&
    request.method === "POST"
  ) {
    const limited = await checkRateLimit(
      request, env, RATE_LIMITS.OTP_VERIFY
    );

    if (limited) return limited;

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return errorResponse(error, "OTP_VERIFY_READ_BODY");
    }

    if (
      !validRegistrationIdentity(body) ||
      typeof body.otp !== "string" ||
      !/^\d{6}$/.test(body.otp.trim())
    ) {
      return json({
        error: "Valid userId, identityId, EMAIL destinationType, destination and six-digit otp are required."
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

      return json({ ok: true, ...result });
    } catch (error) {
      return errorResponse(error, "OTP_VERIFY_PROCESS");
    }
  }

  // Password setup token request after email verification.
  if (
    url.pathname === "/auth/activation/request" &&
    request.method === "POST"
  ) {
    const limited = await checkRateLimit(
      request, env, RATE_LIMITS.ACTIVATION_REQUEST
    );

    if (limited) return limited;

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return errorResponse(error, "PASSWORD_TOKEN_READ_BODY");
    }

    if (
      !body ||
      typeof body.userId !== "string" ||
      !body.userId.trim()
    ) {
      return json({
        error: "A valid userId is required."
      }, 400);
    }

    try {
      const result = await issueActivationToken({
        db: env.DB,
        env,
        userId: body.userId.trim()
      });

      return json({
        ok: true,
        message: "If the account is eligible, a password setup email will be sent.",
        ...result
      }, 202);
    } catch (error) {
      if (error?.status === 404 || error?.status === 409) {
        return json({
          ok: true,
          message: "If the account is eligible, a password setup email will be sent."
        }, 202);
      }

      return errorResponse(error, "PASSWORD_TOKEN_REQUEST");
    }
  }

  if (
    url.pathname === "/auth/password/setup" &&
    request.method === "POST"
  ) {
    const limited = await checkRateLimit(
      request, env, RATE_LIMITS.PASSWORD_SETUP
    );

    if (limited) return limited;

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return errorResponse(error, "PASSWORD_SETUP_READ_BODY");
    }

    if (
      !body ||
      typeof body.setupToken !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(body.setupToken) ||
      typeof body.password !== "string"
    ) {
      return json({
        error: "A valid setupToken and password are required."
      }, 400);
    }

    try {
      const result = await setInitialPassword({
        db: env.DB,
        env,
        setupToken: body.setupToken,
        password: body.password
      });

      return json({ ok: true, ...result });
    } catch (error) {
      return errorResponse(error, "PASSWORD_SETUP_PROCESS");
    }
  }

  return null;
}

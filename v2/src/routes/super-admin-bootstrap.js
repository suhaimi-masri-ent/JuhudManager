import { json } from "../lib/http.js";
import { createResendDelivery } from "../lib/resend-email.js";
import { enforceRateLimit } from "../lib/rate-limit.js";
import {
  issueSuperAdminBootstrapToken
} from "../auth/super-admin-bootstrap.js";

const BOOTSTRAP_PATH = "/internal/super-admin/bootstrap/initiate";

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));

  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    difference |=
      (left[i] ?? 0) ^ (right[i] ?? 0);
  }

  return difference === 0;
}

export async function handleSuperAdminBootstrapRequest(
  request,
  env,
  url
) {
  if (url.pathname !== BOOTSTRAP_PATH) {
    return null;
  }

  if (request.method !== "POST") {
    return json({
      error: "Method not allowed."
    }, 405);
  }

  if (
    !env.SUPER_ADMIN_BOOTSTRAP_SECRET ||
    !env.HMAC_SECRET
  ) {
    return json({
      error: "Super Admin bootstrap is not configured."
    }, 503);
  }

  try {
    const rateLimit = await enforceRateLimit({
      db: env.DB,
      env,
      request,
      scope: "SUPER_ADMIN_BOOTSTRAP",
      limit: 5,
      windowSeconds: 900
    });

    if (!rateLimit.allowed) {
      return json({
        error: "Too many bootstrap attempts. Try again later."
      }, 429);
    }

    const suppliedSecret = request.headers.get(
      "X-Super-Admin-Bootstrap-Key"
    ) ?? "";

    if (
      !constantTimeEqual(
        suppliedSecret,
        env.SUPER_ADMIN_BOOTSTRAP_SECRET
      )
    ) {
      return json({
        error: "Unauthorized."
      }, 401);
    }

    const result = await issueSuperAdminBootstrapToken({
      db: env.DB,
      env: {
        ...env,
        ACTIVATION_DELIVERY: createResendDelivery(env)
      }
    });

    return json({
      status: "ok",
      message: "Password setup email has been sent.",
      expiresInMinutes: result.expiresInMinutes,
      delivery: result.delivery
    });
  } catch (error) {
    const status = Number.isInteger(error?.status)
      ? error.status
      : 500;

    if (status >= 500) {
      console.error("SUPER_ADMIN_BOOTSTRAP_ERROR", {
        message: error?.message ?? "Unknown error"
      });
    }

    return json({
      error: status >= 500
        ? "Super Admin bootstrap request failed."
        : error.message
    }, status);
  }
}

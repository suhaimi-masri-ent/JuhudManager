
import { json } from "./lib/http.js";
import { createResendDelivery } from "./lib/resend-email.js";
import { createWhatsAppCloudDelivery } from "./lib/whatsapp-cloud.js";
import { handleAuthRequest } from "./routes/auth.js";
import { handleLoginRequest } from "./routes/login.js";
import { handlePasswordChangeRequest } from "./routes/password-change.js";
import { handleSessionRequest } from "./routes/session.js";
import { cleanupExpiredRateLimits } from "./lib/rate-limit.js";

const ALLOWED_METHODS = "GET, POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed." }, 403);
    }

    if (request.method === "OPTIONS") {
      const requestedMethod = request.headers.get(
        "Access-Control-Request-Method"
      );

      if (
        requestedMethod &&
        !["GET", "POST"].includes(requestedMethod)
      ) {
        return json({
          error: "Requested method is not allowed."
        }, 405);
      }

      const requestedHeaders = request.headers.get(
        "Access-Control-Request-Headers"
      );

      if (requestedHeaders) {
        const allowed = requestedHeaders
          .split(",")
          .map(header => header.trim().toLowerCase());

        if (
          allowed.some(header =>
            !["content-type", "authorization"].includes(header)
          )
        ) {
          return json({
            error: "Requested headers are not allowed."
          }, 403);
        }
      }

      return withCors(
        new Response(null, { status: 204 }),
        env,
        origin
      );
    }

    let response;

    if (
      url.pathname === "/health" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table'"
        ).first();

        response = json({
          status: "ok",
          service: "juhudmanager-v2-api",
          environment: env.APP_ENV || "unknown",
          database: "connected",
          tables: result?.total ?? 0
        });
      } catch {
        response = json({
          status: "degraded",
          service: "juhudmanager-v2-api",
          database: "unavailable"
        }, 503);
      }
    } else if (url.pathname === "/__delivery-test") {
      response = await handleDeliveryTest(request, env);
    } else {
      try {
        response = await handleLoginRequest(request, env, url);

        if (!response) {
          response = await handlePasswordChangeRequest(
            request,
            env,
            url
          );
        }

        if (!response) {
          response = await handleSessionRequest(
            request,
            env,
            url
          );
        }

        if (!response) {
          const emailDelivery = createResendDelivery(env);
          const whatsappDelivery = createWhatsAppCloudDelivery(env);

          const otpDelivery = {
            async send(message) {
              if (message?.destinationType === "EMAIL") {
                return emailDelivery.send(message);
              }

              if (message?.destinationType === "WHATSAPP") {
                return whatsappDelivery.send(message);
              }

              throw new Error(
                "Unsupported OTP destination type."
              );
            }
          };

          const authEnv = {
            ...env,
            OTP_DELIVERY: otpDelivery,
            ACTIVATION_DELIVERY: emailDelivery
          };

          response = await handleAuthRequest(
            request,
            authEnv,
            url
          );
        }

        if (!response) {
          response = json({ error: "Not found" }, 404);
        }
      } catch {
        response = json({
          error: "Authentication service unavailable."
        }, 500);
      }
    }

    return withCors(response, env, origin);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      cleanupExpiredRateLimits({
        db: env.DB,
        batchSize: 500
      })
        .then(result => {
          console.log(
            "Rate limit cleanup completed:",
            result.deleted
          );
        })
        .catch(error => {
          console.error(
            "Rate limit cleanup failed:",
            error
          );
        })
    );
  }
};

async function handleDeliveryTest(request, env) {
  if (env.DELIVERY_TEST_ENABLED !== "true") {
    return json({ error: "Not found" }, 404);
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const configuredSecret = String(
    env.DELIVERY_TEST_SECRET ?? ""
  );

  const suppliedAuthorization = String(
    request.headers.get("Authorization") ?? ""
  );

  const suppliedSecret = suppliedAuthorization.startsWith("Bearer ")
    ? suppliedAuthorization.slice(7)
    : "";

  if (
    !configuredSecret ||
    !constantTimeEqual(suppliedSecret, configuredSecret)
  ) {
    return json({ error: "Unauthorized." }, 401);
  }

  let body;

  try {
    const rawBody = await request.text();

    if (rawBody.length > 1024) {
      return json({ error: "Request too large." }, 413);
    }

    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const channel = String(body?.channel ?? "").toUpperCase();

  if (!["EMAIL", "WHATSAPP"].includes(channel)) {
    return json({
      error: "Channel must be EMAIL or WHATSAPP."
    }, 400);
  }

  const destination = channel === "EMAIL"
    ? env.DELIVERY_TEST_EMAIL
    : env.DELIVERY_TEST_WHATSAPP;

  if (!destination) {
    return json({
      error: "Test destination is not configured."
    }, 503);
  }

  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);

  const otp = String(randomBytes[0] % 1000000).padStart(6, "0");

  try {
    const delivery = channel === "EMAIL"
      ? createResendDelivery(env)
      : createWhatsAppCloudDelivery(env);

    const result = await delivery.send({
      destinationType: channel,
      destination,
      purpose: "REGISTER",
      otp,
      expiresInMinutes: 5
    });

    return json({
      status: "ok",
      delivered: true,
      channel,
      provider: result.provider,
      messageId: result.messageId
    });
  } catch {
    return json({
      status: "error",
      delivered: false,
      channel,
      error: "Delivery provider rejected or could not process the test."
    }, 503);
  }
}

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

function withCors(response, env, origin) {
  const headers = new Headers(response.headers);

  headers.set("Vary", "Origin");
  headers.set("Cache-Control", "no-store");

  if (origin && origin === env.ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    headers.set("Access-Control-Max-Age", "86400");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

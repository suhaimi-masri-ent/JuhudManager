
import { json } from "./lib/http.js";
import { createResendDelivery } from "./lib/resend-email.js";
import { handleAuthRequest } from "./routes/auth.js";

const ALLOWED_METHODS = "POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    // Reject browser requests from unapproved origins.
    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return json({
        error: "Origin not allowed."
      }, 403);
    }

    if (request.method === "OPTIONS") {
      const requestedMethod = request.headers.get(
        "Access-Control-Request-Method"
      );

      if (requestedMethod && requestedMethod !== "POST") {
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

        const permitted = ["content-type", "authorization"];

        if (allowed.some(header => !permitted.includes(header))) {
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
    } else {
      try {
        const emailDelivery = createResendDelivery(env);

        const authEnv = {
          ...env,
          OTP_DELIVERY: emailDelivery,
          ACTIVATION_DELIVERY: emailDelivery
        };

        response = await handleAuthRequest(
          request,
          authEnv,
          url
        );

        if (!response) {
          response = json({
            error: "Not found"
          }, 404);
        }
      } catch {
        response = json({
          error: "Authentication service unavailable."
        }, 500);
      }
    }

    return withCors(response, env, origin);
  }
};

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

import { json } from "./lib/http.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), env);
    }

    let response;
    if (url.pathname === "/health" && request.method === "GET") {
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
      response = json({ error: "Not found" }, 404);
    }
    return withCors(response, env);
  }
};

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function withCors(response, env) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

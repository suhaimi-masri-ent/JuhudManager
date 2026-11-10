
import { healthHandler } from "./routes/health.js";
import { loginHandler } from "./routes/login.js";
import { meHandler } from "./routes/me.js";
import { logoutHandler } from "./routes/logout.js";
import { getCorsHeaders } from "./config/cors.js";
import { jsonResponse } from "./utils/response.js";

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    let response;

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        response = await healthHandler(env);

      } else if (
        url.pathname === "/api/auth/login" &&
        request.method === "POST"
      ) {
        response = await loginHandler(request, env);

      } else if (
        url.pathname === "/api/auth/me" &&
        request.method === "GET"
      ) {
        response = await meHandler(request, env);

      } else if (
        url.pathname === "/api/auth/logout" &&
        request.method === "POST"
      ) {
        response = await logoutHandler(request, env);

      } else {
        response = jsonResponse(
          { error: "Not Found" },
          404
        );
      }
    } catch (error) {
      console.error("API error:", error);

      response = jsonResponse(
        { error: "Internal server error" },
        500
      );
    }

    const headers = new Headers(response.headers);

    for (const [key, value] of Object.entries(corsHeaders)) {
      headers.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};


import { healthHandler } from "./routes/health.js";
import { getCorsHeaders } from "./config/cors.js";

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(env);

    // Handle browser CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    let response;

    if (url.pathname === "/health" && request.method === "GET") {
      response = await healthHandler(env);
    } else {
      response = Response.json(
        { error: "Not Found" },
        { status: 404 }
      );
    }

    // Attach CORS headers to every API response
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

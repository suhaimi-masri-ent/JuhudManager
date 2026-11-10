
import { healthHandler } from "./routes/health.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return healthHandler(env);
    }

    return Response.json(
      { error: "Not Found" },
      { status: 404 }
    );
  }
};

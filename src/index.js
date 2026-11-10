
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({
        status: "ok",
        service: "juhudmanager-api",
        database: env.DB ? "connected" : "not_bound"
      });
    }

    return Response.json(
      { error: "Not Found" },
      { status: 404 }
    );
  }
};


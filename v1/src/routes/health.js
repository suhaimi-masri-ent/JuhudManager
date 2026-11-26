
export async function healthHandler(env) {
  return Response.json({
    status: "ok",
    service: "juhudmanager-api",
    database: env.DB ? "connected" : "not_bound"
  });
}



export function json(data, status = 200, additionalHeaders = {}) {
  const headers = new Headers(additionalHeaders);

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

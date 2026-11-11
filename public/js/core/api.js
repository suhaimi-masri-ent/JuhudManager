
const API = (window.JUHUD_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");

export async function api(path, options = {}) {
  if (!API || API.includes("REPLACE_WITH")) {
    throw new Error(
      "Configure public/js/config.js with your Cloudflare Worker URL first."
    );
  }

  const token = sessionStorage.getItem("juhud_token");

  const response = await fetch(API + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed (${response.status})`
    );
  }

  return data;
}


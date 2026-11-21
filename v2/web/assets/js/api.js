import { API_BASE } from "./config.js";

export async function apiRequest(path, body, token) {
  if (!API_BASE) {
    throw new Error(
      "API is not connected yet. Configure the V2 Worker URL first."
    );
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE.replace(/\/$/, "")}${path}`,
    {
      method: body ? "POST" : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined
    }
  );

  let result = {};

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response from authentication service.");
  }

  if (!response.ok) {
    throw new Error(
      result.error || "The request could not be completed."
    );
  }

  return result;
}

export function showNotice(message, type = "info") {
  const box = document.getElementById("notice");
  if (!box) return;

  box.textContent = message;
  box.className = `notice show ${type}`;
}

export function clearNotice() {
  const box = document.getElementById("notice");
  if (!box) return;

  box.className = "notice";
  box.textContent = "";
}

export function setLoading(button, loading, text) {
  if (!button) return;

  button.disabled = loading;

  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = text || "Please wait...";
  } else {
    button.textContent =
      button.dataset.originalText || button.textContent;
    delete button.dataset.originalText;
  }
}

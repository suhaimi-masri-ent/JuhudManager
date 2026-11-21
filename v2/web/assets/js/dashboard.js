
import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

function showDashboardNotice(message) {
  const notice = $("dashboardNotice");

  notice.textContent = message;
  notice.classList.remove("hidden");
}

function formatStatus(value) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function clearLocalSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function redirectToLogin() {
  window.location.replace("./index.html");
}

function renderDashboard(result) {
  const user = result.user;
  const session = result.session;

  if (!user || !session) {
    throw new Error("Invalid session information received.");
  }

  const accessLevel = user.accessLevel;

  $("registrationStatus").textContent =
    formatStatus(user.registrationStatus);

  $("accountStatus").textContent =
    formatStatus(user.accountStatus);

  $("accessLevel").textContent =
    formatStatus(accessLevel);

  $("accountAccessLabel").textContent =
    accessLevel === "LIMITED"
      ? "Limited Access"
      : accessLevel === "FULL"
        ? "Full Access"
        : "Access Restricted";

  $("sessionId").textContent =
    session.sessionId || "—";

  $("sessionExpires").textContent =
    formatDate(session.expiresAt);

  $("limitedAccessPanel").classList.toggle(
    "hidden",
    accessLevel !== "LIMITED"
  );

  $("fullAccessPanel").classList.toggle(
    "hidden",
    accessLevel !== "FULL"
  );

  if (accessLevel !== "LIMITED" && accessLevel !== "FULL") {
    throw new Error("Your account does not have a valid access level.");
  }
}

async function loadDashboard() {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const result = await apiRequest(
      "/auth/me",
      null,
      token
    );

    renderDashboard(result);
  } catch (error) {
    if (
      error.message === "Invalid or expired session." ||
      error.message === "A valid Bearer token is required."
    ) {
      clearLocalSession();
      redirectToLogin();
      return;
    }

    showDashboardNotice(
      `Unable to load your account information: ${error.message}`
    );
  }
}

async function logout() {
  const button = $("logoutButton");
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    clearLocalSession();
    redirectToLogin();
    return;
  }

  button.disabled = true;
  button.textContent = "Logging out...";

  try {
    await apiRequest(
      "/auth/logout",
      {},
      token
    );

    clearLocalSession();
    redirectToLogin();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Log Out";

    showDashboardNotice(
      `Logout could not be completed: ${error.message}. Please try again.`
    );
  }
}

$("logoutButton").addEventListener("click", logout);

loadDashboard();

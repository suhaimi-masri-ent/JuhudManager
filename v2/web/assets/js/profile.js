
import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

function showMessage(message, type = "error") {
  const box = $("profileMessage");
  box.textContent = message;
  box.className = `profile-message show ${type}`;
}

function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function redirectToLogin() {
  window.location.replace("./index.html");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function handleAuthError(error) {
  if (
    error.message === "Invalid or expired session." ||
    error.message === "A valid Bearer token is required."
  ) {
    clearSession();
    redirectToLogin();
    return true;
  }

  return false;
}

function displayProfile(profile) {
  $("fullName").value = profile.fullName || "";
  $("dateOfBirth").value = profile.dateOfBirth || "";
  $("email").value = profile.email || "";
  $("whatsapp").value = profile.whatsapp || "Not verified";
  $("accountStatus").value = profile.accountStatus || "—";

  $("createdAt").textContent = formatDate(profile.createdAt);
  $("updatedAt").textContent = formatDate(profile.updatedAt);
}

async function loadProfile() {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    redirectToLogin();
    return;
  }

  const reloadButton = $("reloadProfileButton");
  reloadButton.disabled = true;

  try {
    const result = await apiRequest(
      "/me/profile",
      null,
      token
    );

    if (!result.profile) {
      throw new Error("Invalid profile information received.");
    }

    displayProfile(result.profile);
  } catch (error) {
    if (handleAuthError(error)) return;

    showMessage(
      `Unable to load profile: ${error.message}`
    );
  } finally {
    reloadButton.disabled = false;
  }
}

async function saveProfile(event) {
  event.preventDefault();

  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    redirectToLogin();
    return;
  }

  const button = $("saveProfileButton");
  const fullName = $("fullName").value.trim();
  const dateOfBirth = $("dateOfBirth").value || null;

  if (fullName.length < 2 || fullName.length > 150) {
    showMessage("Full name must contain between 2 and 150 characters.");
    return;
  }

  button.disabled = true;
  button.textContent = "Saving...";

  try {
    const result = await apiRequest(
      "/me/profile",
      {
        fullName,
        dateOfBirth
      },
      token,
      "PATCH"
    );

    if (!result.profile) {
      throw new Error("Invalid profile update response.");
    }

    $("fullName").value = result.profile.fullName || "";
    $("dateOfBirth").value = result.profile.dateOfBirth || "";
    $("updatedAt").textContent = formatDate(result.profile.updatedAt);

    showMessage(
      result.message || "Profile updated successfully.",
      "success"
    );
  } catch (error) {
    if (handleAuthError(error)) return;

    showMessage(
      `Unable to save profile: ${error.message}`
    );
  } finally {
    button.disabled = false;
    button.textContent = "Save Changes";
  }
}

$("profileForm").addEventListener("submit", saveProfile);
$("reloadProfileButton").addEventListener("click", loadProfile);

loadProfile();

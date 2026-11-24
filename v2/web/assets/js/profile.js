import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

let currentAccessLevel = "LIMITED";
let countriesLoaded = false;

const ADDRESS_INPUTS = [
  "addressLine1",
  "addressLine2",
  "city",
  "stateRegion",
  "postalCode",
  "countryId"
];

function showMessage(message, type = "error") {
  const box = $("profileMessage");
  box.textContent = message;
  box.className = `profile-message show ${type}`;
}

function clearMessage() {
  const box = $("profileMessage");
  box.textContent = "";
  box.className = "profile-message";
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

function setAddressPermission() {
  const canEditAddress = currentAccessLevel === "FULL";

  for (const id of ADDRESS_INPUTS) {
    $(id).disabled = !canEditAddress;
  }

  $("addressPermissionMessage").hidden = canEditAddress;
}

async function loadCountries() {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    redirectToLogin();
    return;
  }

  const select = $("countryId");

  try {
    const result = await apiRequest(
      "/me/profile/countries",
      null,
      token
    );

    if (!Array.isArray(result.countries)) {
      throw new Error("Invalid country list received.");
    }

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select country";
    select.appendChild(placeholder);

    for (const country of result.countries) {
      const option = document.createElement("option");

      option.value = country.country_id;
      option.textContent = country.country_name;

      select.appendChild(option);
    }

    countriesLoaded = true;
  } catch (error) {
    if (handleAuthError(error)) return;

    showMessage(
      `Unable to load countries: ${error.message}`
    );
  }
}

function displayProfile(profile) {
  $("fullName").value = profile.fullName || "";
  $("dateOfBirth").value = profile.dateOfBirth || "";
  $("email").value = profile.email || "";
  $("whatsapp").value = profile.whatsapp || "Not verified";
  $("accountStatus").value = profile.accountStatus || "—";

  $("addressLine1").value = profile.addressLine1 || "";
  $("addressLine2").value = profile.addressLine2 || "";
  $("city").value = profile.city || "";
  $("stateRegion").value = profile.stateRegion || "";
  $("postalCode").value = profile.postalCode || "";

  if (countriesLoaded) {
    $("countryId").value = profile.countryId || "";
  }

  currentAccessLevel = profile.accessLevel || "LIMITED";
  setAddressPermission();

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

  clearMessage();

  try {
    if (!countriesLoaded) {
      await loadCountries();

      if (!countriesLoaded) {
        throw new Error("Country list is unavailable.");
      }
    }

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

function validateAddress() {
  const addressLine1 = $("addressLine1").value.trim();
  const city = $("city").value.trim();
  const countryId = $("countryId").value;

  const hasAddress = ADDRESS_INPUTS.some(
    id => $(id).value.trim() !== ""
  );

  if (
    hasAddress &&
    (!addressLine1 || !city || !countryId)
  ) {
    showMessage(
      "Address line 1, city and country are required when providing an address."
    );
    return false;
  }

  return true;
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
    showMessage(
      "Full name must contain between 2 and 150 characters."
    );
    return;
  }

  const body = {
    fullName,
    dateOfBirth
  };

  /*
   * LIMITED users can update only the existing permitted
   * personal fields. Address inputs are not submitted.
   */
  if (currentAccessLevel === "FULL") {
    if (!validateAddress()) return;

    body.addressLine1 = $("addressLine1").value.trim() || null;
    body.addressLine2 = $("addressLine2").value.trim() || null;
    body.city = $("city").value.trim() || null;
    body.stateRegion = $("stateRegion").value.trim() || null;
    body.postalCode = $("postalCode").value.trim() || null;
    body.countryId = $("countryId").value || null;
  }

  button.disabled = true;
  button.textContent = "Saving...";

  clearMessage();

  try {
    const result = await apiRequest(
      "/me/profile",
      body,
      token,
      "PATCH"
    );

    if (!result.profile) {
      throw new Error("Invalid profile update response.");
    }

    displayProfile({
      ...result.profile,
      accessLevel: currentAccessLevel,
      email: $("email").value,
      whatsapp: $("whatsapp").value,
      accountStatus: $("accountStatus").value,
      createdAt: $("createdAt").textContent,
      updatedAt: result.profile.updatedAt
    });

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

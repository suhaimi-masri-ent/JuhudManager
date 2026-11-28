import { apiRequest } from "./api.js";
import { searchAddressSuggestions } from "./address-lookup.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

let currentAccessLevel = "LIMITED";
let countriesLoaded = false;
let currentProfile = null;

let addressSearchTimer = null;
let addressSearchController = null;

const ADDRESS_INPUTS = [
  "addressLine1",
  "addressLine2",
  "city",
  "stateRegion",
  "postalCode",
  "countryId"
];

const PERSONAL_PROFILE_INPUTS = [
  "gender",
  "maritalStatus",
  "employmentStatus"
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

function getDateOfBirth() {
  const yearValue = $("dobYear").value.trim();
  const monthValue = $("dobMonth").value.trim();
  const dayValue = $("dobDay").value.trim();

  const values = [yearValue, monthValue, dayValue];
  const filledCount = values.filter(Boolean).length;

  if (filledCount === 0) {
    return {
      valid: true,
      value: null
    };
  }

  if (filledCount !== 3) {
    return {
      valid: false,
      message: "Please enter the complete date of birth: Year, Month and Day."
    };
  }

  if (
    !/^\d{4}$/.test(yearValue) ||
    !/^\d{1,2}$/.test(monthValue) ||
    !/^\d{1,2}$/.test(dayValue)
  ) {
    return {
      valid: false,
      message: "Please enter a valid date of birth."
    };
  }

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return {
      valid: false,
      message: "Please enter a valid date of birth."
    };
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return {
      valid: false,
      message: "The date of birth is not a valid calendar date."
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return {
      valid: false,
      message: "Date of birth cannot be in the future."
    };
  }

  return {
    valid: true,
    value: [
      String(year).padStart(4, "0"),
      String(month).padStart(2, "0"),
      String(day).padStart(2, "0")
    ].join("-")
  };
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const today = new Date();

  let age = today.getFullYear() - year;

  const birthdayNotReached =
    today.getMonth() + 1 < month ||
    (
      today.getMonth() + 1 === month &&
      today.getDate() < day
    );

  if (birthdayNotReached) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function updateAgeDisplay() {
  const result = getDateOfBirth();

  if (!result.valid || !result.value) {
    $("ageDisplay").textContent = "—";
    return;
  }

  const age = calculateAge(result.value);

  $("ageDisplay").textContent =
    age === null ? "—" : `${age} years`;
}

function displayDateOfBirth(value) {
  $("dobYear").value = "";
  $("dobMonth").value = "";
  $("dobDay").value = "";

  if (!value) {
    updateAgeDisplay();
    return;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    updateAgeDisplay();
    return;
  }

  $("dobYear").value = match[1];
  $("dobMonth").value = String(Number(match[2]));
  $("dobDay").value = String(Number(match[3]));

  updateAgeDisplay();
}

function setAddressPermission() {
  const canEditAddress = currentAccessLevel === "FULL";

  for (const id of ADDRESS_INPUTS) {
    $(id).disabled = !canEditAddress;
  }

  $("addressPermissionMessage").hidden = canEditAddress;
}

function setPersonalProfilePermission() {
  const canEditPersonalProfile = currentAccessLevel === "FULL";

  for (const id of PERSONAL_PROFILE_INPUTS) {
    $(id).disabled = !canEditPersonalProfile;
  }

  $("personalPermissionMessage").hidden =
    canEditPersonalProfile;
}

async function loadCountries() {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    redirectToLogin();
    return false;
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
    return true;
  } catch (error) {
    if (handleAuthError(error)) return false;

    showMessage(
      `Unable to load countries: ${error.message}`
    );

    return false;
  }
}

function displayProfile(profile) {
  currentProfile = { ...profile };

  $("fullName").value = profile.fullName || "";

  displayDateOfBirth(profile.dateOfBirth || null);

  $("gender").value = profile.gender || "";
  $("maritalStatus").value = profile.maritalStatus || "";
  $("employmentStatus").value = profile.employmentStatus || "";

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
  setPersonalProfilePermission();

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
  closeAddressSuggestions();

  try {
    if (!countriesLoaded) {
      await loadCountries();

      if (!countriesLoaded) {
        throw new Error("Country list is unavailable. Please reload and try again.");
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
  const street = $("addressLine2").value.trim();
  const city = $("city").value.trim();
  const countryId = $("countryId").value;

  const hasAddress = ADDRESS_INPUTS.some(
    id => $(id).value.trim() !== ""
  );

  if (
    hasAddress &&
    (!street || !city || !countryId)
  ) {
    showMessage(
      "Street, city and country are required when providing an address. Unit / Lot No. is optional."
    );

    return false;
  }

  return true;
}

function closeAddressSuggestions() {
  $("addressSuggestions").replaceChildren();
  $("addressSuggestions").classList.remove("show");
}

function findCountryId(countryName) {
  if (!countryName) return "";

  const normalized = countryName.trim().toLowerCase();

  const options = Array.from(
    $("countryId").options
  );

  const match = options.find(option =>
    option.textContent.trim().toLowerCase() === normalized
  );

  return match?.value || "";
}

function applyAddressSuggestion(suggestion) {
  /*
   * Unit / Lot No. is intentionally not populated.
   * Photon does not consistently provide this information.
   */
  if (suggestion.street) {
    $("addressLine2").value = suggestion.street;
  }
  
  if (suggestion.city) {
    $("city").value = suggestion.city;
  }

  if (suggestion.state) {
    $("stateRegion").value = suggestion.state;
  }

  if (suggestion.postcode) {
    $("postalCode").value = suggestion.postcode;
  }

  const countryId = findCountryId(suggestion.country);

  if (countryId) {
    $("countryId").value = countryId;
  }

  closeAddressSuggestions();

  $("addressSearchHelp").textContent =
    "Suggestion selected. Please review and edit the address before saving.";
}

function renderAddressSuggestions(suggestions) {
  const container = $("addressSuggestions");

  container.replaceChildren();

  if (!suggestions.length) {
    closeAddressSuggestions();

    $("addressSearchHelp").textContent =
      "No suggestions found. You can continue entering the address manually.";

    return;
  }

  for (const suggestion of suggestions) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "address-suggestion";
    button.setAttribute("role", "option");

    const title = document.createElement("span");
    title.textContent = suggestion.displayName;

    const detail = document.createElement("small");
    detail.textContent = "Address suggestion · Review before saving";

    button.append(title, detail);

    button.addEventListener("click", () => {
      applyAddressSuggestion(suggestion);
    });

    container.appendChild(button);
  }

  container.classList.add("show");

  $("addressSearchHelp").textContent =
    "Choose a suggestion to populate the address fields, then review the details.";
}

async function performAddressSearch(query) {
  if (addressSearchController) {
    addressSearchController.abort();
  }

  addressSearchController = new AbortController();

  $("addressSearchHelp").textContent =
    "Searching for address suggestions...";

  try {
    const suggestions = await searchAddressSuggestions(
      query,
      addressSearchController.signal
    );

    renderAddressSuggestions(suggestions);
  } catch (error) {
    if (error.name === "AbortError") return;

    closeAddressSuggestions();

    $("addressSearchHelp").textContent =
      "Address suggestions are unavailable right now. You can enter the address manually.";
  }
}

function handleAddressInput() {
  if (currentAccessLevel !== "FULL") return;

  if (addressSearchTimer) {
    clearTimeout(addressSearchTimer);
  }

  if (addressSearchController) {
    addressSearchController.abort();
  }

  const query = $("addressLine2").value.trim();

  closeAddressSuggestions();

  if (query.length < 3) {
    $("addressSearchHelp").textContent =
      "Enter at least 3 characters to search for suggestions, or continue typing manually.";

    return;
  }

  addressSearchTimer = setTimeout(() => {
    performAddressSearch(query);
  }, 400);
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
  const dateResult = getDateOfBirth();

  if (fullName.length < 2 || fullName.length > 150) {
    showMessage(
      "Full name must contain between 2 and 150 characters."
    );
    return;
  }

  if (!dateResult.valid) {
    showMessage(dateResult.message);
    return;
  }

  const body = {
    fullName,
    dateOfBirth: dateResult.value
  };

  if (currentAccessLevel === "FULL") {
    if (!validateAddress()) return;

    body.gender = $("gender").value || null;
    body.maritalStatus = $("maritalStatus").value || null;
    body.employmentStatus = $("employmentStatus").value || null;

    body.addressLine1 =
      $("addressLine1").value.trim() || null;

    body.addressLine2 =
      $("addressLine2").value.trim() || null;

    body.city =
      $("city").value.trim() || null;

    body.stateRegion =
      $("stateRegion").value.trim() || null;

    body.postalCode =
      $("postalCode").value.trim() || null;

    body.countryId =
      $("countryId").value || null;
  }

  button.disabled = true;
  button.textContent = "Saving...";

  clearMessage();
  closeAddressSuggestions();

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
      ...currentProfile,
      ...result.profile,
      accessLevel: currentAccessLevel
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

$("reloadProfileButton").addEventListener(
  "click",
  loadProfile
);

for (const id of ["dobYear", "dobMonth", "dobDay"]) {
  $(id).addEventListener("input", updateAgeDisplay);
}

$("addressLine2").addEventListener(
  "input",
  handleAddressInput
);

$("addressLine2").addEventListener(
  "blur",
  () => {
    setTimeout(closeAddressSuggestions, 200);
  }
);

$("addressLine2").addEventListener(
  "focus",
  () => {
    if ($("addressSuggestions").children.length > 0) {
      $("addressSuggestions").classList.add("show");
    }
  }
);

loadProfile();

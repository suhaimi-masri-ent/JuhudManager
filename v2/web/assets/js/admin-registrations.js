
import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

let selectedUserId = null;
let currentRegistration = null;
let recoveryTokenVisible = false;

function token() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function notice(message, isError = false) {
  const element = $("pageNotice");
  element.textContent = message;
  element.classList.remove("hidden");
  element.style.borderColor = isError ? "#e7b8b4" : "#d8e4dc";
  element.style.color = isError ? "#9f241b" : "#365b45";
}

function clearNotice() {
  $("pageNotice").classList.add("hidden");
  $("pageNotice").textContent = "";
}

function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function redirectToLogin() {
  window.location.replace("./index.html");
}

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = value ?? "";
  parent.appendChild(element);

  return element;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date);
}

function setButton(button, disabled, text) {
  button.disabled = disabled;
  button.textContent = text;
}

function clearTokenDisplay() {
  recoveryTokenVisible = false;

  $("recoveryTokenValue").value = "";
  $("recoverySetupUrl").value = "";
  $("recoveryTokenExpiry").textContent = "";

  $("recoveryTokenResult").classList.add("hidden");
}

function resetForms() {
  $("recoveryForm").reset();
  $("assistedApprovalForm").reset();
  clearTokenDisplay();
}

function showAssistedRecoveryStatus(registration) {
  const status = $("assistedRecoveryStatus");
  const approvedAt = registration.adminAssistedRecoveryAt;

  if (approvedAt) {
    status.textContent =
      "Admin-assisted recovery approved on " +
      formatDate(approvedAt) +
      ". Email verification remains pending.";

    status.classList.remove("is-blocked");

    $("assistedApprovalForm").classList.add("hidden");
    $("tokenIssueSection").classList.remove("hidden");

    return;
  }

  status.textContent =
    "Not yet approved. Correct the identity details first, then independently verify the owner and approve recovery.";

  status.classList.remove("is-blocked");

  $("assistedApprovalForm").classList.remove("hidden");
  $("tokenIssueSection").classList.add("hidden");
}

async function loadRegistrations() {
  clearNotice();

  const list = $("registrationList");
  list.replaceChildren();

  addText(list, "p", "muted", "Loading registrations…");

  try {
    const result = await apiRequest(
      "/admin/registrations?status=AWAITING_EMAIL_VERIFICATION&limit=50",
      null,
      token()
    );

    list.replaceChildren();

    if (!result.registrations?.length) {
      addText(
        list,
        "p",
        "muted",
        "No registrations are currently awaiting email verification."
      );

      return;
    }

    for (const registration of result.registrations) {
      const item = document.createElement("article");
      item.className = "registration-item";

      const details = document.createElement("div");
      details.className = "registration-item-details";

      addText(details, "strong", "", registration.fullName);

      addText(
        details,
        "span",
        "",
        registration.email || "Email not verified"
      );

      addText(
        details,
        "small",
        "",
        `Created ${formatDate(registration.createdAt)}`
      );

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "admin-secondary-button";
      selectButton.textContent = "Open";

      selectButton.addEventListener("click", () => {
        loadDetails(registration.userId);
      });

      item.append(details, selectButton);
      list.appendChild(item);
    }
  } catch (error) {
    list.replaceChildren();
    notice(error.message, true);

    if (
      error.message === "Invalid or expired session." ||
      error.message === "A valid Bearer token is required."
    ) {
      clearSession();
      redirectToLogin();
    }
  }
}

async function loadDetails(userId) {
  clearNotice();

  selectedUserId = userId;
  currentRegistration = null;

  $("detailPanel").classList.remove("hidden");
  $("identityList").replaceChildren();

  addText(
    $("identityList"),
    "p",
    "muted",
    "Loading identity records…"
  );

  $("assistedRecoveryStatus").textContent =
    "Loading recovery status…";

  $("assistedApprovalForm").classList.remove("hidden");
  $("tokenIssueSection").classList.add("hidden");

  resetForms();

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}`,
      null,
      token()
    );

    if (selectedUserId !== userId) return;

    const registration = result.registration;
    currentRegistration = registration;

    $("selectedName").textContent =
      registration.fullName || "—";

    $("selectedEmail").textContent =
      registration.email || "—";

    $("selectedStatus").textContent =
      registration.registrationStatus || "—";

    $("selectedAccountStatus").textContent =
      registration.accountStatus || "—";

    const identityList = $("identityList");
    identityList.replaceChildren();

    if (!result.identities?.length) {
      addText(
        identityList,
        "p",
        "muted",
        "No identity records found."
      );
    } else {
      for (const identity of result.identities) {
        const row = document.createElement("div");
        row.className = "identity-row";

        const label = identity.type === "NATIONAL_ID"
          ? `National ID${identity.countryCode ? ` (${identity.countryCode})` : ""}`
          : identity.type;

        addText(row, "strong", "", label);

        addText(
          row,
          "span",
          "",
          identity.maskedValue || "Hidden for security"
        );

        addText(
          row,
          "span",
          "status-pill",
          identity.status
        );

        identityList.appendChild(row);
      }
    }

    showAssistedRecoveryStatus(registration);

    $("detailPanel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (error) {
    notice(error.message, true);
  }
}

async function submitIdentityRecovery(event) {
  event.preventDefault();

  if (!selectedUserId) return;

  const button = $("submitRecoveryButton");
  const nationalId = $("nationalId").value.trim();
  const whatsapp = $("whatsapp").value.trim();

  if (!nationalId && !whatsapp) {
    notice("Enter at least one corrected identity.", true);
    return;
  }

  const body = {
    countryCode: $("countryCode").value.trim().toUpperCase(),
    nationalId,
    whatsapp,
    reason: $("reason").value.trim(),
    verificationMethod: $("verificationMethod").value,
    ownerVerified: $("ownerVerified").checked
  };

  setButton(button, true, "Saving identity correction…");

  try {
    const userId = selectedUserId;

    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}/recover-identities`,
      body,
      token()
    );

    await loadDetails(userId);
    await loadRegistrations();

    notice(
      result.message ||
      "Identity correction saved. New identity records remain UNVERIFIED."
    );
  } catch (error) {
    notice(error.message, true);
  } finally {
    setButton(button, false, "Save identity correction");
  }
}

async function submitAssistedApproval(event) {
  event.preventDefault();

  if (!selectedUserId) return;

  const button = $("approveAssistedRecoveryButton");

  const body = {
    ownerVerified: $("approvalOwnerVerified").checked,
    verificationMethod: $("approvalVerificationMethod").value,
    reason: $("approvalReason").value.trim()
  };

  if (body.ownerVerified !== true) {
    notice("Confirm independent owner verification before approval.", true);
    return;
  }

  if (!body.verificationMethod) {
    notice("Select the owner verification method.", true);
    return;
  }

  if (body.reason.length < 10 || body.reason.length > 1000) {
    notice("Approval reason must contain 10 to 1000 characters.", true);
    return;
  }

  const confirmed = window.confirm(
    "Approve Admin-assisted recovery for this account?\n\n" +
    "The email identity will remain PENDING. " +
    "The account will not be marked as email verified."
  );

  if (!confirmed) return;

  const userId = selectedUserId;

  setButton(button, true, "Approving recovery…");

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}/approve-assisted-recovery`,
      body,
      token()
    );

    await loadDetails(userId);
    await loadRegistrations();

    notice(
      result.message ||
      "Admin-assisted recovery approved. Email remains unverified."
    );
  } catch (error) {
    notice(error.message, true);
  } finally {
    setButton(button, false, "Approve assisted recovery");
  }
}

function buildPasswordSetupUrl(recoveryToken) {
  const setupUrl = new URL(
    "./password-setup.html",
    window.location.href
  );

  setupUrl.search = "";
  setupUrl.searchParams.set("token", recoveryToken);

  return setupUrl.toString();
}

async function issueRecoveryToken() {
  if (!selectedUserId) return;

  if (!currentRegistration?.adminAssistedRecoveryAt) {
    notice("Approve assisted recovery before issuing a token.", true);
    return;
  }

  const confirmed = window.confirm(
    "Issue a new one-time password setup token?\n\n" +
    "Any previous active recovery token will be invalidated. " +
    "The new token expires in 15 minutes and must be handed directly to the verified account owner."
  );

  if (!confirmed) return;

  const button = $("issueRecoveryTokenButton");
  const userId = selectedUserId;

  clearTokenDisplay();
  setButton(button, true, "Issuing token…");

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}/issue-recovery-token`,
      {},
      token()
    );

    const recovery = result.recovery;

    if (
      !recovery ||
      typeof recovery.token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(recovery.token)
    ) {
      throw new Error(
        "The server response did not contain a valid recovery token."
      );
    }

    const setupUrl = buildPasswordSetupUrl(recovery.token);

    $("recoveryTokenValue").value = recovery.token;
    $("recoverySetupUrl").value = setupUrl;
    $("recoveryTokenExpiry").textContent =
      `Expires: ${formatDate(recovery.expiresAt)}. ` +
      "This token can only be used once.";

    $("recoveryTokenResult").classList.remove("hidden");

    recoveryTokenVisible = true;

    $("recoveryTokenResult").scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

    notice(
      "Token issued. Hand it directly to the independently verified account owner."
    );

    // Do not persist the token in browser storage or logs.
  } catch (error) {
    notice(error.message, true);
  } finally {
    setButton(
      button,
      false,
      "Issue one-time password setup token"
    );
  }
}

async function copyValue(value, successMessage) {
  if (!value) {
    notice("There is nothing to copy.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    notice(successMessage);
  } catch {
    notice(
      "Clipboard access is unavailable. Select and copy the displayed value manually.",
      true
    );
  }
}

async function logout() {
  const button = $("logoutButton");
  const currentToken = token();

  if (!currentToken) {
    clearSession();
    redirectToLogin();
    return;
  }

  setButton(button, true, "Logging out…");

  try {
    await apiRequest("/auth/logout", {}, currentToken);
  } catch {
    // Local credentials are cleared even if server-side logout fails.
  }

  clearSession();
  redirectToLogin();
}

$("refreshButton").addEventListener("click", loadRegistrations);

$("recoveryForm").addEventListener(
  "submit",
  submitIdentityRecovery
);

$("assistedApprovalForm").addEventListener(
  "submit",
  submitAssistedApproval
);

$("issueRecoveryTokenButton").addEventListener(
  "click",
  issueRecoveryToken
);

$("copyRecoveryTokenButton").addEventListener("click", () => {
  if (!recoveryTokenVisible) return;

  copyValue(
    $("recoveryTokenValue").value,
    "Recovery token copied."
  );
});

$("copyRecoveryUrlButton").addEventListener("click", () => {
  if (!recoveryTokenVisible) return;

  copyValue(
    $("recoverySetupUrl").value,
    "Password setup link copied."
  );
});

$("cancelSelectionButton").addEventListener("click", () => {
  selectedUserId = null;
  currentRegistration = null;

  resetForms();

  $("detailPanel").classList.add("hidden");
});

$("logoutButton").addEventListener("click", logout);

if (!token()) {
  redirectToLogin();
} else {
  loadRegistrations();
}

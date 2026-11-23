import { apiRequest } from "./api.js";

const $ = (id) => document.getElementById(id);

const ACCESS_TOKEN_KEY = "jm_access_token";
const USER_KEY = "jm_user";

let selectedUserId = null;
let cancellationEligible = false;

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
  if (className) element.className = className;
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

function resetCancellationPanel() {
  cancellationEligible = false;

  $("cancellationPanel").classList.add("hidden");
  $("cancellationEligibility").textContent =
    "Checking cancellation eligibility…";

  $("cancellationReason").value = "";
  $("confirmCancellation").checked = false;
  $("cancelRegistrationButton").disabled = true;
  $("cancelRegistrationButton").textContent =
    "Cancel incomplete registration";
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

async function loadCancellationEligibility(userId) {
  resetCancellationPanel();

  $("cancellationPanel").classList.remove("hidden");

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}/cancellation-eligibility`,
      null,
      token()
    );

    if (selectedUserId !== userId) return;

    const cancellation = result.cancellation;
    const status = $("cancellationEligibility");

    if (!cancellation.eligible) {
      status.textContent =
        "Cancellation is not permitted: " +
        cancellation.blockers.join(" ");

      status.classList.add("is-blocked");
      return;
    }

    cancellationEligible = true;

    status.classList.remove("is-blocked");
    status.textContent =
      "Eligible for cancellation. " +
      `${cancellation.identitiesToRevoke} registration identity record(s), ` +
      `${cancellation.pendingAuthIdentitiesToRevoke} pending authentication identity record(s), ` +
      `and ${cancellation.activeOtpRequestsToInvalidate} active OTP request(s) will be resolved.`;

    $("cancelRegistrationButton").disabled = false;
  } catch (error) {
    $("cancellationEligibility").textContent =
      `Unable to check cancellation eligibility: ${error.message}`;

    $("cancellationEligibility").classList.add("is-blocked");
    cancellationEligible = false;
  }
}

async function loadDetails(userId) {
  clearNotice();

  selectedUserId = userId;
  resetCancellationPanel();

  $("detailPanel").classList.remove("hidden");
  $("identityList").replaceChildren();

  addText(
    $("identityList"),
    "p",
    "muted",
    "Loading identity records…"
  );

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}`,
      null,
      token()
    );

    if (selectedUserId !== userId) return;

    const registration = result.registration;

    $("selectedName").textContent =
      registration.fullName || "—";

    $("selectedEmail").textContent =
      registration.email || "—";

    $("selectedStatus").textContent =
      registration.registrationStatus || "—";

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
          : "WhatsApp";

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

    $("countryCode").value = "";
    $("nationalId").value = "";
    $("whatsapp").value = "";
    $("reason").value = "";
    $("verificationMethod").value = "";
    $("ownerVerified").checked = false;

    $("detailPanel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    if (
      registration.registrationStatus ===
      "AWAITING_EMAIL_VERIFICATION"
    ) {
      await loadCancellationEligibility(userId);
    } else {
      $("cancellationPanel").classList.add("hidden");
    }
  } catch (error) {
    notice(error.message, true);
  }
}

async function submitRecovery(event) {
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

  button.disabled = true;
  button.textContent = "Saving…";

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(selectedUserId)}/recover-identities`,
      body,
      token()
    );

    $("recoveryForm").reset();

    await loadDetails(selectedUserId);
    await loadRegistrations();

    notice(result.message || "Identity correction saved.");
  } catch (error) {
    notice(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Save identity correction";
  }
}

async function submitCancellation(event) {
  event.preventDefault();

  if (!selectedUserId || !cancellationEligible) {
    notice("This registration is not eligible for cancellation.", true);
    return;
  }

  const reason = $("cancellationReason").value.trim();

  if (reason.length < 10 || reason.length > 1000) {
    notice(
      "Cancellation reason must contain 10 to 1000 characters.",
      true
    );
    return;
  }

  if (!$("confirmCancellation").checked) {
    notice("Confirm the cancellation before proceeding.", true);
    return;
  }

  const userId = selectedUserId;
  const button = $("cancelRegistrationButton");

  const confirmed = window.confirm(
    "Cancel this incomplete registration?\n\n" +
    "The user record will be retained, but its remaining identity claims " +
    "will be revoked and active OTP requests invalidated."
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Cancelling…";
  cancellationEligible = false;

  try {
    const result = await apiRequest(
      `/admin/registrations/${encodeURIComponent(userId)}/cancel`,
      { reason },
      token()
    );

    selectedUserId = null;

    $("detailPanel").classList.add("hidden");

    await loadRegistrations();

    notice(
      result.message ||
      "Incomplete registration cancelled successfully."
    );
  } catch (error) {
    notice(error.message, true);

    if (selectedUserId === userId) {
      await loadCancellationEligibility(userId);
    }
  } finally {
    button.disabled = true;
    button.textContent = "Cancel incomplete registration";
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

  button.disabled = true;
  button.textContent = "Logging out…";

  try {
    await apiRequest("/auth/logout", {}, currentToken);
  } catch {
    // Local credentials are cleared even if server-side logout fails.
  }

  clearSession();
  redirectToLogin();
}

$("refreshButton").addEventListener("click", loadRegistrations);

$("recoveryForm").addEventListener("submit", submitRecovery);

$("cancellationForm").addEventListener(
  "submit",
  submitCancellation
);

$("cancelSelectionButton").addEventListener("click", () => {
  selectedUserId = null;
  resetCancellationPanel();
  $("detailPanel").classList.add("hidden");
});

$("logoutButton").addEventListener("click", logout);

if (!token()) {
  redirectToLogin();
} else {
  loadRegistrations();
}

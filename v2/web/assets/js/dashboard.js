
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

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function createWorkspaceCard(title, description, href = null) {
  const card = createElement("article", "workspace-card");

  const heading = createElement("h3", "", title);
  const paragraph = createElement("p", "", description);

  card.append(heading, paragraph);

  if (href) {
    const link = createElement("a", "workspace-link", "Open");
    link.href = href;
    card.append(link);
  } else {
    const status = createElement(
      "span",
      "workspace-coming-soon",
      "Coming in next phase"
    );

    card.append(status);
  }

  return card;
}

function createSection(title) {
  const section = createElement("section", "dashboard-section");
  const heading = createElement("h2", "", title);
  const grid = createElement("div", "workspace-grid");

  section.append(heading, grid);

  return { section, grid };
}

function renderRoleNavigation(user) {
  const existing = $("roleNavigation");

  if (existing) {
    existing.remove();
  }

  if (user.accessLevel !== "FULL") {
    return;
  }

  const roles = Array.isArray(user.roles)
    ? user.roles.map(role => role.roleCode)
    : [];

  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const isAdmin = roles.includes("ADMIN");
  const isAhbab = roles.includes("AHBAB");

  const { section, grid } = createSection("Administration & Navigation");

  section.id = "roleNavigation";

  if (isSuperAdmin) {
    grid.append(
      createWorkspaceCard(
        "Country Management",
        "Create, view and manage countries in the global platform.",
        "./super-admin-countries.html"
      ),
      createWorkspaceCard(
        "Country Admin Management",
        "Assign and manage administrators for each country.",
        "./super-admin-country-admins.html"
      ),
      createWorkspaceCard(
        "Registration Management",
        "Review and manage user registration requests.",
        "./admin-registrations.html"
      )
    );
  }

  if (isAdmin && !isSuperAdmin) {
    const assignments = Array.isArray(user.activeCountryAssignments)
      ? user.activeCountryAssignments
      : [];

    const activeAssignments = assignments.filter(
      item => item.countryStatus === "ACTIVE"
    );

    if (activeAssignments.length === 0) {
      grid.append(
        createWorkspaceCard(
          "Country Administration",
          "No active country assignment is currently available."
        )
      );
    } else {
      for (const assignment of activeAssignments) {
        grid.append(
          createWorkspaceCard(
            `Country: ${assignment.countryName}`,
            `Country code: ${assignment.countryCode}. Your administrative scope is limited to this country.`
          )
        );
      }
    }
  }

  if (isAhbab) {
    grid.append(
      createWorkspaceCard(
        "My Jemaah",
        "View your Jemaah membership and related information."
      ),
      createWorkspaceCard(
        "My Takaza",
        "View your Takaza participation and activities."
      )
    );
  }

  if (grid.children.length > 0) {
    const overview = document.querySelector(".dashboard-section");

    if (overview) {
      overview.after(section);
    } else {
      $("dashboardNotice").after(section);
    }
  }
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

  if (accessLevel === "FULL" && !user.registrationStatus) {
    $("fullAccessPanel").querySelector("h2").textContent =
      "System administration access enabled";

    $("fullAccessPanel").querySelector("p").textContent =
      "Your SUPER_ADMIN account is active. You can access the available system administration functions.";
  }

  if (accessLevel !== "LIMITED" && accessLevel !== "FULL") {
    throw new Error("Your account does not have a valid access level.");
  }

  renderRoleNavigation(user);
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

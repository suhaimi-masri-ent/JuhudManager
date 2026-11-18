
import { currentUser } from "../core/state.js";
import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";

import { initAdminProfileEditor } from "./admin-profile.js";
import {
  initActivityTypeManagement,
  loadActivityTypes
} from "./activity-types.js";
import { initAuditTrail } from "./audit-trail.js";

const $ = id => document.getElementById(id);

let adminUsers = [];
let userCurrentPage = 1;
let userFiltersInitialized = false;

export function isAdmin() {
  return currentUser?.roles?.some(role =>
    ["SUPER_ADMIN", "ADMIN"].includes(role)
  );
}

export function canReview() {
  return currentUser?.roles?.some(role =>
    ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(role)
  );
}


/* =========================
   USER MANAGEMENT
========================= */

function renderAdminUsers() {
  const search = ($("userSearch")?.value || "")
    .trim()
    .toLowerCase();

  const roleFilter = $("userRoleFilter")?.value || "";
  const statusFilter = $("userStatusFilter")?.value || "";
  const pageSize = Number($("userPageSize")?.value) || 10;

  const filteredUsers = adminUsers.filter(user => {
    const searchable = [
      user.full_name,
      user.identifiers,
      user.roles
    ].join(" ").toLowerCase();

    const roles = (user.roles || "USER")
      .split(",")
      .map(role => role.trim());

    return (
      searchable.includes(search) &&
      (!roleFilter || roles.includes(roleFilter)) &&
      (!statusFilter || user.account_status === statusFilter)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  userCurrentPage = Math.min(userCurrentPage, totalPages);

  const start = (userCurrentPage - 1) * pageSize;

  const pageUsers = filteredUsers.slice(
    start,
    start + pageSize
  );

  $("usersTable").innerHTML = table(
    ["Name", "Login identifiers", "Role", "Status", "Action"],
    pageUsers.map(user => `
      <tr>
        <td>${escapeHtml(user.full_name)}</td>
        <td>${escapeHtml(user.identifiers || "—")}</td>
        <td>${escapeHtml(user.roles || "USER")}</td>
        <td>${tag(user.account_status)}</td>
        <td>
          <button
            type="button"
            class="table-action"
            data-edit-user="${escapeHtml(user.user_id)}"
          >Edit Profile</button>
        </td>
      </tr>
    `)
  );

  $("userFilterMessage").textContent =
    `Showing ${filteredUsers.length} of ${adminUsers.length} users.`;

  $("userPagination").innerHTML = `
    <span>
      Page ${userCurrentPage} of ${totalPages}
      (${filteredUsers.length} users)
    </span>

    <div class="row">
      <button
        type="button"
        class="btn"
        id="userPrevious"
        ${userCurrentPage <= 1 ? "disabled" : ""}
      >Previous</button>

      <button
        type="button"
        class="btn"
        id="userNext"
        ${userCurrentPage >= totalPages ? "disabled" : ""}
      >Next</button>
    </div>
  `;

  $("userPrevious").addEventListener("click", () => {
    if (userCurrentPage > 1) {
      userCurrentPage--;
      renderAdminUsers();
    }
  });

  $("userNext").addEventListener("click", () => {
    if (userCurrentPage < totalPages) {
      userCurrentPage++;
      renderAdminUsers();
    }
  });
}


function setupUserFilters() {
  const roleSelect = $("userRoleFilter");
  const statusSelect = $("userStatusFilter");

  const previousRole = roleSelect.value;
  const previousStatus = statusSelect.value;

  const roles = new Set();
  const statuses = new Set();

  adminUsers.forEach(user => {
    (user.roles || "USER")
      .split(",")
      .map(role => role.trim())
      .filter(Boolean)
      .forEach(role => roles.add(role));

    if (user.account_status) {
      statuses.add(user.account_status);
    }
  });

  roleSelect.innerHTML =
    '<option value="">All Roles</option>' +
    [...roles].sort().map(role => `
      <option value="${escapeHtml(role)}">
        ${escapeHtml(role)}
      </option>
    `).join("");

  statusSelect.innerHTML =
    '<option value="">All Statuses</option>' +
    [...statuses].sort().map(status => `
      <option value="${escapeHtml(status)}">
        ${escapeHtml(status)}
      </option>
    `).join("");

  roleSelect.value = previousRole;
  statusSelect.value = previousStatus;

  if (userFiltersInitialized) return;

  const refresh = () => {
    userCurrentPage = 1;
    renderAdminUsers();
  };

  $("userSearch").addEventListener("input", refresh);
  roleSelect.addEventListener("change", refresh);
  statusSelect.addEventListener("change", refresh);
  $("userPageSize").addEventListener("change", refresh);

  $("userResetFilters").addEventListener("click", () => {
    $("userSearch").value = "";
    roleSelect.value = "";
    statusSelect.value = "";
    $("userPageSize").value = "10";

    userCurrentPage = 1;
    renderAdminUsers();
  });

  const toggleButton = $("userToggleFilters");
  const filterPanel = $("userFilterPanel");

  toggleButton.addEventListener("click", () => {
    const isHidden = filterPanel.hidden;

    filterPanel.hidden = !isHidden;

    toggleButton.textContent = isHidden
      ? "Hide Search & Filters"
      : "Show Search & Filters";

    toggleButton.setAttribute(
      "aria-expanded",
      String(isHidden)
    );
  });

  userFiltersInitialized = true;
}


async function loadAdminUsers() {
  const data = await api("/api/admin/users");

  adminUsers = data.users || [];

  setupUserFilters();

  userCurrentPage = 1;
  renderAdminUsers();
}


/* =========================
   LOAD ADMIN
========================= */

export async function loadAdmin(loadActivities) {
  if (!isAdmin()) return;

  const auditData = await api("/api/admin/audit-logs");

  initAuditTrail(auditData);

  await loadAdminUsers();

  initAdminProfileEditor({
    loadActivities,
    reloadUsers: loadAdminUsers
  });

  initActivityTypeManagement(loadActivities);

  await loadActivityTypes();
}

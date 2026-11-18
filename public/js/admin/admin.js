
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

function renderAdminUsers() {
  const search = ($("userSearch")?.value || "")
    .trim()
    .toLowerCase();

  const roleFilter = $("userRoleFilter")?.value || "";
  const statusFilter = $("userStatusFilter")?.value || "";

  const filteredUsers = adminUsers.filter(user => {
    const searchable = [
      user.full_name,
      user.identifiers,
      user.roles
    ].join(" ").toLowerCase();

    const roles = (user.roles || "USER")
      .split(",")
      .map(role => role.trim());

    const matchesSearch = searchable.includes(search);
    const matchesRole =
      !roleFilter || roles.includes(roleFilter);
    const matchesStatus =
      !statusFilter || user.account_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  $("usersTable").innerHTML = table(
    ["Name", "Login identifiers", "Role", "Status", "Action"],
    filteredUsers.map(user => `
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
}

function setupUserFilters() {
  const roleSelect = $("userRoleFilter");
  const statusSelect = $("userStatusFilter");

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

  if (roleSelect.dataset.bound !== "true") {
    $("userSearch").addEventListener("input", renderAdminUsers);
    roleSelect.addEventListener("change", renderAdminUsers);
    statusSelect.addEventListener("change", renderAdminUsers);

    $("userResetFilters").addEventListener("click", () => {
      $("userSearch").value = "";
      roleSelect.value = "";
      statusSelect.value = "";
      renderAdminUsers();
    });

    roleSelect.dataset.bound = "true";
  }
}

async function loadAdminUsers() {
  const data = await api("/api/admin/users");

  adminUsers = data.users || [];

  setupUserFilters();
  renderAdminUsers();
}

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

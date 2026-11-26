import { currentUser } from "../core/state.js";
import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";
import { actionButton } from "./action-icons.js";
import { initAdminNavigation } from "./admin-navigation.js";
import { initAdminProfileEditor } from "./admin-profile.js";
import { initActivityTypeManagement, loadActivityTypes } from "./activity-types.js";
import { initAssignmentManagement, loadAssignments } from "./assignments.js";
import { initAuditTrail } from "./audit-trail.js";

const $ = id => document.getElementById(id);
let adminUsers = [];
let userCurrentPage = 1;
let userFiltersInitialized = false;

export function isAdmin() {
  return currentUser?.roles?.some(role => ["SUPER_ADMIN", "ADMIN"].includes(role));
}

export function canReview() {
  return currentUser?.roles?.some(role => ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(role));
}

export { initAdminNavigation };

function renderAdminUsers() {
  const search = ($("userSearch")?.value || "").trim().toLowerCase();
  const roleFilter = $("userRoleFilter")?.value || "";
  const statusFilter = $("userStatusFilter")?.value || "";
  const pageSize = Number($("userPageSize")?.value) || 10;

  const filtered = adminUsers.filter(user => {
    const searchable = [user.full_name, user.identifiers, user.roles].join(" ").toLowerCase();
    const roles = (user.roles || "USER").split(",").map(role => role.trim());
    return searchable.includes(search) && (!roleFilter || roles.includes(roleFilter)) &&
      (!statusFilter || user.account_status === statusFilter);
  });

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  userCurrentPage = Math.min(userCurrentPage, pages);
  const pageUsers = filtered.slice((userCurrentPage - 1) * pageSize, userCurrentPage * pageSize);

  $("usersTable").innerHTML = table(
    ["Name", "Login identifiers", "Role", "Status", "Actions"],
    pageUsers.map(user => `<tr>
      <td>${escapeHtml(user.full_name)}</td>
      <td>${escapeHtml(user.identifiers || "—")}</td>
      <td>${escapeHtml(user.roles || "USER")}</td>
      <td>${tag(user.account_status)}</td>
      <td class="action-cell">${actionButton("edit", "Edit user profile", "data-edit-user", user.user_id)}</td>
    </tr>`)
  );

  $("userFilterMessage").textContent = `${filtered.length} of ${adminUsers.length} users`;
  $("userPagination").innerHTML = `<span>Page ${userCurrentPage} of ${pages} · ${filtered.length} users</span>
    <div class="admin-pagination-controls">
      <button type="button" class="btn btn-outline" id="userPrevious" ${userCurrentPage <= 1 ? "disabled" : ""}>Previous</button>
      <button type="button" class="btn btn-outline" id="userNext" ${userCurrentPage >= pages ? "disabled" : ""}>Next</button>
    </div>`;

  $("userPrevious").addEventListener("click", () => { if (userCurrentPage > 1) { userCurrentPage--; renderAdminUsers(); } });
  $("userNext").addEventListener("click", () => { if (userCurrentPage < pages) { userCurrentPage++; renderAdminUsers(); } });
}

function setupUserFilters() {
  const roleSelect = $("userRoleFilter");
  const statusSelect = $("userStatusFilter");
  const previousRole = roleSelect.value;
  const previousStatus = statusSelect.value;
  const roles = new Set();
  const statuses = new Set();

  adminUsers.forEach(user => {
    (user.roles || "USER").split(",").map(role => role.trim()).filter(Boolean).forEach(role => roles.add(role));
    if (user.account_status) statuses.add(user.account_status);
  });

  roleSelect.innerHTML = '<option value="">All Roles</option>' + [...roles].sort().map(role => `<option value="${escapeHtml(role)}">${escapeHtml(role)}</option>`).join("");
  statusSelect.innerHTML = '<option value="">All Statuses</option>' + [...statuses].sort().map(status => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("");
  roleSelect.value = previousRole;
  statusSelect.value = previousStatus;
  if (userFiltersInitialized) return;

  const refresh = () => { userCurrentPage = 1; renderAdminUsers(); };
  $("userSearch").addEventListener("input", refresh);
  roleSelect.addEventListener("change", refresh);
  statusSelect.addEventListener("change", refresh);
  $("userPageSize").addEventListener("change", refresh);
  $("userResetFilters").addEventListener("click", () => {
    $("userSearch").value = ""; roleSelect.value = ""; statusSelect.value = ""; $("userPageSize").value = "10"; refresh();
  });
  const toggle = $("userToggleFilters");
  const panel = $("userFilterPanel");
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    toggle.innerHTML = `<span aria-hidden="true">☷</span> ${panel.hidden ? "Show" : "Hide"} Search &amp; Filters`;
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

export async function loadAdmin(loadActivities) {
  initAdminNavigation({ isAdmin: isAdmin(), canReview: canReview() });
  if (!isAdmin()) return;

  const auditData = await api("/api/admin/audit-logs");
  initAuditTrail(auditData);
  await loadAdminUsers();
  initAdminProfileEditor({ loadActivities, reloadUsers: loadAdminUsers });
  initActivityTypeManagement(loadActivities);
  await loadActivityTypes();
  initAssignmentManagement();
  await loadAssignments();
}

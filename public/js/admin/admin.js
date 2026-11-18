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

async function loadAdminUsers() {
  const data = await api("/api/admin/users");

  $("usersTable").innerHTML = table(
    ["Name", "Login identifiers", "Role", "Status", "Action"],
    (data.users || []).map(user => `
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

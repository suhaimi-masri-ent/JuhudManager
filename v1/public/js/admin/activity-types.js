import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";
import { actionButton } from "./action-icons.js";

const $ = id => document.getElementById(id);
let activityTypesCache = [];
let initialized = false;
let filtersBound = false;
let currentPage = 1;

function renderActivityTypes() {
  const search = ($("activityTypeSearch")?.value || "").trim().toLowerCase();
  const frequency = $("activityTypeFrequencyFilter")?.value || "";
  const status = $("activityTypeStatusFilter")?.value || "";
  const pageSize = Number($("activityTypePageSize")?.value) || 10;
  const filtered = activityTypesCache.filter(item =>
    [item.activity_name, item.description, item.frequency, item.status].join(" ").toLowerCase().includes(search) &&
    (!frequency || item.frequency === frequency) && (!status || item.status === status)
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, pages);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  $("activityTypesTable").innerHTML = table(
    ["Activity Name", "Frequency", "Description", "Status", "Actions"],
    rows.map(item => `<tr>
      <td>${escapeHtml(item.activity_name)}</td><td>${escapeHtml(item.frequency)}</td>
      <td>${escapeHtml(item.description || "—")}</td><td>${tag(item.status)}</td>
      <td class="action-cell">
        ${actionButton("edit", "Edit activity type", "data-edit-activity-type", item.activity_type_id)}
        ${actionButton(item.status === "ACTIVE" ? "deactivate" : "activate", item.status === "ACTIVE" ? "Deactivate activity type" : "Activate activity type", "data-toggle-activity-type", item.activity_type_id)}
      </td></tr>`)
  );
  $("activityTypeFilterMessage").textContent = `${filtered.length} of ${activityTypesCache.length} activity types`;
  $("activityTypePagination").innerHTML = `<span>Page ${currentPage} of ${pages} · ${filtered.length} activity types</span>
    <div class="admin-pagination-controls"><button type="button" class="btn btn-outline" id="activityTypePrevious" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>
    <button type="button" class="btn btn-outline" id="activityTypeNext" ${currentPage >= pages ? "disabled" : ""}>Next</button></div>`;
  $("activityTypePrevious").addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderActivityTypes(); } });
  $("activityTypeNext").addEventListener("click", () => { if (currentPage < pages) { currentPage++; renderActivityTypes(); } });
}

function setupFilters() {
  const frequencySelect = $("activityTypeFrequencyFilter");
  const selectedFrequency = frequencySelect.value;
  const frequencies = [...new Set(activityTypesCache.map(item => item.frequency).filter(Boolean))].sort();
  frequencySelect.innerHTML = '<option value="">All Frequencies</option>' + frequencies.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  frequencySelect.value = selectedFrequency;
  if (filtersBound) return;

  const refresh = () => { currentPage = 1; renderActivityTypes(); };
  $("activityTypeSearch").addEventListener("input", refresh);
  frequencySelect.addEventListener("change", refresh);
  $("activityTypeStatusFilter").addEventListener("change", refresh);
  $("activityTypePageSize").addEventListener("change", refresh);
  $("activityTypeResetFilters").addEventListener("click", () => {
    $("activityTypeSearch").value = ""; frequencySelect.value = ""; $("activityTypeStatusFilter").value = ""; $("activityTypePageSize").value = "10"; refresh();
  });
  const toggle = $("activityTypeToggleFilters");
  const panel = $("activityTypeFilterPanel");
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    toggle.innerHTML = `<span aria-hidden="true">☷</span> ${panel.hidden ? "Show" : "Hide"} Search &amp; Filters`;
  });
  filtersBound = true;
}

export async function loadActivityTypes() {
  const result = await api("/api/admin/activity-types");
  activityTypesCache = result.activity_types || [];
  setupFilters();
  currentPage = 1;
  renderActivityTypes();
}

export function initActivityTypeManagement(loadActivities) {
  const dialog = $("editActivityTypeDialog");
  const form = $("editActivityTypeForm");
  const tableElement = $("activityTypesTable");
  if (!dialog || !form || !tableElement || initialized) return;
  initialized = true;

  tableElement.addEventListener("click", async event => {
    const editButton = event.target.closest("[data-edit-activity-type]");
    const toggleButton = event.target.closest("[data-toggle-activity-type]");
    if (editButton) {
      const item = activityTypesCache.find(entry => String(entry.activity_type_id) === String(editButton.dataset.editActivityType));
      if (!item) return;
      $("editActivityTypeId").value = item.activity_type_id;
      $("editActivityTypeName").value = item.activity_name || "";
      $("editActivityTypeFrequency").value = item.frequency || "DAILY";
      $("editActivityTypeDescription").value = item.description || "";
      $("editActivityTypeMessage").textContent = "";
      dialog.showModal();
      return;
    }
    if (!toggleButton) return;
    const item = activityTypesCache.find(entry => String(entry.activity_type_id) === String(toggleButton.dataset.toggleActivityType));
    if (!item) return;
    const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} "${item.activity_name}"?`)) return;
    toggleButton.disabled = true;
    try {
      const result = await api("/api/admin/activity-types", { method: "PATCH", body: JSON.stringify({ activityTypeId: item.activity_type_id, status: newStatus }) });
      await loadActivityTypes();
      if (typeof loadActivities === "function") await loadActivities();
      alert(result.message || "Activity Type status updated.");
    } catch (error) { alert(error.message); }
    finally { toggleButton.disabled = false; }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const activityTypeId = $("editActivityTypeId").value;
    if (!activityTypeId) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    $("editActivityTypeMessage").textContent = "Saving...";
    try {
      const result = await api("/api/admin/activity-types", { method: "PATCH", body: JSON.stringify({
        activityTypeId,
        activityName: $("editActivityTypeName").value.trim(),
        frequency: $("editActivityTypeFrequency").value,
        description: $("editActivityTypeDescription").value.trim()
      }) });
      $("editActivityTypeMessage").textContent = result.message || "Activity Type updated.";
      await loadActivityTypes();
      if (typeof loadActivities === "function") await loadActivities();
      setTimeout(() => dialog.close(), 700);
    } catch (error) { $("editActivityTypeMessage").textContent = error.message; }
    finally { submit.disabled = false; }
  });
  $("cancelEditActivityType").addEventListener("click", () => dialog.close());
}

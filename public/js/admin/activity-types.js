import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";

const $ = id => document.getElementById(id);

let activityTypesCache = [];
let initialized = false;

function renderActivityTypes() {
  $("activityTypesTable").innerHTML = table(
    ["Activity Name", "Frequency", "Description", "Status", "Actions"],
    activityTypesCache.map(item => `
      <tr>
        <td>${escapeHtml(item.activity_name)}</td>
        <td>${escapeHtml(item.frequency)}</td>
        <td>${escapeHtml(item.description || "—")}</td>
        <td>${tag(item.status)}</td>
        <td>
          <button
            type="button"
            class="table-action btn-icon"
            data-edit-activity-type="${escapeHtml(item.activity_type_id)}"
            title="Edit Activity Type"
            aria-label="Edit Activity Type"
          >&#9998;</button>

          <button
            type="button"
            class="table-action btn-icon"
            data-toggle-activity-type="${escapeHtml(item.activity_type_id)}"
            title="${item.status === "ACTIVE" ? "Deactivate" : "Activate"}"
            aria-label="${item.status === "ACTIVE" ? "Deactivate" : "Activate"}"
          >${item.status === "ACTIVE" ? "&#10006;" : "&#10004;"}</button>
        </td>
      </tr>
    `)
  );
}

export async function loadActivityTypes() {
  const result = await api("/api/admin/activity-types");
  activityTypesCache = result.activity_types || [];
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
      const item = activityTypesCache.find(entry =>
        String(entry.activity_type_id) ===
        String(editButton.dataset.editActivityType)
      );
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

    const item = activityTypesCache.find(entry =>
      String(entry.activity_type_id) ===
      String(toggleButton.dataset.toggleActivityType)
    );
    if (!item) return;

    const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${action} "${item.activity_name}"?`)) {
      return;
    }

    toggleButton.disabled = true;

    try {
      const result = await api("/api/admin/activity-types", {
        method: "PATCH",
        body: JSON.stringify({
          activityTypeId: item.activity_type_id,
          status: newStatus
        })
      });

      await loadActivityTypes();

      if (typeof loadActivities === "function") {
        await loadActivities();
      }

      alert(result.message || "Activity Type status updated.");
    } catch (error) {
      alert(error.message);
    } finally {
      toggleButton.disabled = false;
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const activityTypeId = $("editActivityTypeId").value;
    if (!activityTypeId) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    $("editActivityTypeMessage").textContent = "Saving...";

    const body = {
      activityTypeId,
      activityName: $("editActivityTypeName").value.trim(),
      frequency: $("editActivityTypeFrequency").value,
      description: $("editActivityTypeDescription").value.trim()
    };

    try {
      const result = await api("/api/admin/activity-types", {
        method: "PATCH",
        body: JSON.stringify(body)
      });

      $("editActivityTypeMessage").textContent =
        result.message || "Activity Type updated.";

      await loadActivityTypes();

      if (typeof loadActivities === "function") {
        await loadActivities();
      }

      setTimeout(() => dialog.close(), 700);
    } catch (error) {
      $("editActivityTypeMessage").textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  $("cancelEditActivityType").addEventListener("click", () => {
    dialog.close();
  });
}

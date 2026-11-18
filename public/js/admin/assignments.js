
import { api } from "../core/api.js";
import { escapeHtml, tag, table, showMessage } from "../core/helpers.js";

const $ = id => document.getElementById(id);

let initialized = false;

function updateAssignmentTarget() {
  const target = $("assignmentTarget").value;
  const userField = $("assignmentUserField");
  const userSelect = $("assignmentUser");

  const individual = target === "USER";

  userField.hidden = !individual;
  userSelect.required = individual;
}

function populateActivityTypes(items) {
  const select = $("assignmentActivityType");

  const activeTypes = items.filter(item => item.status === "ACTIVE");

  select.innerHTML =
    '<option value="">Select Activity Type</option>' +
    activeTypes.map(item => `
      <option value="${escapeHtml(item.activity_type_id)}">
        ${escapeHtml(item.activity_name)}
      </option>
    `).join("");
}

function populateUsers(items) {
  const select = $("assignmentUser");

  const eligibleUsers = items.filter(user => {
    const roles = (user.roles || "USER")
      .split(",")
      .map(role => role.trim());

    return user.account_status === "ACTIVE" &&
      roles.some(role => ["USER", "EMPLOYEE"].includes(role));
  });

  select.innerHTML =
    '<option value="">Select User</option>' +
    eligibleUsers.map(user => `
      <option value="${escapeHtml(user.user_id)}">
        ${escapeHtml(user.full_name)}
      </option>
    `).join("");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? escapeHtml(value)
    : escapeHtml(date.toLocaleString());
}

function renderAssignments(items) {
  $("assignmentsTable").innerHTML = table(
    [
      "Activity Type",
      "Assigned To",
      "Assigned Date",
      "Due Date",
      "Status"
    ],
    items.map(item => `
      <tr>
        <td>${escapeHtml(item.activity_name || "—")}</td>
        <td>${escapeHtml(item.user_name || "—")}</td>
        <td>${formatDate(item.assigned_at)}</td>
        <td>${escapeHtml(item.due_date || "—")}</td>
        <td>${tag(item.status)}</td>
      </tr>
    `)
  );

  showMessage(
    "assignmentsMessage",
    `${items.length} assignment(s) found.`
  );
}

export async function loadAssignments() {
  try {
    const [assignmentData, activityData, userData] =
      await Promise.all([
        api("/api/admin/assignments"),
        api("/api/admin/activity-types"),
        api("/api/admin/users")
      ]);

    populateActivityTypes(activityData.activity_types || []);
    populateUsers(userData.users || []);
    renderAssignments(assignmentData.assignments || []);

    updateAssignmentTarget();

  } catch (error) {
    showMessage("assignmentsMessage", error.message, true);
  }
}

export function initAssignmentManagement() {
  if (initialized) return;

  const form = $("createAssignmentForm");

  if (!form) return;

  initialized = true;

  $("assignmentTarget").addEventListener(
    "change",
    updateAssignmentTarget
  );

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const submit = form.querySelector(
      'button[type="submit"]'
    );

    const assignToAll =
      $("assignmentTarget").value === "ALL";

    const body = {
      activity_type_id: $("assignmentActivityType").value,
      assign_to_all: assignToAll,
      due_date: $("assignmentDueDate").value || null
    };

    if (!assignToAll) {
      body.user_id = $("assignmentUser").value;
    }

    submit.disabled = true;

    showMessage("createAssignmentMessage", "");

    try {
      const result = await api(
        "/api/admin/assignments",
        {
          method: "POST",
          body: JSON.stringify(body)
        }
      );

      form.reset();
      updateAssignmentTarget();

      showMessage(
        "createAssignmentMessage",
        `Completed. Created: ${result.created}, Skipped: ${result.skipped}.`
      );

      await loadAssignments();

    } catch (error) {
      showMessage(
        "createAssignmentMessage",
        error.message,
        true
      );
    } finally {
      submit.disabled = false;
    }
  });

  updateAssignmentTarget();
}

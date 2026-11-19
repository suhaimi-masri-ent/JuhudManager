import { api } from "../core/api.js";
import { showMessage } from "../core/helpers.js";

const $ = id => document.getElementById(id);

export function initAdminUsers(loadAdmin, loadActivities) {
  $("createUserForm").addEventListener("submit", async event => {
    event.preventDefault();
    showMessage("createUserMessage", "");
    const form = $("createUserForm");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const result = await api("/api/admin/users", { method: "POST", body: JSON.stringify({
        full_name: $("newFullName").value.trim(), email: $("newEmail").value.trim(), password: $("newPassword").value
      }) });
      form.reset();
      showMessage("createUserMessage", result.message || "User created successfully");
      await loadAdmin();
    } catch (error) { showMessage("createUserMessage", error.message, true); }
    finally { submit.disabled = false; }
  });

  $("createTypeForm").addEventListener("submit", async event => {
    event.preventDefault();
    const submit = $("createTypeForm").querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const result = await api("/api/admin/activity-types", { method: "POST", body: JSON.stringify({
        activityName: $("typeName").value.trim(), frequency: $("typeFrequency").value, description: $("typeDescription").value.trim()
      }) });
      showMessage("createTypeMessage", result.message || "Activity type created.");
      $("createTypeForm").reset();
      await loadAdmin();
      if (typeof loadActivities === "function") await loadActivities();
    } catch (error) { showMessage("createTypeMessage", error.message, true); }
    finally { submit.disabled = false; }
  });
}

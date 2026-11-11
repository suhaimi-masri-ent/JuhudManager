
import { api } from "../core/api.js";
import { showMessage } from "../core/helpers.js";

const $ = id => document.getElementById(id);

export function initAdminUsers(loadAdmin, loadActivities) {

  // CREATE USER
  $("createUserForm").addEventListener("submit", async e => {
    e.preventDefault();

    showMessage("createUserMessage", "");

    const form = $("createUserForm");
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    try {
      const result = await api("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          full_name: $("newFullName").value.trim(),
          email: $("newEmail").value.trim(),
          password: $("newPassword").value
        })
      });

      form.reset();

      showMessage(
        "createUserMessage",
        result.message || "User created successfully"
      );

      await loadAdmin();

    } catch (err) {
      showMessage("createUserMessage", err.message, true);

    } finally {
      submitButton.disabled = false;
    }
  });

  // CREATE ACTIVITY TYPE
  $("createTypeForm").addEventListener("submit", async e => {
    e.preventDefault();

    try {
      await api("/api/admin/activity-types", {
        method: "POST",
        body: JSON.stringify({
          activityName: $("typeName").value,
          frequency: $("typeFrequency").value,
          description: $("typeDescription").value
        })
      });

      showMessage(
        "createTypeMessage",
        "Activity type created."
      );

      $("createTypeForm").reset();

      await loadActivities();

    } catch (e) {
      showMessage("createTypeMessage", e.message, true);
    }
  });

}



import { currentUser } from "../core/state.js";
import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";

const $ = id => document.getElementById(id);

export function isAdmin() {
  return currentUser?.roles?.some(r =>
    ["SUPER_ADMIN", "ADMIN"].includes(r)
  );
}

export function canReview() {
  return currentUser?.roles?.some(r =>
    ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(r)
  );
}


function initAdminProfileEditor(loadActivities) {
  const dialog = $("editUserProfileDialog");
  const form = $("editUserProfileForm");

  if (form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  const fields = {
    date_of_birth: "adminEditDob",
    gender: "adminEditGender",
    marital_status: "adminEditMarital",
    nationality: "adminEditNationality",
    employment_status: "adminEditEmploymentStatus",
    employment_type: "adminEditEmploymentType",
    employment_sector: "adminEditEmploymentSector",
    occupation: "adminEditOccupation",
    employer_company: "adminEditEmployer",
    department: "adminEditDepartment",
    position_designation: "adminEditPosition",
    work_location: "adminEditWorkLocation",
    country: "adminEditCountry",
    state_province: "adminEditState",
    city_district: "adminEditCity",
    postcode: "adminEditPostcode",
    street_address: "adminEditStreet",
    building_number: "adminEditBuildingNo",
    building_name: "adminEditBuildingName",
    address_line_2: "adminEditAddress2"
  };

  let selectedUserId = null;

  $("usersTable").addEventListener("click", async e => {
    const button = e.target.closest("[data-edit-user]");
    if (!button) return;

    selectedUserId = button.dataset.editUser;

    $("adminEditProfileMessage").textContent = "Loading profile...";

    try {
      const result = await api(
        `/api/admin/users/${encodeURIComponent(selectedUserId)}/profile`
      );

      const user = result.user;

      $("adminEditFullName").value = user.full_name || "";

      for (const [field, id] of Object.entries(fields)) {
        $(id).value = user[field] || "";
      }

      $("adminEditProfileMessage").textContent = "";
      dialog.showModal();

    } catch (err) {
      alert(err.message);
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!selectedUserId) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const body = {
      full_name: $("adminEditFullName").value.trim()
    };

    for (const [field, id] of Object.entries(fields)) {
      body[field] = $(id).value.trim();
    }

    try {
      const result = await api(
        `/api/admin/users/${encodeURIComponent(selectedUserId)}/profile`,
        {
          method: "PUT",
          body: JSON.stringify(body)
        }
      );

      $("adminEditProfileMessage").textContent =
        result.message || "Profile updated.";

      await loadAdmin(loadActivities);

      setTimeout(() => {
        dialog.close();
      }, 700);

    } catch (err) {
      $("adminEditProfileMessage").textContent = err.message;

    } finally {
      submitButton.disabled = false;
    }
  });

  $("adminEditProfileCancel").addEventListener("click", () => {
    dialog.close();
  });
}


export async function loadAdmin(loadActivities) {

  // ADMIN: LOAD USERS AND ACTIVITY TYPES
  if (isAdmin()) {


    const auditData = await api("/api/admin/audit-logs");
    
    $("auditTrailMessage").textContent =
      `${auditData.audit_logs.length} audit records found.`;
    
    $("auditTrailTable").innerHTML = table(
      ["Date / Time", "Actor", "Action", "Target", "Country", "Device"],
      auditData.audit_logs.map(log => {
        let details = {};
    
        try {
          details = JSON.parse(log.details_json || "{}");
        } catch (e) {}
    
        const client = details.client || {};
    
        return `<tr>
          <td>${escapeHtml(log.created_at || "—")}</td>
          <td>${escapeHtml(log.actor_name || log.actor_user_id || "System")}</td>
          <td>${escapeHtml(log.action)}</td>
          <td>${escapeHtml(log.target_name || log.target_type || "—")}</td>
          <td>${escapeHtml(client.country || "—")}</td>
          <td>${escapeHtml(
            [client.browser, client.os, client.device]
              .filter(Boolean)
              .join(" / ") || "—"
          )}</td>
        </tr>`;
      })
    );

    const d = await api("/api/admin/users");


    $("usersTable").innerHTML = table(
      ["Name", "Login identifiers", "Role", "Status", "Action"],
      d.users.map(u =>
        `<tr>
          <td>${escapeHtml(u.full_name)}</td>
          <td>${escapeHtml(u.identifiers || "—")}</td>
          <td>${escapeHtml(u.roles || "USER")}</td>
          <td>${tag(u.account_status)}</td>
          <td>
            <button
              type="button"
              class="table-action"
              data-edit-user="${escapeHtml(u.user_id)}"
            >Edit Profile</button>
          </td>
        </tr>`
      )
    );

    initAdminProfileEditor(loadActivities);

    await api("/api/admin/activity-types");
  }

  // ADMIN / SUPERVISOR: LOAD SUBMISSIONS
  if (canReview()) {
    const d = await api("/api/admin/submissions");

    $("submissionsTable").innerHTML = table(
      ["User", "Activity", "Date", "Status", "Review"],
      d.submissions.map(s =>
        `<tr>
          <td>${escapeHtml(s.full_name)}</td>
          <td>
            ${escapeHtml(s.activity_name)}<br>
            <span class="muted">${escapeHtml(s.description)}</span>
          </td>
          <td>${escapeHtml(s.activity_date)}</td>
          <td>${tag(s.review_status)}</td>
          <td>
            <button
              class="table-action"
              type="button"
              data-edit-review="${escapeHtml(s.record_id)}"
              data-status="${escapeHtml(s.review_status)}"
              data-remarks="${escapeHtml(s.reviewer_remarks || "")}"
            >Edit Review</button>
          </td>
        </tr>`
      )
    );

    // EDIT REVIEW BUTTON
    $("submissionsTable")
      .querySelectorAll("[data-edit-review]")
      .forEach(btn => {

        btn.addEventListener("click", async () => {
          const recordId = btn.dataset.editReview;
          const currentStatus = btn.dataset.status;
          const currentRemarks = btn.dataset.remarks;

          // ASK FOR NEW STATUS
          const statusInput = prompt(
            "Review Status:\nAPPROVED\nNEEDS_REVISION\nREJECTED\nPENDING",
            currentStatus
          );

          if (statusInput === null) {
            return;
          }

          const reviewStatus = statusInput.trim().toUpperCase();

          const allowedStatuses = [
            "PENDING",
            "APPROVED",
            "NEEDS_REVISION",
            "REJECTED"
          ];

          if (!allowedStatuses.includes(reviewStatus)) {
            alert("Invalid review status.");
            return;
          }

          // ASK FOR REMARKS
          const remarksInput = prompt(
            "Reviewer Remarks:",
            currentRemarks
          );

          if (remarksInput === null) {
            return;
          }

          try {
            await api(
              `/api/admin/submissions/${encodeURIComponent(recordId)}`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  reviewStatus,
                  remarks: remarksInput.trim()
                })
              }
            );

            alert("Review updated successfully.");

            await loadAdmin(loadActivities);

            // REFRESH USER ACTIVITY RECORDS
            await loadActivities();

          } catch (e) {
            alert(e.message);
          }
        });
      });
  }
}


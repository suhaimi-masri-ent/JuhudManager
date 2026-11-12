
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

export async function loadAdmin(loadActivities) {

  // ADMIN: LOAD USERS AND ACTIVITY TYPES
  if (isAdmin()) {
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


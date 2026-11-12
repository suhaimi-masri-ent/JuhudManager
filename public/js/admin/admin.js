
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

/* =========================
   ADMIN PROFILE EDITOR
========================= */

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

      setTimeout(() => dialog.close(), 700);

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


/* =========================
   AUDIT DETAIL VIEWER
========================= */

function showAuditDetails(log) {
  let details = {};

  try {
    details = JSON.parse(log.details_json || "{}");
  } catch (e) {
    details = {};
  }

  const client = details.client || {};

  const rows = {
    "Audit ID": log.audit_id,
    "Date / Time": log.created_at,
    "Actor": log.actor_name || log.actor_user_id || "System",
    "Actor User ID": log.actor_user_id,
    "Action": log.action,
    "Target Type": log.target_type,
    "Target": log.target_name || log.target_id,
    "Target ID": log.target_id,
    "IP Hash": client.ip_hash,
    "Browser": client.browser,
    "Operating System": client.os,
    "Device": client.device,
    "Country": client.country,
    "Cloudflare Ray ID": client.ray_id
  };

  const information = Object.entries(rows)
    .map(([label, value]) => `
      <div>
        <strong>${escapeHtml(label)}</strong>
        <div>${escapeHtml(String(value || "—"))}</div>
      </div>
    `)
    .join("");

  const additionalDetails = Object.entries(details)
    .filter(([key]) => key !== "client")
    .map(([key, value]) => `
      <div>
        <strong>${escapeHtml(key)}</strong>
        <div>${escapeHtml(
          typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value ?? "—")
        )}</div>
      </div>
    `)
    .join("");

  $("auditDetailContent").innerHTML = `
    <h3>Audit Information</h3>
    ${information}

    <h3>Additional Details</h3>
    ${additionalDetails || "<p>No additional details.</p>"}
  `;

  $("auditDetailDialog").showModal();
}

function initAuditDetailViewer() {
  const closeButton = $("auditDetailClose");

  if (!closeButton) return;
  if (closeButton.dataset.initialized === "true") return;

  closeButton.dataset.initialized = "true";

  closeButton.addEventListener("click", () => {
    $("auditDetailDialog").close();
  });
}


/* =========================
   AUDIT TRAIL CONTROLS
========================= */

let auditLogsCache = [];
let auditCurrentPage = 1;


function renderAuditTrail() {
  const search = $("auditSearch").value.trim().toLowerCase();
  const action = $("auditActionFilter").value;
  const country = $("auditCountryFilter").value;
  const dateFrom = $("auditDateFrom").value;
  const dateTo = $("auditDateTo").value;
  const pageSize = Number($("auditPageSize").value) || 25;

  const filtered = auditLogsCache.filter(log => {
    let details = {};

    try {
      details = JSON.parse(log.details_json || "{}");
    } catch (e) {}

    const client = details.client || {};

    const searchable = [
      log.audit_id,
      log.actor_name,
      log.actor_user_id,
      log.action,
      log.target_name,
      log.target_id,
      log.target_type,
      JSON.stringify(details)
    ].join(" ").toLowerCase();

    const date = (log.created_at || "").slice(0, 10);

    return (
      (!search || searchable.includes(search)) &&
      (!action || log.action === action) &&
      (!country || client.country === country) &&
      (!dateFrom || date >= dateFrom) &&
      (!dateTo || date <= dateTo)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  auditCurrentPage = Math.min(auditCurrentPage, totalPages);

  const start = (auditCurrentPage - 1) * pageSize;
  const pageRecords = filtered.slice(start, start + pageSize);

  $("auditTrailMessage").textContent =
    `${filtered.length} records found (${auditLogsCache.length} total loaded).`;

  $("auditTrailTable").innerHTML = table(
    ["Date / Time", "Actor", "Action", "Target", "Country", "Device"],
    pageRecords.map(log => {
      let details = {};

      try {
        details = JSON.parse(log.details_json || "{}");
      } catch (e) {}

      const client = details.client || {};

      return `<tr
        data-audit-id="${escapeHtml(log.audit_id)}"
        style="cursor:pointer"
        title="Click to view audit details"
      >
        <td>${escapeHtml(log.created_at || "—")}</td>
        <td>${escapeHtml(log.actor_name || log.actor_user_id || "System")}</td>
        <td>${escapeHtml(log.action || "—")}</td>
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

  $("auditTrailTable").querySelectorAll("[data-audit-id]")
    .forEach(row => {
      row.addEventListener("click", () => {
        const log = auditLogsCache.find(
          item => item.audit_id === row.dataset.auditId
        );

        if (log) showAuditDetails(log);
      });
    });

  $("auditPagination").innerHTML = `
    <span>
      Page ${auditCurrentPage} of ${totalPages}
      (${filtered.length} records)
    </span>

    <div class="row">
      <button
        type="button"
        class="btn"
        id="auditPrevious"
        ${auditCurrentPage <= 1 ? "disabled" : ""}
      >Previous</button>

      <button
        type="button"
        class="btn"
        id="auditNext"
        ${auditCurrentPage >= totalPages ? "disabled" : ""}
      >Next</button>
    </div>
  `;

  $("auditPrevious").addEventListener("click", () => {
    if (auditCurrentPage > 1) {
      auditCurrentPage--;
      renderAuditTrail();
    }
  });

  $("auditNext").addEventListener("click", () => {
    if (auditCurrentPage < totalPages) {
      auditCurrentPage++;
      renderAuditTrail();
    }
  });
}

function initAuditTrail(data) {
  auditLogsCache = data.audit_logs || [];
  initAuditDetailViewer();

  const actions = [...new Set(
    auditLogsCache.map(log => log.action).filter(Boolean)
  )].sort();

  const countries = [...new Set(
    auditLogsCache.map(log => {
      try {
        return JSON.parse(log.details_json || "{}").client?.country;
      } catch (e) {
        return null;
      }
    }).filter(Boolean)
  )].sort();

  $("auditActionFilter").innerHTML =
    '<option value="">All Actions</option>' +
    actions.map(value =>
      `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
    ).join("");

  $("auditCountryFilter").innerHTML =
    '<option value="">All Countries</option>' +
    countries.map(value =>
      `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
    ).join("");

  const controls = [
    "auditSearch",
    "auditActionFilter",
    "auditCountryFilter",
    "auditDateFrom",
    "auditDateTo",
    "auditPageSize"
  ];

  controls.forEach(id => {
    const element = $(id);

    if (element.dataset.initialized === "true") return;

    element.dataset.initialized = "true";

    const refresh = () => {
      auditCurrentPage = 1;
      renderAuditTrail();
    };

    element.addEventListener("input", refresh);
    element.addEventListener("change", refresh);
  });

  if ($("auditResetFilters").dataset.initialized !== "true") {
    $("auditResetFilters").dataset.initialized = "true";

    $("auditResetFilters").addEventListener("click", () => {
      $("auditSearch").value = "";
      $("auditActionFilter").value = "";
      $("auditCountryFilter").value = "";
      $("auditDateFrom").value = "";
      $("auditDateTo").value = "";
      $("auditPageSize").value = "25";

      auditCurrentPage = 1;
      renderAuditTrail();
    });
  }

  auditCurrentPage = 1;
  renderAuditTrail();
}

/* =========================
   LOAD ADMIN
========================= */

export async function loadAdmin(loadActivities) {

  // ADMIN: LOAD USERS, ACTIVITY TYPES AND AUDIT TRAIL
  if (isAdmin()) {

    const auditData = await api("/api/admin/audit-logs");
    initAuditTrail(auditData);

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

    $("submissionsTable")
      .querySelectorAll("[data-edit-review]")
      .forEach(btn => {

        btn.addEventListener("click", async () => {
          const recordId = btn.dataset.editReview;
          const currentStatus = btn.dataset.status;
          const currentRemarks = btn.dataset.remarks;

          const statusInput = prompt(
            "Review Status:\nAPPROVED\nNEEDS_REVISION\nREJECTED\nPENDING",
            currentStatus
          );

          if (statusInput === null) return;

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

          const remarksInput = prompt(
            "Reviewer Remarks:",
            currentRemarks
          );

          if (remarksInput === null) return;

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
            await loadActivities();

          } catch (e) {
            alert(e.message);
          }
        });
      });
  }
}

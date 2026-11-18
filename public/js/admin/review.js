
import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";

const $ = id => document.getElementById(id);

let submissions = [];
let loadActivitiesCallback = async () => {};
let reviewFiltersBound = false;
let reviewCurrentPage = 1;

const reviewStatuses = [
  "PENDING",
  "APPROVED",
  "NEEDS_REVISION",
  "REJECTED"
];


/* =========================
   CREATE EDIT REVIEW DIALOG
========================= */

function createReviewDialog() {
  if ($("reviewEditDialog")) return;

  const dialog = document.createElement("dialog");
  dialog.id = "reviewEditDialog";

  dialog.innerHTML = `
    <div class="dialog-content">

      <h2>Edit Review</h2>

      <label for="reviewStatusSelect">
        Review Status
      </label>

      <select id="reviewStatusSelect">
        ${reviewStatuses.map(status =>
          `<option value="${status}">${status}</option>`
        ).join("")}
      </select>

      <label for="reviewRemarksInput">
        Reviewer Remarks
      </label>

      <textarea
        id="reviewRemarksInput"
        rows="5"
        placeholder="Enter reviewer remarks..."
      ></textarea>

      <div class="dialog-actions">

        <button
          type="button"
          id="cancelReviewEdit"
          class="btn btn-outline"
        >
          Cancel
        </button>

        <button
          type="button"
          id="saveReviewEdit"
          class="btn btn-primary"
        >
          Save
        </button>

      </div>

      <p id="reviewEditMessage"></p>

    </div>
  `;

  document.body.appendChild(dialog);

  $("cancelReviewEdit").addEventListener("click", () => {
    dialog.close();
  });
}


/* =========================
   SUBMISSION SEARCH & FILTER
========================= */

function renderSubmissions() {
  const search = ($("submissionSearch")?.value || "")
    .trim()
    .toLowerCase();

  const statusFilter =
    $("submissionStatusFilter")?.value || "";

  const dateFrom =
    $("submissionDateFrom")?.value || "";

  const dateTo =
    $("submissionDateTo")?.value || "";

  const pageSize =
    Number($("submissionPageSize")?.value) || 10;

  const filtered = submissions.filter(s => {
    const searchable = [
      s.full_name,
      s.activity_name,
      s.description,
      s.review_status
    ].join(" ").toLowerCase();

    const matchesSearch = searchable.includes(search);

    const matchesStatus =
      !statusFilter || s.review_status === statusFilter;

    const activityDate = s.activity_date || "";

    const matchesFrom =
      !dateFrom || activityDate >= dateFrom;

    const matchesTo =
      !dateTo || activityDate <= dateTo;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFrom &&
      matchesTo
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  reviewCurrentPage = Math.min(
    reviewCurrentPage,
    totalPages
  );

  const start = (reviewCurrentPage - 1) * pageSize;

  const pageRecords = filtered.slice(
    start,
    start + pageSize
  );

  $("submissionsTable").innerHTML = table(
    ["User", "Activity", "Date", "Status", "Actions"],

    pageRecords.map(s =>
      `<tr>

        <td>${escapeHtml(s.full_name)}</td>

        <td>
          ${escapeHtml(s.activity_name)}<br>
          <span class="muted">
            ${escapeHtml(s.description)}
          </span>
        </td>

        <td>${escapeHtml(s.activity_date)}</td>

        <td>${tag(s.review_status)}</td>

        <td>

          <button
            class="table-action"
            type="button"
            data-view-submission="${escapeHtml(s.record_id)}"
          >
            View Details
          </button>

          <button
            class="table-action"
            type="button"
            data-edit-submission="${escapeHtml(s.record_id)}"
          >
            Edit Review
          </button>

        </td>

      </tr>`
    )
  );

  $("submissionFilterMessage").textContent =
    `Showing ${filtered.length} of ${submissions.length} submissions.`;

  $("submissionPagination").innerHTML = `
    <span>
      Page ${reviewCurrentPage} of ${totalPages}
      (${filtered.length} submissions)
    </span>

    <div class="row">
      <button
        type="button"
        class="btn"
        id="submissionPrevious"
        ${reviewCurrentPage <= 1 ? "disabled" : ""}
      >Previous</button>

      <button
        type="button"
        class="btn"
        id="submissionNext"
        ${reviewCurrentPage >= totalPages ? "disabled" : ""}
      >Next</button>
    </div>
  `;

  $("submissionPrevious").addEventListener("click", () => {
    if (reviewCurrentPage > 1) {
      reviewCurrentPage--;
      renderSubmissions();
    }
  });

  $("submissionNext").addEventListener("click", () => {
    if (reviewCurrentPage < totalPages) {
      reviewCurrentPage++;
      renderSubmissions();
    }
  });
}


function setupSubmissionFilters() {
  if (reviewFiltersBound) return;

  const refresh = () => {
    reviewCurrentPage = 1;
    renderSubmissions();
  };

  $("submissionSearch").addEventListener(
    "input",
    refresh
  );

  $("submissionStatusFilter").addEventListener(
    "change",
    refresh
  );

  $("submissionDateFrom").addEventListener(
    "change",
    refresh
  );

  $("submissionDateTo").addEventListener(
    "change",
    refresh
  );

  $("submissionPageSize").addEventListener(
    "change",
    refresh
  );

  $("submissionResetFilters").addEventListener(
    "click",
    () => {
      $("submissionSearch").value = "";
      $("submissionStatusFilter").value = "";
      $("submissionDateFrom").value = "";
      $("submissionDateTo").value = "";
      $("submissionPageSize").value = "10";

      reviewCurrentPage = 1;
      renderSubmissions();
    }
  );

  const toggleButton = $("submissionToggleFilters");
  const filterPanel = $("submissionFilterPanel");

  toggleButton.addEventListener("click", () => {
    const isHidden = filterPanel.hidden;

    filterPanel.hidden = !isHidden;

    toggleButton.textContent = isHidden
      ? "Hide Search & Filters"
      : "Show Search & Filters";

    toggleButton.setAttribute(
      "aria-expanded",
      String(isHidden)
    );
  });

  reviewFiltersBound = true;
}


/* =========================
   VIEW SUBMISSION DETAILS
========================= */

function viewSubmission(recordId) {

  const s = submissions.find(x =>
    String(x.record_id) === String(recordId)
  );

  if (!s) {
    alert("Submission record not found.");
    return;
  }

  const dialog = $("activityDetailsDialog");

  if (!dialog) {
    alert("Activity Details dialog not found.");
    return;
  }

  if (dialog.parentElement !== document.body) {
    document.body.appendChild(dialog);
  }

  const rows = [
    ["User", s.full_name],
    ["Activity type", s.activity_name],
    ["Start date", s.activity_date],
    ["Start time", s.start_time],
    ["End date", s.end_date],
    ["End time", s.end_time],
    ["Description", s.description],
    ["Progress", s.progress_status],
    ["Review status", s.review_status],
    ["Reviewer remarks", s.reviewer_remarks],
    ["Submitted at", s.submitted_at],
    ["Reviewed by", s.reviewer_name],
    ["Reviewed at", s.reviewed_at]
  ];

  $("activityDetailsContent").innerHTML = rows.map(([label, value]) =>
    `<div class="detail-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "—")}</span>
    </div>`
  ).join("");

  $("activityDetailsTitle").textContent = "Submission Details";

  dialog.showModal();
}


/* =========================
   EDIT REVIEW
========================= */

function editReview(recordId) {

  const s = submissions.find(x =>
    String(x.record_id) === String(recordId)
  );

  if (!s) {
    alert("Submission record not found.");
    return;
  }

  createReviewDialog();

  $("reviewStatusSelect").value =
    reviewStatuses.includes(s.review_status)
      ? s.review_status
      : "PENDING";

  $("reviewRemarksInput").value =
    s.reviewer_remarks || "";

  $("reviewEditMessage").textContent = "";

  const dialog = $("reviewEditDialog");

  dialog.showModal();

  const oldButton = $("saveReviewEdit");
  const newButton = oldButton.cloneNode(true);

  oldButton.replaceWith(newButton);

  newButton.addEventListener("click", async () => {

    const reviewStatus = $("reviewStatusSelect").value;
    const remarks = $("reviewRemarksInput").value.trim();

    newButton.disabled = true;

    try {

      await api(
        `/api/admin/submissions/${encodeURIComponent(recordId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            reviewStatus,
            remarks
          })
        }
      );

      dialog.close();

      alert("Review updated successfully.");

      await loadReviews(loadActivitiesCallback);
      await loadActivitiesCallback();

    } catch (error) {

      $("reviewEditMessage").textContent = error.message;

    } finally {

      newButton.disabled = false;

    }

  });
}


/* =========================
   EVENT DELEGATION
========================= */

document.addEventListener("click", event => {

  const viewButton = event.target.closest(
    "[data-view-submission]"
  );

  if (viewButton) {
    viewSubmission(viewButton.dataset.viewSubmission);
    return;
  }

  const editButton = event.target.closest(
    "[data-edit-submission]"
  );

  if (editButton) {
    editReview(editButton.dataset.editSubmission);
  }

});


/* =========================
   LOAD ADMIN SUBMISSIONS
========================= */

export async function loadReviews(loadActivities) {

  loadActivitiesCallback = loadActivities;

  const data = await api("/api/admin/submissions");

  submissions = data.submissions || [];

  setupSubmissionFilters();

  reviewCurrentPage = 1;
  renderSubmissions();
}

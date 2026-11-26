import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";
import { actionButton } from "./action-icons.js";

const $ = id => document.getElementById(id);
let submissions = [];
let loadActivitiesCallback = async () => {};
let reviewFiltersBound = false;
let reviewCurrentPage = 1;
const reviewStatuses = ["PENDING", "APPROVED", "NEEDS_REVISION", "REJECTED"];

function createReviewDialog() {
  if ($("reviewEditDialog")) return;
  const dialog = document.createElement("dialog");
  dialog.id = "reviewEditDialog";
  dialog.className = "details-dialog";
  dialog.innerHTML = `<div class="details-header"><h2>Edit Review</h2><button type="button" id="cancelReviewEdit" class="btn btn-outline">Close</button></div>
    <label for="reviewStatusSelect">Review Status</label><select id="reviewStatusSelect">${reviewStatuses.map(status => `<option value="${status}">${status}</option>`).join("")}</select>
    <label for="reviewRemarksInput">Reviewer Remarks</label><textarea id="reviewRemarksInput" rows="5" placeholder="Enter reviewer remarks..."></textarea>
    <div class="dialog-actions"><button type="button" id="saveReviewEdit" class="btn btn-primary">Save</button></div><p id="reviewEditMessage" class="message"></p>`;
  document.body.appendChild(dialog);
  $("cancelReviewEdit").addEventListener("click", () => dialog.close());
}

function renderSubmissions() {
  const search = ($("submissionSearch")?.value || "").trim().toLowerCase();
  const status = $("submissionStatusFilter")?.value || "";
  const from = $("submissionDateFrom")?.value || "";
  const to = $("submissionDateTo")?.value || "";
  const pageSize = Number($("submissionPageSize")?.value) || 10;
  const filtered = submissions.filter(item => {
    const searchable = [item.full_name, item.activity_name, item.description, item.review_status].join(" ").toLowerCase();
    return searchable.includes(search) && (!status || item.review_status === status) &&
      (!from || (item.activity_date || "") >= from) && (!to || (item.activity_date || "") <= to);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  reviewCurrentPage = Math.min(reviewCurrentPage, pages);
  const rows = filtered.slice((reviewCurrentPage - 1) * pageSize, reviewCurrentPage * pageSize);
  $("submissionsTable").innerHTML = table(["User", "Activity", "Date", "Status", "Actions"], rows.map(item => `<tr>
    <td>${escapeHtml(item.full_name)}</td><td>${escapeHtml(item.activity_name)}<br><span class="muted">${escapeHtml(item.description)}</span></td>
    <td>${escapeHtml(item.activity_date)}</td><td>${tag(item.review_status)}</td><td class="action-cell">
      ${actionButton("view", "View submission details", "data-view-submission", item.record_id)}
      ${actionButton("edit", "Edit review", "data-edit-submission", item.record_id)}
    </td></tr>`));
  $("submissionFilterMessage").textContent = `${filtered.length} of ${submissions.length} submissions`;
  $("submissionPagination").innerHTML = `<span>Page ${reviewCurrentPage} of ${pages} · ${filtered.length} submissions</span>
    <div class="admin-pagination-controls"><button type="button" class="btn btn-outline" id="submissionPrevious" ${reviewCurrentPage <= 1 ? "disabled" : ""}>Previous</button>
    <button type="button" class="btn btn-outline" id="submissionNext" ${reviewCurrentPage >= pages ? "disabled" : ""}>Next</button></div>`;
  $("submissionPrevious").addEventListener("click", () => { if (reviewCurrentPage > 1) { reviewCurrentPage--; renderSubmissions(); } });
  $("submissionNext").addEventListener("click", () => { if (reviewCurrentPage < pages) { reviewCurrentPage++; renderSubmissions(); } });
}

function setupSubmissionFilters() {
  if (reviewFiltersBound) return;
  const refresh = () => { reviewCurrentPage = 1; renderSubmissions(); };
  ["submissionSearch"].forEach(id => $(id).addEventListener("input", refresh));
  ["submissionStatusFilter", "submissionDateFrom", "submissionDateTo", "submissionPageSize"].forEach(id => $(id).addEventListener("change", refresh));
  $("submissionResetFilters").addEventListener("click", () => {
    $("submissionSearch").value = ""; $("submissionStatusFilter").value = ""; $("submissionDateFrom").value = "";
    $("submissionDateTo").value = ""; $("submissionPageSize").value = "10"; refresh();
  });
  const toggle = $("submissionToggleFilters");
  const panel = $("submissionFilterPanel");
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    toggle.innerHTML = `<span aria-hidden="true">☷</span> ${panel.hidden ? "Show" : "Hide"} Search &amp; Filters`;
  });
  reviewFiltersBound = true;
}

function viewSubmission(recordId) {
  const item = submissions.find(entry => String(entry.record_id) === String(recordId));
  if (!item) return alert("Submission record not found.");
  const dialog = $("activityDetailsDialog");
  if (!dialog) return alert("Activity Details dialog not found.");
  if (dialog.parentElement !== document.body) document.body.appendChild(dialog);
  const rows = [
    ["User", item.full_name], ["Activity type", item.activity_name], ["Start date", item.activity_date],
    ["Start time", item.start_time], ["End date", item.end_date], ["End time", item.end_time],
    ["Description", item.description], ["Progress", item.progress_status], ["Review status", item.review_status],
    ["Reviewer remarks", item.reviewer_remarks], ["Submitted at", item.submitted_at],
    ["Reviewed by", item.reviewer_name], ["Reviewed at", item.reviewed_at]
  ];
  $("activityDetailsContent").innerHTML = rows.map(([label, value]) => `<div class="detail-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value || "—")}</span></div>`).join("");
  $("activityDetailsTitle").textContent = "Submission Details";
  dialog.showModal();
}

function editReview(recordId) {
  const item = submissions.find(entry => String(entry.record_id) === String(recordId));
  if (!item) return alert("Submission record not found.");
  createReviewDialog();
  $("reviewStatusSelect").value = reviewStatuses.includes(item.review_status) ? item.review_status : "PENDING";
  $("reviewRemarksInput").value = item.reviewer_remarks || "";
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
      await api(`/api/admin/submissions/${encodeURIComponent(recordId)}`, { method: "PATCH", body: JSON.stringify({ reviewStatus, remarks }) });
      dialog.close();
      alert("Review updated successfully.");
      await loadReviews(loadActivitiesCallback);
      await loadActivitiesCallback();
    } catch (error) { $("reviewEditMessage").textContent = error.message; }
    finally { newButton.disabled = false; }
  });
}

document.addEventListener("click", event => {
  const view = event.target.closest("[data-view-submission]");
  if (view) { viewSubmission(view.dataset.viewSubmission); return; }
  const edit = event.target.closest("[data-edit-submission]");
  if (edit) editReview(edit.dataset.editSubmission);
});

export async function loadReviews(loadActivities) {
  loadActivitiesCallback = loadActivities;
  const data = await api("/api/admin/submissions");
  submissions = data.submissions || [];
  setupSubmissionFilters();
  reviewCurrentPage = 1;
  renderSubmissions();
}

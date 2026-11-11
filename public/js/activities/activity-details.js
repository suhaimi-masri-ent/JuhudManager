
import { records, language } from "../core/state.js";
import { escapeHtml } from "../core/helpers.js";

const $ = id => document.getElementById(id);

export function showActivityDetails(recordId) {
  const r = records.find(x =>
    String(x.record_id) === String(recordId)
  );

  if (!r) return;

  const labels = language === "my"
    ? {
        activity: "Jenis aktiviti",
        startDate: "Tarikh mula",
        startTime: "Masa mula",
        endDate: "Tarikh tamat",
        endTime: "Masa tamat",
        description: "Penerangan",
        progress: "Kemajuan",
        review: "Status semakan",
        remarks: "Komen penyemak",
        submitted: "Tarikh dihantar"
      }
    : {
        activity: "Activity type",
        startDate: "Start date",
        startTime: "Start time",
        endDate: "End date",
        endTime: "End time",
        description: "Description",
        progress: "Progress",
        review: "Review status",
        remarks: "Reviewer remarks",
        submitted: "Submitted at"
      };

  const rows = [
    [labels.activity, r.activity_name],
    [labels.startDate, r.activity_date],
    [labels.startTime, r.start_time],
    [labels.endDate, r.end_date],
    [labels.endTime, r.end_time],
    [labels.description, r.description],
    [labels.progress, r.progress_status],
    [labels.review, r.review_status],
    [labels.remarks, r.reviewer_remarks],
    [labels.submitted, r.submitted_at]
  ];

  $("activityDetailsContent").innerHTML = rows.map(([label, value]) =>
    `<div class="detail-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "—")}</span>
    </div>`
  ).join("");

  $("activityDetailsTitle").textContent =
    language === "my" ? "Butiran aktiviti" : "Activity details";

  $("activityDetailsDialog").showModal();
}


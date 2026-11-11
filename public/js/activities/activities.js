
import {
  activityTypes,
  records,
  language,
  setActivityTypes,
  setRecords
} from "../core/state.js";

import { api } from "../core/api.js";
import { escapeHtml, tag, table } from "../core/helpers.js";

const $ = id => document.getElementById(id);

export async function loadActivities() {
  const d = await api("/api/activities");

  setActivityTypes(d.types || []);
  setRecords(d.records || []);

  const selectedType = $("activityType").value;

  $("activityType").innerHTML = activityTypes.map(x =>
    `<option value="${escapeHtml(x.activity_type_id)}">${escapeHtml(x.activity_name)} (${escapeHtml(x.frequency)})</option>`
  ).join("");

  if (activityTypes.some(x => x.activity_type_id === selectedType)) {
    $("activityType").value = selectedType;
  }

  $("statMine").textContent = records.length;

  $("statPending").textContent =
    records.filter(x => x.review_status === "PENDING").length;

  $("recentRecords").innerHTML = table(
    ["Activity", "Date", "Review"],
    records.slice(0, 5).map(r =>
      `<tr>
        <td>${escapeHtml(r.activity_name)}</td>
        <td>${escapeHtml(r.activity_date)}</td>
        <td>${tag(r.review_status)}</td>
      </tr>`
    )
  );

  $("activityHistory").innerHTML = table(
    ["Activity", "Date", "Progress", "Review", "Details"],
    records.map(r =>
      `<tr>
        <td>${escapeHtml(r.activity_name)}</td>
        <td>${escapeHtml(r.activity_date)}</td>
        <td>${escapeHtml(r.progress_status)}</td>
        <td>${tag(r.review_status)}</td>
        <td>
          <button
            class="table-action"
            type="button"
            data-activity-view="${escapeHtml(r.record_id)}"
          >${language === "my" ? "Lihat" : "View"}</button>
        </td>
      </tr>`
    )
  );
}


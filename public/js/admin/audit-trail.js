import { escapeHtml, table } from "../core/helpers.js";
import { actionButton } from "./action-icons.js";

const $ = id => document.getElementById(id);
let auditLogsCache = [];
let auditCurrentPage = 1;
let initialized = false;

function showAuditDetails(log) {
  let details = {};
  try { details = JSON.parse(log.details_json || "{}"); } catch { details = {}; }
  const client = details.client || {};
  const rows = {
    "Audit ID": log.audit_id, "Date / Time": log.created_at,
    "Actor": log.actor_name || log.actor_user_id || "System", "Actor User ID": log.actor_user_id,
    "Action": log.action, "Target Type": log.target_type, "Target": log.target_name || log.target_id,
    "Target ID": log.target_id, "IP Hash": client.ip_hash, "Browser": client.browser,
    "Operating System": client.os, "Device": client.device, "Country": client.country,
    "Cloudflare Ray ID": client.ray_id
  };
  const information = Object.entries(rows).map(([label, value]) => `<div class="detail-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(String(value || "—"))}</span></div>`).join("");
  const additional = Object.entries(details).filter(([key]) => key !== "client").map(([key, value]) =>
    `<div class="detail-row"><strong>${escapeHtml(key)}</strong><span>${escapeHtml(typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "—"))}</span></div>`
  ).join("");
  $("auditDetailContent").innerHTML = `<h3>Audit Information</h3>${information}<h3>Additional Details</h3>${additional || "<p>No additional details.</p>"}`;
  $("auditDetailDialog").showModal();
}

function renderAuditTrail() {
  const search = $("auditSearch").value.trim().toLowerCase();
  const action = $("auditActionFilter").value;
  const country = $("auditCountryFilter").value;
  const from = $("auditDateFrom").value;
  const to = $("auditDateTo").value;
  const pageSize = Number($("auditPageSize").value) || 10;
  const filtered = auditLogsCache.filter(log => {
    let details = {};
    try { details = JSON.parse(log.details_json || "{}"); } catch {}
    const client = details.client || {};
    const searchable = [log.audit_id, log.actor_name, log.actor_user_id, log.action, log.target_name, log.target_id, log.target_type, JSON.stringify(details)].join(" ").toLowerCase();
    const date = (log.created_at || "").slice(0, 10);
    return (!search || searchable.includes(search)) && (!action || log.action === action) &&
      (!country || client.country === country) && (!from || date >= from) && (!to || date <= to);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  auditCurrentPage = Math.min(auditCurrentPage, pages);
  const rows = filtered.slice((auditCurrentPage - 1) * pageSize, auditCurrentPage * pageSize);
  $("auditTrailMessage").textContent = `${filtered.length} records found (${auditLogsCache.length} total loaded).`;
  $("auditTrailTable").innerHTML = table(["Date / Time", "Actor", "Action", "Target", "Country", "Device", "Actions"], rows.map(log => {
    let details = {};
    try { details = JSON.parse(log.details_json || "{}"); } catch {}
    const client = details.client || {};
    return `<tr><td>${escapeHtml(log.created_at || "—")}</td><td>${escapeHtml(log.actor_name || log.actor_user_id || "System")}</td>
      <td>${escapeHtml(log.action || "—")}</td><td>${escapeHtml(log.target_name || log.target_type || "—")}</td>
      <td>${escapeHtml(client.country || "—")}</td><td>${escapeHtml([client.browser, client.os, client.device].filter(Boolean).join(" / ") || "—")}</td>
      <td class="action-cell">${actionButton("view", "View audit details", "data-audit-view", log.audit_id)}</td></tr>`;
  }));
  $("auditPagination").innerHTML = `<span>Page ${auditCurrentPage} of ${pages} · ${filtered.length} records</span><div class="admin-pagination-controls">
    <button type="button" class="btn btn-outline" id="auditPrevious" ${auditCurrentPage <= 1 ? "disabled" : ""}>Previous</button>
    <button type="button" class="btn btn-outline" id="auditNext" ${auditCurrentPage >= pages ? "disabled" : ""}>Next</button></div>`;
  $("auditPrevious").addEventListener("click", () => { if (auditCurrentPage > 1) { auditCurrentPage--; renderAuditTrail(); } });
  $("auditNext").addEventListener("click", () => { if (auditCurrentPage < pages) { auditCurrentPage++; renderAuditTrail(); } });
}

export function initAuditTrail(data) {
  auditLogsCache = data.audit_logs || [];
  if (initialized) { auditCurrentPage = 1; renderAuditTrail(); return; }
  initialized = true;
  $("auditDetailClose").addEventListener("click", () => $("auditDetailDialog").close());
  $("auditTrailTable").addEventListener("click", event => {
    const button = event.target.closest("[data-audit-view]");
    if (!button) return;
    const log = auditLogsCache.find(item => String(item.audit_id) === String(button.dataset.auditView));
    if (log) showAuditDetails(log);
  });
  const toggle = $("auditToggleFilters");
  const panel = $("auditFilterPanel");
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    toggle.innerHTML = `<span aria-hidden="true">☷</span> ${panel.hidden ? "Show" : "Hide"} Search &amp; Filters`;
  });
  const actions = [...new Set(auditLogsCache.map(log => log.action).filter(Boolean))].sort();
  const countries = [...new Set(auditLogsCache.map(log => { try { return JSON.parse(log.details_json || "{}").client?.country; } catch { return null; } }).filter(Boolean))].sort();
  $("auditActionFilter").innerHTML = '<option value="">All Actions</option>' + actions.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  $("auditCountryFilter").innerHTML = '<option value="">All Countries</option>' + countries.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  ["auditSearch", "auditActionFilter", "auditCountryFilter", "auditDateFrom", "auditDateTo", "auditPageSize"].forEach(id => {
    const element = $(id);
    const refresh = () => { auditCurrentPage = 1; renderAuditTrail(); };
    element.addEventListener("input", refresh);
    element.addEventListener("change", refresh);
  });
  $("auditResetFilters").addEventListener("click", () => {
    $("auditSearch").value = ""; $("auditActionFilter").value = ""; $("auditCountryFilter").value = "";
    $("auditDateFrom").value = ""; $("auditDateTo").value = ""; $("auditPageSize").value = "10"; auditCurrentPage = 1; renderAuditTrail();
  });
  renderAuditTrail();
}

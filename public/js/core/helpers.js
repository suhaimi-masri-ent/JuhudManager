
const $ = id => document.getElementById(id);

export function showMessage(id, msg, error = false) {
  const el = $(id);

  if (!el) return;

  el.textContent = msg || "";
  el.classList.toggle("error", error);
  el.classList.toggle("hidden", !msg);
}

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

export function setActivityStartNow() {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ].join(":");

  const dateInput = $("activityDate");
  const timeInput = $("startTime");

  if (dateInput) dateInput.value = date;
  if (timeInput) timeInput.value = time;
}

export function tag(status) {
  const value = status || "—";
  const className = String(status || "").toLowerCase();

  return `<span class="tag ${className}">${escapeHtml(value)}</span>`;
}

export function table(headers, rows) {
  return `
    <table>
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows.join("")
            : `<tr><td colspan="${headers.length}">No records yet</td></tr>`
        }
      </tbody>
    </table>
  `;
}


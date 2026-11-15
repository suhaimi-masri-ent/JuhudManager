
import { api } from "../core/api.js";

import {
  showMessage,
  escapeHtml,
  tag,
  table
} from "../core/helpers.js";


const $ = id => document.getElementById(id);

let initialized = false;
let currentPage = 1;
let editingTakazaId = null;
let editingTakazaCode = null;

const PAGE_SIZE = 12;


/* =========================
   FORM MANAGEMENT
========================= */

function showTakazaForm() {
  $("takazaForm").hidden = false;
  $("takazaForm").classList.remove("hidden");
  $("takazaCategoryId").focus();
}

function resetTakazaForm() {
  $("takazaFormElement").reset();

  editingTakazaId = null;
  editingTakazaCode = null;

  $("takazaForm").hidden = true;
  $("takazaForm").classList.add("hidden");

  updateFormHeading();
}

function updateFormHeading() {
  const heading = $("takazaForm").querySelector("h3");
  const submitButton = $("takazaFormElement").querySelector(
    'button[type="submit"]'
  );

  if (editingTakazaId) {
    heading.textContent = `Edit Takaza - ${editingTakazaCode}`;
    submitButton.textContent = "Update Takaza";
  } else {
    heading.textContent = "Register New Takaza";
    submitButton.textContent = "Save Takaza";
  }
}


/* =========================
   LOAD FORM OPTIONS
========================= */

async function loadTakazaOptions() {
  const [categoryData, takazaData] = await Promise.all([
    api("/api/admin/takaza-categories"),
    api("/api/admin/takazas")
  ]);

  const categories = categoryData.categories || [];
  const takazas = takazaData.takazas || [];

  $("takazaCategoryId").innerHTML = `
    <option value="">Select Category</option>
    ${categories.map(item => `
      <option value="${escapeHtml(item.category_id)}">
        ${escapeHtml(item.category_code)} -
        ${escapeHtml(item.category_name)}
        ${item.status !== "ACTIVE" ? "(Inactive)" : ""}
      </option>
    `).join("")}
  `;

  $("takazaFilterCategory").innerHTML = `
    <option value="">All Categories</option>
    ${categories.map(item => `
      <option value="${escapeHtml(item.category_id)}">
        ${escapeHtml(item.category_code)} -
        ${escapeHtml(item.category_name)}
      </option>
    `).join("")}
  `;

  $("takazaParentId").innerHTML = `
    <option value="">No Parent Takaza</option>
    ${takazas
      .filter(item => item.takaza_id !== editingTakazaId)
      .map(item => `
        <option value="${escapeHtml(item.takaza_id)}">
          ${escapeHtml(item.takaza_code)} -
          ${escapeHtml(item.takaza_name)}
        </option>
      `).join("")}
  `;
}


/* =========================
   VIEW TAKAZA DETAILS
========================= */

function showTakazaDetails(takaza) {
  let dialog = $("takazaDetailsDialog");

  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "takazaDetailsDialog";
    dialog.className = "details-dialog";

    document.body.appendChild(dialog);
  }

  const fields = [
    ["Takaza Code / No Percha", takaza.takaza_code],
    ["Takaza Name", takaza.takaza_name],
    ["Category", takaza.category_name],
    ["Parent Takaza", takaza.parent_takaza_code || "—"],
    ["Start Date", takaza.start_date || "—"],
    ["End Date", takaza.end_date || "—"],
    ["Status", takaza.status],
    ["Description", takaza.description || "—"],
    ["Created At", takaza.created_at || "—"],
    ["Updated At", takaza.updated_at || "—"]
  ];

  dialog.innerHTML = `
    <div class="details-header">
      <h2>Takaza Details</h2>
      <button
        type="button"
        class="btn btn-outline"
        data-close-details
        aria-label="Close"
      >Close</button>
    </div>

    <div class="details-content">
      ${fields.map(([label, value]) => `
        <div class="detail-row">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(value)}</span>
        </div>
      `).join("")}
    </div>
  `;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }

  dialog.querySelector("[data-close-details]")
    .addEventListener("click", () => {
      dialog.close();
    });
}

/* =========================
   TAKAZA TOOLTIP
========================= */

function initTakazaTooltip() {
  if ($("takazaTooltip")) return;

  const tooltip = document.createElement("div");

  tooltip.id = "takazaTooltip";
  tooltip.className = "takaza-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;

  tooltip.textContent =
    "No Percha is the official Project Code for this Takaza. " +
    "It remains unchanged when the Takaza is edited or archived.";

  document.body.appendChild(tooltip);

  const tableElement = $("takazasTable");

  function showTooltip(icon) {
    const rect = icon.getBoundingClientRect();

    tooltip.hidden = false;

    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    const left = Math.max(
      8,
      Math.min(
        rect.left + rect.width / 2 - tooltipWidth / 2,
        window.innerWidth - tooltipWidth - 8
      )
    );

    let top = rect.top - tooltipHeight - 8;

    if (top < 8) {
      top = rect.bottom + 8;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.min(
      top,
      window.innerHeight - tooltipHeight - 8
    )}px`;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  tableElement.addEventListener("pointerover", event => {
    const icon = event.target.closest(".takaza-info-icon");

    if (icon) showTooltip(icon);
  });

  tableElement.addEventListener("pointerout", event => {
    const icon = event.target.closest(".takaza-info-icon");

    if (icon) hideTooltip();
  });

  tableElement.addEventListener("focusin", event => {
    const icon = event.target.closest(".takaza-info-icon");

    if (icon) showTooltip(icon);
  });

  tableElement.addEventListener("focusout", event => {
    const icon = event.target.closest(".takaza-info-icon");

    if (icon) hideTooltip();
  });

  window.addEventListener("resize", hideTooltip);
  window.addEventListener("scroll", hideTooltip, true);
}


/* =========================
   EDIT TAKAZA
========================= */

async function editTakaza(takazaId) {
  try {
    const data = await api(
      `/api/admin/takazas/${encodeURIComponent(takazaId)}`
    );

    const takaza = data.takaza;

    if (!takaza) {
      throw new Error("Takaza not found");
    }

    editingTakazaId = takaza.takaza_id;
    editingTakazaCode = takaza.takaza_code;

    await loadTakazaOptions();

    $("takazaCategoryId").value = takaza.category_id;
    $("takazaName").value = takaza.takaza_name || "";
    $("takazaParentId").value = takaza.parent_takaza_id || "";
    $("takazaStartDate").value = takaza.start_date || "";
    $("takazaEndDate").value = takaza.end_date || "";
    $("takazaDescription").value = takaza.description || "";

    updateFormHeading();
    showTakazaForm();

    $("takazaForm").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    showMessage("takazaMessage", error.message, true);
  }
}


/* =========================
   ARCHIVE TAKAZA
========================= */

async function archiveTakaza(takazaId, takazaCode) {
  const confirmed = window.confirm(
    `Archive Takaza ${takazaCode}?\n\n` +
    "The record will be preserved in history. It will not be deleted."
  );

  if (!confirmed) return;

  try {
    await api(
      `/api/admin/takazas/${encodeURIComponent(takazaId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          action: "ARCHIVE"
        })
      }
    );

    showMessage(
      "takazaMessage",
      `Takaza ${takazaCode} has been archived.`
    );

    await loadTakazaOptions();
    await loadTakazas();

  } catch (error) {
    showMessage("takazaMessage", error.message, true);
  }
}


/* =========================
   ACTION BUTTON EVENTS
========================= */

async function handleTakazaAction(event) {
  const button = event.target.closest("[data-takaza-action]");

  if (!button) return;

  const action = button.dataset.takazaAction;
  const takazaId = button.dataset.takazaId;
  const takazaCode = button.dataset.takazaCode;

  if (!takazaId) return;

  if (action === "view") {
    try {
      const data = await api(
        `/api/admin/takazas/${encodeURIComponent(takazaId)}`
      );

      showTakazaDetails(data.takaza);

    } catch (error) {
      showMessage("takazaMessage", error.message, true);
    }
  }

  if (action === "edit") {
    await editTakaza(takazaId);
  }

  if (action === "archive") {
    await archiveTakaza(takazaId, takazaCode);
  }
}


/* =========================
   LOAD TAKAZA LIST
========================= */

export async function loadTakazas() {
  try {
    const data = await api("/api/admin/takazas");
    const takazas = data.takazas || [];

    const search = $("takazaSearch").value.trim().toLowerCase();
    const category = $("takazaFilterCategory").value;
    const status = $("takazaFilterStatus").value;
    const dateFrom = $("takazaFilterStartFrom").value;
    const dateTo = $("takazaFilterStartTo").value;

    const filtered = takazas.filter(item => {
      const code = (item.takaza_code || "").toLowerCase();
      const name = (item.takaza_name || "").toLowerCase();

      const matchesSearch =
        !search ||
        code.includes(search) ||
        name.includes(search);

      const matchesCategory =
        !category || item.category_id === category;

      const matchesArchiveView =
        status === "ARCHIVED"
          ? item.status === "ARCHIVED"
          : item.status !== "ARCHIVED";
      
      const matchesStatus =
        !status || item.status === status;
      
      const matchesDateFrom =
        !dateFrom ||
        (item.start_date && item.start_date >= dateFrom);

      const matchesDateTo =
        !dateTo ||
        (item.start_date && item.start_date <= dateTo);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesArchiveView &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });


    /* PAGINATION */

    const totalRecords = filtered.length;

    const totalPages = Math.max(
      1,
      Math.ceil(totalRecords / PAGE_SIZE)
    );

    currentPage = Math.min(
      Math.max(currentPage, 1),
      totalPages
    );

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const pageItems = filtered.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );


    /* TABLE ROWS */

    const rows = pageItems.map(item => {
      const archived = item.status === "ARCHIVED";

      return `
        <tr>
          <td>${escapeHtml(item.takaza_code)}</td>
          <td>${escapeHtml(item.takaza_name)}</td>
          <td>${escapeHtml(item.category_name)}</td>
          <td>${escapeHtml(item.parent_takaza_code || "—")}</td>
          <td>${escapeHtml(item.start_date || "—")}</td>
          <td>${escapeHtml(item.end_date || "—")}</td>
          <td>${tag((item.status || "").toLowerCase())}</td>
          <td>
            <button
              type="button"
              class="table-action"
              data-takaza-action="view"
              data-takaza-id="${escapeHtml(item.takaza_id)}"
            >View</button>

            ${!archived ? `
              <button
                type="button"
                class="table-action"
                data-takaza-action="edit"
                data-takaza-id="${escapeHtml(item.takaza_id)}"
              >Edit</button>

              <button
                type="button"
                class="table-action"
                data-takaza-action="archive"
                data-takaza-id="${escapeHtml(item.takaza_id)}"
                data-takaza-code="${escapeHtml(item.takaza_code)}"
              >Archive</button>
            ` : ""}
          </td>
        </tr>
      `;
    });


    /* RENDER TABLE */

    $("takazasTable").innerHTML = table(
      [
        `
          Takaza Code
          <span class="takaza-info-wrap">
            <button
              type="button"
              class="takaza-info-icon"
              aria-label="No Percha information"
              aria-describedby="takazaTooltip"
            >i</button>
          </span>
        `,
        "Takaza Name",
        "Category",
        "Parent",
        "Start Date",
        "End Date",
        "Status",
        "Action"
      ],
      rows
    );


    /* RENDER PAGINATION */

    const firstRecord = totalRecords
      ? startIndex + 1
      : 0;

    const lastRecord = Math.min(
      startIndex + PAGE_SIZE,
      totalRecords
    );

    $("takazaPagination").innerHTML = `
      <div class="takaza-pagination-info">
        Showing ${firstRecord}–${lastRecord} of ${totalRecords} records
      </div>

      <div class="takaza-pagination-controls">
        <button
          type="button"
          class="btn btn-outline"
          id="takazaPreviousPage"
          ${currentPage <= 1 ? "disabled" : ""}
        >
          Previous
        </button>

        <span>
          Page ${currentPage} of ${totalPages}
        </span>

        <button
          type="button"
          class="btn btn-outline"
          id="takazaNextPage"
          ${currentPage >= totalPages ? "disabled" : ""}
        >
          Next
        </button>
      </div>
    `;


    /* PAGINATION EVENTS */

    $("takazaPreviousPage").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadTakazas();
      }
    });

    $("takazaNextPage").addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadTakazas();
      }
    });

  } catch (error) {
    showMessage("takazaMessage", error.message, true);
  }
}


/* =========================
   SAVE / UPDATE TAKAZA
========================= */

async function saveTakaza(event) {
  event.preventDefault();

  try {
    const body = {
      categoryId: $("takazaCategoryId").value,
      takazaName: $("takazaName").value.trim(),
      parentTakazaId: $("takazaParentId").value,
      startDate: $("takazaStartDate").value,
      endDate: $("takazaEndDate").value,
      description: $("takazaDescription").value.trim()
    };

    let result;

    if (editingTakazaId) {
      result = await api(
        `/api/admin/takazas/${encodeURIComponent(editingTakazaId)}`,
        {
          method: "PUT",
          body: JSON.stringify(body)
        }
      );
    } else {
      result = await api("/api/admin/takazas", {
        method: "POST",
        body: JSON.stringify(body)
      });
    }

    const message = editingTakazaId
      ? `Takaza updated successfully: ${editingTakazaCode}`
      : `Takaza created successfully: ${result.takaza.takaza_code}`;

    resetTakazaForm();

    currentPage = 1;

    showMessage("takazaMessage", message);

    await loadTakazaOptions();
    await loadTakazas();

  } catch (error) {
    showMessage("takazaMessage", error.message, true);
  }
}


/* =========================
   INITIALIZE REGISTRATION
========================= */

export function initTakazaRegistration() {
  if (initialized) return;

  initialized = true;


  // SEARCH & FILTER TOGGLE

  $("takazaFilterToggle").addEventListener("change", () => {
    $("takazaFilterPanel").hidden =
      !$("takazaFilterToggle").checked;
  });


  // ADD TAKAZA

  $("addTakazaBtn").addEventListener("click", async () => {
    try {
      resetTakazaForm();
      await loadTakazaOptions();
      showTakazaForm();
    } catch (error) {
      showMessage("takazaMessage", error.message, true);
    }
  });


  // CANCEL REGISTRATION

  $("cancelTakazaBtn").addEventListener("click", () => {
    resetTakazaForm();
  });


  // SAVE / UPDATE

  $("takazaFormElement").addEventListener(
    "submit",
    saveTakaza
  );


  // TABLE ACTIONS

  $("takazasTable").addEventListener(
    "click",
    handleTakazaAction
  );


  // SEARCH

  $("takazaSearch").addEventListener("input", () => {
    currentPage = 1;
    loadTakazas();
  });


  // FILTERS

  [
    "takazaFilterCategory",
    "takazaFilterStatus",
    "takazaFilterStartFrom",
    "takazaFilterStartTo"
  ].forEach(id => {
    $(id).addEventListener("change", () => {
      currentPage = 1;
      loadTakazas();
    });
  });


  // RESET FILTERS

  $("resetTakazaFiltersBtn").addEventListener("click", () => {
    $("takazaSearch").value = "";
    $("takazaFilterCategory").value = "";
    $("takazaFilterStatus").value = "";
    $("takazaFilterStartFrom").value = "";
    $("takazaFilterStartTo").value = "";

    currentPage = 1;
    loadTakazas();
  });
}


/* =========================
   LOAD TAKAZA REGISTRATION
========================= */

export async function loadTakazaRegistration() {
  await loadTakazaOptions();
  await loadTakazas();
}

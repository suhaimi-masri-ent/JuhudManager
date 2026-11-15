
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

const PAGE_SIZE = 12;


/* =========================
   SHOW / HIDE FORM
========================= */

function showTakazaForm() {
  $("takazaForm").hidden = false;
  $("takazaForm").classList.remove("hidden");
  $("takazaCategoryId").focus();
}


function resetTakazaForm() {
  $("takazaFormElement").reset();

  $("takazaForm").hidden = true;
  $("takazaForm").classList.add("hidden");
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
    ${categories
      .filter(item => item.status === "ACTIVE")
      .map(item => `
        <option value="${escapeHtml(item.category_id)}">
          ${escapeHtml(item.category_code)} - ${escapeHtml(item.category_name)}
        </option>
      `).join("")}
  `;

  $("takazaFilterCategory").innerHTML = `
    <option value="">All Categories</option>
    ${categories.map(item => `
      <option value="${escapeHtml(item.category_id)}">
        ${escapeHtml(item.category_code)} - ${escapeHtml(item.category_name)}
      </option>
    `).join("")}
  `;

  $("takazaParentId").innerHTML = `
    <option value="">No Parent Takaza</option>
    ${takazas.map(item => `
      <option value="${escapeHtml(item.takaza_id)}">
        ${escapeHtml(item.takaza_code)} - ${escapeHtml(item.takaza_name)}
      </option>
    `).join("")}
  `;
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

    const rows = pageItems.map(item => `
      <tr>
        <td>${escapeHtml(item.takaza_code)}</td>
        <td>${escapeHtml(item.takaza_name)}</td>
        <td>${escapeHtml(item.category_name)}</td>
        <td>${escapeHtml(item.parent_takaza_code || "—")}</td>
        <td>${escapeHtml(item.start_date || "—")}</td>
        <td>${escapeHtml(item.end_date || "—")}</td>
        <td>${tag((item.status || "").toLowerCase())}</td>
      </tr>
    `);


    /* RENDER TABLE */

    $("takazasTable").innerHTML = table(
      [
        'Takaza Code <span class="takaza-info-icon" title="No Percha" aria-label="No Percha">ⓘ</span>',
        "Takaza Name",
        "Category",
        "Parent",
        "Start Date",
        "End Date",
        "Status"
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
   CREATE TAKAZA
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

    const result = await api("/api/admin/takazas", {
      method: "POST",
      body: JSON.stringify(body)
    });

    resetTakazaForm();

    currentPage = 1;

    showMessage(
      "takazaMessage",
      `Takaza created successfully: ${result.takaza.takaza_code}`
    );

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


  // SAVE REGISTRATION

  $("takazaFormElement").addEventListener(
    "submit",
    saveTakaza
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

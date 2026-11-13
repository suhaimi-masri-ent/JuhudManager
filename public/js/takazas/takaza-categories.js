
import { api } from "../core/api.js";

import {
  showMessage,
  escapeHtml,
  tag,
  table
} from "../core/helpers.js";


const $ = id => document.getElementById(id);

let editingTakazaCategoryId = null;
let initialized = false;


/* =========================
   RESET CATEGORY FORM
========================= */

function resetTakazaCategoryForm() {
  editingTakazaCategoryId = null;

  $("takazaCategoryFormElement").reset();

  $("takazaCategoryCode").disabled = false;
  $("takazaCategoryStatus").disabled = false;

  $("takazaCategoryFormTitle").textContent =
    "Add Takaza Category";

  $("takazaCategoryForm").hidden = true;
  $("takazaCategoryForm").classList.add("hidden");
}


/* =========================
   SHOW CATEGORY FORM
========================= */

function showTakazaCategoryForm() {
  $("takazaCategoryForm").hidden = false;
  $("takazaCategoryForm").classList.remove("hidden");
}


/* =========================
   LOAD CATEGORY LIST
========================= */

export async function loadTakazaCategories() {
  try {
    const data = await api("/api/admin/takaza-categories");

    const categories = data.categories || [];

    const rows = categories.map(category => {
      const nextStatus =
        category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const statusAction =
        category.status === "ACTIVE" ? "Deactivate" : "Activate";

      return `
        <tr>
          <td>${escapeHtml(category.category_code)}</td>

          <td>${escapeHtml(category.category_name)}</td>

          <td>${escapeHtml(category.description || "—")}</td>

          <td>${tag(category.status.toLowerCase())}</td>

          <td>
            <button
              type="button"
              class="btn btn-outline"
              data-edit-category="${escapeHtml(category.category_id)}"
            >
              Edit
            </button>

            <button
              type="button"
              class="btn btn-outline"
              data-category-status="${escapeHtml(category.category_id)}"
              data-next-status="${nextStatus}"
            >
              ${statusAction}
            </button>
          </td>
        </tr>
      `;
    });

    $("takazaCategoriesTable").innerHTML = table(
      ["Code", "Category Name", "Description", "Status", "Action"],
      rows
    );

  } catch (error) {
    showMessage(
      "takazaCategoryMessage",
      error.message,
      true
    );
  }
}


/* =========================
   CREATE / UPDATE CATEGORY
========================= */

async function saveTakazaCategory(event) {
  event.preventDefault();

  try {
    const categoryData = {
      categoryName: $("takazaCategoryName").value.trim(),
      description: $("takazaCategoryDescription").value.trim()
    };

    if (editingTakazaCategoryId) {

      await api(
        `/api/admin/takaza-categories/${encodeURIComponent(editingTakazaCategoryId)}`,
        {
          method: "PUT",
          body: JSON.stringify(categoryData)
        }
      );

    } else {

      await api("/api/admin/takaza-categories", {
        method: "POST",
        body: JSON.stringify({
          categoryCode: $("takazaCategoryCode").value.trim(),
          ...categoryData,
          status: $("takazaCategoryStatus").value
        })
      });

    }

    resetTakazaCategoryForm();

    showMessage(
      "takazaCategoryMessage",
      "Takaza category saved successfully."
    );

    await loadTakazaCategories();

  } catch (error) {
    showMessage(
      "takazaCategoryMessage",
      error.message,
      true
    );
  }
}


/* =========================
   EDIT CATEGORY
========================= */

async function editTakazaCategory(categoryId) {
  try {
    const data = await api("/api/admin/takaza-categories");

    const category = (data.categories || []).find(
      item => item.category_id === categoryId
    );

    if (!category) {
      throw new Error("Category not found.");
    }

    editingTakazaCategoryId = categoryId;

    $("takazaCategoryFormTitle").textContent =
      "Edit Takaza Category";

    $("takazaCategoryCode").value = category.category_code;
    $("takazaCategoryCode").disabled = true;

    $("takazaCategoryName").value = category.category_name;

    $("takazaCategoryDescription").value =
      category.description || "";

    $("takazaCategoryStatus").value = category.status;
    $("takazaCategoryStatus").disabled = true;

    showTakazaCategoryForm();

    $("takazaCategoryName").focus();

  } catch (error) {
    showMessage(
      "takazaCategoryMessage",
      error.message,
      true
    );
  }
}


/* =========================
   ACTIVATE / DEACTIVATE
========================= */

async function changeTakazaCategoryStatus(
  categoryId,
  nextStatus
) {
  const action =
    nextStatus === "ACTIVE" ? "activate" : "deactivate";

  if (!confirm(`Are you sure you want to ${action} this category?`)) {
    return;
  }

  try {
    await api(
      `/api/admin/takaza-categories/${encodeURIComponent(categoryId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus
        })
      }
    );

    showMessage(
      "takazaCategoryMessage",
      `Category ${action}d successfully.`
    );

    await loadTakazaCategories();

  } catch (error) {
    showMessage(
      "takazaCategoryMessage",
      error.message,
      true
    );
  }
}


/* =========================
   INITIALIZE CATEGORY MODULE
========================= */

export function initTakazaCategories() {

  if (initialized) return;

  initialized = true;


  // ADD CATEGORY

  $("addTakazaCategoryBtn").addEventListener("click", () => {
    resetTakazaCategoryForm();

    showTakazaCategoryForm();

    $("takazaCategoryCode").focus();
  });


  // CANCEL FORM

  $("cancelTakazaCategoryBtn").addEventListener("click", () => {
    resetTakazaCategoryForm();
  });


  // SAVE FORM

  $("takazaCategoryFormElement").addEventListener(
    "submit",
    saveTakazaCategory
  );


  // TABLE ACTIONS

  $("takazaCategoriesTable").addEventListener("click", event => {

    const editButton = event.target.closest(
      "[data-edit-category]"
    );

    if (editButton) {
      editTakazaCategory(editButton.dataset.editCategory);
      return;
    }


    const statusButton = event.target.closest(
      "[data-category-status]"
    );

    if (statusButton) {
      changeTakazaCategoryStatus(
        statusButton.dataset.categoryStatus,
        statusButton.dataset.nextStatus
      );
    }

  });

}


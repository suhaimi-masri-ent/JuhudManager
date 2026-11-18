import { api } from "../core/api.js";

const $ = id => document.getElementById(id);

const profileFields = {
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

export function initAdminProfileEditor({ loadActivities, reloadUsers }) {
  const dialog = $("editUserProfileDialog");
  const form = $("editUserProfileForm");

  if (!dialog || !form || form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  let selectedUserId = null;

  $("usersTable").addEventListener("click", async event => {
    const button = event.target.closest("[data-edit-user]");
    if (!button) return;

    selectedUserId = button.dataset.editUser;
    $("adminEditProfileMessage").textContent = "Loading profile...";

    try {
      const result = await api(
        `/api/admin/users/${encodeURIComponent(selectedUserId)}/profile`
      );

      const user = result.user || {};
      $("adminEditFullName").value = user.full_name || "";

      for (const [field, id] of Object.entries(profileFields)) {
        $(id).value = user[field] || "";
      }

      $("adminEditProfileMessage").textContent = "";
      dialog.showModal();
    } catch (error) {
      $("adminEditProfileMessage").textContent = error.message;
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedUserId) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const body = {
      full_name: $("adminEditFullName").value.trim()
    };

    for (const [field, id] of Object.entries(profileFields)) {
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

      await reloadUsers();

      if (typeof loadActivities === "function") {
        await loadActivities();
      }

      setTimeout(() => dialog.close(), 700);
    } catch (error) {
      $("adminEditProfileMessage").textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  $("adminEditProfileCancel").addEventListener("click", () => {
    dialog.close();
  });
}


import {
  currentUser,
  language,
  setCurrentUser
} from "./core/state.js";

import { api } from "./core/api.js";

import {
  showMessage,
  escapeHtml,
  setActivityStartNow,
  tag,
  table
} from "./core/helpers.js";

import {
  applyLanguage
} from "./core/language.js";

import {
  initAuth,
  showLogin
} from "./auth/auth.js";

import {
  loadProfile
} from "./profile/profile.js";

import {
  loadActivities
} from "./activities/activities.js";

import {
  showActivityDetails
} from "./activities/activity-details.js";

import {
  isAdmin,
  canReview,
  loadAdmin
} from "./admin/admin.js";

import {
  initAdminUsers
} from "./admin/users.js";

import {
  loadReviews
} from "./admin/review.js";

const $ = id => document.getElementById(id);


/* =========================
   TAKAZA CATEGORY FORM
========================= */

$("addTakazaCategoryBtn").addEventListener("click", () => {
  $("takazaCategoryForm").hidden = false;
  $("takazaCategoryForm").classList.remove("hidden");

  $("takazaCategoryCode").focus();
});

$("cancelTakazaCategoryBtn").addEventListener("click", () => {
  $("takazaCategoryForm").hidden = true;
  $("takazaCategoryForm").classList.add("hidden");
});

$("takazaCategoryFormElement").addEventListener("submit", e => {
  e.preventDefault();

  showMessage(
    "takazaCategoryMessage",
    "Category saving will be enabled in the next step."
  );
});

async function loadTakazaCategories() {
  try {
    const data = await api("/api/admin/takaza-categories");

    const categories = data.categories || [];

    const rows = categories.map(category => `
      <tr>
        <td>${escapeHtml(category.category_code)}</td>
        <td>${escapeHtml(category.category_name)}</td>
        <td>${escapeHtml(category.description || "—")}</td>
        <td>${tag(category.status.toLowerCase())}</td>
      </tr>
    `);

    $("takazaCategoriesTable").innerHTML = table(
      ["Code", "Category Name", "Description", "Status"],
      rows
    );

  } catch (e) {
    showMessage("takazaCategoryMessage", e.message, true);
  }
}

/* =========================
   NAVIGATION
========================= */

function switchView(name) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.add("hidden");
  });

  $(`${name}Panel`).classList.remove("hidden");

  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.view === name);
  });

  if (name === "profile") {
    loadProfile().catch(e => {
      showMessage("profileMessage", e.message, true);
    });
  }

  if (name === "admin") {
    loadAdmin(loadActivities).catch(e => alert(e.message));
  }

  if (name === "activities") {
    loadActivities().catch(e => alert(e.message));
  }
}



/* =========================
   LOAD USER SESSION
========================= */

async function loadMe() {
  const data = await api("/api/auth/me");

  const user = {
    ...data.user,
    fullName: data.user.full_name,
    roles: data.roles || []
  };

  setCurrentUser(user);

  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");

  $("greeting").textContent =
    `${language === "my" ? "Selamat datang" : "Welcome"}, ${user.fullName}`;

  $("rolePill").textContent = user.roles.join(" · ");

  document.querySelectorAll(".admin-only").forEach(x => {
    x.classList.toggle("hidden", !isAdmin() && !canReview());
  });

  switchView("dashboard");

  loadActivities().catch(e => {
    console.error("Activities:", e);
  });
}


/* =========================
   NAVIGATION EVENTS
========================= */

document.querySelectorAll(".tab").forEach(b => {
  b.addEventListener("click", () => {
    switchView(b.dataset.view);
  });
});

document.querySelectorAll("[data-go]").forEach(b => {
  b.addEventListener("click", () => {
    switchView(b.dataset.go);
  });
});


/* =========================
   PROFILE
========================= */

$("profileForm").addEventListener("submit", async e => {
  e.preventDefault();

  const body = {
    date_of_birth: $("dob").value,
    gender: $("gender").value,
    marital_status: $("marital").value,
    nationality: $("nationality").value,
    country: $("country").value,
    state_province: $("state").value,
    city_district: $("city").value,
    postcode: $("postcode").value,
    street_address: $("street").value,
    building_number: $("buildingNo").value,
    building_name: $("buildingName").value,
    address_line_2: $("address2").value,
    employment_status: $("employmentStatus").value,
    employment_type: $("employmentType").value,
    employment_sector: $("employmentSector").value,
    occupation: $("occupation").value,
    employer_company: $("employerCompany").value,
    department: $("department").value,
    position_designation: $("positionDesignation").value,
    work_location: $("workLocation").value
  };

  try {
    await api("/api/profile", {
      method: "PUT",
      body: JSON.stringify(body)
    });

    showMessage(
      "profileMessage",
      language === "my" ? "Profil disimpan." : "Profile saved."
    );

  } catch (e) {
    showMessage("profileMessage", e.message, true);
  }
});


/* =========================
   ACTIVITY FORM
========================= */

setActivityStartNow();

$("activityType").addEventListener("change", () => {
  setActivityStartNow();
});


/* =========================
   ACTIVITY DETAILS
========================= */

$("activityHistory").addEventListener("click", e => {
  const button = e.target.closest("[data-activity-view]");

  if (!button) return;

  showActivityDetails(button.dataset.activityView);
});


$("closeActivityDetails").addEventListener("click", () => {
  $("activityDetailsDialog").close();
});


$("activityDetailsDialog").addEventListener("click", e => {
  if (e.target === $("activityDetailsDialog")) {
    $("activityDetailsDialog").close();
  }
});


/* =========================
   SUBMIT ACTIVITY
========================= */

$("activityForm").addEventListener("submit", async e => {
  e.preventDefault();

  try {
    await api("/api/activities", {
      method: "POST",
      body: JSON.stringify({
        activityTypeId: $("activityType").value,
        activityDate: $("activityDate").value,
        startTime: $("startTime").value,
        endDate: $("endDate").value,
        endTime: $("endTime").value,
        description: $("activityDescription").value,
        progressStatus: $("progress").value
      })
    });

    $("activityDescription").value = "";
    $("endDate").value = "";
    $("endTime").value = "";

    showMessage(
      "activityMessage",
      language === "my"
        ? "Aktiviti dihantar untuk semakan."
        : "Activity submitted for review."
    );

    await loadActivities();

  } catch (e) {
    showMessage("activityMessage", e.message, true);
  }
});


/* =========================
   INITIALIZE ADMIN USERS
========================= */

initAdminUsers(loadAdmin, loadActivities);


/* =========================
   INITIALIZE AUTH
========================= */

initAuth(loadMe);


/* =========================
   INITIAL LANGUAGE
========================= */

applyLanguage();


/* =========================
   RESTORE SESSION
========================= */

if (sessionStorage.getItem("juhud_token")) {
  loadMe().catch(err => {
    console.error("Session restoration failed:", err);

    sessionStorage.removeItem("juhud_token");
    showLogin();
  });
} else {
  showLogin();
}

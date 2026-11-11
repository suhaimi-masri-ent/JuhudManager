
const API = (window.JUHUD_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");

const $ = id => document.getElementById(id);

let currentUser = null;
let activityTypes = [];
let records = [];
let language = "en";

const messages = {
  en: {
    welcome: "A clearer way to manage people and activities.",
    intro: "One secure workspace for profiles, periodic updates and administrative review.",
    feature1: "Personal information",
    feature2: "Daily to yearly activities",
    feature3: "Review and reporting workflow",
    signIn: "Sign in",
    loginWith: "Login using",
    identifier: "Email Address",
    password: "Password",
    accountNote: "Accounts are created by an administrator.",
    logout: "Logout",
    workspace: "WORKSPACE",
    dashboard: "Dashboard",
    myProfile: "My Profile",
    activities: "Activities",
    administration: "Administration",
    mySubmissions: "My submissions",
    pendingReview: "Pending review",
    accountStatus: "Account status",
    active: "Active",
    recentActivity: "Recent activity",
    viewAll: "View all",
    personalProfile: "Personal profile",
    profileHint: "Keep your contact and address information up to date.",
    dateOfBirth: "Date of birth",
    gender: "Gender",
    marital: "Marital status",
    nationality: "Nationality",
    country: "Country",
    state: "State / Province",
    city: "City / District",
    postcode: "Postcode",
    street: "Street address",
    buildingNo: "Building number",
    buildingName: "Building name",
    address2: "Address line 2",
    saveProfile: "Save profile",
    submitActivity: "Submit an activity",
    activityType: "Activity type",
    activityDate: "Activity date",
    periodStart: "Period start (optional)",
    periodEnd: "Period end (optional)",
    description: "Description / update",
    progress: "Progress",
    submitForReview: "Submit for review",
    myHistory: "My activity history",
    createUser: "Create user",
    fullName: "Full name",
    temporaryPassword: "Initial password (12+ characters)",
    createAccount: "Create account",
    users: "Users",
    createActivityType: "Create activity type",
    activityName: "Activity name",
    frequency: "Frequency",
    createActivity: "Create activity",
    reviewSubmissions: "Review submissions",
    footer: "People, activities and progress"
  },

  my: {
    welcome: "Cara lebih jelas untuk mengurus pengguna dan aktiviti.",
    intro: "Satu ruang kerja selamat untuk profil, kemas kini berkala dan semakan pentadbir.",
    feature1: "Maklumat peribadi",
    feature2: "Aktiviti harian hingga tahunan",
    feature3: "Aliran semakan dan laporan",
    signIn: "Log masuk",
    loginWith: "Log masuk menggunakan",
    identifier: "Alamat e-mel",
    password: "Kata laluan",
    accountNote: "Akaun didaftarkan oleh pentadbir.",
    logout: "Log keluar",
    workspace: "RUANG KERJA",
    dashboard: "Papan pemuka",
    myProfile: "Profil saya",
    activities: "Aktiviti",
    administration: "Pentadbiran",
    mySubmissions: "Penyerahan saya",
    pendingReview: "Menunggu semakan",
    accountStatus: "Status akaun",
    active: "Aktif",
    recentActivity: "Aktiviti terkini",
    viewAll: "Lihat semua",
    personalProfile: "Profil peribadi",
    profileHint: "Pastikan maklumat hubungan dan alamat sentiasa dikemas kini.",
    dateOfBirth: "Tarikh lahir",
    gender: "Jantina",
    marital: "Status perkahwinan",
    nationality: "Warganegara",
    country: "Negara",
    state: "Negeri / Wilayah",
    city: "Bandar / Daerah",
    postcode: "Poskod",
    street: "Alamat jalan",
    buildingNo: "Nombor bangunan",
    buildingName: "Nama bangunan",
    address2: "Baris alamat 2",
    saveProfile: "Simpan profil",
    submitActivity: "Hantar aktiviti",
    activityType: "Jenis aktiviti",
    activityDate: "Tarikh aktiviti",
    periodStart: "Mula tempoh (pilihan)",
    periodEnd: "Akhir tempoh (pilihan)",
    description: "Penerangan / kemas kini",
    progress: "Kemajuan",
    submitForReview: "Hantar untuk semakan",
    myHistory: "Sejarah aktiviti saya",
    createUser: "Cipta pengguna",
    fullName: "Nama penuh",
    temporaryPassword: "Kata laluan awal (12+ aksara)",
    createAccount: "Cipta akaun",
    users: "Pengguna",
    createActivityType: "Cipta jenis aktiviti",
    activityName: "Nama aktiviti",
    frequency: "Kekerapan",
    createActivity: "Cipta aktiviti",
    reviewSubmissions: "Semak penyerahan",
    footer: "Pengguna, aktiviti dan kemajuan"
  }
};

function t(key) {
  return messages[language][key] || messages.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

async function api(path, options = {}) {
  if (!API || API.includes("REPLACE_WITH")) {
    throw new Error("Configure public/js/config.js with your Cloudflare Worker URL first.");
  }

  const token = sessionStorage.getItem("juhud_token");

  const response = await fetch(API + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

function showMessage(id, msg, error = false) {
  const el = $(id);
  if (!el) return;

  el.textContent = msg || "";
  el.classList.toggle("error", error);
  el.classList.toggle("hidden", !msg);
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function setActivityStartNow() {
  const now = new Date();

  const date =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  const time =
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");

  $("activityDate").value = date;
  $("startTime").value = time;
}

function tag(status) {
  const s = String(status || "").toLowerCase();
  return `<span class="tag ${s}">${escapeHtml(status || "—")}</span>`;
}

function table(headers, rows) {
  return `
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.length
          ? rows.join("")
          : `<tr><td colspan="${headers.length}" class="muted">No records yet</td></tr>`
        }
      </tbody>
    </table>
  `;
}

/* =========================
   ACTIVITY DETAILS POPUP
========================= */

function showActivityDetails(recordId) {
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

function isAdmin() {
  return currentUser?.roles?.some(r =>
    ["SUPER_ADMIN", "ADMIN"].includes(r)
  );
}

function canReview() {
  return currentUser?.roles?.some(r =>
    ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(r)
  );
}

function showLogin() {
  currentUser = null;
  $("appView").classList.add("hidden");
  $("loginView").classList.remove("hidden");
  $("logoutBtn").classList.add("hidden");
}

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
    loadAdmin().catch(e => alert(e.message));
  }

  if (name === "activities") {
    loadActivities().catch(e => alert(e.message));
  }
}

async function loadMe() {
  const data = await api("/api/auth/me");

  currentUser = {
    ...data.user,
    fullName: data.user.full_name,
    roles: data.roles || []
  };

  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");

  $("greeting").textContent =
    `${language === "my" ? "Selamat datang" : "Welcome"}, ${currentUser.fullName}`;

  $("rolePill").textContent = currentUser.roles.join(" · ");

  document.querySelectorAll(".admin-only").forEach(x => {
    x.classList.toggle("hidden", !isAdmin() && !canReview());
  });

  switchView("dashboard");

  loadActivities().catch(e => {
    console.error("Activities:", e);
  });
}

async function loadProfile() {
  const data = await api("/api/profile");
  const p = data.profile;

  $("dob").value = p.date_of_birth || "";
  $("gender").value = p.gender || "";
  $("marital").value = p.marital_status || "";
  $("nationality").value = p.nationality || "";
  $("country").value = p.country || "";
  $("state").value = p.state_province || "";
  $("city").value = p.city_district || "";
  $("postcode").value = p.postcode || "";
  $("street").value = p.street_address || "";
  $("buildingNo").value = p.building_number || "";
  $("buildingName").value = p.building_name || "";
  $("address2").value = p.address_line_2 || "";
}

async function loadActivities() {
  const d = await api("/api/activities");

  activityTypes = d.types || [];
  records = d.records || [];

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

/* =========================
   ADMIN
========================= */

async function loadAdmin() {
  if (isAdmin()) {
    const d = await api("/api/admin/users");

    $("usersTable").innerHTML = table(
      ["Name", "Login identifiers", "Role", "Status"],
      d.users.map(u =>
        `<tr>
          <td>${escapeHtml(u.full_name)}</td>
          <td>${escapeHtml(u.identifiers || "—")}</td>
          <td>${escapeHtml(u.roles || "USER")}</td>
          <td>${tag(u.account_status)}</td>
        </tr>`
      )
    );

    await api("/api/admin/activity-types");
  }

  if (canReview()) {
    const d = await api("/api/admin/submissions");

    $("submissionsTable").innerHTML = table(
      ["User", "Activity", "Date", "Status", "Review"],
      d.submissions.map(s =>
        `<tr>
          <td>${escapeHtml(s.full_name)}</td>
          <td>
            ${escapeHtml(s.activity_name)}<br>
            <span class="muted">${escapeHtml(s.description)}</span>
          </td>
          <td>${escapeHtml(s.activity_date)}</td>
          <td>${tag(s.review_status)}</td>
          <td>
            <button
              class="table-action"
              type="button"
              data-edit-review="${escapeHtml(s.record_id)}"
              data-status="${escapeHtml(s.review_status)}"
              data-remarks="${escapeHtml(s.reviewer_remarks || "")}"
            >Edit Review</button>
          </td>
        </tr>`
      )
    );

    // EDIT REVIEW BUTTON
    $("submissionsTable")
      .querySelectorAll("[data-edit-review]")
      .forEach(btn => {
        btn.addEventListener("click", async () => {
          const recordId = btn.dataset.editReview;
          const currentStatus = btn.dataset.status;
          const currentRemarks = btn.dataset.remarks;

          // ASK FOR NEW STATUS
          const statusInput = prompt(
            "Review Status:\nAPPROVED\nNEEDS_REVISION\nREJECTED\nPENDING",
            currentStatus
          );

          if (statusInput === null) {
            return;
          }

          const reviewStatus = statusInput.trim().toUpperCase();

          const allowedStatuses = [
            "PENDING",
            "APPROVED",
            "NEEDS_REVISION",
            "REJECTED"
          ];

          if (!allowedStatuses.includes(reviewStatus)) {
            alert("Invalid review status.");
            return;
          }

          // ASK FOR REMARKS
          const remarksInput = prompt(
            "Reviewer Remarks:",
            currentRemarks
          );

          if (remarksInput === null) {
            return;
          }

          try {
            await api(`/api/admin/submissions/${encodeURIComponent(recordId)}`, {
              method: "PATCH",
              body: JSON.stringify({
                reviewStatus,
                remarks: remarksInput.trim()
              })
            });

            alert("Review updated successfully.");

            await loadAdmin();

            // REFRESH USER ACTIVITY RECORDS
            await loadActivities();

          } catch (e) {
            alert(e.message);
          }
        });
      });
  }
}

/* =========================
   LOGIN
========================= */

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();

  showMessage("loginMessage", "");

  try {
    const loginResult = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("loginIdentifier").value.trim(),
        password: $("password").value
      })
    });

    if (!loginResult.token) {
      throw new Error("Login response did not contain a session token.");
    }

    sessionStorage.setItem("juhud_token", loginResult.token);

    await loadMe();

  } catch (err) {
    sessionStorage.removeItem("juhud_token");
    showLogin();
    showMessage("loginMessage", err.message, true);
  }
});

/* =========================
   LOGOUT
========================= */

$("logoutBtn").addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", {
      method: "POST"
    });
  } catch (e) {
    console.error("Logout:", e);
  } finally {
    sessionStorage.removeItem("juhud_token");
    showLogin();
    $("password").value = "";
  }
});

/* =========================
   LANGUAGE
========================= */

$("languageSelect").addEventListener("change", e => {
  language = e.target.value;
  applyLanguage();

  if (currentUser) {
    $("greeting").textContent =
      `${language === "my" ? "Selamat datang" : "Welcome"}, ${currentUser.fullName}`;
  }
});

/* =========================
   NAVIGATION
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
    address_line_2: $("address2").value
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
   ACTIVITIES
========================= */

setActivityStartNow();

$("activityType").addEventListener("change", () => {
  setActivityStartNow();
});

/* Activity history View button */

$("activityHistory").addEventListener("click", e => {
  const button = e.target.closest("[data-activity-view]");

  if (!button) return;

  showActivityDetails(button.dataset.activityView);
});

/* Close popup button */

$("closeActivityDetails").addEventListener("click", () => {
  $("activityDetailsDialog").close();
});

/* Close popup when clicking outside */

$("activityDetailsDialog").addEventListener("click", e => {
  if (e.target === $("activityDetailsDialog")) {
    $("activityDetailsDialog").close();
  }
});

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
   CREATE USER
========================= */

$("createUserForm").addEventListener("submit", async e => {
  e.preventDefault();

  showMessage("createUserMessage", "");

  const form = $("createUserForm");
  const submitButton = form.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  try {
    const result = await api("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        full_name: $("newFullName").value.trim(),
        email: $("newEmail").value.trim(),
        password: $("newPassword").value
      })
    });

    form.reset();

    showMessage(
      "createUserMessage",
      result.message || "User created successfully"
    );

    await loadAdmin();

  } catch (err) {
    showMessage("createUserMessage", err.message, true);

  } finally {
    submitButton.disabled = false;
  }
});

/* =========================
   CREATE ACTIVITY TYPE
========================= */

$("createTypeForm").addEventListener("submit", async e => {
  e.preventDefault();

  try {
    await api("/api/admin/activity-types", {
      method: "POST",
      body: JSON.stringify({
        activityName: $("typeName").value,
        frequency: $("typeFrequency").value,
        description: $("typeDescription").value
      })
    });

    showMessage(
      "createTypeMessage",
      "Activity type created."
    );

    $("createTypeForm").reset();

    await loadActivities();

  } catch (e) {
    showMessage("createTypeMessage", e.message, true);
  }
});

/* =========================
   INITIALIZATION
========================= */

applyLanguage();

if (sessionStorage.getItem("juhud_token")) {
  loadMe().catch(err => {
    console.error("Session restoration failed:", err);

    sessionStorage.removeItem("juhud_token");
    showLogin();
  });
} else {
  showLogin();
}

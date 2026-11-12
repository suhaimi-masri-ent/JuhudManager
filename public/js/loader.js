
/* =========================
   JUHUDMANAGER HTML LOADER
========================= */

const partials = [
  {
    container: "authContainer",
    file: "partials/auth.html"
  },
  {
    container: "dashboardContainer",
    file: "partials/dashboard.html"
  },
  {
    container: "profileContainer",
    file: "partials/profile.html"
  },
  {
    container: "activitiesContainer",
    file: "partials/activities.html"
  },
  {
    container: "administrationContainer",
    file: "partials/administration.html"
  }
];


/* =========================
   LOAD HTML PARTIALS
========================= */

async function loadPartial(containerId, file) {

  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(
      `HTML container not found: ${containerId}`
    );
  }

  const response = await fetch(file);

  if (!response.ok) {
    throw new Error(
      `Failed to load ${file}: HTTP ${response.status}`
    );
  }

  const html = await response.text();

  container.innerHTML = html;
}


/* =========================
   INITIALIZE APPLICATION
========================= */

async function initializeApplication() {

  try {

    for (const partial of partials) {

      await loadPartial(
        partial.container,
        partial.file
      );

    }

    console.log(
      "JuhudManager HTML partials loaded successfully."
    );

    await import("./app.js");

  } catch (error) {

    console.error(
      "JuhudManager initialization failed:",
      error
    );

    document.body.innerHTML = `
      <div style="
        max-width:600px;
        margin:80px auto;
        padding:24px;
        font-family:Arial,sans-serif;
        text-align:center;
      ">
        <h2>JuhudManager Loading Error</h2>

        <p>
          The application could not be loaded.
        </p>

        <p style="color:#b42318;">
          ${error.message}
        </p>

        <button onclick="location.reload()">
          Reload Page
        </button>
      </div>
    `;

  }

}


/* =========================
   START
========================= */

initializeApplication();



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
   SHOW APPLICATION ERROR
========================= */

function showLoadingError(error) {

  const wrapper = document.createElement("div");
  wrapper.className = "loading-error";

  const title = document.createElement("h2");
  title.textContent = "JuhudManager Loading Error";

  const message = document.createElement("p");
  message.textContent =
    "The application could not be loaded.";

  const errorMessage = document.createElement("p");
  errorMessage.className = "loading-error-message";
  errorMessage.textContent =
    error?.message || "An unexpected error occurred.";

  const reloadButton = document.createElement("button");
  reloadButton.className = "btn btn-primary";
  reloadButton.textContent = "Reload Page";

  reloadButton.addEventListener("click", () => {
    location.reload();
  });

  wrapper.append(
    title,
    message,
    errorMessage,
    reloadButton
  );

  document.body.replaceChildren(wrapper);
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

    showLoadingError(error);

  }

}


/* =========================
   START
========================= */

initializeApplication();

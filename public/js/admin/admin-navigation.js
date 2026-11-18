let initialized = false;

export function initAdminNavigation({ isAdmin, canReview }) {
  const root = document.getElementById("adminPanel");
  if (!root) return;

  root.querySelectorAll("[data-admin-requires-admin]").forEach(element => {
    element.hidden = !isAdmin;
  });
  root.querySelectorAll("[data-admin-requires-review]").forEach(element => {
    element.hidden = !canReview;
  });

  // The standalone review link is used only for supervisors; admins see it nested under Activity Management.
  root.querySelectorAll("[data-admin-review-standalone]").forEach(element => {
    element.hidden = !canReview || isAdmin;
  });

  const navButtons = [...root.querySelectorAll("[data-admin-nav]")]
    .filter(button => !button.hidden && button.offsetParent !== null);

  const available = navButtons.map(button => button.dataset.adminNav);
  const defaultPage = isAdmin ? "users" : (canReview ? "submissions" : available[0]);

  function showPage(name) {
    const page = root.querySelector(`[data-admin-page="${name}"]`);
    if (!page || page.hidden) return;

    root.querySelectorAll("[data-admin-page]").forEach(section => {
      section.hidden = section.dataset.adminPage !== name;
    });
    root.querySelectorAll("[data-admin-nav]").forEach(button => {
      button.classList.toggle("active", button.dataset.adminNav === name);
      button.setAttribute("aria-current", button.dataset.adminNav === name ? "page" : "false");
    });
  }

  if (!initialized) {
    root.addEventListener("click", event => {
      const button = event.target.closest("[data-admin-nav]");
      if (!button || button.hidden) return;
      showPage(button.dataset.adminNav);
    });
    initialized = true;
  }

  showPage(available.includes(defaultPage) ? defaultPage : available[0]);
}

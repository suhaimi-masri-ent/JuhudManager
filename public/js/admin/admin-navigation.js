
let initialized = false;

export function initAdminNavigation({ isAdmin, canReview }) {
  const root = document.getElementById("adminPanel");
  if (!root) return;

  // Apply role-based visibility to navigation and pages.
  root.querySelectorAll("[data-admin-requires-admin]").forEach(element => {
    element.hidden = !isAdmin;
  });

  root.querySelectorAll("[data-admin-requires-review]").forEach(element => {
    element.hidden = !canReview;
  });

  // Standalone Submission Review is only for Supervisors.
  root.querySelectorAll("[data-admin-review-standalone]").forEach(element => {
    element.hidden = !canReview || isAdmin;
  });

  const navButtons = [...root.querySelectorAll("[data-admin-nav]")]
    .filter(button => !button.hidden);

  const available = navButtons.map(button => button.dataset.adminNav);

  const defaultPage = isAdmin
    ? "users"
    : (canReview ? "submissions" : available[0]);

  function showPage(name) {
    const page = root.querySelector(
      `[data-admin-page="${name}"]`
    );

    if (!page) return;

    // Check role permission, not the page's previous hidden state.
    const requiresAdmin = page.hasAttribute("data-admin-requires-admin");
    const requiresReview = page.hasAttribute("data-admin-requires-review");

    if (requiresAdmin && !isAdmin) return;
    if (requiresReview && !canReview) return;

    root.querySelectorAll("[data-admin-page]").forEach(section => {
      section.hidden = section.dataset.adminPage !== name;
    });

    root.querySelectorAll("[data-admin-nav]").forEach(button => {
      const active = button.dataset.adminNav === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
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

  showPage(
    available.includes(defaultPage)
      ? defaultPage
      : available[0]
  );
}

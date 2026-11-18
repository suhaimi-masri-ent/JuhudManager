
const THEME_KEY = "juhudmanager-theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const button = document.getElementById("themeToggle");

  if (button) {
    button.textContent =
      theme === "dark" ? "☀️ Light" : "🌙 Dark";

    button.setAttribute(
      "aria-label",
      theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
    );
  }
}

// Load saved preference, or follow device preference.
const savedTheme = localStorage.getItem(THEME_KEY);

const initialTheme = savedTheme ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

applyTheme(initialTheme);

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("themeToggle");

  if (!button) return;

  button.addEventListener("click", () => {
    const current =
      document.documentElement.dataset.theme;

    const next = current === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  applyTheme(
    document.documentElement.dataset.theme
  );
});

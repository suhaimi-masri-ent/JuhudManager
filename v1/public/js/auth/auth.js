
import { currentUser, setCurrentUser, language, setLanguage } from "../core/state.js";
import { api } from "../core/api.js";
import { showMessage } from "../core/helpers.js";
import { applyLanguage } from "../core/language.js";

const $ = id => document.getElementById(id);

export function showLogin() {
  setCurrentUser(null);

  $("appView").classList.add("hidden");
  $("loginView").classList.remove("hidden");
  $("logoutBtn").classList.add("hidden");
}

export function initAuth(loadMe) {

  // LOGIN
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

  // LOGOUT
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

  // LANGUAGE
  $("languageSelect").addEventListener("change", e => {
    setLanguage(e.target.value);
    applyLanguage();

    const user = currentUser;

    if (user) {
      $("greeting").textContent =
        `${e.target.value === "my" ? "Selamat datang" : "Welcome"}, ${user.fullName}`;
    }
  });

}


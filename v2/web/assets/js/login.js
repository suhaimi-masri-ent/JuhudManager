
import {
  apiRequest,
  showNotice,
  clearNotice,
  setLoading
} from "./api.js";

const $ = (id) => document.getElementById(id);

function switchTab(tab) {
  clearNotice();

  const login = tab === "login";

  $("loginView").classList.toggle("hidden", !login);
  $("registerView").classList.toggle("hidden", login);
  $("tabs").classList.remove("hidden");

  $("loginTab").classList.toggle("active", login);
  $("registerTab").classList.toggle("active", !login);
}

$("loginTab").addEventListener("click", () => switchTab("login"));
$("registerTab").addEventListener("click", () => switchTab("register"));

document.querySelectorAll("[data-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const input = $(button.dataset.toggle);
    const visible = input.type === "text";

    input.type = visible ? "password" : "text";
    button.textContent = visible ? "Show" : "Hide";
  });
});

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  clearNotice();

  const button = $("loginButton");
  setLoading(button, true, "Signing in...");

  try {
    const result = await apiRequest(
      "/auth/login/password",
      {
        email: $("loginEmail").value.trim(),
        password: $("loginPassword").value,
        deviceName: navigator.userAgent.slice(0, 120),
        deviceType: /Android|iPhone|Mobile/i.test(navigator.userAgent)
          ? "MOBILE"
          : "DESKTOP"
      }
    );

    if (!result.accessToken) {
      throw new Error("Login response did not contain an access token.");
    }

    sessionStorage.setItem("jm_access_token", result.accessToken);

    sessionStorage.setItem(
      "jm_user",
      JSON.stringify({
        userId: result.userId,
        registrationStatus: result.registrationStatus,
        accountStatus: result.accountStatus,
        accessLevel: result.accessLevel
      })
    );

    window.location.replace("./dashboard.html");

  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    setLoading(button, false);
  }
});

$("forgotPassword").addEventListener("click", () => {
  showNotice(
    "Password reset is not implemented yet. Please contact the administrator.",
    "info"
  );
});

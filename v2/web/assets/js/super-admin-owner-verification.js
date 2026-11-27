
import {
  apiRequest,
  showNotice,
  clearNotice,
  setLoading
} from "./api.js";

const REQUEST_PATH =
  "/internal/super-admin/owner-verification/request";

const VERIFY_PATH =
  "/internal/super-admin/owner-verification/verify";

const requestView =
  document.getElementById("requestView");

const otpView =
  document.getElementById("otpView");

const completeView =
  document.getElementById("completeView");

const requestButton =
  document.getElementById("requestButton");

const resendButton =
  document.getElementById("resendButton");

const verifyButton =
  document.getElementById("verifyButton");

const otpForm =
  document.getElementById("otpForm");

const otpCode =
  document.getElementById("otpCode");

let resendTimer = null;
let resendSeconds = 0;

function startResendCooldown(seconds = 60) {
  if (resendTimer) {
    clearInterval(resendTimer);
  }

  resendSeconds = seconds;
  resendButton.disabled = true;

  updateResendButton();

  resendTimer = setInterval(() => {
    resendSeconds -= 1;

    updateResendButton();

    if (resendSeconds <= 0) {
      clearInterval(resendTimer);
      resendTimer = null;

      resendButton.disabled = false;
      resendButton.textContent = "Request a new code";
    }
  }, 1000);
}

function updateResendButton() {
  resendButton.textContent =
    `Request a new code (${resendSeconds}s)`;
}

async function requestCode(button) {
  clearNotice();

  setLoading(button, true, "Sending code...");

  try {
    await apiRequest(
      REQUEST_PATH,
      null,
      null,
      "POST"
    );

    requestView.classList.add("hidden");
    otpView.classList.remove("hidden");

    otpCode.value = "";

    startResendCooldown(60);

    showNotice(
      "If the designated owner is eligible, a verification code has been sent to the registered email address.",
      "success"
    );

    otpCode.focus();

  } catch (error) {
    showNotice(
      error.message || "Unable to request a verification code.",
      "error"
    );

  } finally {
    setLoading(button, false);
  }
}

requestButton.addEventListener("click", () => {
  requestCode(requestButton);
});

resendButton.addEventListener("click", () => {
  if (resendSeconds > 0) {
    return;
  }

  requestCode(resendButton);
});

otpForm.addEventListener("submit", async event => {
  event.preventDefault();

  clearNotice();

  const otp = otpCode.value.trim();

  if (!/^\d{6}$/.test(otp)) {
    showNotice(
      "Enter a valid six-digit verification code.",
      "error"
    );

    return;
  }

  setLoading(
    verifyButton,
    true,
    "Verifying..."
  );

  try {
    const result = await apiRequest(
      VERIFY_PATH,
      { otp },
      null,
      "POST"
    );

    if (
      result.verified !== true ||
      result.verificationStatus !== "VERIFIED"
    ) {
      throw new Error(
        "The verification result could not be confirmed."
      );
    }

    if (resendTimer) {
      clearInterval(resendTimer);
      resendTimer = null;
    }

    otpView.classList.add("hidden");
    completeView.classList.remove("hidden");

    showNotice(
      "Owner email verification completed successfully.",
      "success"
    );

  } catch (error) {
    showNotice(
      error.message || "Email verification failed.",
      "error"
    );

    otpCode.select();

  } finally {
    setLoading(
      verifyButton,
      false
    );
  }
});

import {
  apiRequest,
  showNotice,
  clearNotice,
  setLoading
} from "./api.js";

const $ = (id) => document.getElementById(id);

const state = {
  userId: null,
  emailIdentityId: null,
  email: null,
  registrationStep: "FORM",
  registrationMode: "START"
};

let otpResendInterval = null;

function stopOtpResendCountdown() {
  if (otpResendInterval) {
    clearInterval(otpResendInterval);
    otpResendInterval = null;
  }
}

function startOtpResendCountdown(seconds = 60) {
  stopOtpResendCountdown();

  const button = $("resendOtpButton");
  let remaining = Math.max(0, Number(seconds) || 60);

  function update() {
    button.disabled = remaining > 0;
    button.textContent = remaining > 0
      ? `Resend code (${remaining}s)`
      : "Resend verification code";

    if (remaining <= 0) {
      stopOtpResendCountdown();
    }
  }

  update();

  if (remaining > 0) {
    otpResendInterval = setInterval(() => {
      remaining -= 1;
      update();
    }, 1000);
  }
}

function showOtpView() {
  state.registrationStep = "OTP";

  $("registrationFormView").classList.add("hidden");
  $("otpView").classList.remove("hidden");
  $("otpDestination").textContent = state.email;
  $("dot2").classList.add("active");
}

/*
 * Convert selected registration fields to uppercase
 * while the user types or pastes text.
 */
function enforceUppercaseInput(elementId) {
  const input = $(elementId);

  input.addEventListener("input", () => {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const uppercaseValue = input.value.toUpperCase();

    if (input.value !== uppercaseValue) {
      input.value = uppercaseValue;

      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }
    }
  });
}

enforceUppercaseInput("fullName");
enforceUppercaseInput("countryCode");
enforceUppercaseInput("nationalId");

function setRegistrationMode(mode) {
  state.registrationMode = mode;

  const submitButton = $("registerButton");
  const modeButton = $("resumeRegistrationButton");
  const modeNote = $("registrationModeNote");

  if (mode === "RESUME") {
    submitButton.textContent = "Resume registration";
    modeButton.textContent = "Start a new registration";
    modeNote.textContent =
      "Enter the same details used in your previous registration. " +
      "Your original email address and identity details must match.";
  } else {
    submitButton.textContent = "Continue";
    modeButton.textContent = "Resume an incomplete registration";
    modeNote.textContent =
      "Already started registration but did not complete email verification? " +
      "Choose Resume to continue without creating another account.";
  }

  clearNotice();
}

function createResumeControls() {
  const form = $("registrationForm");

  const button = document.createElement("button");
  button.type = "button";
  button.id = "resumeRegistrationButton";
  button.className = "primary secondary";
  button.textContent = "Resume an incomplete registration";

  const note = document.createElement("p");
  note.id = "registrationModeNote";
  note.className = "small-note";
  note.textContent =
    "Already started registration but did not complete email verification? " +
    "Choose Resume to continue without creating another account.";

  form.insertAdjacentElement("afterend", button);
  button.insertAdjacentElement("afterend", note);

  button.addEventListener("click", () => {
    const nextMode = state.registrationMode === "START"
      ? "RESUME"
      : "START";

    setRegistrationMode(nextMode);
  });
}

createResumeControls();

async function resendRegistrationOtp() {
  const button = $("resendOtpButton");

  if (button.disabled) return;

  clearNotice();
  button.disabled = true;
  button.textContent = "Sending...";

  try {
    const result = await apiRequest(
      "/auth/otp/request",
      {
        userId: state.userId,
        identityId: state.emailIdentityId,
        destinationType: "EMAIL",
        destination: state.email
      }
    );

    startOtpResendCountdown(result.resendAfterSeconds || 60);

    showNotice(
      "A new verification code has been requested. Please check your email.",
      "success"
    );
  } catch (error) {
    button.disabled = false;
    button.textContent = "Resend verification code";
    showNotice(error.message, "error");
  }
}

$("resendOtpButton").addEventListener(
  "click",
  resendRegistrationOtp
);

async function sendPasswordSetupEmail() {
  const button = $("requestSetupEmailButton");
  const status = $("setupEmailStatus");

  button.disabled = true;
  button.textContent = "Requesting email...";

  try {
    await apiRequest(
      "/auth/activation/request",
      { userId: state.userId }
    );

    status.textContent =
      "Password setup email request accepted. " +
      "If your account is eligible, an email will be sent. " +
      "Please check your inbox and spam folder.";

    button.textContent = "Resend password setup email";

    showNotice(
      "Password setup email request accepted.",
      "success"
    );
  } catch (error) {
    status.textContent =
      "Your email is verified, but the password setup email " +
      "request could not be completed. You can try again.";

    button.textContent = "Try again";
    showNotice(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

$("requestSetupEmailButton").addEventListener(
  "click",
  sendPasswordSetupEmail
);

$("registrationForm").addEventListener("submit", async event => {
  event.preventDefault();
  clearNotice();

  const button = $("registerButton");
  setLoading(button, true, "Submitting...");

  try {
    const country = $("countryCode").value.trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(country)) {
      throw new Error(
        "Enter a valid two-letter issuing country code."
      );
    }

    const registrationData = {
      fullName: $("fullName").value.trim().toUpperCase(),
      countryCode: country,
      nationalId: $("nationalId").value.trim().toUpperCase(),
      email: $("registerEmail").value.trim(),
      whatsapp: $("whatsapp").value.trim()
    };

    const endpoint = state.registrationMode === "RESUME"
      ? "/auth/register/resume"
      : "/auth/register/start";

    const result = await apiRequest(
      endpoint,
      registrationData
    );

    state.userId = result.userId;
    state.emailIdentityId = result.identities?.email?.identityId;
    state.email = registrationData.email;

    if (!state.userId || !state.emailIdentityId) {
      throw new Error(
        "Registration response is incomplete. Please contact support."
      );
    }

    showOtpView();

    try {
      const otpResult = await apiRequest(
        "/auth/otp/request",
        {
          userId: state.userId,
          identityId: state.emailIdentityId,
          destinationType: "EMAIL",
          destination: state.email
        }
      );

      startOtpResendCountdown(
        otpResult.resendAfterSeconds || 60
      );

      showNotice(
        state.registrationMode === "RESUME"
          ? "Your previous registration has been resumed. Please check your email for the verification code."
          : "Verification code requested. Please check your email.",
        "success"
      );
    } catch (otpError) {
      const resendButton = $("resendOtpButton");

      resendButton.disabled = false;
      resendButton.textContent = "Resend verification code";

      showNotice(
        "Your registration is saved, but the verification code " +
        "could not be requested. Use Resend verification code to try again. " +
        otpError.message,
        "error"
      );
    }
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    setLoading(button, false);
    button.textContent = state.registrationMode === "RESUME"
      ? "Resume registration"
      : "Continue";
  }
});

$("otpForm").addEventListener("submit", async event => {
  event.preventDefault();
  clearNotice();

  const button = $("verifyButton");
  const otp = $("otpCode").value.trim();

  if (!/^\d{6}$/.test(otp)) {
    showNotice("Enter a valid six-digit code.", "error");
    return;
  }

  setLoading(button, true, "Verifying...");

  try {
    const result = await apiRequest(
      "/auth/otp/verify",
      {
        userId: state.userId,
        identityId: state.emailIdentityId,
        destinationType: "EMAIL",
        destination: state.email,
        otp
      }
    );

    if (!result.verified) {
      throw new Error("Email verification was not completed.");
    }

    state.registrationStep = "COMPLETE";
    stopOtpResendCountdown();

    $("otpView").classList.add("hidden");
    $("completeView").classList.remove("hidden");
    $("dot3").classList.add("active");

    showNotice("Email verified successfully.", "success");

    await sendPasswordSetupEmail();
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    setLoading(button, false);
  }
});

$("backToLogin").addEventListener("click", () => {
  stopOtpResendCountdown();

  $("completeView").classList.add("hidden");
  $("otpView").classList.add("hidden");
  $("registrationFormView").classList.remove("hidden");

  $("registrationForm").reset();
  $("otpForm").reset();

  state.userId = null;
  state.emailIdentityId = null;
  state.email = null;
  state.registrationStep = "FORM";

  setRegistrationMode("START");

  $("dot2").classList.remove("active");
  $("dot3").classList.remove("active");

  $("resendOtpButton").disabled = true;
  $("resendOtpButton").textContent = "Resend code (60s)";

  $("setupEmailStatus").textContent =
    "Your email is verified. Request your password setup email.";

  $("requestSetupEmailButton").disabled = false;
  $("requestSetupEmailButton").textContent =
    "Send password setup email";

  clearNotice();

  $("loginView").classList.remove("hidden");
  $("registerView").classList.add("hidden");
  $("tabs").classList.remove("hidden");
  $("loginTab").classList.add("active");
  $("registerTab").classList.remove("active");
});

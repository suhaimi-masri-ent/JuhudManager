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
  registrationStep: "FORM"
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

$("resendOtpButton").addEventListener("click", resendRegistrationOtp);

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

    const email = $("registerEmail").value.trim();

    const result = await apiRequest(
      "/auth/register/start",
      {
        fullName: $("fullName").value.trim(),
        countryCode: country,
        nationalId: $("nationalId").value.trim(),
        email,
        whatsapp: $("whatsapp").value.trim()
      }
    );

    state.userId = result.userId;
    state.emailIdentityId = result.identities?.email?.identityId;
    state.email = email;

    if (!state.userId || !state.emailIdentityId) {
      throw new Error(
        "Registration response is incomplete. Please contact support."
      );
    }

    const otpResult = await apiRequest(
      "/auth/otp/request",
      {
        userId: state.userId,
        identityId: state.emailIdentityId,
        destinationType: "EMAIL",
        destination: state.email
      }
    );

    state.registrationStep = "OTP";

    $("registrationFormView").classList.add("hidden");
    $("otpView").classList.remove("hidden");
    $("otpDestination").textContent = state.email;
    $("dot2").classList.add("active");

    startOtpResendCountdown(otpResult.resendAfterSeconds || 60);

    showNotice(
      "Verification code requested. Please check your email.",
      "success"
    );
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    setLoading(button, false);
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

    /*
     * OTP has been verified and consumed.
     * A password setup email failure must not require OTP again.
     */
    state.registrationStep = "COMPLETE";
    stopOtpResendCountdown();

    $("otpView").classList.add("hidden");
    $("completeView").classList.remove("hidden");
    $("dot3").classList.add("active");

    showNotice("Email verified successfully.", "success");

    // This helper handles its own error and leaves retry available.
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

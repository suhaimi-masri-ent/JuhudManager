
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const PASSWORD_SETUP_PAGE =
  "https://suhaimi-masri-ent.github.io/JuhudManager/v2/web/password-setup.html";

const DEFAULT_FROM_EMAIL = "noreply@juhud.run.place";
const DEFAULT_FROM_NAME = "JuhudManager";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createSender(env) {
  const email = String(
    env.BREVO_FROM_EMAIL ?? DEFAULT_FROM_EMAIL
  ).trim();

  const name = String(
    env.BREVO_FROM_NAME ?? DEFAULT_FROM_NAME
  )
    .trim()
    .replace(/[<>"]/g, "");

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error(
      "A valid BREVO_FROM_EMAIL is required."
    );
  }

  return { name, email };
}

function buildEmail(message) {
  const {
    purpose,
    otp,
    activationToken,
    expiresInMinutes
  } = message;

  if (purpose === "REGISTER") {
    if (!/^\d{6}$/.test(String(otp ?? ""))) {
      throw new Error("A valid registration OTP is required.");
    }

    const subject = "Your JuhudManager verification code";

    const text = [
      "Assalamualaikum,",
      "",
      "Your JuhudManager registration verification code is:",
      "",
      otp,
      "",
      `This code expires in ${expiresInMinutes} minutes.`,
      "Do not share this code with anyone.",
      "",
      "If you did not request this code, you can ignore this email.",
      "",
      "JuhudManager"
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.6;color:#222">
        <h2>JuhudManager</h2>
        <p>Assalamualaikum,</p>
        <p>Your registration verification code is:</p>
        <p style="font-size:30px;font-weight:bold;letter-spacing:6px">
          ${escapeHtml(otp)}
        </p>
        <p>This code expires in
          <strong>${escapeHtml(expiresInMinutes)} minutes</strong>.
        </p>
        <p>Do not share this code with anyone.</p>
        <p>If you did not request this code, you can ignore this email.</p>
        <p>JuhudManager</p>
      </div>
    `;

    return { subject, text, html };
  }

  if (purpose === "PASSWORD_SETUP") {
    if (
      typeof activationToken !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(activationToken)
    ) {
      throw new Error("A valid password setup token is required.");
    }

    const setupUrl = new URL(PASSWORD_SETUP_PAGE);
    setupUrl.searchParams.set("token", activationToken);

    const setupLink = setupUrl.toString();

    const subject = "Set your JuhudManager password";

    const text = [
      "Assalamualaikum,",
      "",
      "Your JuhudManager email has been verified.",
      "",
      "Please use the link below to create your account password:",
      "",
      setupLink,
      "",
      `This link expires in ${expiresInMinutes} minutes.`,
      "It can only be used once.",
      "",
      "If you did not request this password setup, you can ignore this email.",
      "",
      "JuhudManager"
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.6;color:#222">
        <h2>JuhudManager</h2>
        <p>Assalamualaikum,</p>
        <p>Your email address has been verified.</p>
        <p>Please continue by creating your account password.</p>
        <p style="margin:28px 0">
          <a
            href="${escapeHtml(setupLink)}"
            style="display:inline-block;padding:12px 22px;background:#166534;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold"
          >
            Set My Password
          </a>
        </p>
        <p>If the button does not work, copy and open this link:</p>
        <p style="word-break:break-all">
          <a href="${escapeHtml(setupLink)}">
            ${escapeHtml(setupLink)}
          </a>
        </p>
        <p>
          This link expires in
          <strong>${escapeHtml(expiresInMinutes)} minutes</strong>
          and can only be used once.
        </p>
        <p>If you did not request this password setup, you can ignore this email.</p>
        <p>JuhudManager</p>
      </div>
    `;

    return { subject, text, html };
  }

  // Legacy purpose retained for compatibility.
  if (purpose === "ACCOUNT_ACTIVATION") {
    if (
      typeof activationToken !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(activationToken)
    ) {
      throw new Error("A valid account activation token is required.");
    }

    const subject = "Activate your JuhudManager account";

    const text = [
      "Assalamualaikum,",
      "",
      "Your JuhudManager account is ready for activation.",
      "",
      "Use the activation token below to set your initial password:",
      "",
      activationToken,
      "",
      `This token expires in ${expiresInMinutes} minutes.`,
      "The token can only be used once.",
      "",
      "If you did not request this activation, you can ignore this email.",
      "",
      "JuhudManager"
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;line-height:1.6;color:#222">
        <h2>JuhudManager account activation</h2>
        <p>Assalamualaikum,</p>
        <p>Your account is ready for activation.</p>
        <p>Use this activation token to set your initial password:</p>
        <div style="padding:16px;background:#f3f4f6;border-radius:8px;word-break:break-all;font-family:monospace">
          ${escapeHtml(activationToken)}
        </div>
        <p>This token expires in
          <strong>${escapeHtml(expiresInMinutes)} minutes</strong>
          and can only be used once.
        </p>
        <p>If you did not request this activation, you can ignore this email.</p>
        <p>JuhudManager</p>
      </div>
    `;

    return { subject, text, html };
  }

  throw new Error("Unsupported email delivery purpose.");
}

/**
 * Create a Brevo transactional email delivery adapter.
 *
 * Required Worker secret:
 * - BREVO_API_KEY
 *
 * Optional Worker variables:
 * - BREVO_FROM_EMAIL
 * - BREVO_FROM_NAME
 *
 * Default sender:
 * - noreply@juhud.run.place
 * - JuhudManager
 *
 * Supported purposes:
 * - REGISTER
 * - PASSWORD_SETUP
 * - ACCOUNT_ACTIVATION (legacy)
 *
 * WhatsApp delivery is intentionally not handled here.
 */
export function createBrevoDelivery(env) {
  return {
    async send(message) {
      if (!env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is not configured.");
      }

      if (message?.destinationType !== "EMAIL") {
        throw new Error(
          "Brevo email adapter only supports EMAIL destinations."
        );
      }

      const destination = String(
        message.destination ?? ""
      ).trim();

      if (
        !destination ||
        destination.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)
      ) {
        throw new Error("A valid email destination is required.");
      }

      const expiresInMinutes = Number(
        message.expiresInMinutes
      );

      if (
        !Number.isInteger(expiresInMinutes) ||
        expiresInMinutes < 1 ||
        expiresInMinutes > 60
      ) {
        throw new Error("A valid email expiry period is required.");
      }

      const email = buildEmail({
        ...message,
        expiresInMinutes
      });

      const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          sender: createSender(env),
          to: [
            {
              email: destination
            }
          ],
          subject: email.subject,
          textContent: email.text,
          htmlContent: email.html
        })
      });

      if (!response.ok) {
        // Do not expose provider response details or credentials.
        throw new Error(
          `Brevo email delivery failed with HTTP ${response.status}.`
        );
      }

      const result = await response.json();

      if (!result?.messageId) {
        throw new Error(
          "Brevo did not return an email message ID."
        );
      }

      return {
        delivered: true,
        provider: "BREVO",
        messageId: result.messageId
      };
    }
  };
}

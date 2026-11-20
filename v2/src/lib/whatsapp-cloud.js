
const DEFAULT_API_VERSION = "v27.0";

function requiredValue(value, name) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error(`${name} is not configured.`);
  }

  return normalized;
}

function validatePhoneNumber(value) {
  const phone = String(value ?? "").trim();

  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error("A valid E.164 WhatsApp number is required.");
  }

  return phone.slice(1);
}

function validateOtp(message) {
  if (!/^\d{6}$/.test(String(message?.otp ?? ""))) {
    throw new Error("A valid six-digit OTP is required.");
  }

  const expiry = Number(message.expiresInMinutes);

  if (!Number.isInteger(expiry) || expiry < 1 || expiry > 90) {
    throw new Error("A valid OTP expiry period is required.");
  }

  return String(message.otp);
}

export function createWhatsAppCloudDelivery(env) {
  return {
    async send(message) {
      if (message?.destinationType !== "WHATSAPP") {
        throw new Error(
          "WhatsApp adapter only supports WHATSAPP destinations."
        );
      }

      if (message?.purpose !== "REGISTER") {
        throw new Error(
          "Unsupported WhatsApp message purpose."
        );
      }

      const accessToken = requiredValue(
        env.WHATSAPP_ACCESS_TOKEN,
        "WHATSAPP_ACCESS_TOKEN"
      );

      const phoneNumberId = requiredValue(
        env.WHATSAPP_PHONE_NUMBER_ID,
        "WHATSAPP_PHONE_NUMBER_ID"
      );

      const templateName = requiredValue(
        env.WHATSAPP_OTP_TEMPLATE_NAME,
        "WHATSAPP_OTP_TEMPLATE_NAME"
      );

      const languageCode = requiredValue(
        env.WHATSAPP_OTP_TEMPLATE_LANGUAGE,
        "WHATSAPP_OTP_TEMPLATE_LANGUAGE"
      );

      const apiVersion = String(
        env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION
      ).trim();

      if (!/^v\d+\.\d+$/.test(apiVersion)) {
        throw new Error("Invalid WhatsApp Graph API version.");
      }

      if (!/^[a-z0-9_]{1,60}$/.test(templateName)) {
        throw new Error("Invalid WhatsApp OTP template name.");
      }

      if (!/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(languageCode)) {
        throw new Error("Invalid WhatsApp template language.");
      }

      const destination = validatePhoneNumber(
        message.destination
      );

      const otp = validateOtp(message);

      const endpoint =
        `https://graph.facebook.com/${apiVersion}/` +
        `${encodeURIComponent(phoneNumberId)}/messages`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: destination,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: otp
                  }
                ]
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                  {
                    type: "text",
                    text: otp
                  }
                ]
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error(
          `WhatsApp delivery failed with HTTP ${response.status}.`
        );
      }

      const result = await response.json();
      const messageId = result?.messages?.[0]?.id;

      if (!messageId) {
        throw new Error(
          "WhatsApp did not return a message ID."
        );
      }

      return {
        delivered: true,
        provider: "META_WHATSAPP_CLOUD_API",
        messageId
      };
    }
  };
}

import { json } from "../lib/http.js";
import { requestRegistrationOtp, verifyRegistrationOtp } from "../auth/otp.js";

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function errorResponse(error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  return json({
    error: status === 500 ? "Authentication service unavailable." : error.message
  }, status);
}

export async function handleAuthRequest(request, env, url) {
  if (url.pathname === "/auth/otp/request" && request.method === "POST") {
    const body = await readJson(request);
    if (!body || !["EMAIL", "WHATSAPP"].includes(body.destinationType) || !body.destination) {
      return json({ error: "destinationType and destination are required." }, 400);
    }

    try {
      const result = await requestRegistrationOtp({
        db: env.DB,
        env,
        destinationType: body.destinationType,
        destination: body.destination
      });
      return json({ ok: true, ...result }, 202);
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (url.pathname === "/auth/otp/verify" && request.method === "POST") {
    const body = await readJson(request);
    if (!body || !["EMAIL", "WHATSAPP"].includes(body.destinationType) || !body.destination || !body.otp) {
      return json({ error: "destinationType, destination and otp are required." }, 400);
    }

    try {
      const result = await verifyRegistrationOtp({
        db: env.DB,
        env,
        destinationType: body.destinationType,
        destination: body.destination,
        otp: body.otp
      });
      return json({ ok: true, ...result });
    } catch (error) {
      return errorResponse(error);
    }
  }

  return null;
}

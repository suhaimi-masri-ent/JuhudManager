

import {
  hashValue,
  normalizeDestination
} from "./crypto.js";

export function nowIso() {
  return new Date().toISOString();
}

export function plusSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

export function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function normalizeEmail(destination) {
  try {
    return normalizeDestination("EMAIL", destination);
  } catch (error) {
    throw httpError(error.message, 400);
  }
}

export function requireEmailDestination(destinationType) {
  if (destinationType !== "EMAIL") {
    throw httpError(
      "Only email OTP verification is currently supported.",
      400
    );
  }
}

export function requireOtpSecrets(env) {
  if (!env.HMAC_SECRET || !env.OTP_HASH_SECRET) {
    throw new Error("Authentication secrets are not configured.");
  }
}

export async function calculateEmailHashes(env, normalized) {
  const identityHash = await hashValue(
    env.HMAC_SECRET,
    `EMAIL:GLOBAL:${normalized}`
  );

  const destinationHash = await hashValue(
    env.HMAC_SECRET,
    `EMAIL:${normalized}`
  );

  return { identityHash, destinationHash };
}

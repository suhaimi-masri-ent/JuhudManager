const encoder = new TextEncoder();

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function requireSecret(value, name) {
  if (!value) throw new Error(`Missing Worker secret: ${name}`);
  return value;
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(requireSecret(secret, "HMAC_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizeDestination(type, value) {
  const input = String(value ?? "").trim();

  if (type === "EMAIL") {
    const normalized = input.toLowerCase();
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new TypeError("A valid email address is required.");
    }
    return normalized;
  }

  if (type === "WHATSAPP") {
    const normalized = input.replace(/[\s().-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      throw new TypeError("WhatsApp number must use E.164 format.");
    }
    return normalized;
  }

  throw new TypeError("Destination type must be EMAIL or WHATSAPP.");
}

export async function hashValue(secret, value) {
  return hmacHex(secret, value);
}

export async function hashOtp(secret, purpose, destinationHash, otp) {
  return hmacHex(secret, `otp:v1:${purpose}:${destinationHash}:${otp}`);
}

export async function encryptValue(secret, value) {
  const rawKey = decodeBase64Url(requireSecret(secret, "ENCRYPTION_KEY"));
  if (rawKey.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }

  const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value)
  );

  return `${encodeBase64Url(iv)}.${encodeBase64Url(new Uint8Array(ciphertext))}`;
}

export function generateOtp() {
  const limit = Math.floor(0x100000000 / 1000000) * 1000000;
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);

  return String(value[0] % 1000000).padStart(6, "0");
}

export function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

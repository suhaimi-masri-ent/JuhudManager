
const encoder = new TextEncoder();

export function toHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function fromHex(hex) {
  if (
    typeof hex !== "string" ||
    !/^[0-9a-f]+$/i.test(hex) ||
    hex.length % 2 !== 0
  ) {
    throw new Error("Invalid hexadecimal value");
  }

  return new Uint8Array(
    hex.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );
}

export async function sha256(value) {
  const result = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(value)
  );

  return toHex(result);
}

export async function derivePasswordBits(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    key,
    256
  );
}

export async function verifyPassword(password, saltHex, storedHash) {
  try {
    const parts = storedHash.split("$");

    if (
      parts.length !== 3 ||
      parts[0] !== "pbkdf2-sha256" ||
      parts[1] !== "100000"
    ) {
      return false;
    }

    const salt = fromHex(saltHex);
    const expectedHash = fromHex(parts[2]);

    if (salt.length !== 16 || expectedHash.length !== 32) {
      return false;
    }

    const derived = new Uint8Array(
      await derivePasswordBits(password, salt)
    );

    let difference = 0;

    for (let i = 0; i < expectedHash.length; i++) {
      difference |= derived[i] ^ expectedHash[i];
    }

    return difference === 0;
  } catch {
    return false;
  }
}

export function generateSessionToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashEmail(env, email) {
  const keyBytes = fromHex(env.HASH_KEY);

  if (keyBytes.length !== 32) {
    throw new Error("HASH_KEY must be 32 bytes");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const normalizedEmail = email.trim().toLowerCase();

  const result = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(normalizedEmail)
  );

  return toHex(result);
}

export async function encryptEmail(env, email) {
  const keyBytes = fromHex(env.EMAIL_ENCRYPTION_KEY);

  if (keyBytes.length !== 32) {
    throw new Error("EMAIL_ENCRYPTION_KEY must be 32 bytes");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const normalizedEmail = email.trim().toLowerCase();

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(normalizedEmail)
  );

  return "v2:" + toHex(iv) + ":" + toHex(encrypted);
}

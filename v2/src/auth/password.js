
import argon2Wasm from "@shtora/argon2w/wasm";
import {
  configureWasm,
  hash,
  verify,
  parsePHC
} from "@shtora/argon2w";

// Initialize the Argon2 WASM runtime before using hash or verify.
configureWasm(argon2Wasm);

export const PASSWORD_POLICY = Object.freeze({
  algorithm: "argon2id",
  version: 19,
  memoryCost: 19456,
  timeCost: 3,
  parallelism: 1,
  saltLength: 16,
  hashLength: 32,
  minimumCharacters: 12,
  maximumUtf8Bytes: 1024
});

const VERIFY_LIMITS = Object.freeze({
  maxMemoryKib: 32768,
  maxTimeCost: 4,
  maxParallelism: 1
});

const encoder = new TextEncoder();

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Validate a new password.
 *
 * Passwords are not trimmed or normalized.
 * Whitespace is significant and remains part of the password.
 */
export function validatePassword(password) {
  if (typeof password !== "string") {
    throw httpError("Password must be a string.", 400);
  }

  const characterCount = Array.from(password).length;
  const byteCount = encoder.encode(password).length;

  if (characterCount < PASSWORD_POLICY.minimumCharacters) {
    throw httpError(
      `Password must contain at least ${PASSWORD_POLICY.minimumCharacters} characters.`,
      400
    );
  }

  if (byteCount > PASSWORD_POLICY.maximumUtf8Bytes) {
    throw httpError(
      "Password exceeds the maximum permitted size.",
      400
    );
  }

  return {
    characterCount,
    byteCount
  };
}

/**
 * Check whether a stored PHC string uses an acceptable
 * Argon2id configuration before expensive verification.
 */
export function isAcceptablePasswordHash(encoded) {
  if (
    typeof encoded !== "string" ||
    encoded.length === 0 ||
    encoded.length > 512
  ) {
    return false;
  }

  try {
    const parameters = parsePHC(encoded);

    return (
      parameters.type === "argon2id" &&
      parameters.version === PASSWORD_POLICY.version &&
      parameters.memoryCost >= PASSWORD_POLICY.memoryCost &&
      parameters.memoryCost <= VERIFY_LIMITS.maxMemoryKib &&
      parameters.timeCost >= PASSWORD_POLICY.timeCost &&
      parameters.timeCost <= VERIFY_LIMITS.maxTimeCost &&
      parameters.parallelism === PASSWORD_POLICY.parallelism
    );
  } catch {
    return false;
  }
}

/**
 * Generate a PHC-encoded Argon2id password hash.
 */
export async function hashPassword(password) {
  validatePassword(password);

  const encoded = await hash(password, {
    profile: "standard"
  });

  if (!isAcceptablePasswordHash(encoded)) {
    throw new Error(
      "Generated password hash does not match the approved Argon2id policy."
    );
  }

  return encoded;
}

/**
 * Verify a password against a stored PHC-encoded hash.
 */
export async function verifyPassword(password, encoded) {
  if (
    typeof password !== "string" ||
    encoder.encode(password).length >
      PASSWORD_POLICY.maximumUtf8Bytes
  ) {
    return false;
  }

  if (!isAcceptablePasswordHash(encoded)) {
    return false;
  }

  return verify(encoded, password, VERIFY_LIMITS);
}

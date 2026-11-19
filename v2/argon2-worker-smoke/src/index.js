
import argon2Wasm from "@shtora/argon2w/wasm";
import {
  configureWasm,
  hash,
  verify
} from "@shtora/argon2w";

configureWasm(argon2Wasm);

const TEST_PASSWORD = "JuhudManager-Argon2-Smoke-Test-Only";

const STANDARD_PROFILE = {
  memoryCost: 19456,
  timeCost: 3,
  parallelism: 1
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function encodeToken(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeToken(token) {
  const base64 = token
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(
    binary,
    character => character.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return jsonResponse({
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      }, 405);
    }

    if (url.pathname === "/") {
      return jsonResponse({
        ok: true,
        purpose: "Argon2id hash and verify tests",
        profile: "standard",
        endpoints: [
          "/hash/standard",
          "/verify/standard?token=HASH_TOKEN&case=correct",
          "/verify/standard?token=HASH_TOKEN&case=wrong"
        ]
      });
    }

    if (url.pathname === "/hash/standard") {
      try {
        const encoded = await hash(TEST_PASSWORD, {
          profile: "standard"
        });

        return jsonResponse({
          ok: true,
          operation: "hash",
          algorithm: "Argon2id",
          profile: "standard",
          parameters: STANDARD_PROFILE,
          hashFormat: encoded.split("$").slice(0, 3).join("$"),
          hashToken: encodeToken(encoded),
          purpose: "Test only. Do not use this hash for real accounts."
        });
      } catch (error) {
        return jsonResponse({
          ok: false,
          operation: "hash",
          error: "ARGON2_HASH_FAILED",
          details: {
            name: error?.name || "Error",
            message: error?.message || "Unknown error"
          }
        }, 500);
      }
    }

    if (url.pathname === "/verify/standard") {
      const token = url.searchParams.get("token");
      const testCase = url.searchParams.get("case");

      if (!token || !["correct", "wrong"].includes(testCase)) {
        return jsonResponse({
          ok: false,
          error: "INVALID_TEST_PARAMETERS",
          required: {
            token: "Hash token returned by /hash/standard",
            case: "correct or wrong"
          }
        }, 400);
      }

      try {
        const encoded = decodeToken(token);

        const password = testCase === "correct"
          ? TEST_PASSWORD
          : "Definitely-Wrong-Password";

        const accepted = await verify(encoded, password, {
          maxMemoryKib: STANDARD_PROFILE.memoryCost,
          maxTimeCost: STANDARD_PROFILE.timeCost,
          maxParallelism: STANDARD_PROFILE.parallelism
        });

        const expected = testCase === "correct";
        const passed = accepted === expected;

        return jsonResponse({
          ok: passed,
          operation: "verify",
          profile: "standard",
          testCase,
          passwordAccepted: accepted,
          expectedPasswordAccepted: expected,
          purpose: "Cloudflare Workers CPU compatibility test only"
        });
      } catch (error) {
        return jsonResponse({
          ok: false,
          operation: "verify",
          error: "ARGON2_VERIFY_FAILED",
          details: {
            name: error?.name || "Error",
            message: error?.message || "Unknown error"
          }
        }, 500);
      }
    }

    return jsonResponse({
      ok: false,
      error: "NOT_FOUND"
    }, 404);
  }
};

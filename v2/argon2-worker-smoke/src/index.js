import argon2Wasm from "@shtora/argon2w/wasm";
import {
  configureWasm,
  hash,
  verify
} from "@shtora/argon2w";

configureWasm(argon2Wasm);

const TEST_PASSWORD = "JuhudManager-Argon2-Smoke-Test-Only";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
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

    if (url.pathname !== "/") {
      return jsonResponse({
        ok: false,
        error: "NOT_FOUND"
      }, 404);
    }

    try {
      const encoded = await hash(TEST_PASSWORD, {
        profile: "experimental"
      });

      const correctPasswordAccepted = await verify(
        encoded,
        TEST_PASSWORD
      );

      const wrongPasswordRejected = !(await verify(
        encoded,
        "Definitely-Wrong-Password"
      ));

      return jsonResponse({
        ok: correctPasswordAccepted && wrongPasswordRejected,
        algorithm: "Argon2id",
        hashFormat: encoded.split("$").slice(0, 3).join("$"),
        correctPasswordAccepted,
        wrongPasswordRejected,
        profile: "experimental",
        purpose: "Cloudflare Workers compatibility smoke test only"
      });
    } catch (error) {
      return jsonResponse({
        ok: false,
        error: "ARGON2_SMOKE_TEST_FAILED",
        details: {
          name: error?.name || "Error",
          message: error?.message || "Unknown error"
        }
      }, 500);
    }
  }
};

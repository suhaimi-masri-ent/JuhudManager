
import argon2Wasm from "@shtora/argon2w/wasm";
import {
  configureWasm,
  hash
} from "@shtora/argon2w";

configureWasm(argon2Wasm);

const TEST_PASSWORD = "JuhudManager-Argon2-Smoke-Test-Only";

const PROFILES = {
  experimental: {
    memoryCost: 2048,
    timeCost: 1,
    parallelism: 1
  },
  m8t2: {
    memoryCost: 8192,
    timeCost: 2,
    parallelism: 1
  },
  m16t2: {
    memoryCost: 16384,
    timeCost: 2,
    parallelism: 1
  },
  standard: {
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1
  }
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

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return jsonResponse({
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      }, 405);
    }

    const match = url.pathname.match(/^\/hash\/([a-z0-9]+)$/);

    if (!match) {
      return jsonResponse({
        ok: true,
        purpose: "Argon2id CPU compatibility test",
        availableProfiles: Object.keys(PROFILES),
        usage: "/hash/m8t2"
      });
    }

    const profile = match[1];
    const parameters = PROFILES[profile];

    if (!parameters) {
      return jsonResponse({
        ok: false,
        error: "UNKNOWN_PROFILE",
        availableProfiles: Object.keys(PROFILES)
      }, 400);
    }

    try {
      const encoded = await hash(TEST_PASSWORD, {
        profile
      });

      return jsonResponse({
        ok: true,
        algorithm: "Argon2id",
        profile,
        parameters,
        hashFormat: encoded.split("$").slice(0, 3).join("$"),
        purpose: "Cloudflare Workers CPU compatibility test only"
      });
    } catch (error) {
      return jsonResponse({
        ok: false,
        error: "ARGON2_HASH_FAILED",
        profile,
        details: {
          name: error?.name || "Error",
          message: error?.message || "Unknown error"
        }
      }, 500);
    }
  }
};

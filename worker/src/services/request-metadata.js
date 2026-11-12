import { sha256 } from "../utils/crypto.js";

export async function getRequestMetadata(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const userAgent = request.headers.get("User-Agent") || "";

  let browser = "Unknown";

  if (/Edg\//i.test(userAgent)) {
    browser = "Edge";
  } else if (/OPR\/|Opera/i.test(userAgent)) {
    browser = "Opera";
  } else if (/Firefox\//i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Chrome\//i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari\//i.test(userAgent)) {
    browser = "Safari";
  }

  let os = "Unknown";

  if (/Android/i.test(userAgent)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
  } else if (/Windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
  }

  let device = "Desktop";

  if (/iPad|Tablet/i.test(userAgent)) {
    device = "Tablet";
  } else if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) {
    device = "Mobile";
  }

  return {
    ip_hash: ip ? await sha256(ip) : null,
    browser,
    os,
    device,
    country: request.headers.get("CF-IPCountry") || null,
    ray_id: request.headers.get("CF-Ray") || null
  };
}

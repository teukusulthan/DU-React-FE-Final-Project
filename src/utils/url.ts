import api from "../api/client";

export function toAbsoluteUrl(input?: string | null): string | undefined {
  if (!input) return undefined;

  let u = String(input).trim();
  if (!u) return undefined;

  if (/^(https?:)?\/\//i.test(u) || /^data:/i.test(u) || /^blob:/i.test(u)) {
    return u;
  }

  const base =
    api.defaults.baseURL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const urlObj = new URL(
    base,
    typeof window !== "undefined" ? window.location.origin : undefined
  );
  const origin = urlObj.origin;

  u = u
    .replace(/\\/g, "/")
    .replace(/^\.?\/*/, "/")
    .replace(/^\/?public\/+/, "/")
    .replace(/^\/?uploads\/+/, "/uploads/");

  const abs = `${origin}${u.startsWith("/") ? "" : "/"}${u}`.replace(
    /([^:]\/)\/+/g,
    "$1"
  );
  return abs;
}

export function safeAbsolute(input?: string | null): string | undefined {
  const t = typeof input === "string" ? input.trim() : "";
  if (!t) return undefined;
  return toAbsoluteUrl(t);
}

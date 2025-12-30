// client/src/api/http.ts
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

type ApiErrorShape = { message?: string };

function isApiErrorShape(v: unknown): v is ApiErrorShape {
  return typeof v === "object" && v !== null && "message" in v;
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = buildUrl(path);

  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers ?? {});

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // ✅ only set JSON header if body is NOT FormData
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  // handle empty responses
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (isApiErrorShape(data)) throw new Error(data.message || "Request failed");
    throw new Error("Request failed");
  }

  return data as T;
}

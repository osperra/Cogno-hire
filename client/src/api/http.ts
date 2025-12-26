// client/src/api/http.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

type ApiErrorShape = { message?: string };

function isApiErrorShape(v: unknown): v is ApiErrorShape {
  return typeof v === "object" && v !== null && "message" in v;
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  const text = await res.text();
  let json: unknown = null;

  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    // backend returned non-json
  }

  if (!res.ok) {
    const msg =
      isApiErrorShape(json) && typeof json.message === "string"
        ? json.message
        : `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return json as T;
}

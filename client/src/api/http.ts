const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

type ApiErrorShape = { message?: string; error?: string };

function isApiErrorShape(v: unknown): v is ApiErrorShape {
  return typeof v === "object" && v !== null && ("message" in v || "error" in v);
}

function joinUrl(base: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

type SafeBody = {
  asJson?: unknown;
  asText: string;
  contentType: string;
};

async function readBodySafely(res: Response): Promise<SafeBody> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  const trimmed = text.trim();
  const looksJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  const isJson = contentType.includes("application/json") || looksJson;

  if (isJson) {
    try {
      return { asJson: JSON.parse(text) as unknown, asText: text, contentType };
    } catch {
      // fall back to text
    }
  }

  return { asText: text, contentType };
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const url = joinUrl(API_BASE, path);
  const token = localStorage.getItem("token");

  const headers = new Headers(init.headers ?? {});

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const { asJson, asText, contentType } = await readBodySafely(res);

  if (!res.ok) {
    const serverMsg =
      asJson && isApiErrorShape(asJson) ? (asJson.message || asJson.error || "") : "";

    const trimmed = asText.trim();
    const isHtml =
      contentType.includes("text/html") ||
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html") ||
      trimmed.startsWith("<pre");

    const hint = isHtml
      ? " (Got HTML instead of JSON. Usually: wrong API base URL, missing route mount, or auth redirect.)"
      : "";

    const snippet = asText.slice(0, 200).replace(/\s+/g, " ").trim();

    const msg =
      serverMsg ||
      `API ${res.status} ${res.statusText} for ${url}${hint}${snippet ? ` | Response: ${snippet}` : ""}`;

    throw new Error(String(msg));
  }

  if (asJson !== undefined) return asJson as T;
  return asText as unknown as T;
}

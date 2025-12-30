const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || "http://localhost:5000";

type ApiErrorShape = { message?: string };

function isApiErrorShape(v: unknown): v is ApiErrorShape {
  return typeof v === "object" && v !== null && "message" in v;
}

function getToken(): string | null {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export class ApiError extends Error {
  status: number;
  url: string;
  response: { data: unknown; text: string };

  constructor(args: { message: string; status: number; url: string; data: unknown; text: string }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.url = args.url;
    this.response = { data: args.data, text: args.text };
  }
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const url = joinUrl(API_BASE, path);

  const isFormData =
    typeof FormData !== "undefined" && opts.body instanceof FormData;

  const headers: Record<string, string> = {};

  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...opts,
    credentials: opts.credentials ?? "include",
    headers: {
      ...headers,
      ...(opts.headers as Record<string, string> | undefined),
    },
  });

  const text = await res.text();
  let json: unknown = null;

  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    // non-json
  }

  if (!res.ok) {
    const msg =
      isApiErrorShape(json) && typeof json.message === "string"
        ? json.message
        : text || `Request failed: ${res.status}`;

    throw new ApiError({ message: msg, status: res.status, url, data: json, text });
  }

  return json as T;
}

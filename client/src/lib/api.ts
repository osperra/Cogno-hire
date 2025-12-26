const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getToken() {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  opts: RequestInit & { json?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(opts.headers);

  if (opts.json !== undefined) headers.set("Content-Type", "application/json");
  if (opts.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = typeof data === "object" && data?.message ? data.message : String(data);
    throw new Error(msg);
  }
  return data as T;
}

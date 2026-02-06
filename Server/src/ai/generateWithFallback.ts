// Server/src/ai/generateWithFallback.ts
type ProviderName = "gemini" | "groq" | "ollama";

class ProviderError extends Error {
  provider: ProviderName;
  status?: number;
  retryable: boolean;

  constructor(provider: ProviderName, message: string, opts?: { status?: number; retryable?: boolean }) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.status = opts?.status;
    this.retryable = !!opts?.retryable;
  }
}

function isRetryableStatus(status?: number) {
  return status === 429 || status === 408 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 20000, ...rest } = init;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function getEnv() {
  return {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",

    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
    GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-8b-instant",

    OLLAMA_HOST: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5:3b-instruct",
  };
}

async function callGemini(prompt: string) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();
  if (!GEMINI_API_KEY) throw new ProviderError("gemini", "GEMINI_API_KEY missing", { retryable: false });

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent` +
    `?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    timeoutMs: 20000,
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 650,
      },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `${res.status} ${res.statusText}`;
    throw new ProviderError("gemini", msg, { status: res.status, retryable: isRetryableStatus(res.status) });
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("")?.trim() || "";

  if (!text) throw new ProviderError("gemini", "Empty output", { retryable: true });
  return text;
}

async function callGroq(prompt: string) {
  const { GROQ_API_KEY, GROQ_MODEL } = getEnv();
  if (!GROQ_API_KEY) throw new ProviderError("groq", "GROQ_API_KEY missing", { retryable: false });

  const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    timeoutMs: 15000,
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "Return only plain text. No markdown fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 650,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `${res.status} ${res.statusText}`;
    throw new ProviderError("groq", msg, { status: res.status, retryable: isRetryableStatus(res.status) });
  }

  const text = String(data?.choices?.[0]?.message?.content || "").trim();
  if (!text) throw new ProviderError("groq", "Empty output", { retryable: true });
  return text;
}

async function callOllama(prompt: string) {
  const { OLLAMA_HOST, OLLAMA_MODEL } = getEnv();
  const url = `${OLLAMA_HOST.replace(/\/$/, "")}/api/generate`;

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    timeoutMs: 30000,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 520,
      },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error || data?.message || `${res.status} ${res.statusText}`;
    throw new ProviderError("ollama", msg, { status: res.status, retryable: isRetryableStatus(res.status) });
  }

  const text = String(data?.response || "").trim();
  if (!text) throw new ProviderError("ollama", "Empty output", { retryable: true });
  return text;
}

async function tryProvider(provider: ProviderName, prompt: string) {
  if (provider === "gemini") return callGemini(prompt);
  if (provider === "groq") return callGroq(prompt);
  return callOllama(prompt);
}

export async function generateTextWithFallback(
  prompt: string,
  order: ProviderName[] = ["gemini", "groq", "ollama"],
) {
  const errors: Array<{ provider: ProviderName; message: string; status?: number }> = [];

  for (const p of order) {
    try {
      const text = await tryProvider(p, prompt);
      return { text, provider: p };
    } catch (e: any) {
      const pe =
        e instanceof ProviderError
          ? e
          : new ProviderError(p, e?.message || "Unknown error", { retryable: true });

      errors.push({ provider: pe.provider, message: pe.message, status: pe.status });

      if (!pe.retryable) break;
    }
  }

  const err = new Error("All providers failed") as any;
  err.providerErrors = errors;
  throw err;
}

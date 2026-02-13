import { Router, Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.js";

const router = Router();

type JobMatchInput = {
  id: string;
  title: string;
  description?: string;
  skills?: string[];
  techStack?: string[];
  location?: string;
  workType?: string;
  jobType?: string;
  experience?: number;
};

function getEnv(name: string) {
  return process.env[name] || "";
}

function clamp01To100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function guessMimeFromFormatOrUrl(x: string) {
  const u = x.toLowerCase();
  if (u.endsWith(".pdf") || u === "pdf") return "application/pdf";
  if (u.endsWith(".png") || u === "png") return "image/png";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg") || u === "jpg" || u === "jpeg")
    return "image/jpeg";
  if (u.endsWith(".webp") || u === "webp") return "image/webp";
  if (u.endsWith(".docx") || u === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (u.endsWith(".doc") || u === "doc") return "application/msword";
  return "application/octet-stream";
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, tries = 3) {
  let lastErr: any = null;

  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Failed to download file: ${r.status}`);
      return r;
    } catch (e: any) {
      lastErr = e;
      await sleep(400 * (i + 1));
    }
  }

  throw lastErr;
}

async function downloadAsBase64FromUrl(url: string) {
  const r = await fetchWithRetry(url, 3);
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString("base64");
}

// ✅ Create signed URL for Cloudinary authenticated/private
function getSignedCloudinaryUrl(args: {
  publicId: string;
  resourceType?: "raw" | "image";
  format?: string;
}) {
  const { publicId, resourceType = "raw", format } = args;

  // short-lived URL
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 5;

  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
    ...(format ? { format } : {}),
  });
}

async function geminiGenerateText(prompt: string) {
  const key = getEnv("GEMINI_API_KEY");
  const model = getEnv("GEMINI_MODEL") || "gemini-2.5-flash-lite";

  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    const err = new Error(`Gemini error ${resp.status}: ${t}`);
    (err as any).status = resp.status;
    throw err;
  }

  const data = (await resp.json()) as any;
  return (
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") ||
    ""
  );
}

async function geminiExtractFromFileInline(args: {
  mimeType: string;
  base64: string;
}) {
  const key = getEnv("GEMINI_API_KEY");
  const model = getEnv("GEMINI_MODEL") || "gemini-2.5-flash-lite";
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                "Extract ALL readable resume text. Return plain text only. Keep sections and bullets if possible.",
            },
            { inlineData: { mimeType: args.mimeType, data: args.base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    const err = new Error(`Gemini extract error ${resp.status}: ${t}`);
    (err as any).status = resp.status;
    throw err;
  }

  const data = (await resp.json()) as any;
  return (
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") ||
    ""
  );
}

/**
 * ✅ Simple in-memory cache:
 * key: resumePublicId -> resumeText
 * (You can later store in DB to persist.)
 */
const resumeTextCache = new Map<string, { text: string; at: number }>();
const RESUME_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function getCachedResumeText(resumePublicId: string) {
  const v = resumeTextCache.get(resumePublicId);
  if (!v) return null;
  if (Date.now() - v.at > RESUME_CACHE_TTL_MS) {
    resumeTextCache.delete(resumePublicId);
    return null;
  }
  return v.text;
}

function setCachedResumeText(resumePublicId: string, text: string) {
  resumeTextCache.set(resumePublicId, { text, at: Date.now() });
}

function heuristicMatch(resumeText: string, jobs: JobMatchInput[]) {
  const resume = resumeText.toLowerCase();
  const out: Record<string, number> = {};

  for (const j of jobs) {
    const skills = (j.skills ?? j.techStack ?? []).map(String).filter(Boolean);
    const bag = [
      j.title,
      j.description ?? "",
      skills.join(" "),
      j.location ?? "",
      j.workType ?? "",
      j.jobType ?? "",
    ]
      .join(" ")
      .toLowerCase();

    let hits = 0;
    let total = 0;

    for (const s of skills) {
      const k = s.toLowerCase().trim();
      if (!k) continue;
      total++;
      if (resume.includes(k)) hits++;
    }

    // basic blend: skills overlap + title similarity
    const titleTokens = String(j.title || "")
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    let titleHits = 0;
    for (const t of titleTokens) {
      if (resume.includes(t)) titleHits++;
    }

    const skillScore = total ? (hits / total) * 70 : 10;
    const titleScore = titleTokens.length
      ? (titleHits / titleTokens.length) * 30
      : 10;

    const score = clamp01To100(Math.round(skillScore + titleScore));
    out[j.id] = score;
  }

  return out;
}

// ✅ Resume extract supports either resumePublicId (recommended) OR resumeUrl (public only)
router.post("/resume/extract", async (req: Request, res: Response) => {
  try {
    const {
      resumePublicId,
      resumeUrl,
      resumeFormat,
      resumeResourceType,
    } = req.body as {
      resumePublicId?: string;
      resumeUrl?: string;
      resumeFormat?: string;
      resumeResourceType?: "raw" | "image";
    };

    if (!resumePublicId && !resumeUrl) {
      return res
        .status(400)
        .json({ message: "resumePublicId or resumeUrl is required" });
    }

    // ✅ cache by publicId if present
    if (resumePublicId) {
      const cached = getCachedResumeText(resumePublicId);
      if (cached) return res.json({ resumeText: cached, cached: true });
    }

    let base64 = "";
    let mimeType = "application/pdf";

    if (resumePublicId) {
      const signed = getSignedCloudinaryUrl({
        publicId: resumePublicId,
        resourceType: resumeResourceType || "raw",
        format: resumeFormat,
      });

      base64 = await downloadAsBase64FromUrl(signed);
      mimeType = guessMimeFromFormatOrUrl(resumeFormat || "pdf");
    } else {
      // only works if resumeUrl is PUBLIC
      base64 = await downloadAsBase64FromUrl(resumeUrl!);
      mimeType = guessMimeFromFormatOrUrl(resumeUrl!);
    }

    const resumeText = await geminiExtractFromFileInline({ mimeType, base64 });

    if (resumePublicId) setCachedResumeText(resumePublicId, resumeText);

    return res.json({ resumeText, cached: false });
  } catch (e: any) {
    console.error("AI_RESUME_EXTRACT_ERROR:", e?.message || e);
    return res.status(500).json({ message: "Failed to extract resume" });
  }
});

// ✅ Match batch: ONE request for many jobs (less quota)
// Also chunks if jobs are large.
router.post("/jobs/match-batch", async (req: Request, res: Response) => {
  try {
    const { resumeText, jobs } = req.body as {
      resumeText?: string;
      jobs?: JobMatchInput[];
    };

    if (!resumeText || !Array.isArray(jobs)) {
      return res.status(400).json({ message: "resumeText and jobs[] required" });
    }

    const cleanJobs = jobs
      .filter((j) => j && j.id && j.title)
      .slice(0, 30); // ✅ protect from huge batches

    // chunk into groups of 8 to avoid huge prompt
    const CHUNK = 8;

    const matches: Record<string, number> = {};

    for (let i = 0; i < cleanJobs.length; i += CHUNK) {
      const chunk = cleanJobs.slice(i, i + CHUNK);

      const payloadForPrompt = chunk.map((j) => ({
        id: j.id,
        title: j.title,
        description: (j.description || "").slice(0, 800),
        skills: (j.skills ?? j.techStack ?? []).map(String).filter(Boolean),
        location: j.location || j.workType || "",
        jobType: j.jobType || "",
        experience: typeof j.experience === "number" ? j.experience : null,
      }));

      const prompt = `
You are an ATS matching engine.
Given a RESUME and a list of JOBS, return JSON ONLY.

Return format:
{"matches":[{"id":"<jobId>","match":<0-100>}, ...]}

Rules:
- match is integer 0-100
- Output ONLY valid JSON. No extra text.

RESUME:
${resumeText.slice(0, 6000)}

JOBS:
${JSON.stringify(payloadForPrompt)}
`.trim();

      // ✅ retry on 429 (rate limit)
      let raw = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          raw = await geminiGenerateText(prompt);
          break;
        } catch (e: any) {
          const status = e?.status;
          if (status === 429 && attempt < 2) {
            await sleep(1200 * (attempt + 1));
            continue;
          }
          throw e;
        }
      }

      // parse JSON safely
      const jsonText = String(raw).trim();
      let parsed: any = null;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        // attempt to extract json block if model wrapped it
        const m = jsonText.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }

      const list: any[] = Array.isArray(parsed?.matches) ? parsed.matches : [];
      for (const item of list) {
        const id = String(item?.id || "").trim();
        const n = Number(item?.match);
        if (!id) continue;
        matches[id] = Number.isFinite(n) ? clamp01To100(Math.round(n)) : 0;
      }
    }

    // fallback heuristic if gemini returns nothing
    if (!Object.keys(matches).length) {
      const fallback = heuristicMatch(resumeText, cleanJobs);
      return res.json({ matches: fallback, fallback: true });
    }

    return res.json({ matches, fallback: false });
  } catch (e: any) {
    console.error("AI_MATCH_BATCH_ERROR:", e?.message || e);

    // If Gemini quota exhausted, return heuristic instead of 500
    const msg = String(e?.message || "");
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      try {
        const { resumeText, jobs } = req.body as {
          resumeText?: string;
          jobs?: JobMatchInput[];
        };

        const safeJobs = Array.isArray(jobs) ? jobs : [];
        const fallback = heuristicMatch(resumeText || "", safeJobs);
        return res.json({ matches: fallback, fallback: true });
      } catch {
        // ignore
      }
    }

    return res.status(500).json({ message: "Failed to match jobs" });
  }
});

export default router;

import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import mammoth from "mammoth";
import { cloudinary } from "../config/cloudinary.js";
import Document from "../models/Document.js";

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
  experience?: number;};

type ResolvedResume = {
  base64: string;





  
  mimeType: string;
  cacheKey: string;
};

function getEnv(name: string) {
  return process.env[name] || "";
}

function clamp01To100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function guessMimeFromFormatOrUrl(x: string) {
  const u = String(x || "").toLowerCase();
  if (u.endsWith(".pdf") || u === "pdf") return "application/pdf";
  if (u.endsWith(".docx") || u === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (u.endsWith(".doc") || u === "doc") return "application/msword";
  if (u.endsWith(".png") || u === "png") return "image/png";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg") || u === "jpg" || u === "jpeg")
    return "image/jpeg";
  if (u.endsWith(".webp") || u === "webp") return "image/webp";
  return "application/octet-stream";
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, tries = 2) {
  let lastErr: any = null;

  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) {
        throw Object.assign(new Error(`Failed to download file: ${r.status}`), {
          status: r.status,
          url,
        });
      }
      return r;
    } catch (e: any) {
      lastErr = e;
      await sleep(250 * (i + 1));
    }
  }

  throw lastErr;
}

async function downloadAsBase64FromUrl(url: string) {
  const r = await fetchWithRetry(url, 2);
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString("base64");
}

async function parsePdf(buf: Buffer) {
  const mod: any = await import("pdf-parse");
  const fn = mod?.default ?? mod;
  return fn(buf);
}

function buildSignedCloudinaryUrl(args: {
  publicId: string;
  resourceType: "raw" | "image" | "video";
  deliveryType: "upload" | "authenticated" | "private";
  format?: string;
}) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10;

  return cloudinary.url(args.publicId, {
    resource_type: args.resourceType,
    type: args.deliveryType,
    secure: true,
    sign_url: args.deliveryType !== "upload",
    ...(args.deliveryType !== "upload" ? { expires_at: expiresAt } : {}),
    ...(args.format ? { format: args.format } : {}),
  } as any);
}

async function downloadByPublicIdBestEffort(args: {
  resumePublicId: string;
  resumeFormat?: string;
  resumeResourceType?: "raw" | "image" | "video";
  resumeDeliveryType?: "upload" | "authenticated" | "private";
}) {
  const fmt = args.resumeFormat || "pdf";
  const rt = (args.resumeResourceType as any) || "raw";
  const preferred = args.resumeDeliveryType || "authenticated";

  const order: Array<"authenticated" | "private" | "upload"> =
    preferred === "upload"
      ? ["upload", "authenticated", "private"]
      : ["authenticated", "private", "upload"];

  let lastErr: any = null;

  for (const dt of order) {
    const signed = buildSignedCloudinaryUrl({
      publicId: args.resumePublicId,
      resourceType: rt,
      deliveryType: dt,
      format: fmt,
    });

    try {
      const base64 = await downloadAsBase64FromUrl(signed);
      return {
        base64,
        mimeType: guessMimeFromFormatOrUrl(fmt),
        used: { dt, rt, fmt, publicId: args.resumePublicId },
      };
    } catch (e: any) {
      lastErr = e;
    }
  }

  const rtFallbacks: Array<"raw" | "image"> = rt === "raw" ? ["image"] : ["raw"];

  for (const rt2 of rtFallbacks) {
    for (const dt of order) {
      const signed = buildSignedCloudinaryUrl({
        publicId: args.resumePublicId,
        resourceType: rt2,
        deliveryType: dt,
        format: fmt,
      });

      try {
        const base64 = await downloadAsBase64FromUrl(signed);
        return {
          base64,
          mimeType: guessMimeFromFormatOrUrl(fmt),
          used: { dt, rt: rt2, fmt, publicId: args.resumePublicId },
        };
      } catch (e: any) {
        lastErr = e;
      }
    }
  }

  throw lastErr ?? new Error("Failed to download resume via publicId");
}

async function downloadFromGridFSAsBase64(args: {
  fileId: mongoose.Types.ObjectId;
  bucketName?: string;
}): Promise<Buffer> {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo connection not ready");
  }

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: args.bucketName || "docs",
  });

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = bucket.openDownloadStream(args.fileId);

    stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err: any) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
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
    const err = Object.assign(new Error(`Gemini error ${resp.status}: ${t}`), {
      status: resp.status,
    });
    throw err;
  }

  const data = (await resp.json()) as any;
  return (
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") || ""
  );
}

async function geminiExtractFromFileInline(args: { mimeType: string; base64: string }) {
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
    const err = Object.assign(new Error(`Gemini extract error ${resp.status}: ${t}`), {
      status: resp.status,
    });
    throw err;
  }

  const data = (await resp.json()) as any;
  return (
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") || ""
  );
}

async function localExtractFromFile(args: { mimeType: string; base64: string }) {
  const buf = Buffer.from(args.base64, "base64");

  if (args.mimeType === "application/pdf") {
    const out = await parsePdf(buf);
    return String(out?.text || "").trim();
  }

  if (
    args.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    args.mimeType.includes("wordprocessingml")
  ) {
    const out = await mammoth.extractRawText({ buffer: buf });
    return String(out?.value || "").trim();
  }

  throw new Error(`Local extract unsupported mimeType: ${args.mimeType}`);
}

async function resolveResumeSource(args: {
  resumeDocId?: string;
  resumePublicId?: string;
  resumeUrl?: string;
  resumeFormat?: string;
  resumeResourceType?: "raw" | "image" | "video";
  resumeDeliveryType?: "upload" | "authenticated" | "private";
}): Promise<ResolvedResume> {
  if (args.resumeDocId) {
    const _id = String(args.resumeDocId);
    if (!mongoose.Types.ObjectId.isValid(_id)) throw new Error("Invalid resumeDocId");

    const doc: any = await Document.findById(_id).lean();
    if (!doc) throw new Error("Resume document not found");

    if (doc.gridFsId) {
      const buf = await downloadFromGridFSAsBase64({
        fileId: new mongoose.Types.ObjectId(String(doc.gridFsId)),
        bucketName: String(doc.bucketName || "docs"),
      });

      return {
        base64: buf.toString("base64"),
        mimeType: String(doc.mimeType || "application/pdf"),
        cacheKey: `doc:${_id}:gridfs:${doc.gridFsId}`,
      };
    }

    if (doc.fileUrl) {
      const base64 = await downloadAsBase64FromUrl(String(doc.fileUrl));
      const mimeType =
        String(doc.mimeType || "").trim() ||
        guessMimeFromFormatOrUrl(String(doc.name || doc.fileUrl));
      return { base64, mimeType, cacheKey: `doc:${_id}:url:${doc.fileUrl}` };
    }

    throw new Error("Document has neither gridFsId nor fileUrl");
  }

  if (args.resumePublicId) {
    const dl = await downloadByPublicIdBestEffort({
      resumePublicId: args.resumePublicId,
      resumeFormat: args.resumeFormat,
      resumeResourceType: args.resumeResourceType,
      resumeDeliveryType: args.resumeDeliveryType,
    });

    return {
      base64: dl.base64,
      mimeType: dl.mimeType,
      cacheKey: `publicId:${args.resumePublicId}`,
    };
  }

  if (args.resumeUrl) {
    const base64 = await downloadAsBase64FromUrl(args.resumeUrl);
    const mimeType = guessMimeFromFormatOrUrl(args.resumeFormat || args.resumeUrl);
    return { base64, mimeType, cacheKey: `url:${args.resumeUrl}` };
  }

  throw new Error("resumeDocId or resumePublicId or resumeUrl is required");
}

const resumeTextCache = new Map<string, { text: string; at: number }>();
const RESUME_CACHE_TTL_MS = 1000 * 60 * 60;

function getCachedResumeText(key: string) {
  const v = resumeTextCache.get(key);
  if (!v) return null;
  if (Date.now() - v.at > RESUME_CACHE_TTL_MS) {
    resumeTextCache.delete(key);
    return null;
  }
  return v.text;
}

function setCachedResumeText(key: string, text: string) {
  resumeTextCache.set(key, { text, at: Date.now() });
}

router.post("/resume/extract", async (req: Request, res: Response) => {
  try {
    const {
      resumeDocId,
      resumePublicId,
      resumeUrl,
      resumeFormat,
      resumeResourceType,
      resumeDeliveryType,
    } = req.body as {
      resumeDocId?: string;
      resumePublicId?: string;
      resumeUrl?: string;
      resumeFormat?: string;
      resumeResourceType?: "raw" | "image" | "video";
      resumeDeliveryType?: "upload" | "authenticated" | "private";
    };

    const resolved = await resolveResumeSource({
      resumeDocId,
      resumePublicId,
      resumeUrl,
      resumeFormat,
      resumeResourceType,
      resumeDeliveryType,
    });

    const cached = getCachedResumeText(resolved.cacheKey);
    if (cached) return res.json({ resumeText: cached, cached: true });

    let resumeText = "";
    try {
      if (getEnv("GEMINI_API_KEY")) {
        resumeText = await geminiExtractFromFileInline({
          mimeType: resolved.mimeType,
          base64: resolved.base64,
        });
      } else {
        resumeText = await localExtractFromFile({
          mimeType: resolved.mimeType,
          base64: resolved.base64,
        });
      }
    } catch {
      resumeText = await localExtractFromFile({
        mimeType: resolved.mimeType,
        base64: resolved.base64,
      });
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(422).json({ message: "Could not extract any text from resume" });
    }

    setCachedResumeText(resolved.cacheKey, resumeText);
    return res.json({ resumeText, cached: false });
  } catch (e: any) {
    return res.status(500).json({
      message: "Failed to extract resume",
      error: String(e?.message || e),
    });
  }
});

router.post("/jobs/match-batch", async (req: Request, res: Response) => {
  try {
    const { resumeText, jobs } = req.body as { resumeText?: string; jobs?: JobMatchInput[] };

    if (!resumeText || !Array.isArray(jobs)) {
      return res.status(400).json({ message: "resumeText and jobs[] required" });
    }

    const cleanJobs = jobs.filter((j) => j && j.id && j.title).slice(0, 30);
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

      const jsonText = String(raw).trim();
      let parsed: any = null;

      try {
        parsed = JSON.parse(jsonText);
      } catch {
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

    if (!Object.keys(matches).length) {
      const resume = resumeText.toLowerCase();
      const out: Record<string, number> = {};

      for (const j of cleanJobs) {
        const skills = (j.skills ?? j.techStack ?? []).map(String).filter(Boolean);

        let hits = 0;
        let total = 0;
        for (const s of skills) {
          const k = s.toLowerCase().trim();
          if (!k) continue;
          total++;
          if (resume.includes(k)) hits++;
        }

        const titleTokens = String(j.title || "")
          .toLowerCase()
          .split(/\W+/)
          .filter(Boolean);

        let titleHits = 0;
        for (const t of titleTokens) if (resume.includes(t)) titleHits++;

        const skillScore = total ? (hits / total) * 70 : 10;
        const titleScore = titleTokens.length ? (titleHits / titleTokens.length) * 30 : 10;

        out[j.id] = clamp01To100(Math.round(skillScore + titleScore));
      }

      return res.json({ matches: out, fallback: true });
    }

    return res.json({ matches, fallback: false });
  } catch {
    return res.status(500).json({ message: "Failed to match jobs" });
  }
});

export default router;

import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import mammoth from "mammoth";
import { cloudinary } from "../config/cloudinary.js";
import Document from "../models/Document.js";
import { createRequire } from "module";
import { createHash } from "crypto";
import { generateTextWithFallback } from "../ai/generateWithFallback.js";
import JobMatchCache from "../models/JobMatchCache.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();
const requireCjs = createRequire(import.meta.url);

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

type ResolvedResume = {
  base64: string;
  mimeType: string;
  cacheKey: string;
  fileNameHint?: string;
};

function getEnv(name: string) {
  return process.env[name] || "";
}

function clamp01To100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function normalizeResumeForHash(text: string) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeJobForHash(j: JobMatchInput) {
  const skills = (j.skills ?? j.techStack ?? []).map(String).filter(Boolean).sort();
  return JSON.stringify({
    id: String(j.id || "").trim(),
    title: String(j.title || "").trim(),
    description: String(j.description || "").trim().slice(0, 2000),
    skills,
    location: String(j.location || j.workType || "").trim(),
    jobType: String(j.jobType || "").trim(),
    experience: typeof j.experience === "number" ? j.experience : null,
  });
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

function fileNameFromUrl(u: string) {
  try {
    const url = new URL(u);
    const p = url.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(p);
  } catch {
    const p = String(u || "").split("?")[0].split("#")[0];
    return p.split("/").filter(Boolean).pop() || "";
  }
}

function sniffMimeFromBuffer(buf: Buffer, nameHint?: string): string {
  if (!buf || buf.length < 4) return guessMimeFromFormatOrUrl(nameHint || "");

  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return "application/pdf";
  }
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    const byName = guessMimeFromFormatOrUrl(nameHint || "");
    if (byName !== "application/octet-stream") return byName;
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }

  return guessMimeFromFormatOrUrl(nameHint || "");
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

async function downloadAsBufferFromUrl(url: string) {
  const r = await fetchWithRetry(url, 2);
  return Buffer.from(await r.arrayBuffer());
}

async function downloadAsBase64FromUrl(url: string) {
  const buf = await downloadAsBufferFromUrl(url);
  return buf.toString("base64");
}

async function parsePdfToText(buf: Buffer): Promise<string> {
  try {
    const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
    return await extractTextWithPdfJs(pdfjs, buf);
  } catch {
    try {
      const pdfjs: any = requireCjs("pdfjs-dist/legacy/build/pdf.js");
      return await extractTextWithPdfJs(pdfjs, buf);
    } catch (e: any) {
      throw new Error(`PDF extract failed: ${String(e?.message || e)}`);
    }
  }
}

async function extractTextWithPdfJs(pdfjs: any, buf: Buffer): Promise<string> {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buf) });
  const pdf = await loadingTask.promise;

  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const strings = (content.items || [])
      .map((it: any) => (typeof it?.str === "string" ? it.str : ""))
      .filter(Boolean);
    out += strings.join(" ") + "\n";
  }
  return out.trim();
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
        fileNameHint: `${args.resumePublicId}.${fmt}`,
      };
    } catch (e: any) {
      lastErr = e;
    }
  }

  throw lastErr ?? new Error("Failed to download resume via publicId");
}

async function downloadFromGridFSAsBuffer(args: {
  fileId: mongoose.Types.ObjectId;
  bucketName?: string;
}): Promise<Buffer> {
  if (!mongoose.connection?.db) throw new Error("Mongo connection not ready");

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
            { text: "Extract ALL readable resume text. Return plain text only." },
            { inlineData: { mimeType: args.mimeType, data: args.base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`Gemini extract error ${resp.status}: ${t}`);
  }

  const data = (await resp.json()) as any;
  return (
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") || ""
  );
}

async function localExtractFromFile(args: {
  mimeType: string;
  base64: string;
  fileNameHint?: string;
}) {
  const buf = Buffer.from(args.base64, "base64");
  let mt = String(args.mimeType || "").trim().toLowerCase();

  if (!mt || mt === "application/octet-stream") {
    mt = sniffMimeFromBuffer(buf, args.fileNameHint);
  }

  if (mt === "application/pdf") {
    return await parsePdfToText(buf);
  }

  if (
    mt === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mt.includes("wordprocessingml")
  ) {
    const out = await mammoth.extractRawText({ buffer: buf });
    return String(out?.value || "").trim();
  }

  if (mt === "application/msword" || (args.fileNameHint || "").toLowerCase().endsWith(".doc")) {
    throw new Error("Local extract unsupported for .doc. Upload PDF/DOCX or enable OCR provider.");
  }

  throw new Error(`Local extract unsupported mimeType: ${mt}`);
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

    const nameHint =
      String(doc.name || "").trim() ||
      String(doc.fileUrl ? fileNameFromUrl(String(doc.fileUrl)) : "").trim() ||
      undefined;

    if (doc.gridFsId) {
      const buf = await downloadFromGridFSAsBuffer({
        fileId: new mongoose.Types.ObjectId(String(doc.gridFsId)),
        bucketName: String(doc.bucketName || "docs"),
      });

      const mimeFromDoc = String(doc.mimeType || "").trim() || "application/octet-stream";
      const mimeType =
        mimeFromDoc !== "application/octet-stream"
          ? mimeFromDoc
          : sniffMimeFromBuffer(buf, nameHint);

      return {
        base64: buf.toString("base64"),
        mimeType,
        cacheKey: `doc:${_id}:gridfs:${doc.gridFsId}`,
        fileNameHint: nameHint,
      };
    }

    if (doc.fileUrl) {
      const fileUrl = String(doc.fileUrl);
      const buf = await downloadAsBufferFromUrl(fileUrl);
      const base64 = buf.toString("base64");

      const mimeFromDoc = String(doc.mimeType || "").trim() || "";
      const guessedByName = guessMimeFromFormatOrUrl(nameHint || fileUrl);

      const mimeType =
        mimeFromDoc && mimeFromDoc !== "application/octet-stream"
          ? mimeFromDoc
          : guessedByName !== "application/octet-stream"
            ? guessedByName
            : sniffMimeFromBuffer(buf, nameHint);

      return {
        base64,
        mimeType,
        cacheKey: `doc:${_id}:url:${fileUrl}`,
        fileNameHint: nameHint,
      };
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
      fileNameHint: dl.fileNameHint,
    };
  }

  if (args.resumeUrl) {
    const url = String(args.resumeUrl);
    const buf = await downloadAsBufferFromUrl(url);
    const base64 = buf.toString("base64");
    const nameHint = fileNameFromUrl(url);

    const byFormat = guessMimeFromFormatOrUrl(args.resumeFormat || "");
    const byName = guessMimeFromFormatOrUrl(nameHint || url);

    const mimeType =
      byFormat !== "application/octet-stream"
        ? byFormat
        : byName !== "application/octet-stream"
          ? byName
          : sniffMimeFromBuffer(buf, nameHint);

    return { base64, mimeType, cacheKey: `url:${url}`, fileNameHint: nameHint };
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
    } = req.body as any;

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
          fileNameHint: resolved.fileNameHint,
        });
      }
    } catch {
      resumeText = await localExtractFromFile({
        mimeType: resolved.mimeType,
        base64: resolved.base64,
        fileNameHint: resolved.fileNameHint,
      });
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(422).json({
        message: "Could not extract any text from resume",
        debug: {
          mimeType: resolved.mimeType,
          fileNameHint: resolved.fileNameHint,
          cacheKey: resolved.cacheKey,
        },
      });
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

function localMatchFallback(resumeText: string, jobs: JobMatchInput[]) {
  const resume = resumeText.toLowerCase();
  const out: Record<string, number> = {};

  for (const j of jobs) {
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

  return out;
}

router.post("/jobs/match-batch", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { resumeText, jobs } = req.body as { resumeText?: string; jobs?: JobMatchInput[] };
    if (!resumeText || !Array.isArray(jobs)) {
      return res.status(400).json({ message: "resumeText and jobs[] required" });
    }

    const userId = String((req.user as any)?.id || (req.user as any)?._id || "");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const candidateId = new mongoose.Types.ObjectId(userId);

    const cleanJobs = jobs.filter((j) => j && j.id && j.title).slice(0, 30);

    const resumeHash = sha256(normalizeResumeForHash(resumeText));

    // Build jobHash map
    const jobMeta = cleanJobs.map((j) => {
      const jobHash = sha256(normalizeJobForHash(j));
      return { job: j, jobHash };
    });

    const cachedDocs = await JobMatchCache.find({
      candidateId,
      resumeHash,
      jobId: { $in: jobMeta.map((x) => String(x.job.id)) },
      jobHash: { $in: jobMeta.map((x) => x.jobHash) }, 
    })
      .select("jobId jobHash match provider")
      .lean();

    const cacheKeyToMatch = new Map<string, { match: number; provider?: string }>();
    for (const d of cachedDocs as any[]) {
      cacheKeyToMatch.set(`${d.jobId}::${d.jobHash}`, { match: d.match, provider: d.provider });
    }

    const matches: Record<string, number> = {};
    const missing: Array<{ job: JobMatchInput; jobHash: string }> = [];

    for (const jm of jobMeta) {
      const k = `${String(jm.job.id)}::${jm.jobHash}`;
      const hit = cacheKeyToMatch.get(k);
      if (hit) matches[String(jm.job.id)] = clamp01To100(Math.round(hit.match));
      else missing.push(jm);
    }

    const CHUNK = 8;
    const bulkOps: any[] = [];

    for (let i = 0; i < missing.length; i += CHUNK) {
      const chunk = missing.slice(i, i + CHUNK);

      const payloadForPrompt = chunk.map((x) => ({
        id: x.job.id,
        title: x.job.title,
        description: (x.job.description || "").slice(0, 800),
        skills: (x.job.skills ?? x.job.techStack ?? []).map(String).filter(Boolean),
        location: x.job.location || x.job.workType || "",
        jobType: x.job.jobType || "",
        experience: typeof x.job.experience === "number" ? x.job.experience : null,
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
      let providerUsed: string = "local";

      try {
        const out = await generateTextWithFallback(prompt, ["gemini", "groq", "ollama"]);
        raw = out.text;
        providerUsed = out.provider;
      } catch {
        const partial = localMatchFallback(resumeText, chunk.map((c) => c.job));
        for (const c of chunk) {
          const id = String(c.job.id);
          const m = partial[id] ?? 0;
          matches[id] = clamp01To100(Math.round(m));
          bulkOps.push({
            updateOne: {
              filter: { candidateId, resumeHash, jobId: id, jobHash: c.jobHash },
              update: { $set: { match: matches[id], provider: "local" } },
              upsert: true,
            },
          });
        }
        continue;
      }

      let parsed: any = null;
      const jsonText = String(raw).trim();
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        const m = jsonText.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }

      const list: any[] = Array.isArray(parsed?.matches) ? parsed.matches : [];

      if (!list.length) {
        const partial = localMatchFallback(resumeText, chunk.map((c) => c.job));
        for (const c of chunk) {
          const id = String(c.job.id);
          const m = partial[id] ?? 0;
          matches[id] = clamp01To100(Math.round(m));
          bulkOps.push({
            updateOne: {
              filter: { candidateId, resumeHash, jobId: id, jobHash: c.jobHash },
              update: { $set: { match: matches[id], provider: "local" } },
              upsert: true,
            },
          });
        }
        continue;
      }

      const temp = new Map<string, number>();
      for (const item of list) {
        const id = String(item?.id || "").trim();
        const n = Number(item?.match);
        if (!id) continue;
        temp.set(id, Number.isFinite(n) ? clamp01To100(Math.round(n)) : 0);
      }

      for (const c of chunk) {
        const id = String(c.job.id);
        const m = temp.has(id) ? (temp.get(id) as number) : 0;
        matches[id] = clamp01To100(Math.round(m));
        bulkOps.push({
          updateOne: {
            filter: { candidateId, resumeHash, jobId: id, jobHash: c.jobHash },
            update: { $set: { match: matches[id], provider: providerUsed } },
            upsert: true,
          },
        });
      }
    }

    if (bulkOps.length) {
      await JobMatchCache.bulkWrite(bulkOps, { ordered: false });
    }

    return res.json({
      matches,
      cached: missing.length === 0,
      resumeHash,
    });
  } catch (e: any) {
    return res.status(500).json({
      message: "Failed to match jobs",
      error: String(e?.message || e),
    });
  }
});

export default router;

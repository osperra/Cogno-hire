import { Router, type Request, type Response, type NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import multer from "multer";
import { z } from "zod";

import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { Document } from "../models/Document.js";
import { storage } from "../config/cloudinary.js";

export const candidatesRouter = Router();


type UiCandidate = {
  id: string;
  name: string;
  role: string;
  score: number;
  avatar: string;
};

type CandidateMeLean = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  about?: string;
  experienceLevel?: "Fresher" | "Junior" | "Mid" | "Senior" | "Lead";
  skills?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  resumeDocId?: Types.ObjectId | null;
  resumeFileName?: string;
};


function initials(name: string) {
  const s = (name || "").trim();
  if (!s) return "NA";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "N";
  const second = parts.length > 1 ? parts[1][0] : parts[0]?.[1] ?? "A";
  return (first + second).toUpperCase();
}

function clampScore(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

async function getEmployerJobIds(employerId: string) {
  const jobs = await Job.find({ employerId }, { _id: 1 }).lean();
  return jobs.map((j) => j._id);
}

function oidList(ids: unknown[]) {
  return ids.map((id) => new mongoose.Types.ObjectId(String(id)));
}

async function mapAppsToUi(apps: any[]): Promise<UiCandidate[]> {
  return apps.map((a) => {
    const candidateName = a?.candidateId?.name ?? "Unknown";
    const jobTitle = a?.jobId?.title ?? "Unknown Role";
    return {
      id: String(a._id),
      name: candidateName,
      role: jobTitle,
      score: clampScore(a?.overallScore),
      avatar: initials(candidateName),
    };
  });
}

function userToCandidateProfile(me: CandidateMeLean) {
  return {
    id: String(me._id),
    name: me.name,
    email: me.email,
    phone: me.phone,
    location: me.location,
    headline: me.headline,
    about: me.about,
    experienceLevel: me.experienceLevel,
    skills: me.skills ?? [],
    linkedin: me.linkedin,
    github: me.github,
    portfolio: me.portfolio,
    resumeUrl: me.resumeUrl,
    resumeDocId: me.resumeDocId ? String(me.resumeDocId) : "",
    resumeFileName: me.resumeFileName,
  };
}

function isResumeAllowed(file: Express.Multer.File) {
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  return ["pdf", "doc", "docx"].includes(ext);
}


const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "application/pdf" ||
      file.mimetype.includes("word") ||
      file.mimetype.includes("document");
    cb(null, ok);
  },
});

function errorToPlain(e: unknown) {
  if (e instanceof Error) return { name: e.name, message: e.message, stack: e.stack };
  return e;
}

candidatesRouter.get("/", requireAuth, requireRole(["employer", "hr"]), async (req: AuthedRequest, res) => {
  const employerId = req.user!.id;

  const jobIds = await getEmployerJobIds(employerId);
  if (jobIds.length === 0) return res.json({ screening: [], interview: [], offer: [] });

  const matchBase = { jobId: { $in: oidList(jobIds) } };
  const LIMIT = 12;

  const [screeningApps, interviewApps, offerApps] = await Promise.all([
    Application.find({
      ...matchBase,
      hiringStatus: { $in: ["PENDING", "UNDER_REVIEW", "INVITED"] },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(LIMIT)
      .populate("candidateId", "name email")
      .populate("jobId", "title")
      .lean(),

    Application.find({
      ...matchBase,
      interviewStatus: "IN_PROGRESS",
      hiringStatus: { $nin: ["REJECTED", "HIRED"] },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(LIMIT)
      .populate("candidateId", "name email")
      .populate("jobId", "title")
      .lean(),

    Application.find({
      ...matchBase,
      hiringStatus: "SHORTLISTED",
      interviewStatus: "COMPLETED",
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(LIMIT)
      .populate("candidateId", "name email")
      .populate("jobId", "title")
      .lean(),
  ]);

  return res.json({
    screening: await mapAppsToUi(screeningApps),
    interview: await mapAppsToUi(interviewApps),
    offer: await mapAppsToUi(offerApps),
  });
});


candidatesRouter.get("/me", requireAuth, requireRole(["candidate"]), async (req: AuthedRequest, res) => {
  try {
    const me = await User.findById(req.user!.id)
      .select(
        "_id name email phone location headline about experienceLevel skills linkedin github portfolio resumeUrl resumeDocId resumeFileName"
      )
      .lean<CandidateMeLean>()
      .exec();

    if (!me) return res.status(404).json({ message: "User not found" });
    return res.json(userToCandidateProfile(me));
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: errorToPlain(e) });
  }
});

candidatesRouter.patch("/me", requireAuth, requireRole(["candidate"]), async (req: AuthedRequest, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      headline: z.string().optional(),
      about: z.string().optional(),
      experienceLevel: z.enum(["Fresher", "Junior", "Mid", "Senior", "Lead"]).optional(),
      skills: z.array(z.string()).optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      portfolio: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", details: parsed.error.flatten() });

    const update: Record<string, any> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v === undefined) continue;
      update[k] = typeof v === "string" ? v.trim() : v;
    }

    const updated = await User.findByIdAndUpdate(req.user!.id, update, { new: true })
      .select(
        "_id name email phone location headline about experienceLevel skills linkedin github portfolio resumeUrl resumeDocId resumeFileName"
      )
      .lean<CandidateMeLean>()
      .exec();

    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json(userToCandidateProfile(updated));
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: errorToPlain(e) });
  }
});

candidatesRouter.post(
  "/me/resume",
  requireAuth,
  requireRole(["candidate"]),
  (req, res, next) => uploadResume.single("file")(req as any, res as any, next as any),
  async (req: AuthedRequest & { file?: Express.Multer.File }, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      if (!isResumeAllowed(req.file)) return res.status(400).json({ message: "Only PDF/DOC/DOCX supported" });

      const fileUrl = (req.file as any).path || "";
      if (!fileUrl) return res.status(500).json({ message: "Upload failed (missing file URL)" });

      const doc = await Document.create({
        ownerUserId: req.user!.id,
        uploadedByUserId: req.user!.id,
        name: req.file.originalname,
        type: "Resume",
        category: "Application",
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        fileUrl,
        status: "PENDING",
        bucketName: "docs",
      });

      await User.updateOne(
        { _id: req.user!.id },
        {
          $set: {
            resumeUrl: fileUrl,
            resumeDocId: doc._id,
            resumeFileName: req.file.originalname,
          },
        }
      );

      return res.status(201).json({
        resumeUrl: fileUrl,
        resumeDocId: String(doc._id),
        resumeFileName: req.file.originalname,
      });
    } catch (e) {
      return res.status(500).json({ message: "Resume upload failed", error: errorToPlain(e) });
    }
  }
);

candidatesRouter.delete("/me/resume", requireAuth, requireRole(["candidate"]), async (req: AuthedRequest, res) => {
  try {
    const me = await User.findById(req.user!.id)
      .select("resumeDocId")
      .lean<Pick<CandidateMeLean, "resumeDocId">>()
      .exec();

    if (me?.resumeDocId) {
      await Document.deleteOne({ _id: me.resumeDocId });
    }

    await User.updateOne(
      { _id: req.user!.id },
      { $unset: { resumeUrl: "", resumeDocId: "", resumeFileName: "" } }
    );

    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ message: "Failed to remove resume", error: errorToPlain(e) });
  }
});

candidatesRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("CANDIDATES_ROUTE_ERROR:", err);
  return res.status(err?.status || 500).json({
    message: err?.message || "Server error",
    error: errorToPlain(err),
  });
});

export default candidatesRouter;

// Server/src/routes/applications.ts
// ... imports ...
import { Router, type Request } from "express";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import { Types } from "mongoose";
import { storage } from "../config/cloudinary.js"; // Import Cloudinary storage

import { Application } from "../models/Application.js";
import { Document } from "../models/Document.js";
import { Job } from "../models/Jobs.js";

import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";

export const applicationsRouter = Router();

async function getEmployerJobIds(employerId: string) {
  const jobs = await Job.find({ employerId }).select("_id").lean();
  return jobs.map((j) => j._id);
}

const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
      // Basic check
      if (file.mimetype === "application/pdf" || file.mimetype.includes("doc")) {
          cb(null, true);
      } else {
          cb(new Error("Only PDF/DOC/DOCX allowed") as any, false);
      }
  }
});

type MulterAuthedRequest = Request & {
  user?: AuthedRequest["user"];
  file?: Express.Multer.File;
};

applicationsRouter.post(
  "/upload-resume",
  requireAuth,
  requireRole(["candidate"]),
  uploadResume.single("resume"),
  async (req: MulterAuthedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      if (!req.file) return res.status(400).json({ message: "Resume file is required" });

      const jobId =
        typeof (req.body as Record<string, unknown>)?.jobId === "string"
          ? String((req.body as Record<string, unknown>).jobId)
          : "";

      if (jobId && !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      // Cloudinary URL
      const resumeUrl = req.file.path;
      // We can use a dummy ObjectId if the field is required by the schema, or generate one.
      // But looking at Document model, gridFsId is required. We must provide something.
      // We can create a new ObjectId just to satisfy the schema or modify the schema to be optional.
      // Modifying schema is better but might break other things. Let's just generate a fake GridFS ID for now or use the file ID if we had one.
      const gridFsId = new Types.ObjectId(); 

      const created = await Document.create({
            ownerUserId: req.user!.id,
            uploadedByUserId: req.user!.id,
            jobId: jobId ? jobId : undefined,
            applicationId: undefined,

            name: req.file!.originalname,
            type: "Resume",
            category: "Application",

            mimeType: req.file!.mimetype,
            sizeBytes: req.file!.size,

            gridFsId, // Dummy ID to satisfy schema
            bucketName: "cloudinary", // Marker
            fileUrl: resumeUrl,

            status: "PENDING",
      });

      return res.json({ resumeUrl, resumeDocId: String(created._id) });

    } catch (e) {
      console.error("UPLOAD_RESUME_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

applicationsRouter.post("/", requireAuth, requireRole(["candidate"]), async (req: AuthedRequest, res) => {
  try {
    const schema = z.object({
      jobId: z.string().min(1),
      coverLetter: z.string().optional(),
      resumeDocId: z.string().optional(),
      resumeUrl: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const job = await Job.findById(parsed.data.jobId).select("_id").lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    const exists = await Application.findOne({
      jobId: parsed.data.jobId,
      candidateId: req.user!.id,
    })
      .select("_id")
      .lean();

    if (exists) return res.status(409).json({ message: "You already applied for this job." });

    const created = await Application.create({
      jobId: parsed.data.jobId,
      candidateId: req.user!.id,
      coverLetter: parsed.data.coverLetter?.trim() || undefined,
      resumeUrl: parsed.data.resumeUrl?.trim() || undefined,
    });

    const resumeDocId = parsed.data.resumeDocId;
    if (resumeDocId && Types.ObjectId.isValid(resumeDocId)) {
      const doc = await Document.findById(resumeDocId).lean();
      if (doc && String(doc.ownerUserId) === String(req.user!.id)) {
        await Document.findByIdAndUpdate(resumeDocId, {
          $set: { applicationId: created._id, jobId: created.jobId },
        });

        await Application.findByIdAndUpdate(created._id, {
          $set: { resumeUrl: doc.fileUrl },
        });
      }
    }

    return res.status(201).json({ message: "Applied successfully", applicationId: created._id });
  } catch (e) {
    console.error("APPLY_ERROR:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

applicationsRouter.get("/me", requireAuth, requireRole(["candidate"]), async (req: AuthedRequest, res) => {
  try {
    const schema = z.object({
      tab: z.enum(["all", "pending", "hired", "rejected"]).optional(),
      q: z.string().optional(),
      limit: z.string().optional(),
    });

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

    const tab = parsed.data.tab ?? "all";
    const q = (parsed.data.q ?? "").trim().toLowerCase();
    const limit = Math.min(Math.max(parseInt(parsed.data.limit ?? "200", 10) || 200, 1), 500);

    const match: Record<string, unknown> = { candidateId: req.user!.id };

    if (tab === "hired") match.hiringStatus = "HIRED";
    if (tab === "rejected") match.hiringStatus = "REJECTED";
    if (tab === "pending") match.hiringStatus = { $in: ["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED"] };

    let apps = await Application.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("jobId", "title location jobType salaryRange company companyName")
      .lean();

    if (q) {
      apps = apps.filter((a: any) => {
        const j = a.jobId || {};
        const title = String(j.title || "").toLowerCase();
        const company = String(j.companyName || j.company || "").toLowerCase();
        const location = String(j.location || "").toLowerCase();
        return title.includes(q) || company.includes(q) || location.includes(q);
      });
    }

    return res.json(apps);
  } catch (e) {
    console.error("CANDIDATE_APPS_ERROR:", e);
    return res.status(500).json({ message: "Server error" });
  }
});


applicationsRouter.get(
  "/candidate/counts",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
    try {
      const grouped = await Application.aggregate([
        { $match: { candidateId: new Types.ObjectId(req.user!.id) } },
        { $group: { _id: "$hiringStatus", count: { $sum: 1 } } },
      ]);

      const map: Record<string, number> = {};
      for (const g of grouped) map[String(g._id)] = Number(g.count) || 0;

      const hired = map["HIRED"] || 0;
      const rejected = map["REJECTED"] || 0;
      const pending = (map["PENDING"] || 0) + (map["INVITED"] || 0) + (map["UNDER_REVIEW"] || 0) + (map["SHORTLISTED"] || 0);

      return res.json({
        all: hired + rejected + pending,
        pending,
        hired,
        rejected,
      });
    } catch (e) {
      console.error("CANDIDATE_COUNTS_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);


applicationsRouter.get(
  "/employer/counts",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    try {
      const jobIds = await getEmployerJobIds(req.user!.id);

      if (!jobIds.length) {
        return res.json({ all: 0, invited: 0, underReview: 0, shortlisted: 0, hired: 0, rejected: 0 });
      }

      const match = { jobId: { $in: jobIds } };

      const grouped = await Application.aggregate([
        { $match: match },
        { $group: { _id: "$hiringStatus", count: { $sum: 1 } } },
      ]);

      const map: Record<string, number> = {};
      for (const g of grouped) map[String(g._id)] = Number(g.count) || 0;

      const invited = map["INVITED"] || 0;
      const underReview = map["UNDER_REVIEW"] || 0;
      const shortlisted = map["SHORTLISTED"] || 0;
      const hired = map["HIRED"] || 0;
      const rejected = map["REJECTED"] || 0;

      return res.json({
        all: invited + underReview + shortlisted + hired + rejected + (map["PENDING"] || 0),
        invited,
        underReview,
        shortlisted,
        hired,
        rejected,
      });
    } catch (e) {
      console.error("EMPLOYER_COUNTS_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

applicationsRouter.get(
  "/employer",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    try {
      const tab = typeof req.query.tab === "string" ? req.query.tab : "all";
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const jobTitle = typeof req.query.jobTitle === "string" ? req.query.jobTitle.trim() : "";
      const interviewStatus = typeof req.query.interviewStatus === "string" ? req.query.interviewStatus.trim() : "";
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || "200"), 10) || 200, 1), 500);

      const jobIds = await getEmployerJobIds(req.user!.id);
      if (!jobIds.length) return res.json([]);

      const match: Record<string, unknown> = { jobId: { $in: jobIds } };

      if (tab === "invited") match.hiringStatus = "INVITED";
      else if (tab === "under-review") match.hiringStatus = "UNDER_REVIEW";
      else if (tab === "shortlisted") match.hiringStatus = "SHORTLISTED";
      else if (tab === "hired") match.hiringStatus = "HIRED";
      else if (tab === "rejected") match.hiringStatus = "REJECTED";

      if (interviewStatus && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(interviewStatus)) {
        match.interviewStatus = interviewStatus;
      }

      let apps = await Application.find(match)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("candidateId", "name email")
        .populate("jobId", "title company companyName location")
        .lean();

      if (jobTitle) {
        const jt = jobTitle.toLowerCase();
        apps = apps.filter((a: any) => String(a?.jobId?.title || "").toLowerCase() === jt);
      }

      if (q) {
        const qq = q.toLowerCase();
        apps = apps.filter((a: any) => {
          const c = a.candidateId || {};
          const j = a.jobId || {};
          const name = String(c.name || "").toLowerCase();
          const email = String(c.email || "").toLowerCase();
          const title = String(j.title || "").toLowerCase();
          return name.includes(qq) || email.includes(qq) || title.includes(qq);
        });
      }

      return res.json(apps);
    } catch (e) {
      console.error("EMPLOYER_APPS_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

applicationsRouter.patch(
  "/:id/status",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      hiringStatus: z.enum(["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED", "HIRED", "REJECTED"]).optional(),
      interviewStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
      overallScore: z.number().optional(),
      communication: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const updated = await Application.findByIdAndUpdate(req.params.id, { $set: parsed.data }, { new: true });
    if (!updated) return res.status(404).json({ message: "Application not found" });

    res.json(updated);
  }
);

export default applicationsRouter;

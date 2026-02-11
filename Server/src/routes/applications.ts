// Server/src/routes/applications.ts (COMPLETE updated file)
// ✅ Updates:
// 1) Employer gets notification when a candidate applies (application_created)
// 2) Candidate gets notification when employer changes hiring/interview status (application_status_changed)
// NOTE: Candidate gets notification when new job is posted => implement in jobs route (not here)

import { Router, type Request } from "express";
import { z } from "zod";
import multer from "multer";
import { Types } from "mongoose";
import { storage } from "../config/cloudinary.js";

import { Application } from "../models/Application.js";
import { Document } from "../models/Document.js";
import { Job } from "../models/Jobs.js";
import { Notification } from "../models/Notification.js"; // ✅ NEW

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
    if (file.mimetype === "application/pdf" || file.mimetype.includes("doc")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF/DOC/DOCX allowed") as any, false);
    }
  },
});

type MulterAuthedRequest = Request & {
  user?: AuthedRequest["user"];
  file?: Express.Multer.File;
};

function safeObjectIdString(x: unknown) {
  return typeof x === "string" && Types.ObjectId.isValid(x) ? x : "";
}

async function createNotification(params: {
  userId: string;
  type: "application_created" | "application_status_changed" | "job_created" | "general";
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
}) {
  // userId in Notification model is typically ObjectId ref; pass string is fine for mongoose
  return Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    meta: params.meta,
    isRead: false,
  });
}

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

      const resumeUrl = req.file.path;
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

        gridFsId,
        bucketName: "cloudinary",
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

applicationsRouter.post(
  "/",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
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

      if (!Types.ObjectId.isValid(parsed.data.jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      // ✅ Fetch employerId + title so we can notify employer
      const job = await Job.findById(parsed.data.jobId).select("_id employerId title").lean();
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

      const resumeDocId = safeObjectIdString(parsed.data.resumeDocId);
      if (resumeDocId) {
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

      // ✅ EMPLOYER NOTIFICATION: someone applied to their job
      try {
        const employerId = String((job as any).employerId ?? "");
        if (Types.ObjectId.isValid(employerId)) {
          await createNotification({
            userId: employerId,
            type: "application_created",
            title: "New application received",
            message: `A candidate applied for "${String((job as any).title ?? "your job")}".`,
            link: "/app/employer/applicants",
            meta: {
              jobId: String(job._id),
              applicationId: String(created._id),
              candidateId: String(req.user!.id),
            },
          });
        }
      } catch (e) {
        console.error("NOTIFY_EMPLOYER_ON_APPLY_ERROR:", e);
        // do not block application creation
      }

      return res.status(201).json({
        message: "Applied successfully",
        applicationId: created._id,
      });
    } catch (e) {
      console.error("APPLY_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * ✅ EMPLOYER: Get applicants of a specific job
 * URL: GET /api/applications/employer/job/:jobId
 */
applicationsRouter.get(
  "/employer/job/:jobId",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    try {
      const jobId = String(req.params.jobId || "").trim();

      if (!Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      // Ensure job belongs to this employer/hr
      const job = await Job.findOne({
        _id: new Types.ObjectId(jobId),
        employerId: new Types.ObjectId(req.user!.id),
      })
        .select("_id")
        .lean();

      if (!job) {
        return res.status(404).json({ message: "Job not found or not allowed" });
      }

      const apps = await Application.find({ jobId: new Types.ObjectId(jobId) })
        .sort({ createdAt: -1 })
        .populate("candidateId", "name email")
        .lean();

      // normalize for UI
      const result = apps.map((a: any) => ({
        _id: String(a._id),
        name: a?.candidateId?.name,
        email: a?.candidateId?.email,
        status: a?.hiringStatus,
        score: typeof a?.overallScore === "number" ? a.overallScore : 0,
        appliedAt: a?.createdAt ? new Date(a.createdAt).toISOString() : undefined,
        interviewStatus: a?.interviewStatus,
      }));

      return res.json(result);
    } catch (e) {
      console.error("EMPLOYER_JOB_APPLICANTS_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

applicationsRouter.get(
  "/me",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
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
      if (tab === "pending")
        match.hiringStatus = { $in: ["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED"] };

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
  }
);

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
      const pending =
        (map["PENDING"] || 0) +
        (map["INVITED"] || 0) +
        (map["UNDER_REVIEW"] || 0) +
        (map["SHORTLISTED"] || 0);

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
        return res.json({
          all: 0,
          pending: 0,
          invited: 0,
          underReview: 0,
          shortlisted: 0,
          hired: 0,
          rejected: 0,
        });
      }

      const match = { jobId: { $in: jobIds } };

      const grouped = await Application.aggregate([
        { $match: match },
        { $group: { _id: "$hiringStatus", count: { $sum: 1 } } },
      ]);

      const map: Record<string, number> = {};
      for (const g of grouped) map[String(g._id)] = Number(g.count) || 0;

      const pending = map["PENDING"] || 0;
      const invited = map["INVITED"] || 0;
      const underReview = map["UNDER_REVIEW"] || 0;
      const shortlisted = map["SHORTLISTED"] || 0;
      const hired = map["HIRED"] || 0;
      const rejected = map["REJECTED"] || 0;

      return res.json({
        all: pending + invited + underReview + shortlisted + hired + rejected,
        pending,
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
      const interviewStatus =
        typeof req.query.interviewStatus === "string" ? req.query.interviewStatus.trim() : "";
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || "200"), 10) || 200, 1), 500);

      const jobIds = await getEmployerJobIds(req.user!.id);
      if (!jobIds.length) return res.json([]);

      const match: Record<string, unknown> = { jobId: { $in: jobIds } };

      if (tab === "pending") match.hiringStatus = "PENDING";
      else if (tab === "invited") match.hiringStatus = "INVITED";
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
      hiringStatus: z
        .enum(["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED", "HIRED", "REJECTED"])
        .optional(),
      interviewStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
      overallScore: z.number().optional(),
      communication: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    // ✅ need candidateId to notify candidate
    const app = await Application.findById(req.params.id).select("_id jobId candidateId hiringStatus interviewStatus").lean();
    if (!app) return res.status(404).json({ message: "Application not found" });

    const job = await Job.findById(app.jobId).select("_id employerId title").lean();
    if (!job || String((job as any).employerId) !== String(req.user!.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Application not found" });

    // ✅ CANDIDATE NOTIFICATION: status changed (only if relevant fields changed)
    try {
      const candidateId = String((app as any).candidateId ?? "");
      if (Types.ObjectId.isValid(candidateId)) {
        const jobTitle = String((job as any).title ?? "your application");

        const hiringChanged =
          typeof parsed.data.hiringStatus === "string" &&
          parsed.data.hiringStatus !== (app as any).hiringStatus;

        const interviewChanged =
          typeof parsed.data.interviewStatus === "string" &&
          parsed.data.interviewStatus !== (app as any).interviewStatus;

        if (hiringChanged || interviewChanged) {
          const parts: string[] = [];
          if (hiringChanged) parts.push(`Hiring status: ${String(parsed.data.hiringStatus)}`);
          if (interviewChanged) parts.push(`Interview status: ${String(parsed.data.interviewStatus)}`);

          await createNotification({
            userId: candidateId,
            type: "application_status_changed",
            title: "Application update",
            message: `${jobTitle} • ${parts.join(" • ")}`,
            link: "/app/candidate/applications",
            meta: {
              jobId: String((job as any)._id),
              applicationId: String((app as any)._id),
              hiringStatus: parsed.data.hiringStatus,
              interviewStatus: parsed.data.interviewStatus,
            },
          });
        }
      }
    } catch (e) {
      console.error("NOTIFY_CANDIDATE_STATUS_CHANGE_ERROR:", e);
      // do not block update
    }

    res.json(updated);
  }
);

export default applicationsRouter;

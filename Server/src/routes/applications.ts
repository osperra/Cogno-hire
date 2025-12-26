// server/routes/applications.ts
import { Router } from "express";
import { z } from "zod";
import { Application } from "../models/Application.js";
import { Job } from "../models/Jobs.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

export const applicationsRouter = Router();

/**
 * Candidate applies to job
 * POST /api/applications/:jobId
 */
applicationsRouter.post(
  "/:jobId",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      coverLetter: z.string().optional(),
      resumeUrl: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    try {
      const app = await Application.create({
        jobId: job._id,
        candidateId: req.user!.id,

        interviewStatus: "PENDING",
        hiringStatus: "PENDING",
        overallScore: 0,
        communication: "AVERAGE",

        coverLetter: parsed.data.coverLetter,
        resumeUrl: parsed.data.resumeUrl,
      });

      return res.status(201).json(app);
    } catch (e: any) {
      // prevent duplicate apply (same job + same candidate)
      if (e?.code === 11000) {
        return res.status(409).json({ message: "Already applied for this job" });
      }
      console.error("APPLY_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Candidate - my applications (dynamic + populated)
 * GET /api/applications/me?tab=all|pending|hired|rejected&q=...
 */
applicationsRouter.get(
  "/me",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
    const tab = typeof req.query.tab === "string" ? req.query.tab : "all";
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const match: any = { candidateId: req.user!.id };

    if (tab === "pending") {
      match.$or = [
        { interviewStatus: { $in: ["PENDING", "IN_PROGRESS"] } },
        { hiringStatus: { $in: ["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED"] } },
      ];
    } else if (tab === "hired") {
      match.hiringStatus = "HIRED";
    } else if (tab === "rejected") {
      match.hiringStatus = "REJECTED";
    }

    let apps: any[] = await Application.find(match)
      .sort({ createdAt: -1 })
      .populate("jobId", "title location company") // adjust these fields based on Job schema
      .lean();

    if (q) {
      const qq = q.toLowerCase();
      apps = apps.filter((a) => {
        const job = a.jobId || {};
        const title = String(job.title || "").toLowerCase();
        const company = String(job.company || "").toLowerCase();
        const hiring = String(a.hiringStatus || "").toLowerCase();
        const interview = String(a.interviewStatus || "").toLowerCase();

        return (
          title.includes(qq) ||
          company.includes(qq) ||
          hiring.includes(qq) ||
          interview.includes(qq)
        );
      });
    }

    res.json(apps);
  }
);

/**
 * Employer/HR - view applicants for my jobs
 * GET /api/applications/employer?jobId=...
 */
applicationsRouter.get(
  "/employer",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;

    const match: any = {};
    if (jobId) match.jobId = jobId;

    // Only applications for jobs created by this employer
    const jobs = await Job.find({ employerId: req.user!.id }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    match.jobId = match.jobId ? match.jobId : { $in: jobIds };

    const apps = await Application.find(match)
      .sort({ createdAt: -1 })
      .populate("candidateId", "name email")
      .populate("jobId", "title company location");

    res.json(apps);
  }
);

/**
 * Employer/HR update statuses
 * PATCH /api/applications/:id/status
 *
 * Body:
 * { hiringStatus?: "PENDING"|"INVITED"|"UNDER_REVIEW"|"SHORTLISTED"|"HIRED"|"REJECTED",
 *   interviewStatus?: "PENDING"|"IN_PROGRESS"|"COMPLETED",
 *   overallScore?: number,
 *   communication?: string }
 */
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
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Application not found" });
    res.json(updated);
  }
);

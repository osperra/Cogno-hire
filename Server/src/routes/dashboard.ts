import { Router } from "express";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";

export const dashboardRouter = Router();


dashboardRouter.get(
  "/employer",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const employerId = req.user!.id;

    const jobs = await Job.find({ employerId }).sort({ createdAt: -1 }).limit(5);

    const jobIds = jobs.map((j) => j._id);

    const apps = await Application.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("candidateId", "name email")
      .populate("jobId", "title");

    const [activeJobPosts, totalResponses, pendingReviews, hired, rejected] =
      await Promise.all([
        Job.countDocuments({ employerId }),
        Application.countDocuments({ jobId: { $in: jobIds } }),
        Application.countDocuments({
          jobId: { $in: jobIds },
          hiringStatus: { $in: ["PENDING", "UNDER_REVIEW", "INVITED", "SHORTLISTED"] },
        }),
        Application.countDocuments({ jobId: { $in: jobIds }, hiringStatus: "HIRED" }),
        Application.countDocuments({ jobId: { $in: jobIds }, hiringStatus: "REJECTED" }),
      ]);

    const responsesAgg = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);

    const responsesMap = new Map<string, number>();
    responsesAgg.forEach((r) => responsesMap.set(String(r._id), r.count));

    const recentJobs = jobs.map((j: any) => ({
      _id: String(j._id),
      title: j.title,
      type: j.type ?? undefined,
      location: j.location ?? undefined,
      ctc: j.ctc ?? undefined,
      experience: j.experience ?? undefined,
      duration: j.duration ?? undefined,
      difficulty: j.difficulty ?? undefined,
      responses: responsesMap.get(String(j._id)) ?? 0,
    }));

    res.json({
      kpis: {
        activeJobPosts,
        totalResponses,
        pendingReviews,
        hired,
        rejected,
      },
      recentJobs,
      recentApplications: apps,
    });
  }
);

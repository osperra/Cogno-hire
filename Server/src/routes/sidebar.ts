import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";
import { Notification } from "../models/Notification.js";

export const sidebarRouter = Router();

sidebarRouter.get("/counts", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;

    // ✅ cast once (safe even if already ObjectId-ish)
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (role === "employer" || role === "hr") {
      // ✅ try both (string + ObjectId) to avoid schema mismatch pain
      const employerMatch = userObjectId
        ? { $in: [userId, userObjectId] }
        : userId;

      const jobs = await Job.find({ employerId: employerMatch }).select("_id").lean();
      const jobIds = jobs.map((j) => j._id);

      const employerJobs = jobIds.length;

      if (!jobIds.length) {
        return res.json({
          employerJobs: 0,
          employerApplicants: 0,
          employerDocuments: 0,
          employerReviews: 0,
          employerOnboarding: 0,
        });
      }

      const employerApplicants = await Application.countDocuments({
        jobId: { $in: jobIds },
      });

      const employerReviews = await Application.countDocuments({
        jobId: { $in: jobIds },
        hiringStatus: { $in: ["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED"] },
      });

      const employerOnboarding = await Application.countDocuments({
        jobId: { $in: jobIds },
        hiringStatus: "HIRED",
      });

      const employerDocuments = 0;

      return res.json({
        employerJobs,
        employerApplicants,
        employerDocuments,
        employerReviews,
        employerOnboarding,
      });
    }

    const candidateJobs = await Job.countDocuments({ isActive: true });

    const candidateApplications = await Application.countDocuments({
      candidateId: userObjectId ? { $in: [userId, userObjectId] } : userId,
    });

    const candidateNotificationsUnread = await Notification.countDocuments({
      userId: userObjectId ? { $in: [userId, userObjectId] } : userId,
      $or: [{ isRead: false }, { readAt: { $exists: false } }, { readAt: null }],
    });

    return res.json({
      candidateJobs,
      candidateApplications,
      candidateNotificationsUnread,
    });
  } catch (e) {
    console.error("SIDEBAR_COUNTS_ERROR:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";
import { Notification } from "../models/Notification.js";

export const sidebarRouter = Router();

sidebarRouter.get("/counts", requireAuth, async (req: AuthedRequest, res) => {
  const role = req.user!.role;

  if (role === "employer") {
    const employerJobs = await Job.countDocuments({ employerId: req.user!.id });
    const employerApplicants = 0;
    const employerDocuments = 0;
    const employerReviews = 0;
    const employerOnboarding = 0;

    return res.json({
      employerJobs,
      employerApplicants,
      employerDocuments,
      employerReviews,
      employerOnboarding,
    });
  }

  return res.json({
    candidateJobs: 0, 
    candidateApplications: 0,
    candidateNotificationsUnread: 0,
  });
});

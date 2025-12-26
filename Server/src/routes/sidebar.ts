import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
// import { Application } from "../models/Application.js";
// import { Notification } from "../models/Notification.js";

export const sidebarRouter = Router();

sidebarRouter.get("/counts", requireAuth, async (req: AuthedRequest, res) => {
  const role = req.user!.role;

  // NOTE: Adjust queries based on your actual models/fields
  if (role === "employer") {
    const employerJobs = await Job.countDocuments({ employerId: req.user!.id });

    // placeholder until you add actual models
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

  // candidate
  // const candidateApplications = await Application.countDocuments({ candidateId: req.user!.id });
  // const candidateNotificationsUnread = await Notification.countDocuments({ userId: req.user!.id, isRead: false });

  return res.json({
    candidateJobs: 0, // you can do Job.countDocuments({ status: "open" }) etc
    candidateApplications: 0,
    candidateNotificationsUnread: 0,
  });
});

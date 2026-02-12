import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { CompanyProfile } from "../models/CompanyProfile.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";
import { Notification } from "../models/Notification.js";

export const accountRouter = Router();

accountRouter.delete("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  await Promise.all([
    CompanyProfile.deleteMany({ employerId: userId }).catch(() => null),
    Job.deleteMany({ employerId: userId }).catch(() => null),
    Application.deleteMany({ employerId: userId }).catch(() => null),
    Notification.deleteMany({ userId }).catch(() => null),
  ]);

  await User.deleteOne({ _id: userId });

  return res.json({ message: "Account deleted" });
});

import { Router, Response } from "express";
import { Types } from "mongoose";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Job } from "../models/Jobs"; 
import { Application } from "../models/Application"; 

const router = Router();

type DashboardJob = {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  type: string;
  ctc: string;
  match: number;
};

type ApplicationStatus = "Pending" | "Interview Completed" | "Hired";
type InterviewStatus = "Not Started" | "Completed";

type DashboardApplication = {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  appliedDate: string;
  status: ApplicationStatus;
  interviewStatus: InterviewStatus;
  score: number | null;
};

function safeStr(v: any, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function shortLogo(company: string): string {
  const cleaned = safeStr(company, "COGNO");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function toCtc(job: any): string {
  const sr = job?.salaryRange;
  if (sr && typeof sr === "object") {
    const min = sr?.min ?? sr?.from ?? sr?.start;
    const max = sr?.max ?? sr?.to ?? sr?.end;
    const cur = safeStr(sr?.currency, "₹");
    if (min != null && max != null) return `${cur}${min} - ${cur}${max}`;
    if (min != null) return `${cur}${min}+`;
    if (max != null) return `Up to ${cur}${max}`;
  }

  return safeStr(job?.ctc, "-");
}

function toDashboardJob(doc: any, idx: number): DashboardJob {
  const title = safeStr(doc?.title, "Job");
  const company = safeStr(doc?.company, safeStr(doc?.companyName, "Company"));
  const location = safeStr(doc?.location, "-");
  const type = safeStr(doc?.jobType, safeStr(doc?.type, "-"));

  const match = Math.max(
    60,
    Math.min(99, 75 + ((idx * 7) % 20))
  );

  return {
    id: idx + 1, 
    company,
    companyLogo: safeStr(doc?.companyLogo, shortLogo(company)),
    title,
    location,
    type,
    ctc: toCtc(doc),
    match,
  };
}

router.get(
  "/candidate/dashboard",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const userObjectId = new Types.ObjectId(userId);

      const me = await User.findById(userObjectId).select("name email role").lean<{
        _id: Types.ObjectId;
        name: string;
        email: string;
        role: string;
      }>();

      if (!me) return res.status(404).json({ message: "User not found" });

      const recommendedDocs = await Job.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const invitedDocs = await Job.find({
        isActive: true,
        invitedCandidates: userObjectId,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const recommendedJobs = recommendedDocs.map((d: any, i: number) =>
        toDashboardJob(d, i)
      );

      const invitedJobs = invitedDocs.map((d: any, i: number) =>
        toDashboardJob(d, i)
      );

  
      let recentApplications: DashboardApplication[] = [];

      try {
        const appDocs = await Application.find({ candidateId: userObjectId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        recentApplications = appDocs.map((a: any, i: number) => {
          const company = safeStr(a?.company, a?.companyName || "Company");
          const title = safeStr(a?.title, a?.jobTitle || "Job");
          const statusRaw = safeStr(a?.status, "Pending");

          const status: ApplicationStatus =
            statusRaw === "Hired"
              ? "Hired"
              : statusRaw === "Interview Completed"
              ? "Interview Completed"
              : "Pending";

          const interviewStatus: InterviewStatus =
            safeStr(a?.interviewStatus) === "Completed" ? "Completed" : "Not Started";

          return {
            id: i + 1,
            company,
            companyLogo: safeStr(a?.companyLogo, shortLogo(company)),
            title,
            appliedDate: (a?.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString()),
            status,
            interviewStatus,
            score: typeof a?.score === "number" ? a.score : null,
          };
        });
      } catch {
        recentApplications = [];
      }

      const pendingInterviews = recentApplications.filter(
        (a) => a.interviewStatus === "Not Started"
      ).length;

      const offersReceived = recentApplications.filter(
        (a) => a.status === "Hired"
      ).length;

      return res.json({
        me: {
          id: String(me._id),
          name: me.name,
          email: me.email,
          role: me.role,
        },
        profileCompletion: 75,
        stats: {
          totalApplications: recentApplications.length,
          pendingInterviews,
          offersReceived,
          newRecommendations: recommendedJobs.length,
          invitedCount: invitedJobs.length,
        },
        recommendedJobs,
        invitedJobs,
        recentApplications,
      });
    } catch (err) {
      console.error("dashboard error:", err);
      return res.status(500).json({ message: "Dashboard failed" });
    }
  }
);

export default router;

import { Router, Response } from "express";
import { Types } from "mongoose";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";
import { Notification } from "../models/Notification.js";
import { CompanyProfile } from "../models/CompanyProfile.js";

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

type RecentActivityItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

function safeStr(v: unknown, fallback = ""): string {
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

  const match = Math.max(60, Math.min(99, 75 + ((idx * 7) % 20)));

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

      const me = await User.findById(userObjectId)
        .select("name email role")
        .lean<{ _id: Types.ObjectId; name: string; email: string; role: string }>();

      if (!me) return res.status(404).json({ message: "User not found" });

      const recommendedDocs = await Job.aggregate([
        { $match: { isActive: true, status: "open" } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "company_profiles",
            localField: "employerId",
            foreignField: "employerId",
            as: "profile",
          },
        },
        {
          $addFields: {
            company: { $ifNull: ["$companyName", { $arrayElemAt: ["$profile.companyName", 0] }, "$company", "Company"] },
            logoUrl: { $arrayElemAt: ["$profile.logoUrl", 0] },
          },
        },
        { $project: { profile: 0 } },
      ]);

      const invitedDocs = await Job.aggregate([
        { $match: { isActive: true, status: "open", invitedCandidates: userObjectId } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "company_profiles",
            localField: "employerId",
            foreignField: "employerId",
            as: "profile",
          },
        },
        {
          $addFields: {
            company: { $ifNull: ["$companyName", { $arrayElemAt: ["$profile.companyName", 0] }, "$company", "Company"] },
            logoUrl: { $arrayElemAt: ["$profile.logoUrl", 0] },
          },
        },
        { $project: { profile: 0 } },
      ]);

      const recommendedJobs = recommendedDocs.map((d: any, i: number) => toDashboardJob(d, i));
      const invitedJobs = invitedDocs.map((d: any, i: number) => toDashboardJob(d, i));

      let recentApplications: DashboardApplication[] = [];
      try {
        const appDocs = await Application.find({ candidateId: userObjectId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate({
            path: "jobId",
            select: "title company companyName employerId",
          })
          .lean();

        const employerIds = appDocs.map((a: any) => a.jobId?.employerId).filter(Boolean);
        const profiles = await CompanyProfile.find({ employerId: { $in: employerIds } }).select("employerId companyName logoUrl").lean();
        const profileMap = new Map(profiles.map((p: any) => [String(p.employerId), p]));

        recentApplications = appDocs.map((a: any, i: number) => {
          const job = (a?.jobId as any) || {};
          const profile = profileMap.get(String(job.employerId));
          const company = safeStr(job.companyName, safeStr(profile?.companyName, safeStr(job.company, "Company")));
          const logoUrl = (profile as any)?.logoUrl || "";
          const title = safeStr(job?.title, "Job");

          const statusRaw = safeStr(a?.status, safeStr(a?.hiringStatus, "Pending"));
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
            companyLogo: logoUrl || shortLogo(company),
            title,
            appliedDate: a?.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
            status,
            interviewStatus,
            score: typeof a?.score === "number" ? a.score : typeof a?.overallScore === "number" ? a.overallScore : null,
          };
        });
      } catch {
        recentApplications = [];
      }

      const pendingInterviews = recentApplications.filter((a) => a.interviewStatus === "Not Started").length;
      const offersReceived = recentApplications.filter((a) => a.status === "Hired").length;

      const notifs = await Notification.find({ userId: userId })
        .sort({ isRead: 1, createdAt: -1 })
        .limit(10)
        .lean();

      const recentActivity: RecentActivityItem[] = notifs.map((n: any) => ({
        id: String(n._id),
        type: safeStr(n.type, "general"),
        title: safeStr(n.title, "Notification"),
        message: safeStr(n.message, ""),
        link: typeof n.link === "string" ? n.link : undefined,
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
      }));

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

        recentActivity,
      });
    } catch (err) {
      console.error("dashboard error:", err);
      return res.status(500).json({ message: "Dashboard failed" });
    }
  }
);

export default router;

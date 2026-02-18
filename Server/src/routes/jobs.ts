import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { CompanyProfile } from "../models/CompanyProfile.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

export const jobsRouter = Router();

function toRegex(q: string) {
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(safe, "i");
}

const salaryRangeSchema = z
  .object({
    start: z.number().optional(),
    end: z.number().optional(),
    currency: z.string().optional(),
  })
  .optional();

const salaryRangeInputSchema = z.union([z.string(), salaryRangeSchema]).optional();

const techStackSchema = z
  .array(z.string())
  .optional()
  .transform((arr) => {
    if (!arr) return undefined;
    const cleaned = arr.map((s) => String(s).trim()).filter(Boolean);
    return cleaned.length ? cleaned : undefined;
  });

const jobInputSchema = z.object({
  title: z.string().min(1).transform((s) => s.trim()),
  about: z.string().optional(),
  description: z.string().optional(),

  company: z.string().optional(),
  companyName: z.string().optional(),

  location: z.string().optional(),
  workType: z.string().optional(),

  jobType: z.string().optional(),
  salaryRange: salaryRangeInputSchema,

  isActive: z.boolean().optional(),
  workExperience: z.number().optional(),

  techStack: techStackSchema,

  interviewSettings: z
    .object({
      maxCandidates: z.number().optional(),
      interviewDuration: z.number().optional(),
      difficultyLevel: z.string().optional(),
      language: z.string().optional(),
      interviewers: z.array(z.unknown()).optional(),
      questions: z.array(z.unknown()).optional(),
    })
    .optional(),

  invitedCandidates: z.array(z.unknown()).optional(),
  price: z.number().optional(),
  paymentDetails: z.unknown().optional(),

  status: z.enum(["draft", "open", "closed"]).optional(),
});

async function createCandidateJobNotifications(job: any) {
  const candidates = await User.find({ role: "candidate" }).select("_id").lean();
  if (!candidates.length) return;

  const company = String(job.companyName ?? job.company ?? "Company");
  const title = String(job.title ?? "New job");

  const docs = candidates.map((c) => ({
    userId: String(c._id),
    type: "job_created" as const,
    title: "New job posted",
    message: `${company} posted "${title}".`,
    link: `/app/candidate/jobs`,
    meta: {
      jobId: String(job._id),
      company,
      title,
    },
    isRead: false,
  }));

  await Notification.insertMany(docs, { ordered: false });
}


jobsRouter.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 10) || 10));
  const skip = (page - 1) * limit;
  const q =
    String(req.query.q ?? "").trim() ||
    String(req.query.search ?? "").trim();
  const location = String(req.query.location ?? "").trim();
  const workType = String(req.query.workType ?? "").trim();
  const jobType = String(req.query.jobType ?? "").trim();
  const difficulty = String(req.query.difficulty ?? "").trim();
  const minSalary = String(req.query.minSalary ?? "").trim();
  const sort = String(req.query.sort ?? "recent").trim();
  const includeAll = String(req.query.includeAll ?? "") === "1";
  const filter: Record<string, unknown> = {};

  if (!includeAll) {
    filter.status = "open";
    filter.isActive = { $ne: false };
  }

  if (q) {
    const rx = toRegex(q);
    (filter as any).$or = [
      { title: rx },
      { about: rx },
      { description: rx },
      { company: rx },
      { companyName: rx },
      { location: rx },
      { workType: rx },
      { jobType: rx },
      { techStack: rx },
      { skills: rx },
    ];
  }

  if (location && location !== "all-locations") {
    (filter as any).$and = (filter as any).$and ?? [];
    (filter as any).$and.push({
      $or: [{ location: toRegex(location) }, { workType: toRegex(location) }],
    });
  }

  if (workType) (filter as any).workType = toRegex(workType);
  if (jobType) (filter as any).jobType = toRegex(jobType);

  if (difficulty) {
    (filter as any).$and = (filter as any).$and ?? [];
    (filter as any).$and.push({
      $or: [
        { "interviewSettings.difficultyLevel": toRegex(difficulty) },
        { difficultyLevel: toRegex(difficulty) },
        { difficulty: toRegex(difficulty) },
      ],
    });
  }

  if (minSalary) {
    const n = Number(minSalary);
    if (Number.isFinite(n)) (filter as any)["salaryRange.start"] = { $gte: n };
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "salary-high") {
    sortObj = {
      "salaryRange.end": -1,
      "salaryRange.start": -1,
      createdAt: -1,
    } as any;
  }

  const [items, total] = await Promise.all([
    Job.aggregate([
      { $match: filter },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
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
    ]),
    Job.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

jobsRouter.get(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const jobs = await Job.find({ employerId: req.user!.id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  }
);

jobsRouter.get(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findOne({ _id: id, employerId: req.user!.id }).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    return res.json(job);
  }
);

jobsRouter.post(
  "/:id/duplicate",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const original = await Job.findOne({
      _id: id,
      employerId: req.user!.id,
    }).lean();

    if (!original) return res.status(404).json({ message: "Job not found" });

    const { _id, createdAt, updatedAt, __v, ...rest } = original as any;

    const copy = await Job.create({
      ...rest,
      employerId: req.user!.id,
      title: original.title ? `${original.title} (Copy)` : "Untitled (Copy)",
      status: "draft",
      isActive: true,
      invitedCandidates: [],
    });

    return res.status(201).json(copy);
  }
);

jobsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const deleted = await Job.findOneAndDelete({
      _id: id,
      employerId: req.user!.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Job not found or not allowed" });
    }

    return res.json({ ok: true, id });
  }
);

jobsRouter.get(
  "/:id/applicants",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findOne({ _id: id, employerId: req.user!.id })
      .select("_id title")
      .lean();

    if (!job) return res.status(404).json({ message: "Job not found" });

    const apps = await Application.find({ jobId: new Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .populate("candidateId", "name email")
      .select("candidateId hiringStatus interviewStatus overallScore createdAt")
      .lean();

    const result = apps.map((a: any) => ({
      _id: String(a._id),
      userId: a.candidateId?._id ? String(a.candidateId._id) : undefined,
      name: a.candidateId?.name,
      email: a.candidateId?.email,
      status: a.hiringStatus,
      score: typeof a.overallScore === "number" ? a.overallScore : 0,
      appliedAt: a.createdAt ? new Date(a.createdAt).toISOString() : undefined,
      interviewStatus: a.interviewStatus,
    }));

    return res.json(result);
  }
);

jobsRouter.post(
  "/",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const parsed = jobInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const sr = parsed.data.salaryRange;
    const normalizedSalaryRange = typeof sr === "string" ? undefined : sr;

    const profile = await CompanyProfile.findOne({ employerId: req.user!.id }).select("companyName").lean();
    const finalCompanyName = parsed.data.companyName ?? parsed.data.company ?? profile?.companyName ?? "Company";

    const job = await Job.create({
      employerId: req.user!.id,
      ...parsed.data,
      companyName: finalCompanyName,
      salaryRange: normalizedSalaryRange,
    });

    try {
      const status = String((job as any).status ?? "");
      const isActive = (job as any).isActive !== false;
      if (status === "open" && isActive) {
        await createCandidateJobNotifications(job);
      }
    } catch (e) {
      console.error("JOB_CREATED_NOTIFY_CANDIDATES_ERROR:", e);
    }

    res.status(201).json(job);
  }
);

jobsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const parsed = jobInputSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const sr = parsed.data.salaryRange;
    const normalizedSalaryRange = typeof sr === "string" ? undefined : sr;

    const before = await Job.findOne({ _id: req.params.id, employerId: req.user!.id })
      .select("_id status isActive title company companyName")
      .lean();

    const profile = await CompanyProfile.findOne({ employerId: req.user!.id }).select("companyName").lean();
    const finalCompanyName = parsed.data.companyName ?? parsed.data.company ?? profile?.companyName ?? before?.companyName ?? "Company";

    const updated = await Job.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user!.id },
      { $set: { ...parsed.data, companyName: finalCompanyName, salaryRange: normalizedSalaryRange } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Job not found or not allowed" });

    try {
      const wasVisible =
        before && String((before as any).status) === "open" && (before as any).isActive !== false;

      const nowVisible =
        String((updated as any).status) === "open" && (updated as any).isActive !== false;

      if (!wasVisible && nowVisible) {
        await createCandidateJobNotifications(updated);
      }
    } catch (e) {
      console.error("JOB_PATCH_NOTIFY_CANDIDATES_ERROR:", e);
    }

    res.json(updated);
  }
);



jobsRouter.post(
  "/:id/save",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(id).select("_id").lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    await User.findByIdAndUpdate(req.user!.id, {
      $addToSet: { savedJobs: id },
    });

    return res.json({ ok: true });
  }
);

jobsRouter.delete(
  "/:id/save",
  requireAuth,
  requireRole(["candidate"]),
  async (req: AuthedRequest, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    await User.findByIdAndUpdate(req.user!.id, {
      $pull: { savedJobs: id },
    });

    return res.json({ ok: true });
  }
);

export default jobsRouter;

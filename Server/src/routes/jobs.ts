import { Router } from "express";
import { z } from "zod";
import { Job } from "../models/Jobs.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

export const jobsRouter = Router();

function toRegex(q: string) {
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(safe, "i");
}

jobsRouter.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 10) || 10));
  const skip = (page - 1) * limit;

  const q = String(req.query.q ?? "").trim();
  const location = String(req.query.location ?? "").trim();
  const workType = String(req.query.workType ?? "").trim();
  const jobType = String(req.query.jobType ?? "").trim();
  const difficulty = String(req.query.difficulty ?? "").trim();
  const minSalary = String(req.query.minSalary ?? "").trim();
  const sort = String(req.query.sort ?? "recent").trim();

  // ✅ candidate should see all jobs → but usually only "open" + active
  // If you truly want EVERYTHING including closed/draft, pass includeAll=1
  const includeAll = String(req.query.includeAll ?? "") === "1";

  const filter: any = {};

  if (!includeAll) {
    filter.status = "open";
    filter.isActive = { $ne: false };
  }

  if (q) {
    const rx = toRegex(q);
    filter.$or = [
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
    // supports "remote" / "hybrid" / "onsite" kinds of values
    filter.$and = filter.$and ?? [];
    filter.$and.push({
      $or: [{ location: toRegex(location) }, { workType: toRegex(location) }],
    });
  }

  if (workType) {
    filter.workType = toRegex(workType);
  }

  if (jobType) {
    filter.jobType = toRegex(jobType);
  }

  if (difficulty) {
    filter.$and = filter.$and ?? [];
    filter.$and.push({
      $or: [
        { "interviewSettings.difficultyLevel": toRegex(difficulty) },
        { difficultyLevel: toRegex(difficulty) },
        { difficulty: toRegex(difficulty) },
      ],
    });
  }

  if (minSalary) {
    const n = Number(minSalary);
    if (Number.isFinite(n)) {
      // salaryRange.start >= min
      filter["salaryRange.start"] = { $gte: n };
    }
  }

  // ✅ sorting
  let sortObj: any = { createdAt: -1 }; // recent default
  if (sort === "salary-high") sortObj = { "salaryRange.end": -1, "salaryRange.start": -1, createdAt: -1 };
  if (sort === "relevance") sortObj = { createdAt: -1 }; // keep simple unless you add text indexes
  if (sort === "match") sortObj = { createdAt: -1 }; // placeholder unless you calculate match

  const [items, total] = await Promise.all([
    Job.find(filter).sort(sortObj).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

jobsRouter.get(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const jobs = await Job.find({ employerId: req.user!.id }).sort({ createdAt: -1 });
    res.json(jobs);
  }
);

const salaryRangeSchema = z
  .object({
    start: z.number().optional(),
    end: z.number().optional(),
    currency: z.string().optional(),
  })
  .optional();

const salaryRangeInputSchema = z.union([z.string(), salaryRangeSchema]).optional();

jobsRouter.post(
  "/",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      title: z.string().min(1),
      about: z.string().optional(),

      // ✅ accept company from frontend (preferred)
      company: z.string().optional(),
      companyName: z.string().optional(),

      location: z.string().optional(),
      workType: z.string().optional(),

      jobType: z.string().optional(),
      salaryRange: salaryRangeInputSchema,

      isActive: z.boolean().optional(),
      workExperience: z.number().optional(),

      interviewSettings: z
        .object({
          maxCandidates: z.number().optional(),
          interviewDuration: z.number().optional(),
          difficultyLevel: z.string().optional(),
          language: z.string().optional(),
        })
        .optional(),

      status: z.enum(["draft", "open", "closed"]).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const sr = parsed.data.salaryRange;
    const normalizedSalaryRange = typeof sr === "string" ? undefined : sr;

    const job = await Job.create({
      employerId: req.user!.id,
      ...parsed.data,
      salaryRange: normalizedSalaryRange,
    });

    res.status(201).json(job);
  }
);

jobsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      title: z.string().min(1).optional(),
      about: z.string().optional(),

      company: z.string().optional(),
      companyName: z.string().optional(),

      location: z.string().optional(),
      workType: z.string().optional(),

      jobType: z.string().optional(),
      salaryRange: salaryRangeInputSchema,

      isActive: z.boolean().optional(),
      workExperience: z.number().optional(),

      interviewSettings: z
        .object({
          maxCandidates: z.number().optional(),
          interviewDuration: z.number().optional(),
          difficultyLevel: z.string().optional(),
          language: z.string().optional(),
        })
        .optional(),

      status: z.enum(["draft", "open", "closed"]).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const sr = parsed.data.salaryRange;
    const normalizedSalaryRange = typeof sr === "string" ? undefined : sr;

    const updated = await Job.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user!.id },
      { $set: { ...parsed.data, salaryRange: normalizedSalaryRange } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Job not found or not allowed" });
    res.json(updated);
  }
);

import { Router } from "express";
import { z } from "zod";
import { Job } from "../models/Jobs.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

export const jobsRouter = Router();

jobsRouter.get("/", async (_req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
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
    const normalizedSalaryRange =
      typeof sr === "string"
        ? undefined 
        : sr;

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
    const normalizedSalaryRange =
      typeof sr === "string"
        ? undefined
        : sr;

    const updated = await Job.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user!.id },
      { $set: { ...parsed.data, salaryRange: normalizedSalaryRange } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Job not found or not allowed" });
    res.json(updated);
  }
);

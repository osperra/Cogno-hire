import { Router } from "express";
import { z } from "zod";
import { CompanyProfile } from "../models/companyProfile";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

export const companyProfileRouter = Router();

// Get my company profile
companyProfileRouter.get(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const profile = await CompanyProfile.findOne({ employerId: req.user!.id });
    res.json(profile ?? null);
  }
);

// Upsert my company profile
companyProfileRouter.put(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      companyName: z.string().min(1),
      tagline: z.string().optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      companySize: z.string().optional(),
      foundedYear: z.number().optional(),
      headquarters: z.string().optional(),
      description: z.string().optional(),
      mission: z.string().optional(),
      values: z.string().optional(),
      contactEmail: z.string().optional(),
      phone: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
      facebook: z.string().optional(),
      culture: z.string().optional(),
      benefits: z.string().optional(),
      logoUrl: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const profile = await CompanyProfile.findOneAndUpdate(
      { employerId: req.user!.id },
      { $set: parsed.data },
      { upsert: true, new: true }
    );

    res.json(profile);
  }
);

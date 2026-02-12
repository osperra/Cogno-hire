import { Router } from "express"; import { z } from "zod";
import multer from "multer";
import { CompanyProfile } from "../models/CompanyProfile.js";
import {
  requireAuth,
  requireRole,
  type AuthedRequest,
} from "../middleware/auth.js";
import { storage } from "../config/cloudinary.js";

export const companyProfileRouter = Router();


const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed") as any, false);
  },
});

type MulterAuthedRequest = AuthedRequest & {
  file?: Express.Multer.File;
};

function normalizeCompanyPayload(input: any) {
  const i = input ?? {};

  return {
    companyName: (i.companyName ?? i.name ?? "").toString().trim(),
    tagline: i.tagline ? String(i.tagline) : undefined,
    website: i.website ? String(i.website) : undefined,
    industry: i.industry ? String(i.industry) : undefined,
    companySize: i.companySize ?? i.size ? String(i.companySize ?? i.size) : undefined,
    foundedYear:
      i.foundedYear === undefined || i.foundedYear === null || i.foundedYear === ""
        ? undefined
        : Number(i.foundedYear),
    headquarters: i.headquarters ?? i.location ? String(i.headquarters ?? i.location) : undefined,
    description: i.description ? String(i.description) : undefined,
    mission: i.mission ? String(i.mission) : undefined,
    values: i.values ? String(i.values) : undefined,
    contactEmail: i.contactEmail ? String(i.contactEmail) : undefined,
    phone: i.phone ? String(i.phone) : undefined,
    linkedin: i.linkedin ? String(i.linkedin) : undefined,
    twitter: i.twitter ? String(i.twitter) : undefined,
    github: i.github ? String(i.github) : undefined,
    facebook: i.facebook ? String(i.facebook) : undefined,
    culture: i.culture ? String(i.culture) : undefined,
    benefits: i.benefits ? String(i.benefits) : undefined,
  };
}

const companyUpsertSchema = z
  .object({
    companyName: z.string().optional(),
    name: z.string().optional(),

    tagline: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),

    companySize: z.string().optional(),
    size: z.string().optional(),

    foundedYear: z
      .preprocess((v) => {
        if (v === "" || v === null || v === undefined) return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : v;
      }, z.number().int().min(1800).max(new Date().getFullYear()).optional())
      .optional(),

    headquarters: z.string().optional(),
    location: z.string().optional(),

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
  })
  .passthrough();

companyProfileRouter.get(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const profile = await CompanyProfile.findOne({ employerId: req.user!.id });
    return res.json(profile ?? null);
  },
);

companyProfileRouter.put(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const parsed = companyUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const normalized = normalizeCompanyPayload(parsed.data);

    const existing = await CompanyProfile.findOne({ employerId: req.user!.id })
      .select("companyName")
      .lean();

    const finalCompanyName =
      normalized.companyName ||
      (existing?.companyName ? String(existing.companyName) : "Company");

    const updateDoc = {
      ...normalized,
      companyName: finalCompanyName,
    };

    const profile = await CompanyProfile.findOneAndUpdate(
      { employerId: req.user!.id },
      { $set: updateDoc },
      { upsert: true, new: true },
    );

    return res.json(profile);
  },
);


companyProfileRouter.get(
  "/me/basic",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const profile = await CompanyProfile.findOne({ employerId: req.user!.id }).lean();

    if (!profile) return res.json(null);

    return res.json({
      _id: profile._id,
      name: profile.companyName ?? "",
      website: profile.website ?? "",
      industry: profile.industry ?? "",
      size: profile.companySize ?? "",
      location: profile.headquarters ?? "",
      description: profile.description ?? "",
      logoUrl: (profile as any).logoUrl ?? "",
    });
  },
);


companyProfileRouter.put(
  "/me/basic",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      name: z.string().optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      size: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const payload = normalizeCompanyPayload(parsed.data);

    const existing = await CompanyProfile.findOne({ employerId: req.user!.id })
      .select("companyName")
      .lean();

    const finalCompanyName =
      payload.companyName ||
      (existing?.companyName ? String(existing.companyName) : "Company");

    const updated = await CompanyProfile.findOneAndUpdate(
      { employerId: req.user!.id },
      {
        $set: {
          companyName: finalCompanyName,
          website: payload.website,
          industry: payload.industry,
          companySize: payload.companySize,
          headquarters: payload.headquarters,
          description: payload.description,
        },
      },
      { upsert: true, new: true },
    ).lean();

    return res.json({
      _id: updated?._id,
      name: updated?.companyName ?? "",
      website: updated?.website ?? "",
      industry: updated?.industry ?? "",
      size: updated?.companySize ?? "",
      location: updated?.headquarters ?? "",
      description: updated?.description ?? "",
      logoUrl: (updated as any)?.logoUrl ?? "",
    });
  },
);

companyProfileRouter.post(
  "/logo",
  requireAuth,
  requireRole(["employer", "hr"]),
  upload.single("logo"),
  async (req: MulterAuthedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      if (!req.file) return res.status(400).json({ message: "Logo file is required" });

      const employerId = req.user.id;

      let profile = await CompanyProfile.findOne({ employerId });
      if (!profile) {
        profile = await CompanyProfile.create({
          employerId,
          companyName: "Company",
        });
      }

      const logoUrl = req.file.path;

      (profile as any).logoUrl = logoUrl;
      profile.logoMimeType = req.file.mimetype;
      profile.logoOriginalName = req.file.originalname;

      await profile.save();

      return res.json({ logoUrl });
    } catch (e) {
      console.error("COMPANY_LOGO_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

companyProfileRouter.get(
  "/logo/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const employerId = req.user!.id;

    const profile = await CompanyProfile.findOne({ employerId }).lean();

    if ((profile as any)?.logoUrl) {
      return res.redirect((profile as any).logoUrl);
    }

    if ((profile as any)?.logoGridFsId) {
      return res
        .status(404)
        .json({ message: "Logo not found (legacy storage not supported)" });
    }

    return res.status(404).json({ message: "Logo not found" });
  },
);

export default companyProfileRouter;

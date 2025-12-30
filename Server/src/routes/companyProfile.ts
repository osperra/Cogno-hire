import { Router, type Request } from "express";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { CompanyProfile } from "../models/companyProfile.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";

export const companyProfileRouter = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "logos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".png";
    const name = `logo_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype);
  if (!ok) {
    cb(new Error("Only PNG/JPG/WEBP allowed"));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, 
});

type MulterAuthedRequest = AuthedRequest & {
  file?: Express.Multer.File;
};

companyProfileRouter.get(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const profile = await CompanyProfile.findOne({ employerId: req.user!.id });
    res.json(profile ?? null);
  }
);

companyProfileRouter.put(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const schema = z.object({
      companyName: z.string().min(1).transform((s) => s.trim()),
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

companyProfileRouter.post(
  "/logo",
  requireAuth,
  requireRole(["employer", "hr"]),
  upload.single("logo"),
  async (req: MulterAuthedRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "Logo file is required" });

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const existing = await CompanyProfile.findOne({ employerId: req.user.id });

    if (!existing) {
      const created = await CompanyProfile.create({
        employerId: req.user.id,
        companyName: "Company",
        logoUrl,
      });
      return res.json({ logoUrl: created.logoUrl });
    }

    existing.logoUrl = logoUrl;
    await existing.save();

    res.json({ logoUrl });
  }
);

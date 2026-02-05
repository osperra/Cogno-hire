// Server/src/routes/companyProfile.ts
import { Router, type Request } from "express";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import { CompanyProfile } from "../models/companyProfile.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { Types } from "mongoose";
import { storage } from "../config/cloudinary.js"; // Import Cloudinary storage

export const companyProfileRouter = Router();

/**
 * ✅ We store logo in Cloudinary
 */
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
       cb(null, true);
    } else {
       cb(new Error("Only images allowed") as any, false);
    }
  }
});

type MulterAuthedRequest = AuthedRequest & {
  file?: Express.Multer.File;
};

/**
 * GET /api/company-profile/me
 */
companyProfileRouter.get(
  "/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const profile = await CompanyProfile.findOne({ employerId: req.user!.id });
    return res.json(profile ?? null);
  }
);

/**
 * PUT /api/company-profile/me
 */
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
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const profile = await CompanyProfile.findOneAndUpdate(
      { employerId: req.user!.id },
      { $set: parsed.data },
      { upsert: true, new: true }
    );

    return res.json(profile);
  }
);

/**
 * POST /api/company-profile/logo
 * form-data: logo=<file>
 *
 * ✅ Stores file in Cloudinary
 * ✅ Saves logoUrl in company profile
 */
companyProfileRouter.post(
  "/logo",
  requireAuth,
  requireRole(["employer", "hr"]),
  upload.single("logo"),
  async (req: MulterAuthedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      if (!req.file)
        return res.status(400).json({ message: "Logo file is required" });

      const employerId = req.user.id;

      // Ensure profile exists
      let profile = await CompanyProfile.findOne({ employerId });
      if (!profile) {
        profile = await CompanyProfile.create({
          employerId,
          companyName: "Company",
        });
      }

      // Cloudinary upload handled by multer, req.file.path is the URL
      const logoUrl = req.file.path;
      
      profile.logoUrl = logoUrl;
      // We can clear GridFS fields or leave them for history, but relying on logoUrl is best
      profile.logoMimeType = req.file.mimetype;
      profile.logoOriginalName = req.file.originalname;

      await profile.save();
      
      // Return the direct URL or the API endpoint
      return res.json({ logoUrl });
      
    } catch (e) {
      console.error("COMPANY_LOGO_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GET /api/company-profile/logo/me
 * ✅ Redirects to Cloudinary URL
 */
companyProfileRouter.get(
  "/logo/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const employerId = req.user!.id;

    const profile = await CompanyProfile.findOne({ employerId }).lean();
    
    if (profile?.logoUrl) {
         return res.redirect(profile.logoUrl);
    }

    // Fallback: Check if GridFS ID exists (legacy)
    if (profile?.logoGridFsId) {
        // Since we removed helper function usage here to simplify, we just return 404 or a placeholder if only GridFS exists
        // but haven't migrated. Ideally we migrate everything. 
        // For now, let's just return 404 if no Cloudinary URL.
        return res.status(404).json({ message: "Logo not found (legacy storage not supported)" });
    }
    
    return res.status(404).json({ message: "Logo not found" });
  }
);

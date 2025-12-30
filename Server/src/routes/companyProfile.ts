// Server/src/routes/companyProfile.ts
import { Router, type Request } from "express";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import { CompanyProfile } from "../models/companyProfile.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { getMongooseBucket } from "../utils/mongooseGridfs.js";
import { Types } from "mongoose";

export const companyProfileRouter = Router();

/**
 * ✅ We store logo in MongoDB (GridFS)
 * => use memoryStorage (NO disk folder)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: ((
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      file.mimetype
    );

    if (!ok) {
      // TS in your setup complains if we pass Error|null combos
      // So we use "any" call signature safely.
      (cb as any)(new Error("Only PNG/JPG/WEBP allowed"), false);
      return;
    }
    (cb as any)(null, true);
  }) as any,
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
 * ✅ Stores file in GridFS
 * ✅ Saves logoGridFsId + mimeType into company profile
 * ✅ Returns logoUrl which is a STREAM endpoint (not disk path)
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

      // If old logo exists in GridFS, delete it best-effort
      if (profile.logoGridFsId && Types.ObjectId.isValid(profile.logoGridFsId)) {
        try {
          const bucket = getMongooseBucket("logos");
          await bucket.delete(profile.logoGridFsId as any);
        } catch {
          // ignore delete failures
        }
      }

      const bucket = getMongooseBucket("logos");

      // Store mimeType in metadata (avoid "contentType" typing issue)
      const uploadStream = bucket.openUploadStream(
        req.file.originalname || "logo",
        {
          metadata: {
            mimeType: req.file.mimetype,
            employerId: String(employerId),
          },
        } as any
      );

      uploadStream.end(req.file.buffer);

      uploadStream.on("error", (err: unknown) => {
        console.error("GRIDFS_LOGO_UPLOAD_ERROR:", err);
        return res.status(500).json({ message: "Failed to upload logo" });
      });

      uploadStream.on("finish", async () => {
        // ✅ IMPORTANT: use uploadStream.id (NOT file._id)
        profile!.logoGridFsId = uploadStream.id as unknown as Types.ObjectId;
        profile!.logoMimeType = req.file!.mimetype;
        profile!.logoOriginalName = req.file!.originalname;

        // A stream endpoint that serves the image from DB
        const logoUrl = `/api/company-profile/logo/me`;

        await profile!.save();
        return res.json({ logoUrl });
      });
    } catch (e) {
      console.error("COMPANY_LOGO_ERROR:", e);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GET /api/company-profile/logo/me
 * ✅ Streams logo from GridFS for current employer
 */
companyProfileRouter.get(
  "/logo/me",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const employerId = req.user!.id;

    const profile = await CompanyProfile.findOne({ employerId }).lean();
    if (!profile?.logoGridFsId)
      return res.status(404).json({ message: "Logo not found" });

    const bucket = getMongooseBucket("logos");

    res.setHeader(
      "Content-Type",
      profile.logoMimeType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${profile.logoOriginalName || "logo"}"`
    );

    bucket.openDownloadStream(profile.logoGridFsId as any).pipe(res);
  }
);

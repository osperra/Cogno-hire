// Server/src/routes/documents.ts
import { Router, type Request } from "express";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import { Types } from "mongoose";

import { Document } from "../models/Document.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Jobs.js";

import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { storage } from "../config/cloudinary.js"; // Import Cloudinary storage

export const documentsRouter = Router();

// Use Cloudinary storage
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        // Basic filter, Cloudinary also has format restrictions
        if (file.mimetype.startsWith("image/") || 
            file.mimetype === "application/pdf" || 
            file.mimetype.includes("word") ||
            file.mimetype.includes("document")) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

type MulterAuthedRequest = Request & {
    user?: AuthedRequest["user"];
    file?: Express.Multer.File;
};

// ... helper functions (getEmployerJobIds, etc.) remain mostly same ...
async function getEmployerJobIds(employerId: string) {
    const jobs = await Job.find({ employerId }).select("_id").lean();
    return jobs.map((j) => j._id);
}

async function assertEmployerCanAccessJob(employerId: string, jobId: string) {
    const job = await Job.findById(jobId).lean();
    if (!job) return { ok: false as const, status: 404, message: "Job not found" };
    if (String((job as any).employerId) !== String(employerId)) {
        return { ok: false as const, status: 403, message: "Forbidden" };
    }
    return { ok: true as const, job };
}

async function assertEmployerCanAccessApplication(employerId: string, applicationId: string) {
    const app = await Application.findById(applicationId).lean();
    if (!app) return { ok: false as const, status: 404, message: "Application not found" };

    const jobChk = await assertEmployerCanAccessJob(employerId, String((app as any).jobId));
    if (!jobChk.ok) return jobChk;

    return { ok: true as const, app, job: jobChk.job };
}


documentsRouter.get(
    "/file/:id",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    async (req: AuthedRequest, res) => {
        try {
            const id = req.params.id;
            // NOTE: We now assume `id` might be a Mongo ObjectId of the Document record, OR a GridFS ID if legacy.
            // But usually the client calls this with the Document ID or the fileUrl handles it.
            // If the client expects to download by `gridFsId`, we need to find the document.
            
            // Let's assume the ID passed is a Document _id (or we try to find by gridFsId for backward compat)
            let doc = await Document.findById(id).lean();
            if (!doc && Types.ObjectId.isValid(id)) {
                 doc = await Document.findOne({ gridFsId: id }).lean();
            }
            // For Cloudinary migration, we might not rely on gridFsId anymore.
            
            if (!doc) return res.status(404).json({ message: "File not found" });

            // Access control
            if (req.user!.role === "candidate" && String(doc.ownerUserId) !== String(req.user!.id)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            if (req.user!.role !== "candidate") {
                if (doc.applicationId) {
                    const chk = await assertEmployerCanAccessApplication(req.user!.id, String(doc.applicationId));
                    if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                } else if (doc.jobId) {
                    const chk = await assertEmployerCanAccessJob(req.user!.id, String(doc.jobId));
                    if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                } else {
                    return res.status(403).json({ message: "Forbidden" });
                }
            }

            // Redirect to Cloudinary URL
            if (doc.fileUrl) {
                return res.redirect(doc.fileUrl);
            }

            // Fallback for legacy GridFS (if any exist and we haven't migrated them)
            // If you want to strictly remove GridFS, just error here.
             return res.status(404).json({ message: "File URL not found" });

        } catch (e) {
            console.error("DOC_FILE_STREAM_ERROR:", e);
            return res.status(500).json({ message: "Server error" });
        }
    }
);


documentsRouter.get(
    "/",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    async (req: AuthedRequest, res) => {
        try {
            const schema = z.object({
                tab: z.enum(["all", "application", "verification", "onboarding", "employee"]).optional(),
                q: z.string().optional(),
                type: z.string().optional(),
                status: z.enum(["PENDING", "VERIFIED", "COMPLETED", "SIGNED"]).optional(),
                days: z.string().optional(),
                limit: z.string().optional(),
                applicationId: z.string().optional(),
                jobId: z.string().optional(),
            });

            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

            const tab = parsed.data.tab ?? "all";
            const q = (parsed.data.q ?? "").trim().toLowerCase();
            const type = (parsed.data.type ?? "").trim();
            const status = parsed.data.status;
            const days = parseInt(parsed.data.days ?? "", 10);
            const limit = Math.min(Math.max(parseInt(parsed.data.limit ?? "200", 10) || 200, 1), 500);

            const applicationId = parsed.data.applicationId;
            const jobId = parsed.data.jobId;

            const match: Record<string, unknown> = {};

            if (req.user!.role === "candidate") {
                match.ownerUserId = req.user!.id;
            } else {
                if (applicationId) {
                    if (!Types.ObjectId.isValid(applicationId)) return res.status(400).json({ message: "Invalid applicationId" });
                    const chk = await assertEmployerCanAccessApplication(req.user!.id, applicationId);
                    if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                    match.applicationId = applicationId;
                } else if (jobId) {
                    if (!Types.ObjectId.isValid(jobId)) return res.status(400).json({ message: "Invalid jobId" });
                    const chk = await assertEmployerCanAccessJob(req.user!.id, jobId);
                    if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                    match.jobId = jobId;
                } else {
                    const ids = await getEmployerJobIds(req.user!.id);
                    if (!ids.length) return res.json([]);
                    match.jobId = { $in: ids };
                }
            }

            if (tab !== "all") {
                const tabMap: Record<string, string> = {
                    application: "Application",
                    verification: "Verification",
                    onboarding: "Onboarding",
                    employee: "Employee",
                };
                match.category = tabMap[tab] ?? tab;
            }

            if (type) match.type = type;
            if (status) match.status = status;

            if (!Number.isNaN(days) && days > 0) {
                const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                match.createdAt = { $gte: since };
            }

            let docs = await Document.find(match)
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("uploadedByUserId", "name email")
                .lean();

            if (q) {
                docs = docs.filter((d: any) => {
                    const name = String(d.name || "").toLowerCase();
                    const typeStr = String(d.type || "").toLowerCase();
                    const categoryStr = String(d.category || "").toLowerCase();
                    const uploader = String(d.uploadedByUserId?.name || d.uploadedByUserId?.email || "").toLowerCase();
                    return name.includes(q) || typeStr.includes(q) || categoryStr.includes(q) || uploader.includes(q);
                });
            }

            return res.json(docs);
        } catch (e) {
            console.error("DOCS_LIST_ERROR:", e);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

documentsRouter.get(
    "/stats",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    async (req: AuthedRequest, res) => {
        try {
            const schema = z.object({
                applicationId: z.string().optional(),
                jobId: z.string().optional(),
            });

            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

            const applicationId = parsed.data.applicationId;
            const jobId = parsed.data.jobId;

            const match: Record<string, unknown> = {};

            if (req.user!.role === "candidate") {
                match.ownerUserId = req.user!.id;
            } else {
                if (applicationId) {
                    if (!Types.ObjectId.isValid(applicationId)) return res.status(400).json({ message: "Invalid applicationId" });
                    const chk = await assertEmployerCanAccessApplication(req.user!.id, applicationId);
                    if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                    match.applicationId = applicationId;
                } else if (jobId) {
                    if (!Types.ObjectId.isValid(jobId)) return res.status(400).json({ message: "Invalid jobId" });
                    const chk = await assertEmployerCanAccessJob(req.user!.id, jobId);
                    if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                    match.jobId = jobId;
                } else {
                    const ids = await getEmployerJobIds(req.user!.id);
                    if (!ids.length) return res.json({ total: 0, verified: 0, pending: 0, requiresAction: 0 });
                    match.jobId = { $in: ids };
                }
            }

            const grouped = await Document.aggregate([
                { $match: match },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]);

            const m: Record<string, number> = {};
            for (const g of grouped) m[String(g._id)] = Number(g.count) || 0;

            const total = Object.values(m).reduce((a, b) => a + b, 0);
            const verified = (m["VERIFIED"] || 0) + (m["COMPLETED"] || 0) + (m["SIGNED"] || 0);
            const pending = m["PENDING"] || 0;

            return res.json({ total, verified, pending, requiresAction: pending });
        } catch (e) {
            console.error("DOCS_STATS_ERROR:", e);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

export default documentsRouter;

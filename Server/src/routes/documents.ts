import { Router, type Request } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Types } from "mongoose";
import { Document } from "../models/Document.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";

export const documentsRouter = Router();

const DOCS_DIR = path.join(process.cwd(), "uploads", "docs");
fs.mkdirSync(DOCS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) => cb(null, DOCS_DIR),

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const safeExt = ext || ".bin";
        const name = `doc_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
        cb(null, name);
    },
});

const ALLOWED_MIME = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
]);

const fileFilter: multer.Options["fileFilter"] = (req, file, callback) => {
    const ok = ALLOWED_MIME.has(file.mimetype);

    const cb = callback as unknown as (error: Error | null, acceptFile: boolean) => void;

    if (!ok) return cb(new Error("Only PDF/DOC/DOCX/JPG/PNG allowed"), false);
    return cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

type MulterAuthedRequest = Request & {
    user?: AuthedRequest["user"];
    file?: Express.Multer.File;
};


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
                candidateId: z.string().optional(),
                limit: z.string().optional(),
            });

            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

            const tab = parsed.data.tab ?? "all";
            const q = (parsed.data.q ?? "").trim().toLowerCase();
            const type = (parsed.data.type ?? "").trim();
            const status = parsed.data.status;
            const days = parseInt(parsed.data.days ?? "", 10);
            const limit = Math.min(Math.max(parseInt(parsed.data.limit ?? "200", 10) || 200, 1), 500);

            const match: Record<string, unknown> = {};

            if (req.user!.role === "candidate") {
                match.ownerUserId = req.user!.id;
            } else {
                if (parsed.data.candidateId && Types.ObjectId.isValid(parsed.data.candidateId)) {
                    match.ownerUserId = parsed.data.candidateId;
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
                    const uploader = String(d?.uploadedByUserId?.name || d?.uploadedByUserId?.email || "").toLowerCase();
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
            const schema = z.object({ candidateId: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

            const match: Record<string, unknown> = {};

            if (req.user!.role === "candidate") {
                match.ownerUserId = req.user!.id;
            } else {
                if (parsed.data.candidateId && Types.ObjectId.isValid(parsed.data.candidateId)) {
                    match.ownerUserId = parsed.data.candidateId;
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
            const requiresAction = pending;

            return res.json({ total, verified, pending, requiresAction });
        } catch (e) {
            console.error("DOCS_STATS_ERROR:", e);
            return res.status(500).json({ message: "Server error" });
        }
    }
);


documentsRouter.post(
    "/upload",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    upload.single("file"),
    async (req: MulterAuthedRequest, res) => {
        try {
            if (!req.user) return res.status(401).json({ message: "Unauthorized" });
            if (!req.file) return res.status(400).json({ message: "File is required" });

            const bodySchema = z.object({
                ownerUserId: z.string().optional(),
                type: z.string().min(1),
                category: z.string().min(1),
                status: z.enum(["PENDING", "VERIFIED", "COMPLETED", "SIGNED"]).optional(),
                jobId: z.string().optional(),
                applicationId: z.string().optional(),
            });

            const parsed = bodySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
            }

            const ownerUserId =
                req.user.role === "candidate"
                    ? req.user.id
                    : parsed.data.ownerUserId && Types.ObjectId.isValid(parsed.data.ownerUserId)
                        ? parsed.data.ownerUserId
                        : undefined;

            if (!ownerUserId) {
                return res.status(400).json({ message: "ownerUserId is required for employer/hr uploads" });
            }

            const fileUrl = `/uploads/docs/${req.file.filename}`;

            const created = await Document.create({
                ownerUserId,
                uploadedByUserId: req.user.id,
                jobId: parsed.data.jobId && Types.ObjectId.isValid(parsed.data.jobId) ? parsed.data.jobId : undefined,
                applicationId:
                    parsed.data.applicationId && Types.ObjectId.isValid(parsed.data.applicationId)
                        ? parsed.data.applicationId
                        : undefined,
                name: req.file.originalname,
                type: parsed.data.type,
                category: parsed.data.category,
                mimeType: req.file.mimetype,
                sizeBytes: req.file.size,
                fileUrl,
                status: parsed.data.status ?? "PENDING",
            });

            return res.status(201).json(created);
        } catch (e) {
            console.error("DOC_UPLOAD_ERROR:", e);
            return res.status(500).json({ message: "Server error" });
        }
    }
);


documentsRouter.patch(
    "/:id/status",
    requireAuth,
    requireRole(["employer", "hr"]),
    async (req: AuthedRequest, res) => {
        const schema = z.object({
            status: z.enum(["PENDING", "VERIFIED", "COMPLETED", "SIGNED"]),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

        const updated = await Document.findByIdAndUpdate(
            req.params.id,
            { $set: { status: parsed.data.status } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Document not found" });
        return res.json(updated);
    }
);

documentsRouter.delete(
    "/:id",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    async (req: AuthedRequest, res) => {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Document not found" });

        if (req.user!.role === "candidate" && String(doc.ownerUserId) !== String(req.user!.id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const localPath = path.join(process.cwd(), doc.fileUrl.replace(/^\/uploads\//, "uploads/"));

        try {
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        } catch {
            // ignore
        }

        await doc.deleteOne();
        return res.json({ ok: true });
    }
);

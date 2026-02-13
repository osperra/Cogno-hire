import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import multer from "multer";
import { Types } from "mongoose";

import { Document } from "../models/Document.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Jobs.js";

import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { storage } from "../config/cloudinary.js";


export const documentsRouter = Router();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok =
            file.mimetype.startsWith("image/") ||
            file.mimetype === "application/pdf" ||
            file.mimetype.includes("word") ||
            file.mimetype.includes("document");

        cb(null, ok);
    },
});

type MulterAuthedRequest = Request & {
    user?: AuthedRequest["user"];
    file?: Express.Multer.File;
};

type AuthUser = NonNullable<AuthedRequest["user"]>;

function mustGetUser(req: { user?: AuthedRequest["user"] }): AuthUser {
    if (!req.user) {
        const err: any = new Error("Unauthenticated (req.user missing).");
        err.status = 401;
        throw err;
    }
    return req.user as AuthUser;
}

function errorToPlain(e: unknown) {
    if (e instanceof Error) {
        return {
            name: e.name,
            message: e.message,
            stack: e.stack,
        };
    }
    return e;
}

const asyncHandler =
    (fn: (req: any, res: any, next: any) => Promise<any>) =>
        (req: any, res: any, next: any) =>
            Promise.resolve(fn(req, res, next)).catch(next);

function multerErrorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
    if (!err) return next();

    if (err?.name === "MulterError") {
        return res.status(400).json({
            message: "Upload error",
            error: err.message,
            code: err.code,
        });
    }

    return res.status(500).json({
        message: "Upload failed",
        error: errorToPlain(err),
    });
}


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

async function assertCanAccessDocument(user: AuthUser, doc: any) {
    if (user.role === "candidate") {
        if (String(doc.ownerUserId) !== String(user.id)) {
            return { ok: false as const, status: 403, message: "Forbidden" };
        }
        return { ok: true as const };
    }

    if (String(doc.ownerUserId) === String(user.id)) return { ok: true as const };

    if (doc.applicationId) {
        const chk = await assertEmployerCanAccessApplication(user.id, String(doc.applicationId));
        if (!chk.ok) return chk;
        return { ok: true as const };
    }

    if (doc.jobId) {
        const chk = await assertEmployerCanAccessJob(user.id, String(doc.jobId));
        if (!chk.ok) return chk;
        return { ok: true as const };
    }

    return { ok: false as const, status: 403, message: "Forbidden" };
}


documentsRouter.get(
    "/file/:id",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    asyncHandler(async (req: AuthedRequest, res) => {
        const user = mustGetUser(req);

        const id = req.params.id;

        let doc = await Document.findById(id).lean();
        if (!doc && Types.ObjectId.isValid(id)) {
            doc = await Document.findOne({ gridFsId: id }).lean();
        }

        if (!doc) return res.status(404).json({ message: "File not found" });

        const access = await assertCanAccessDocument(user, doc);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        if (doc.fileUrl) return res.redirect(doc.fileUrl);

        return res.status(404).json({ message: "File URL not found" });
    })
);

documentsRouter.get(
    "/",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    asyncHandler(async (req: AuthedRequest, res) => {
        const user = mustGetUser(req);

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

        if (user.role === "candidate") {
            match.ownerUserId = user.id;
        } else {
            if (applicationId) {
                if (!Types.ObjectId.isValid(applicationId)) return res.status(400).json({ message: "Invalid applicationId" });
                const chk = await assertEmployerCanAccessApplication(user.id, applicationId);
                if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                match.applicationId = applicationId;
            } else if (jobId) {
                if (!Types.ObjectId.isValid(jobId)) return res.status(400).json({ message: "Invalid jobId" });
                const chk = await assertEmployerCanAccessJob(user.id, jobId);
                if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                match.jobId = jobId;
            } else {
                const ids = await getEmployerJobIds(user.id);
                match.$or = [{ ownerUserId: user.id }, ...(ids.length ? [{ jobId: { $in: ids } }] : [])];
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
    })
);

documentsRouter.get(
    "/stats",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    asyncHandler(async (req: AuthedRequest, res) => {
        const user = mustGetUser(req);

        const schema = z.object({
            applicationId: z.string().optional(),
            jobId: z.string().optional(),
        });

        const parsed = schema.safeParse(req.query);
        if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

        const applicationId = parsed.data.applicationId;
        const jobId = parsed.data.jobId;

        const match: Record<string, unknown> = {};

        if (user.role === "candidate") {
            match.ownerUserId = user.id;
        } else {
            if (applicationId) {
                if (!Types.ObjectId.isValid(applicationId)) return res.status(400).json({ message: "Invalid applicationId" });
                const chk = await assertEmployerCanAccessApplication(user.id, applicationId);
                if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                match.applicationId = applicationId;
            } else if (jobId) {
                if (!Types.ObjectId.isValid(jobId)) return res.status(400).json({ message: "Invalid jobId" });
                const chk = await assertEmployerCanAccessJob(user.id, jobId);
                if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
                match.jobId = jobId;
            } else {
                const ids = await getEmployerJobIds(user.id);
                match.$or = [{ ownerUserId: user.id }, ...(ids.length ? [{ jobId: { $in: ids } }] : [])];
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
    })
);

documentsRouter.post(
    "/upload",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    (req, res, next) => upload.single("file")(req, res, (err) => (err ? multerErrorHandler(err, req, res, next) : next())),
    asyncHandler(async (req: MulterAuthedRequest, res) => {
        const user = mustGetUser(req);

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const fileUrl = (req.file as any).path || "";
        if (!fileUrl) return res.status(500).json({ message: "Upload failed (missing file URL)" });

        const schema = z.object({
            type: z.string().min(1),
            category: z.string().min(1),
            status: z.enum(["PENDING", "VERIFIED", "COMPLETED", "SIGNED"]).optional(),
            jobId: z.string().optional(),
            applicationId: z.string().optional(),
            ownerUserId: z.string().optional(),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Invalid form fields", details: parsed.error.flatten() });

        const { type, category, status, jobId, applicationId, ownerUserId } = parsed.data;

        if (user.role !== "candidate") {
            if (applicationId) {
                if (!Types.ObjectId.isValid(applicationId)) return res.status(400).json({ message: "Invalid applicationId" });
                const chk = await assertEmployerCanAccessApplication(user.id, applicationId);
                if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
            } else if (jobId) {
                if (!Types.ObjectId.isValid(jobId)) return res.status(400).json({ message: "Invalid jobId" });
                const chk = await assertEmployerCanAccessJob(user.id, jobId);
                if (!chk.ok) return res.status(chk.status).json({ message: chk.message });
            }
        }

        const doc = await Document.create({
            ownerUserId: ownerUserId && Types.ObjectId.isValid(ownerUserId) ? ownerUserId : user.id,
            uploadedByUserId: user.id,

            jobId: jobId && Types.ObjectId.isValid(jobId) ? jobId : undefined,
            applicationId: applicationId && Types.ObjectId.isValid(applicationId) ? applicationId : undefined,

            name: req.file.originalname,
            type,
            category,

            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,

            gridFsId: undefined,
            bucketName: "docs",

            fileUrl,
            status: status ?? "PENDING",
        });

        return res.status(201).json(doc);
    })
);

documentsRouter.patch(
    "/:id/status",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    asyncHandler(async (req: AuthedRequest, res) => {
        const user = mustGetUser(req);

        const { id } = req.params;

        const schema = z.object({
            status: z.enum(["PENDING", "VERIFIED", "COMPLETED", "SIGNED"]),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Invalid status" });

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ message: "Document not found" });

        const access = await assertCanAccessDocument(user, doc);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        doc.status = parsed.data.status;
        await doc.save();

        return res.json(doc.toObject());
    })
);

documentsRouter.delete(
    "/:id",
    requireAuth,
    requireRole(["candidate", "employer", "hr"]),
    asyncHandler(async (req: AuthedRequest, res) => {
        const user = mustGetUser(req);

        const { id } = req.params;

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ message: "Document not found" });

        const access = await assertCanAccessDocument(user, doc);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        await Document.deleteOne({ _id: id });
        return res.status(204).send();
    })
);

documentsRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("DOCS_ROUTE_ERROR:", err);
    return res.status(err?.status || 500).json({
        message: err?.message || "Server error",
        error: errorToPlain(err),
    });
});

export default documentsRouter;

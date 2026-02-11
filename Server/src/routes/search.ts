import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";

type SearchEntity = "job" | "application" | "candidate" | "notification";

type SearchItem = {
    id: string;
    type: SearchEntity;
    title: string;
    subtitle?: string;
    url?: string;
    meta?: Record<string, unknown>;
};

type SearchResponse = { items: SearchItem[] };

export const searchRouter = Router();

searchRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
    const q = String(req.query.q ?? "").trim();
    const limitRaw = Number(req.query.limit ?? 8);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 8;

    if (!q) return res.json({ items: [] } satisfies SearchResponse);

    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const role = req.user?.role;

    const items: SearchItem[] = [];

    if (role === "employer" || role === "hr") {
        const jobs = await Job.find({
            employerId: req.user!.id,
            $or: [{ title: rx }, { location: rx }],
        })
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        items.push(
            ...jobs.map((j: any) => ({
                id: String(j._id),
                type: "job" as const,
                title: String(j.title ?? "Untitled Job"),
                subtitle: j.location ? String(j.location) : undefined,
                meta: { jobId: String(j._id) },
                url: "/app/employer/jobs",
            }))
        );

        const apps = await Application.find({
            $or: [{ employerId: req.user!.id }],
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("candidateId", "name email")
            .populate("jobId", "title")
            .lean();

        const appMatches = (apps as any[]).filter((a) => {
            const candName = String(a?.candidateId?.name ?? "");
            const candEmail = String(a?.candidateId?.email ?? "");
            const jobTitle = String(a?.jobId?.title ?? "");
            return rx.test(candName) || rx.test(candEmail) || rx.test(jobTitle);
        });

        items.push(
            ...appMatches.slice(0, 6).map((a: any) => ({
                id: String(a._id),
                type: "application" as const,
                title: `${String(a?.candidateId?.name ?? "Candidate")} • ${String(a?.jobId?.title ?? "Job")}`,
                subtitle: a?.candidateId?.email ? String(a.candidateId.email) : undefined,
                meta: { applicationId: String(a._id) },
                url: "/app/employer/applicants",
            }))
        );
    }

    if (role === "candidate") {
        const jobs = await Job.find({
            $or: [{ title: rx }, { location: rx }],
            isActive: { $ne: false },
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        items.push(
            ...jobs.slice(0, 8).map((j: any) => ({
                id: String(j._id),
                type: "job" as const,
                title: String(j.title ?? "Untitled Job"),
                subtitle: j.location ? String(j.location) : undefined,
                meta: { jobId: String(j._id) },
                url: "/app/candidate/jobs",
            }))
        );
    }

    return res.json({ items: items.slice(0, limit) } satisfies SearchResponse);
});

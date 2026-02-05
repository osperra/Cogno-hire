import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";

export const candidatesRouter = Router();

type UiCandidate = {
    id: string;
    name: string;
    role: string;
    score: number;
    avatar: string;
};

function initials(name: string) {
    const s = (name || "").trim();
    if (!s) return "NA";
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "N";
    const second = parts.length > 1 ? parts[1][0] : (parts[0]?.[1] ?? "A");
    return (first + second).toUpperCase();
}

function clampScore(n: unknown) {
    const v = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, Math.round(v)));
}

async function getEmployerJobIds(employerId: string) {
    const jobs = await Job.find({ employerId }, { _id: 1 }).lean();
    return jobs.map((j) => j._id);
}

function oidList(ids: any[]) {
    return ids.map((id) => new mongoose.Types.ObjectId(String(id)));
}

async function mapAppsToUi(apps: any[]): Promise<UiCandidate[]> {
    return apps.map((a) => {
        const candidateName = a?.candidateId?.name ?? "Unknown";
        const jobTitle = a?.jobId?.title ?? "Unknown Role";

        return {
            id: String(a._id),
            name: candidateName,
            role: jobTitle,
            score: clampScore(a?.overallScore),
            avatar: initials(candidateName),
        };
    });
}

candidatesRouter.get(
    "/",
    requireAuth,
    requireRole(["employer", "hr"]),
    async (req: AuthedRequest, res) => {
        const employerId = req.user!.id;

        const jobIds = await getEmployerJobIds(employerId);
        if (jobIds.length === 0) {
            return res.json({ screening: [], interview: [], offer: [] });
        }

        const matchBase = { jobId: { $in: oidList(jobIds) } };

        const LIMIT = 12;

        const [screeningApps, interviewApps, offerApps] = await Promise.all([
            Application.find({
                ...matchBase,
                hiringStatus: { $in: ["PENDING", "UNDER_REVIEW", "INVITED"] },
            })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(LIMIT)
                .populate("candidateId", "name email")
                .populate("jobId", "title")
                .lean(),

            Application.find({
                ...matchBase,
                interviewStatus: "IN_PROGRESS",
                hiringStatus: { $nin: ["REJECTED", "HIRED"] },
            })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(LIMIT)
                .populate("candidateId", "name email")
                .populate("jobId", "title")
                .lean(),

            Application.find({
                ...matchBase,
                hiringStatus: "SHORTLISTED",
                interviewStatus: "COMPLETED",
            })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(LIMIT)
                .populate("candidateId", "name email")
                .populate("jobId", "title")
                .lean(),
        ]);

        return res.json({
            screening: await mapAppsToUi(screeningApps),
            interview: await mapAppsToUi(interviewApps),
            offer: await mapAppsToUi(offerApps),
        });
    }
);

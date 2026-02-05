import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { Job } from "../models/Jobs.js";
import { Application } from "../models/Application.js";

export const pipelineRouter = Router();

const STAGE_COLORS: Record<string, string> = {
    Applied: "#6B7280",
    Screening: "#2563EB",
    Interview: "#7C3AED",
    Offer: "#F97316",
    Hired: "#16A34A",
};

pipelineRouter.get(
    "/",
    requireAuth,
    requireRole(["employer", "hr"]),
    async (req: AuthedRequest, res) => {
        const employerId = req.user!.id;

        const jobs = await Job.find({ employerId }, { _id: 1 }).lean();
        const jobIds = jobs.map((j) => j._id);

        if (jobIds.length === 0) {
            return res.json({
                stages: [
                    { name: "Applied", count: 0, color: STAGE_COLORS.Applied },
                    { name: "Screening", count: 0, color: STAGE_COLORS.Screening },
                    { name: "Interview", count: 0, color: STAGE_COLORS.Interview },
                    { name: "Offer", count: 0, color: STAGE_COLORS.Offer },
                    { name: "Hired", count: 0, color: STAGE_COLORS.Hired },
                ],
            });
        }

        const match = {
            jobId: { $in: jobIds.map((id) => new mongoose.Types.ObjectId(String(id))) },
        };

        const [
            appliedCount,
            screeningCount,
            interviewCount,
            offerCount,
            hiredCount,
        ] = await Promise.all([
            Application.countDocuments(match),

            Application.countDocuments({
                ...match,
                hiringStatus: { $in: ["PENDING", "UNDER_REVIEW", "INVITED"] },
            }),

            Application.countDocuments({
                ...match,
                interviewStatus: "IN_PROGRESS",
                hiringStatus: { $nin: ["REJECTED", "HIRED"] },
            }),

            Application.countDocuments({
                ...match,
                hiringStatus: "SHORTLISTED",
                interviewStatus: "COMPLETED",
            }),

            Application.countDocuments({
                ...match,
                hiringStatus: "HIRED",
            }),
        ]);

        return res.json({
            stages: [
                { name: "Applied", count: appliedCount, color: STAGE_COLORS.Applied },
                { name: "Screening", count: screeningCount, color: STAGE_COLORS.Screening },
                { name: "Interview", count: interviewCount, color: STAGE_COLORS.Interview },
                { name: "Offer", count: offerCount, color: STAGE_COLORS.Offer },
                { name: "Hired", count: hiredCount, color: STAGE_COLORS.Hired },
            ],
        });
    }
);

import { Router } from "express";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { EmployeeReview } from "../models/EmployeeReview.js";

export const reviewsRouter = Router();

function quarterStart(d: Date) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

function toUiStatus(s: string) {
  return s === "COMPLETED" ? "Completed" : s === "PENDING" ? "Pending" : "Scheduled";
}

reviewsRouter.get(
  "/stats",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (_req: AuthedRequest, res) => {

    const now = new Date();
    const qStart = quarterStart(now);

    const [totals] = await EmployeeReview.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
                scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
              },
            },
          ],
          avg: [
            { $match: { overallRating: { $gt: 0 } } },
            { $group: { _id: null, avgRating: { $avg: "$overallRating" } } },
          ],
          thisQuarter: [
            { $match: { createdAt: { $gte: qStart } } },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          totalReviews: { $ifNull: [{ $arrayElemAt: ["$counts.totalReviews", 0] }, 0] },
          completed: { $ifNull: [{ $arrayElemAt: ["$counts.completed", 0] }, 0] },
          pending: { $ifNull: [{ $arrayElemAt: ["$counts.pending", 0] }, 0] },
          scheduled: { $ifNull: [{ $arrayElemAt: ["$counts.scheduled", 0] }, 0] },
          avgRating: { $ifNull: [{ $arrayElemAt: ["$avg.avgRating", 0] }, 0] },
          thisQuarter: { $ifNull: [{ $arrayElemAt: ["$thisQuarter.count", 0] }, 0] },
        },
      },
    ]);

    res.json({
      totalReviews: totals?.totalReviews ?? 0,
      completed: totals?.completed ?? 0,
      pending: totals?.pending ?? 0,
      scheduled: totals?.scheduled ?? 0,
      thisQuarter: totals?.thisQuarter ?? 0,
      avgRating: Number((totals?.avgRating ?? 0).toFixed(1)),
    });
  }
);

reviewsRouter.get(
  "/",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const statusMap: Record<string, string> = {
      completed: "COMPLETED",
      pending: "PENDING",
      scheduled: "SCHEDULED",
    };

    const statusQuery = req.query.status
      ? statusMap[String(req.query.status)]
      : undefined;

    const filter: any = {};
    if (statusQuery) filter.status = statusQuery;

    const reviews = await EmployeeReview.find(filter)
      .sort({ reviewDate: -1 })
      .lean();

    res.json(
      reviews.map((r: any) => ({
        id: String(r._id),
        employee: r.employeeName,
        position: r.position,
        reviewDate:
          r.status === "SCHEDULED"
            ? `Scheduled: ${new Date(r.reviewDate).toDateString()}`
            : new Date(r.reviewDate).toDateString(),
        reviewer: r.reviewerName,
        overallRating: r.overallRating ?? 0,
        categories: r.categories ?? {
          technical: 0,
          communication: 0,
          teamwork: 0,
          productivity: 0,
        },
        status: toUiStatus(r.status) as "Completed" | "Pending" | "Scheduled",
      }))
    );
  }
);

reviewsRouter.get(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const r = await EmployeeReview.findById(req.params.id).lean();
    if (!r) return res.status(404).json({ message: "Review not found" });

    res.json({
      id: String(r._id),
      employee: r.employeeName,
      position: r.position,
      reviewer: r.reviewerName,
      reviewDate:
        r.status === "SCHEDULED"
          ? `Scheduled: ${new Date(r.reviewDate).toDateString()}`
          : new Date(r.reviewDate).toDateString(),
      overallRating: r.overallRating ?? 0,
      categories: r.categories ?? {
        technical: 0,
        communication: 0,
        teamwork: 0,
        productivity: 0,
      },
      status: toUiStatus(r.status),

      managerFeedback: r.managerFeedback ?? "",
      areasForGrowth: r.areasForGrowth ?? "",
      goals: Array.isArray(r.goals) ? r.goals : [],
      achievements: Array.isArray((r as any).achievements) ? (r as any).achievements : [],
    });
  }
);

reviewsRouter.post(
  "/",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const review = await EmployeeReview.create({
      ...req.body,
      reviewerId: req.user!.id,
      reviewerName: req.user!.name,
    });

    res.status(201).json({ id: review._id });
  }
);

reviewsRouter.put(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const updated = await EmployeeReview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();

    if (!updated) return res.status(404).json({ message: "Review not found" });

    res.json({ ok: true });
  }
);
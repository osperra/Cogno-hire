import { Router } from "express";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { EmployeeOnboarding } from "../models/EmployeeOnboarding.js";

export const onboardingRouter = Router();

function fmtDate(d: Date) {
  return new Date(d).toDateString();
}

function calcProgress(steps: any[]) {
  const tasks = (steps ?? []).flatMap((s) => s.tasks ?? []);
  const total = tasks.length || 0;
  const done = tasks.filter((t: any) => t.completed).length || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { totalTasks: total, completedTasks: done, progress: pct };
}

function daysRemaining(start: Date, expected?: Date | null) {
  if (expected) {
    const ms = new Date(expected).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Math.max(0, d);
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  const ms = end.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function uiStatus(s: string) {
  return s === "COMPLETED" ? "Completed" : "In Progress";
}

onboardingRouter.get(
  "/stats",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (_req: AuthedRequest, res) => {
    const now = new Date();

    const [agg] = await EmployeeOnboarding.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                active: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                total: { $sum: 1 },
              },
            },
          ],
          avgCompletion: [
            { $match: { status: "COMPLETED" } },
            {
              $project: {
                days: {
                  $dateDiff: { startDate: "$startDate", endDate: "$updatedAt", unit: "day" },
                },
              },
            },
            { $group: { _id: null, avgDays: { $avg: "$days" } } },
          ],
        },
      },
      {
        $project: {
          active: { $ifNull: [{ $arrayElemAt: ["$counts.active", 0] }, 0] },
          completed: { $ifNull: [{ $arrayElemAt: ["$counts.completed", 0] }, 0] },
          total: { $ifNull: [{ $arrayElemAt: ["$counts.total", 0] }, 0] },
          avgDays: { $ifNull: [{ $arrayElemAt: ["$avgCompletion.avgDays", 0] }, 0] },
        },
      },
    ]);

    const total = agg?.total ?? 0;
    const completed = agg?.completed ?? 0;
    const active = agg?.active ?? 0;
    const avgDays = Math.round(agg?.avgDays ?? 0);
    const successRate = total ? Math.round((completed / total) * 100) : 0;

    res.json({
      activeOnboardingCount: active,
      completedCount: completed,
      avgCompletion: `${avgDays || 0} days`,
      successRate: `${successRate}%`,
      asOf: now.toISOString(),
    });
  }
);

onboardingRouter.get(
  "/",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const statusQ = String(req.query.status || "active");
    const filter: any = {};
    if (statusQ === "active") filter.status = "IN_PROGRESS";
    if (statusQ === "completed") filter.status = "COMPLETED";

    const rows = await EmployeeOnboarding.find(filter).sort({ startDate: -1 }).lean();

    res.json(
      rows.map((r: any) => {
        const p = calcProgress(r.steps);
        const dr = r.status === "COMPLETED" ? 0 : daysRemaining(r.startDate, r.expectedEndDate);
        return {
          id: String(r._id),
          employee: r.employeeName,
          position: r.position,
          startDate: fmtDate(r.startDate),
          progress: p.progress,
          status: uiStatus(r.status),
          daysRemaining: dr,
        };
      })
    );
  }
);

onboardingRouter.get(
  "/:id",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const doc = await EmployeeOnboarding.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Onboarding not found" });

    const progress = calcProgress(doc.steps);

    res.json({
      id: String(doc._id),
      employee: doc.employeeName,
      position: doc.position,
      startDate: fmtDate(doc.startDate),
      status: uiStatus(doc.status),
      progress: progress.progress,
      steps: (doc.steps ?? []).map((s: any) => ({
        stepId: s.stepId,
        category: s.category,
        iconKey: s.iconKey, 
        tasks: (s.tasks ?? []).map((t: any) => ({
          id: t.taskId,
          name: t.name,
          completed: !!t.completed,
        })),
      })),
    });
  }
);

onboardingRouter.put(
  "/:id/task/:taskId",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const { id, taskId } = req.params;
    const completed = !!req.body?.completed;

    const doc = await EmployeeOnboarding.findById(id);
    if (!doc) return res.status(404).json({ message: "Onboarding not found" });

    let found = false;
    for (const step of doc.steps) {
      const task = step.tasks.find((t) => t.taskId === taskId);
      if (task) {
        task.completed = completed;
        task.completedAt = completed ? new Date() : null;
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ message: "Task not found" });

    const p = calcProgress(doc.steps as any);
    doc.status = p.totalTasks > 0 && p.completedTasks === p.totalTasks ? "COMPLETED" : "IN_PROGRESS";

    await doc.save();

    res.json({ ok: true });
  }
);

onboardingRouter.post(
  "/",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const body = req.body || {};

    const defaultSteps = [
      {
        stepId: "pre",
        category: "Pre-Onboarding",
        iconKey: "MAIL",
        tasks: [
          { taskId: "1", name: "Send welcome email", completed: false },
          { taskId: "2", name: "Collect required documents", completed: false },
          { taskId: "3", name: "Background check completed", completed: false },
          { taskId: "4", name: "Sign offer letter", completed: false },
        ],
      },
      {
        stepId: "day1",
        category: "Day 1 - Setup",
        iconKey: "LAPTOP",
        tasks: [
          { taskId: "5", name: "Workspace setup", completed: false },
          { taskId: "6", name: "IT equipment provisioning", completed: false },
          { taskId: "7", name: "Email and account creation", completed: false },
          { taskId: "8", name: "Security badge issuance", completed: false },
        ],
      },
      {
        stepId: "week1",
        category: "Week 1 - Orientation",
        iconKey: "BOOK",
        tasks: [
          { taskId: "9", name: "Company orientation", completed: false },
          { taskId: "10", name: "Team introductions", completed: false },
          { taskId: "11", name: "HR policies review", completed: false },
          { taskId: "12", name: "Benefits enrollment", completed: false },
        ],
      },
      {
        stepId: "week2_4",
        category: "Week 2-4 - Integration",
        iconKey: "TEAM",
        tasks: [
          { taskId: "13", name: "Department training", completed: false },
          { taskId: "14", name: "Shadow team members", completed: false },
          { taskId: "15", name: "First project assignment", completed: false },
          { taskId: "16", name: "30-day check-in meeting", completed: false },
        ],
      },
    ];

    const created = await EmployeeOnboarding.create({
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      position: body.position,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : null,
      steps: Array.isArray(body.steps) && body.steps.length ? body.steps : defaultSteps,
    });

    res.status(201).json({ id: created._id });
  }
);
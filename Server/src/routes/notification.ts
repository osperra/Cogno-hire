import { Router } from "express";
import { z } from "zod";
import { Notification } from "../models/Notification.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

const notificationsRouter = Router();

notificationsRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const unreadOnly = String(req.query.unreadOnly ?? "false") === "true";
  const limitRaw = Number(req.query.limit ?? 30);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 30;

  const filter: any = { userId: req.user!.id };
  if (unreadOnly) filter.isRead = false;

  const items = await Notification.find(filter)
    .sort({ isRead: 1, createdAt: -1 })
    .limit(limit);

  const unreadCount = await Notification.countDocuments({
    userId: req.user!.id,
    isRead: false,
  });

  return res.json({ items, unreadCount });
});

notificationsRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    userId: z.string().min(1),
    type: z
      .enum(["application_created", "application_status_changed", "job_created", "general"])
      .optional(),
    title: z.string().min(1),
    message: z.string().min(1),
    link: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(), // ✅ FIX for Zod v4
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const n = await Notification.create({
    userId: parsed.data.userId,
    type: parsed.data.type ?? "general",
    title: parsed.data.title,
    message: parsed.data.message,
    link: parsed.data.link,
    meta: parsed.data.meta,
    isRead: false,
  });

  return res.status(201).json(n);
});

notificationsRouter.patch("/:id/read", requireAuth, async (req: AuthedRequest, res) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Notification not found" });
  return res.json(updated);
});

notificationsRouter.patch("/read-all", requireAuth, async (req: AuthedRequest, res) => {
  const result = await Notification.updateMany(
    { userId: req.user!.id, isRead: false },
    { $set: { isRead: true } }
  );

  return res.json({ message: "All marked read", modifiedCount: result.modifiedCount ?? 0 });
});

notificationsRouter.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const deleted = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.id,
  });

  if (!deleted) return res.status(404).json({ message: "Notification not found" });
  return res.json({ message: "Deleted" });
});

export default notificationsRouter;

import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
    try {
        const user = await User.findById(req.user!.id).select("preferences.settings").lean() as any;
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user.preferences?.settings || {});
    } catch (error) {
        console.error("GET /preferences/me error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.put("/me", requireAuth, async (req: AuthedRequest, res) => {
    try {
        const schema = z.object({
            emailNotifications: z.boolean().optional(),
            productUpdates: z.boolean().optional(),
            marketingEmails: z.boolean().optional(),
            desktopNotifications: z.boolean().optional(),
            weeklySummary: z.boolean().optional(),
            defaultLanding: z.enum(["dashboard", "jobs", "applicants", "company", "analytics"]).optional(),
            theme: z.enum(["light", "dark", "system"]).optional(),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
        }

        const updateMap: Record<string, any> = {};
        for (const [key, value] of Object.entries(parsed.data)) {
            if (value !== undefined) {
                updateMap[`preferences.settings.${key}`] = value;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user!.id,
            { $set: updateMap },
            { new: true }
        ).select("preferences.settings").lean() as any;

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        return res.json(updatedUser.preferences?.settings || {});
    } catch (error) {
        console.error("PUT /preferences/me error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;

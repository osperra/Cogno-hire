import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { User } from "../models/User";

const router = Router();


router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId)
      .select("_id name email role createdAt updatedAt") // ✅ include name
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user); 
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

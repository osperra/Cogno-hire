import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

const authRouter = Router();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  return secret && secret.trim().length > 0 ? secret : null;
}

authRouter.post("/register", async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["candidate", "employer", "hr", "interviewer"]).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const data = parsed.data;
    const email = normalizeEmail(data.email);

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: data.role ?? "candidate",
    });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (e) {
    console.error("REGISTER_ERROR:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) return res.status(500).json({ message: "JWT_SECRET missing in .env" });

    const email = normalizeEmail(parsed.data.email);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // prevents: Illegal arguments: string, undefined
    if (!user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    
    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ role: user.role }, jwtSecret, {
      subject: String(user._id),
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error("LOGIN_ERROR:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
});

export default authRouter;

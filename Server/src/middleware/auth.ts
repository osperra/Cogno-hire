import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthedUser = { id: string; role: string };

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

type JwtWithRole = jwt.JwtPayload & { role?: unknown };

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  return s && s.trim().length > 0 ? s : null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const secret = getJwtSecret();
  if (!secret) return res.status(500).json({ message: "JWT_SECRET missing in .env" });

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing auth token" });

  try {
    const payload = jwt.verify(token, secret) as JwtWithRole;

    const userId = payload.sub; 
    const role = typeof payload.role === "string" ? payload.role : "";

    if (!userId) return res.status(401).json({ message: "Invalid token" });

    req.user = { id: String(userId), role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

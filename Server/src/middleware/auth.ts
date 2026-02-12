import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type Role = "employer" | "candidate" | "hr" | "admin" | (string & {});

export type AuthedUser = {
  id: string;
  role: Role;
  name?: string;
};

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

type JwtPayload = jwt.JwtPayload & {
  role?: unknown;
  name?: unknown;
  id?: unknown;
};


function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  return s && s.trim().length > 0 ? s : null;
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token.length ? token : null;
}

function extractUserId(payload: JwtPayload): string {
  if (typeof payload.sub === "string" && payload.sub.trim()) return payload.sub.trim();

  if (typeof payload.id === "string" && payload.id.trim()) return payload.id.trim();

  const anyId = (payload as any)?.id;
  if (typeof anyId === "string" && anyId.trim()) return anyId.trim();

  return "";
}

function extractRole(payload: JwtPayload): string {
  const r = payload.role;
  return typeof r === "string" ? r.trim() : "";
}

function extractName(payload: JwtPayload): string | undefined {
  const n = payload.name;
  return typeof n === "string" && n.trim().length ? n.trim() : undefined;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const secret = getJwtSecret();
  if (!secret) return res.status(500).json({ message: "JWT_SECRET missing in .env" });

  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ message: "Missing auth token" });

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    const userId = extractUserId(payload);
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const role = extractRole(payload);
    if (!role) return res.status(401).json({ message: "Invalid token (role missing)" });

    req.user = { id: userId, role: role as Role, name: extractName(payload) };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

export function requireRole(roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}


export function debugAuth(req: Request, _res: Response, next: NextFunction) {
  console.log("AUTH HEADER:", req.headers.authorization);
  next();
}

import { Router, Request, Response } from "express";
import { db } from "../db";
import { UserProfile, UserRole } from "../types";

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  // Find or create profile
  let user = Array.from(db.profiles.values()).find((u) => u.email === email);
  if (!user) {
    user = {
      id: `u-${Date.now()}`,
      email,
      name: email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      role: (role as UserRole) || "Documentation Team",
      organization: "Kerala Exporters Association",
      created_at: new Date().toISOString(),
    };
    db.profiles.set(user.id, user);
  }

  res.json({
    success: true,
    user,
    token: `vfx_auth_jwt_${user.id}`,
  });
});

// POST /api/auth/register
authRouter.post("/register", (req: Request, res: Response) => {
  const { email, name, role, organization } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, error: "Email and name required" });
  }

  const user: UserProfile = {
    id: `u-${Date.now()}`,
    email,
    name,
    role: (role as UserRole) || "Documentation Team",
    organization: organization || "Kerala Export Trade Hub",
    created_at: new Date().toISOString(),
  };

  db.profiles.set(user.id, user);

  res.status(201).json({
    success: true,
    user,
    token: `vfx_auth_jwt_${user.id}`,
  });
});

// GET /api/auth/me
authRouter.get("/me", (_req: Request, res: Response) => {
  const defaultUser = Array.from(db.profiles.values())[0];
  res.json({ success: true, user: defaultUser });
});

// GET /api/audit-logs
authRouter.get("/audit-logs", (req: Request, res: Response) => {
  const { shipment_id } = req.query;
  let logs = db.auditLogs;
  if (shipment_id && typeof shipment_id === "string") {
    logs = logs.filter((l) => l.shipment_id === shipment_id);
  }
  res.json({ success: true, count: logs.length, audit_logs: logs });
});

import { Request, Response, NextFunction } from "express";
import { Client } from "pg";
import { AuthRequest } from "./authMiddleware";

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect();

export function authorize(resource: string, action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Superadmin shortcut
    if (req.user.role_id === 1) return next();
    // Get role permissions
    const result = await client.query("SELECT permissions FROM roles WHERE role_id = $1", [req.user.role_id]);
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Role not found" });
    }
    const permissions = result.rows[0].permissions;
    if (permissions[resource] && permissions[resource].includes(action)) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  };
} 
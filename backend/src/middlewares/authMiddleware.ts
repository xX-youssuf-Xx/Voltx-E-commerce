import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/database";

export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    name: string;
    email: string;
    role_id: number;
  } | undefined;
  file?: Express.Multer.File | undefined;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header missing or invalid' });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded || !decoded.user_id) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get user from database
    const result = await db.query(
      "SELECT user_id, name, email, role_id FROM users WHERE user_id = $1",
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = result.rows[0];
    next();
    return;
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
} 
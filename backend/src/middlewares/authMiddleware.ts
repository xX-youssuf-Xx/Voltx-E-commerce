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
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const result = await db.query(
      "SELECT user_id, name, email, role_id FROM users WHERE user_id = $1",
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
} 
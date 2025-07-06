import { Request, Response } from "express";
import * as authService from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";

export async function register(req: Request, res: Response) {
  const { name, email, pass } = req.body;
  if (!name || !email || !pass) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  try {
    const user = await authService.register(name, email, pass);
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, pass } = req.body;
  if (!email || !pass) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const result = await authService.login(email, pass);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

export async function verify(req: AuthRequest, res: Response) {
  try {
    // The auth middleware already verified the token
    // Just return the user information
    return res.json({
      user: {
        user_id: req.user?.user_id,
        name: req.user?.name,
        email: req.user?.email,
        role_id: req.user?.role_id
      }
    });
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    return res.json({
      user_id: req.user?.user_id,
      name: req.user?.name,
      email: req.user?.email,
      role_id: req.user?.role_id
    });
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid token" });
  }
} 
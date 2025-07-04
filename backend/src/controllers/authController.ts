import { Request, Response } from "express";
import * as authService from "../services/authService";

export async function register(req: Request, res: Response) {
  const { name, email, pass } = req.body;
  if (!name || !email || !pass) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  try {
    const user = await authService.register(name, email, pass);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, pass } = req.body;
  if (!email || !pass) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const result = await authService.login(email, pass);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
} 
import { Request, Response } from "express";
import * as brandService from "../services/brandService";
import { AuthRequest } from "../middlewares/authMiddleware";

export async function listBrands(req: Request, res: Response) {
  try {
    const brands = await brandService.listBrands(req.query);
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBrandById(req: Request, res: Response) {
  try {
    const brand = await brandService.getBrandById(Number(req.params.id));
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createBrand(req: AuthRequest, res: Response) {
  try {
    const brand = await brandService.createBrand(req.body, req.user?.user_id);
    res.status(201).json(brand);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateBrand(req: AuthRequest, res: Response) {
  try {
    const brand = await brandService.updateBrand(Number(req.params.id), req.body, req.user?.user_id);
    res.json(brand);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteBrand(req: AuthRequest, res: Response) {
  try {
    await brandService.deleteBrand(Number(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
} 
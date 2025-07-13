import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";
import { AuthRequest } from "../middlewares/authMiddleware";

export async function listCategories(req: Request, res: Response) {
  try {
    const categories = await categoryService.listCategories(req.query);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const category = await categoryService.getCategoryById(Number(req.params.id));
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const category = await categoryService.createCategory(req.body, req.user?.user_id);
    res.status(201).json(category);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const category = await categoryService.updateCategory(Number(req.params.id), req.body, req.user?.user_id);
    res.json(category);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getCategoriesWithSubcategories(req: Request, res: Response) {
  try {
    const categories = await categoryService.getCategoriesWithSubcategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
import { Request, Response } from "express";
import * as productService from "../services/productService";
import { AuthRequest } from "../middlewares/authMiddleware";

export async function listProducts(req: Request, res: Response) {
  try {
    const products = await productService.listProducts(req.query);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await productService.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const product = await productService.createProduct(req.body, req.user?.user_id, imagePath);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const product = await productService.updateProduct(Number(req.params.id), req.body, req.user?.user_id);
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    await productService.deleteProduct(Number(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function addProductMedia(req: AuthRequest, res: Response) {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const media = await productService.addProductMedia(Number(req.params.id), req.body, req.user?.user_id, imagePath);
    res.status(201).json(media);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProductMedia(req: AuthRequest, res: Response) {
  try {
    await productService.deleteProductMedia(Number(req.params.id), Number(req.params.mediaId), req.user?.user_id);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
} 
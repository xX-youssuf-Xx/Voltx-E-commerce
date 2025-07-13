import { Router } from "express";
import { listProductsAdmin } from "../controllers/productController";

const router = Router();

// Admin products endpoint
router.get("/products", listProductsAdmin);

export default router; 
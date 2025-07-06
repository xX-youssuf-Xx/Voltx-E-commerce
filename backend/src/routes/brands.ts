import { Router } from "express";
import * as brandController from "../controllers/brandController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Public routes
router.get("/", brandController.listBrands);
router.get("/:id", brandController.getBrandById);

// Protected routes
router.post("/", authenticate, authorize("brands", "create"), brandController.createBrand);
router.put("/:id", authenticate, authorize("brands", "update"), brandController.updateBrand);
router.delete("/:id", authenticate, authorize("brands", "delete"), brandController.deleteBrand);

export default router; 
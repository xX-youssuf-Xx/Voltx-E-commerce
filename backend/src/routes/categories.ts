import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Public routes
router.get("/", categoryController.listCategories);
router.get("/:id", categoryController.getCategoryById);

// Protected routes
router.post("/", authenticate, authorize("categories", "create"), categoryController.createCategory);
router.put("/:id", authenticate, authorize("categories", "update"), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize("categories", "delete"), categoryController.deleteCategory);

export default router; 
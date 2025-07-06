import { Router } from "express";
import * as discountController from "../controllers/discountController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Public endpoints
router.get("/generate-code", discountController.generateDiscountCode);
router.get("/", discountController.listDiscounts);
router.get("/:id", discountController.getDiscountById);
router.get("/:id/usages", discountController.listDiscountUsages);

// Protected endpoints
router.post("/", authenticate, authorize("discounts", "create"), discountController.createDiscount);
router.put("/:id", authenticate, authorize("discounts", "update"), discountController.updateDiscount);
router.delete("/:id", authenticate, authorize("discounts", "delete"), discountController.deleteDiscount);

export default router; 
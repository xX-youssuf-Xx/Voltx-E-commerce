import { Router } from "express";
import { register, login, verify, me } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";
import * as discountController from "../controllers/discountController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticate, verify);
router.get("/me", authenticate, me);
router.get("/discounts/generate-code", discountController.generateDiscountCode);

export default router; 
import { Router } from "express";
import { register, login, verify, me } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";
import * as discountController from "../controllers/discountController";
import { getUserById } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticate, verify);
router.get("/me", authenticate, me);
router.get("/discounts/generate-code", discountController.generateDiscountCode);
router.get('/users/:id', authenticate, getUserById);

export default router; 
import { Router } from "express";
import * as productController from "../controllers/productController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp for now, we'll rename it after the product is created
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = Router();

// Public
router.get("/", productController.listProducts); // filter, list
router.get("/paginated", productController.getPaginatedProducts); // paginated list
router.get("/generate-sku", productController.generateSKU); // generate unique SKU
router.get("/:id", productController.getProductById); // details
router.get("/:id/short", productController.getProductShortInfo); // short info

// Protected
router.post("/", authenticate, authorize("products", "create"), upload.single("image"), productController.createProduct);
router.put("/:id", authenticate, authorize("products", "update"), upload.single("image"), productController.updateProduct);
router.delete("/:id", authenticate, authorize("products", "delete"), productController.deleteProduct);
router.post("/:id/media", authenticate, authorize("products", "update"), upload.single("image"), productController.addProductMedia);
router.delete("/:id/media/:mediaId", authenticate, authorize("products", "update"), productController.deleteProductMedia);

export default router; 
import { Router } from "express";
import * as productController from "../controllers/productController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import multer from "multer";
import path from "path";

const uploadDir = path.join(__dirname, "../../uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = Router();

// Public
router.get("/", productController.listProducts); // filter, list
router.get("/:id", productController.getProductById); // details

// Protected
router.post("/", authenticate, authorize("products", "create"), upload.single("image"), productController.createProduct);
router.put("/:id", authenticate, authorize("products", "update"), productController.updateProduct);
router.delete("/:id", authenticate, authorize("products", "delete"), productController.deleteProduct);
router.post("/:id/media", authenticate, authorize("products", "update"), upload.single("image"), productController.addProductMedia);
router.delete("/:id/media/:mediaId", authenticate, authorize("products", "update"), productController.deleteProductMedia);

export default router; 
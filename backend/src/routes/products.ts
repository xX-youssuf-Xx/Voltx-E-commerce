import { Router } from "express";
import { getProductById, getProductShortInfo, getProductBySlug, listProducts, getPaginatedProducts, generateSKU, createProduct, updateProduct, deleteProduct, addProductMedia, deleteProductMedia, listProductDocs, addProductDoc, deleteProductDoc, updateProductDoc, getShopProducts, getProductsByIds, fuzzySearchProducts } from "../controllers/productController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as orderController from '../controllers/orderController';

// Always use dist/uploads for uploads
const uploadDir = path.join(process.cwd(), "dist", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp for now, will be renamed after product is created
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = Router();

// Public
router.get("/", listProducts); // filter, list
router.get("/paginated", getPaginatedProducts); // paginated list
router.get("/shop", getShopProducts); // shop products with filtering, sorting, pagination
router.get("/generate-sku", generateSKU); // generate unique SKU
router.get("/search", fuzzySearchProducts);

// --- FIX: Place orders/receipts routes BEFORE any :id routes ---
router.get('/orders', authenticate, orderController.listOrders);
router.get('/receipts/:id', authenticate, orderController.getReceipt);
router.put('/orders/:id', authenticate, orderController.updateOrder);
router.put('/receipts/:id', authenticate, orderController.updateReceipt);
router.delete('/orders/:id', authenticate, orderController.deleteOrder);
router.delete('/receipts/:id', authenticate, orderController.deleteReceipt);
// -------------------------------------------------------------

router.get("/:id", getProductById); // details
router.get("/:id/short", getProductShortInfo); // short info
router.get("/slug/:slug", getProductBySlug);
// Change from GET to POST for by-ids
router.post('/by-ids', getProductsByIds);


// Protected
router.post("/", authenticate, authorize("products", "create"), upload.single("image"), createProduct);
router.put("/:id", authenticate, authorize("products", "update"), upload.single("image"), updateProduct);
router.delete("/:id", authenticate, authorize("products", "delete"), deleteProduct);
router.post("/:id/media", authenticate, authorize("products", "update"), upload.single("image"), addProductMedia);
router.delete("/:id/media/:mediaId", authenticate, authorize("products", "update"), deleteProductMedia);

// DOCS ENDPOINTS
router.get("/:id/docs", listProductDocs);
router.post("/:id/docs", authenticate, authorize("products", "update"), upload.single("file"), addProductDoc);
router.delete("/:id/docs/:docId", authenticate, authorize("products", "update"), deleteProductDoc);
router.put("/:id/docs/:docId", authenticate, authorize("products", "update"), upload.single("file"), updateProductDoc);

router.post('/checkout', orderController.createOrder);
router.post('/validate-coupon', orderController.validateCoupon);

export default router; 
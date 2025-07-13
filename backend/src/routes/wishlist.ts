import { Router } from 'express';
import { addToWishlist, removeFromWishlist, getWishlist, getWishlistStatus } from '../controllers/wishlistController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.post('/', addToWishlist);
router.delete('/:product_id', removeFromWishlist);
router.get('/', getWishlist);
router.get('/status', getWishlistStatus);

export default router; 
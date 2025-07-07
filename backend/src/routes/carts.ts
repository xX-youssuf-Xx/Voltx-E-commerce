import { Router } from 'express';
import * as cartController from '../controllers/cartController';

const router = Router();

router.post('/', cartController.createCart);
router.get('/', cartController.listCarts);
router.get('/:id', cartController.getCart);
router.get('/code/:code', cartController.getCartByCode);
router.put('/:id', cartController.updateCart);
router.delete('/:id', cartController.deleteCart);

export default router; 
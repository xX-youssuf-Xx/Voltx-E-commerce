import { Router } from 'express';
import * as homepageController from '../controllers/homepageController';

const router = Router();

router.get('/:section', homepageController.listSection);
router.post('/:section', homepageController.addProduct);
router.delete('/:section/:id', homepageController.removeProduct);
router.put('/:section/order', homepageController.reorderSection);

export default router; 
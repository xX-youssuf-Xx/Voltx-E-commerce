import { Router } from 'express';
import * as homepageController from '../controllers/homepageController';

const router = Router();

// New endpoint for complete homepage data
router.get('/', homepageController.getHomepageData);

router.get('/:section', homepageController.listSection);
router.post('/:section', homepageController.addProduct);
router.delete('/:section/:id', homepageController.removeProduct);
router.put('/:section/order', homepageController.reorderSection);

export default router; 
import { Router } from 'express';
import { CylinderController } from './cylinder.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

// Store Inventory Routes
router.post('/inventory/batch', CylinderController.addBatchBrandsToStore);
router.delete('/inventory/brands/:brandId', CylinderController.removeBrandFromStore);
router.post('/inventory', CylinderController.addBrandToStore);
router.get('/inventory', CylinderController.getInventory);
router.patch('/inventory/:id', CylinderController.updateInventory);

export { router as CylinderRoutes };

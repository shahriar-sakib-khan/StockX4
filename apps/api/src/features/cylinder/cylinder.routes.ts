import { Router } from 'express';
import { CylinderController } from './cylinder.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

// Store Inventory Routes
// Store Inventory Routes
// Store Inventory Routes
router.get('/inventory', CylinderController.getInventory);
router.post('/inventory/upsert', CylinderController.upsertInventory);
router.patch('/inventory/:id', CylinderController.updateInventory);

export { router as CylinderRoutes };

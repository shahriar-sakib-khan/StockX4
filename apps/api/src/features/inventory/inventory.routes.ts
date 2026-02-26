import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.get('/', InventoryController.getInventory);
router.get('/size-stats/:size', InventoryController.getSizeStats);
router.post('/upsert', InventoryController.upsertInventory);
router.delete('/:id', InventoryController.deleteInventory);
router.patch('/product/:productId', InventoryController.patchStoreProduct);

export { router as InventoryRoutes };

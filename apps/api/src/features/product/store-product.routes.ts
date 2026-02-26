import { Router } from 'express';
import { StoreProductController } from './store-product.controller';
import { authenticate } from '../../middleware/auth.middleware';

// Note: Mounted alongside existing global ProductRoutes usually, or as a distinct module in app.ts
const router: Router = Router();

router.use(authenticate);

router.post('/sync-cylinders', StoreProductController.syncCylinderMatrix);
router.post('/archive-size', StoreProductController.archiveCylinderSize);
router.post('/stove', StoreProductController.addStove);
router.post('/regulator', StoreProductController.addRegulator);

export { router as StoreProductRoutes };

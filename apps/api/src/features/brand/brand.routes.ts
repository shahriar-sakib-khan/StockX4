import { Router } from 'express';
import { BrandController } from './brand.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

// Admin Routes (Should be protected by role, but open for now/MVP)
// Public/Global Brand Routes
router.get('/', BrandController.getGlobalBrands);
router.post('/', BrandController.createGlobalBrand);
router.put('/:id', BrandController.updateGlobalBrand);
router.delete('/:id', BrandController.deleteGlobalBrand);

// Store Brand Routes
router.get('/store', BrandController.getStoreBrands);
router.post('/store', BrandController.addStoreBrand);
router.post('/store/custom', BrandController.createCustomBrand);
router.put('/store/bulk/update', BrandController.updateStoreBrandsBulk); // Specific route first
router.put('/store/:id', BrandController.updateStoreBrand); // Parameter route last
router.delete('/store/:id', BrandController.deleteStoreBrand);

export { router as BrandRoutes };

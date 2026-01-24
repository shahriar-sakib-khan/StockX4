import { Router } from 'express';
import { BrandController } from './brand.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

// Admin Routes (Should be protected by role, but open for now/MVP)
router.post('/', BrandController.createGlobalBrand);
router.get('/', BrandController.getGlobalBrands);
router.put('/:id', BrandController.updateGlobalBrand);
router.delete('/:id', BrandController.deleteGlobalBrand);

export { router as BrandRoutes };

import { Router } from 'express';
import { ShopController } from './shop.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate); // Require login

router.post('/', ShopController.create);
router.get('/', ShopController.list);
router.get('/:id', ShopController.get);
router.put('/:id', ShopController.update);
router.delete('/:id', ShopController.delete);

export { router as ShopRoutes };

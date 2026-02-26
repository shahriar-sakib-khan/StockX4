import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.post('/', ProductController.create);
router.get('/', ProductController.list);
router.get('/:id', ProductController.get);
router.put('/:id', ProductController.update);
router.patch('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export { router as ProductRoutes };

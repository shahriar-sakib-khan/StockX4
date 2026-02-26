import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.post('/', CustomerController.create);
router.get('/', CustomerController.list);
router.get('/:id', CustomerController.get);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.delete);

export { router as CustomerRoutes };

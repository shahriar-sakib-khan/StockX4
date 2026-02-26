import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.post('/', VehicleController.create);
router.get('/', VehicleController.list);
router.get('/:id', VehicleController.get);
router.put('/:id', VehicleController.update);
router.delete('/:id', VehicleController.delete);

export { router as VehicleRoutes };

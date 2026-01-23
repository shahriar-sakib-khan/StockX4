import { Router } from 'express';
import { StoreController } from './store.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { StaffManagementRoutes } from '../staff/staff.routes';

const router: Router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => StoreController.create(req, res).catch(next));
router.get('/', (req, res, next) => StoreController.list(req, res).catch(next));
router.get('/:id', (req, res, next) => StoreController.get(req, res).catch(next));
router.put('/:id', (req, res, next) => StoreController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => StoreController.delete(req, res).catch(next));

// Mount Staff Routes: /stores/:storeId/staff
router.use('/:storeId/staff', StaffManagementRoutes);

export { router as StoreRoutes };

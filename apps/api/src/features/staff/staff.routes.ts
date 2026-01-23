import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticate } from '../../middleware/auth.middleware';

// Public Router (Login)
const publicRouter: Router = Router();
publicRouter.post('/login', (req, res, next) => StaffController.login(req, res).catch(next));

// Management Router (Nested under /stores/:storeId/staff)
const managementRouter: Router = Router({ mergeParams: true });
managementRouter.use(authenticate);

managementRouter.post('/', (req, res, next) => StaffController.create(req, res).catch(next));
managementRouter.get('/', (req, res, next) => StaffController.list(req, res).catch(next));
managementRouter.patch('/:staffId', (req, res, next) => StaffController.update(req, res).catch(next));
managementRouter.delete('/:staffId', (req, res, next) => StaffController.delete(req, res).catch(next));

export { publicRouter as StaffPublicRoutes, managementRouter as StaffManagementRoutes };

import { Router } from 'express';
import { SalaryController } from './salary.controller';
import { authenticate } from '../../../middleware/auth.middleware';

// Salary Router (Nested under /stores/:storeId/staff/:staffId/salary)
const salaryRouter: Router = Router({ mergeParams: true });
salaryRouter.use(authenticate);

// POST /stores/:storeId/staff/:staffId/salary/pay — Pay salary or bonus
salaryRouter.post('/pay', (req, res, next) => SalaryController.paySalary(req, res).catch(next));

// GET /stores/:storeId/staff/:staffId/salary/history — Salary payment history
salaryRouter.get('/history', (req, res, next) => SalaryController.getSalaryHistory(req, res).catch(next));

// POST /stores/:storeId/staff/:staffId/salary/accrue — Trigger monthly accrual
salaryRouter.post('/accrue', (req, res, next) => SalaryController.processAccruals(req, res).catch(next));

export { salaryRouter as SalaryRoutes };

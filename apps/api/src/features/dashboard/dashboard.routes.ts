import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

const router = Router();

// /api/dashboard/:storeId/...
// Or /api/stores/:storeId/dashboard/... ?
// Let's stick to passing storeId as param if we mount it under /api/dashboard

router.get('/:storeId/stats', DashboardController.getStats);
router.get('/:storeId/chart', DashboardController.getChartData);
router.get('/:storeId/inventory', DashboardController.getInventorySummary);

export const dashboardRoutes: Router = router;

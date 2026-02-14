import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
    static async getStats(req: Request, res: Response) {
        try {
            const storeId = req.params.storeId;
            const period = req.query.period as 'day' | 'week' | 'month' | 'year' | undefined;

            const stats = await DashboardService.getStats(storeId, period);
            res.json(stats);
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard stats' });
        }
    }

    static async getChartData(req: Request, res: Response) {
        try {
            const storeId = req.params.storeId;
            const days = Number(req.query.days) || 30;

            const data = await DashboardService.getChartData(storeId, days);
            res.json(data);
        } catch (error) {
            console.error('Error getting chart data:', error);
            res.status(500).json({ message: 'Failed to fetch chart data' });
        }
    }

    static async getInventorySummary(req: Request, res: Response) {
        try {
            const storeId = req.params.storeId;

            const summary = await DashboardService.getInventorySummary(storeId);
            res.json(summary);
        } catch (error) {
            console.error('Error getting inventory summary:', error);
            res.status(500).json({ message: 'Failed to fetch inventory summary' });
        }
    }
}

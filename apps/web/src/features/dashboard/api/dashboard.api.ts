import { api } from '@/lib/api';

export const dashboardApi = {
    getStats: (storeId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') => {
        return api.get(`dashboard/${storeId}/stats?period=${period}`).json<any>();
    },
    getChartData: (storeId: string, days: number = 30) => {
        return api.get(`dashboard/${storeId}/chart?days=${days}`).json<any[]>();
    },
    getInventorySummary: (storeId: string) => {
        return api.get(`dashboard/${storeId}/inventory`).json<any>();
    }
};

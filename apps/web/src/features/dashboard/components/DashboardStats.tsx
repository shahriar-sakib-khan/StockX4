import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStatsProps {
    storeId: string;
}

export const DashboardStats = ({ storeId }: DashboardStatsProps) => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats', storeId],
        queryFn: () => dashboardApi.getStats(storeId, 'month')
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
        );
    }

    const cards = [
        {
            label: 'Total Sales (Month)',
            value: stats?.totalSales || 0,
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            label: 'Total Expenses (Month)',
            value: stats?.totalExpenses || 0,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50',
            borderColor: 'border-red-100'
        },
        {
            label: 'Net Profit (Month)',
            value: stats?.netProfit || 0,
            icon: DollarSign,
            color: (stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-orange-500',
            bg: (stats?.netProfit || 0) >= 0 ? 'bg-green-50' : 'bg-orange-50',
             borderColor: (stats?.netProfit || 0) >= 0 ? 'border-green-100' : 'border-orange-100'
        },
        {
            label: 'Total Due (Receivable)',
            value: stats?.totalDue || 0,
            icon: CreditCard,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
             borderColor: 'border-orange-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className={`bg-white rounded-xl p-4 border ${card.borderColor} shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
                        <h4 className={`text-2xl font-bold ${card.color} mt-1`}>
                           ৳{card.value.toLocaleString()}
                        </h4>
                    </div>
                </div>
            ))}
        </div>
    );
};

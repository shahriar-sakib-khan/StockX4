import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStatsProps {
    storeId: string;
}

export const DashboardStats = ({ storeId }: DashboardStatsProps) => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats', storeId, 'day'],
        queryFn: () => dashboardApi.getStats(storeId, 'day')
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
            label: 'Total Sales (Today)',
            value: stats?.totalSales || 0,
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            label: 'Total Expenses (Today)',
            value: stats?.totalExpenses || 0,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50',
            borderColor: 'border-red-100'
        },
        {
            label: 'Net Profit (Today)',
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {cards.map((card, index) => (
                <div key={index} className={`bg-white rounded-[1rem] sm:rounded-xl p-3 sm:p-5 border ${card.borderColor} shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow active:scale-[0.97]`}>
                    <div className="flex justify-between items-start mb-2 sm:mb-4">
                        <div className={`p-1.5 sm:p-2.5 rounded-lg ${card.bg}`}>
                            <card.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <span className="text-[9px] xs:text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest leading-none block truncate">{card.label}</span>
                        <h4 className={`text-lg xs:text-xl sm:text-2xl md:text-4xl font-black ${card.color} mt-1 sm:mt-2 leading-none truncate`}>
                           ৳{card.value.toLocaleString()}
                        </h4>
                    </div>
                </div>
            ))}
        </div>
    );
};

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-[120px] md:h-[140px] w-full rounded-2xl bg-muted/50" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: 'Total Sales (Today)',
            value: stats?.totalSales || 0,
            icon: TrendingUp,
            iconColor: 'text-emerald-600 dark:text-emerald-500',
            iconBg: 'bg-emerald-500/15',
            valueColor: 'text-foreground'
        },
        {
            label: 'Total Expenses (Today)',
            value: stats?.totalExpenses || 0,
            icon: TrendingDown,
            iconColor: 'text-destructive',
            iconBg: 'bg-destructive/15',
            valueColor: 'text-foreground'
        },
        {
            label: 'Net Profit (Today)',
            value: stats?.netProfit || 0,
            icon: DollarSign,
            iconColor: (stats?.netProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive',
            iconBg: (stats?.netProfit || 0) >= 0 ? 'bg-emerald-500/15' : 'bg-destructive/15',
            valueColor: (stats?.netProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'
        },
        {
            label: 'Total Due (Receivable)',
            value: stats?.totalDue || 0,
            icon: CreditCard,
            iconColor: 'text-amber-600 dark:text-amber-500',
            iconBg: 'bg-amber-500/15',
            valueColor: 'text-foreground'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card, index) => (
                <Card 
                    key={index} 
                    className="border-border/40 shadow-sm bg-card hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                    <CardContent className="p-4 md:p-5 flex flex-col justify-between h-full min-h-[120px] md:min-h-[140px]">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                                <card.icon className={`w-5 h-5 md:w-6 md:h-6 ${card.iconColor}`} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest block truncate mb-1">
                                {card.label}
                            </span>
                            <h4 className={`text-xl sm:text-2xl md:text-3xl font-black ${card.valueColor} tracking-tight leading-none truncate`}>
                                ৳{card.value.toLocaleString()}
                            </h4>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
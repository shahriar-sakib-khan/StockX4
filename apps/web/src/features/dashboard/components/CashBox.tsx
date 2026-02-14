import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CashBoxProps {
    storeId: string;
}

export const CashBox = ({ storeId }: CashBoxProps) => {
    const { data: stats, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['dashboard-stats', storeId],
        queryFn: () => dashboardApi.getStats(storeId, 'month') // Period doesn't affect CashInHand usually, but API requires it
    });

    if (isLoading) {
        return <Skeleton className="h-48 w-full rounded-xl" />;
    }

    const cashInHand = stats?.cashInHand || 0;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-xl relative overflow-hidden group">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-32 h-32 transform rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-slate-300 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            Cash Box
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">Current Cash in Hand</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="text-slate-300 hover:text-white hover:bg-white/10"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="mt-4">
                    <span className="text-4xl font-bold tracking-tight">
                        ৳{cashInHand.toLocaleString()}
                    </span>
                </div>

                <div className="mt-4 flex gap-4 text-xs text-slate-300 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-1">
                        <div className="p-1 rounded bg-green-500/20 text-green-400">
                             <TrendingUp className="w-3 h-3" />
                        </div>
                        <span>Sales & Payments</span>
                    </div>
                    <div className="flex items-center gap-1">
                         <div className="p-1 rounded bg-red-500/20 text-red-400">
                             <TrendingDown className="w-3 h-3" />
                        </div>
                        <span>Expenses</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

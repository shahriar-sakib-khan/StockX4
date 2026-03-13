import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Wallet, TrendingUp, TrendingDown, Coins as IconCoins, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CashBoxProps {
    storeId: string;
}

const StatCard = ({ label, value, icon: Icon, color, bg, borderColor }: any) => (
    <div className={`p-3 sm:p-4 rounded-xl border ${borderColor} ${bg} shadow-sm group hover:shadow-md transition-all active:scale-95`}>
        <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 rounded-lg bg-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate mb-1">
                    {label}
                </p>
                <div className="flex items-baseline gap-0.5">
                    <span className={`text-[10px] sm:text-xs font-bold ${color}`}>৳</span>
                    <span className={`text-sm xs:text-base sm:text-2xl font-black ${color} tracking-tight truncate`}>
                        {value.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export const CashBox = ({ storeId }: CashBoxProps) => {
    const { data: cashData, isLoading } = useQuery({
        queryKey: ['dashboard-stats', storeId, 'day'],
        queryFn: () => dashboardApi.getStats(storeId, 'day')
    });

    if (isLoading) return <Skeleton className="h-48 w-full rounded-xl shadow-sm" />;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-xs sm:text-base tracking-tight uppercase">Cash Box</h3>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-0.5">Real-time Balance</p>
                    </div>
                </div>
                <div className="hidden xs:flex flex-col items-end">
                    <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Live Tracking
                    </span>
                </div>
            </div>

            <div className="space-y-2.5 sm:space-y-4">
                <div className="p-4 sm:p-6 bg-slate-900 rounded-2xl relative overflow-hidden group border border-slate-800 shadow-xl shadow-slate-200/50">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                    
                    <div className="relative z-10">
                        <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
                            <IconCoins className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            Cash in Hand
                        </p>
                        <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="text-xl sm:text-3xl font-black text-white">৳</span>
                            <span className="text-2xl xs:text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none italic truncate">
                                {(cashData?.cashInHand || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <StatCard
                        label="In (Today)"
                        value={cashData?.cashInPeriod || 0}
                        icon={TrendingUp}
                        color="text-emerald-600"
                        bg="bg-emerald-50/50"
                        borderColor="border-emerald-100"
                    />
                    <StatCard
                        label="Out (Today)"
                        value={cashData?.cashOutPeriod || 0}
                        icon={TrendingDown}
                        color="text-rose-500"
                        bg="bg-rose-50/50"
                        borderColor="border-rose-100"
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                 <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest italic flex items-center justify-center gap-1.5 opacity-60">
                    <Shield className="w-2.5 h-2.5" />
                    Secure Transaction Data
                 </p>
            </div>
        </div>
    );
};

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface CashBoxProps {
    storeId: string;
}

const StatPill = ({ label, value, icon: Icon, color, bgClass }: any) => (
    <div className="flex-1 flex flex-col justify-center p-2.5 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-1.5 mb-1">
            <div className={`p-1 rounded-full ${bgClass}`}>
                <Icon className={`w-3 h-3 ${color}`} strokeWidth={3} />
            </div>
            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                {label}
            </p>
        </div>
        <div className="flex items-baseline gap-0.5 pl-1">
            <span className={`text-[10px] font-bold ${color}`}>৳</span>
            <span className={`text-sm md:text-base font-black text-foreground tracking-tight truncate`}>
                {value.toLocaleString()}
            </span>
        </div>
    </div>
);

export const CashBox = ({ storeId }: CashBoxProps) => {
    const { data: cashData, isLoading } = useQuery({
        queryKey: ['dashboard-stats', storeId, 'day'],
        queryFn: () => dashboardApi.getStats(storeId, 'day')
    });

    if (isLoading) return <Skeleton className="h-[180px] w-full rounded-2xl shadow-sm" />;

    return (
        <Card className="border-border/40 shadow-sm bg-card relative overflow-hidden group">
            {/* Extremely subtle background gradient flair */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            
            {/* Removed h-full and justify-between, added simple gap-4 */}
            <CardContent className="p-4 md:p-5 flex flex-col gap-4 relative z-10">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-500">
                            <Wallet className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm md:text-base tracking-tight leading-none">Vault Balance</h3>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Liquid Cash</p>
                        </div>
                    </div>
                    {/* Live Indicator */}
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 md:py-1 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                {/* Main Value - Tightened margins */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl md:text-2xl font-black text-muted-foreground/50">৳</span>
                        <span className="text-3xl lg:text-4xl 2xl:text-5xl font-black text-foreground tracking-tighter leading-none truncate">
                            {(cashData?.cashInHand || 0).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Flow Stats (In/Out) */}
                <div className="flex gap-2 md:gap-3 w-full">
                    <StatPill
                        label="In"
                        value={cashData?.cashInPeriod || 0}
                        icon={ArrowUpRight}
                        color="text-emerald-600 dark:text-emerald-500"
                        bgClass="bg-emerald-500/15"
                    />
                    <StatPill
                        label="Out"
                        value={cashData?.cashOutPeriod || 0}
                        icon={ArrowDownRight}
                        color="text-destructive"
                        bgClass="bg-destructive/15"
                    />
                </div>
            </CardContent>
        </Card>
    );
};
import { useTransactionSummary } from '@/features/pos/api/transaction.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface StatsViewProps {
    storeId: string;
    filters: any;
}

export const StatsView = ({ storeId, filters }: StatsViewProps) => {
    const { data: summary, isLoading } = useTransactionSummary(storeId, filters);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!summary) return null;

    const cards = [
        {
            title: "Total Sales",
            value: summary.totalSales,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200"
        },
        {
            title: "Cash Income",
            value: summary.cashIncome,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-200"
        },
        {
            title: "Digital Income",
            value: summary.digitalIncome,
            color: "text-cyan-600",
            bg: "bg-cyan-50",
            border: "border-cyan-200"
        },
        {
            title: "Net Cash Flow",
            value: summary.netCashFlow,
            color: summary.netCashFlow >= 0 ? "text-emerald-700" : "text-rose-700",
            bg: summary.netCashFlow >= 0 ? "bg-emerald-50/50" : "bg-rose-50/50",
            border: summary.netCashFlow >= 0 ? "border-emerald-300" : "border-rose-300"
        },
        {
            title: "Total Expenses",
            value: summary.totalExpenses,
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-200"
        },
        {
            title: "Due Collected",
            value: summary.totalDueCollected,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200"
        },
        {
            title: "Due Pending",
            value: summary.totalDuePending,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200"
        },
        {
            title: "Returns",
            value: summary.totalReturns,
            color: "text-slate-600",
            bg: "bg-slate-50",
            border: "border-slate-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
                <Card key={idx} className={`${card.bg} ${card.border} border-2 shadow-sm`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                            {card.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl sm:text-3xl font-black ${card.color}`}>
                            ৳{card.value?.toLocaleString() || 0}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

import { useTransactionSummary } from '../api/transaction.api';
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
                        <div className={`text-3xl font-black ${card.color}`}>
                            ৳{card.value?.toLocaleString() || 0}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

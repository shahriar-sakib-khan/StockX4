import { useMemo } from 'react';
import { DiaryItem } from './DiaryItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DiaryViewProps {
    transactions: any[];
    date: Date;
    isLoading: boolean;
}

export const DiaryView = ({ transactions, date, isLoading }: DiaryViewProps) => {

    const { income, expense, totals } = useMemo(() => {
        const incomeTransactions: any[] = [];
        const expenseTransactions: any[] = [];

        let totalIncome = 0;
        let totalDue = 0;
        let totalExpense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'SALE' || tx.type === 'DUE_PAYMENT') {
                incomeTransactions.push(tx);
                if (tx.type === 'SALE') {
                    totalIncome += (tx.paidAmount || 0);
                    totalDue += (tx.dueAmount || 0);
                } else if (tx.type === 'DUE_PAYMENT') {
                    totalIncome += (tx.paidAmount || 0);
                }
            } else if (tx.type === 'EXPENSE' || tx.type === 'RETURN') {
                expenseTransactions.push(tx);
                totalExpense += (tx.finalAmount || 0);
            }
        });

        return {
            income: incomeTransactions,
            expense: expenseTransactions,
            totals: { totalIncome, totalDue, totalExpense }
        };
    }, [transactions]);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading diary...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100svh-220px)] min-h-[500px]">
            {/* Income Page (Left) */}
            <Card className="flex flex-col h-full border-t-8 border-t-emerald-500 shadow-lg bg-slate-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-2xl font-black text-emerald-900">
                        <span>INCOME</span>
                        <div className="text-right">
                             <span className="block text-3xl">৳{totals.totalIncome}</span>
                             <span className="text-sm font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Due: ৳{totals.totalDue}
                             </span>
                        </div>
                    </CardTitle>
                    <Separator className="bg-emerald-200" />
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full px-6 py-4">
                        {income.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                                <span className="text-4xl font-black mb-2">Empty</span>
                                <span className="text-sm font-bold">No Income Data</span>
                            </div>
                        ) : (
                            income.map(tx => (
                                <DiaryItem key={tx._id} transaction={tx} isIncome={true} />
                            ))
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Expense Page (Right) */}
            <Card className="flex flex-col h-full border-t-8 border-t-rose-500 shadow-lg bg-slate-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-2xl font-black text-rose-900">
                        <span>EXPENSE</span>
                        <span className="text-3xl">৳{totals.totalExpense}</span>
                    </CardTitle>
                    <Separator className="bg-rose-200" />
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                     <ScrollArea className="h-full px-6 py-4">
                        {expense.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                                <span className="text-4xl font-black mb-2">Empty</span>
                                <span className="text-sm font-bold">No Expense Data</span>
                            </div>
                        ) : (
                            expense.map(tx => (
                                <DiaryItem key={tx._id} transaction={tx} isIncome={false} />
                            ))
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

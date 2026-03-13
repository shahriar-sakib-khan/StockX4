import { useMemo, useState } from 'react';
import { DiaryItem } from './DiaryItem';
import { HistoryInvoiceModal } from './HistoryInvoiceModal';
import { EmptyState } from './EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Calculator, Info, ShoppingBag, Receipt, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface DiaryViewProps {
    transactions: any[];
    summary?: any;
    searchQuery?: string;
    date: Date;
    isLoading: boolean;
}

export const DiaryView = ({ transactions, summary, searchQuery = '', date, isLoading }: DiaryViewProps) => {
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    // Sales Sub-Filters
    const [salesFilter, setSalesFilter] = useState<'all' | 'paid' | 'partial' | 'due'>('all');
    // Expense Sub-Filters
    const [expenseFilter, setExpenseFilter] = useState<'all' | 'restock' | 'salary' | 'vehicle' | 'utility'>('all');

    const filteredTransactions = useMemo(() => {
        let docs = transactions;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            docs = docs.filter(tx => 
                tx.invoiceNumber?.toLowerCase().includes(q) ||
                tx.customer?.name?.toLowerCase().includes(q) ||
                tx.staff?.name?.toLowerCase().includes(q) ||
                tx.items?.some((i: any) => i.name?.toLowerCase().includes(q))
            );
        }
        return docs;
    }, [transactions, searchQuery]);

    const { sales, expenses, allSalesCount, allExpensesCount } = useMemo(() => {
        const s = filteredTransactions.filter(tx => tx.type === 'SALE' || tx.type === 'DUE_PAYMENT');
        const e = filteredTransactions.filter(tx => tx.type === 'EXPENSE' || tx.type === 'RETURN');

        const filteredS = s.filter(tx => {
            if (salesFilter === 'all') return true;
            if (salesFilter === 'paid') return tx.dueAmount === 0;
            if (salesFilter === 'partial') return tx.dueAmount > 0 && tx.paidAmount > 0;
            if (salesFilter === 'due') return tx.paidAmount === 0;
            return true;
        });

        const filteredE = e.filter(tx => {
            if (expenseFilter === 'all') return true;
            
            const cat = (tx.category || tx.items?.[0]?.category || tx.items?.[0]?.name || '').toLowerCase().replace(/_/g, ' ');

            if (expenseFilter === 'restock') return cat.includes('restock') || tx.type === 'RETURN';
            if (expenseFilter === 'salary') return cat.includes('salary') || cat.includes('staff');
            if (expenseFilter === 'vehicle') return cat.includes('vehicle') || cat.includes('fuel') || cat.includes('repair');
            if (expenseFilter === 'utility') return cat.includes('utility') || cat.includes('bill') || cat.includes('electric');
            return true;
        });

        return { 
            sales: filteredS, 
            expenses: filteredE,
            allSalesCount: s.length,
            allExpensesCount: e.length,
            s, e // Expose raw lists for filter counts
        };
    }, [filteredTransactions, salesFilter, expenseFilter]);

    const { s, e } = useMemo(() => {
         // This is redundant with the above, I'll just use the one above.
         return { s: filteredTransactions.filter(tx => tx.type === 'SALE' || tx.type === 'DUE_PAYMENT'), 
                  e: filteredTransactions.filter(tx => tx.type === 'EXPENSE' || tx.type === 'RETURN') };
    }, [filteredTransactions]);


    const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground font-black animate-pulse">LOADING DIARY...</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-8">
            {/* Mobile Toggle Button */}
            <div className="flex lg:hidden bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'sales' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 opacity-60"
                    )}
                >
                    <ShoppingBag size={16} />
                    Sales ({sales.length})
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === 'expenses' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 opacity-60"
                    )}
                >
                    <Receipt size={16} />
                    Expenses ({expenses.length})
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:h-[calc(100svh-380px)] min-h-[400px]">
                {/* Daily Sales Column */}
                <div className={cn(
                    "flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden",
                    activeTab === 'sales' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-emerald-50">
                        <div className="flex justify-between items-center mb-2 sm:mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={16} className="text-emerald-600" />
                                <h3 className="text-base sm:text-lg font-black text-emerald-900 tracking-tight">Daily Sales</h3>
                            </div>
                            <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black">
                                {sales.length}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {['all', 'paid', 'partial', 'due'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setSalesFilter(f as any)}
                                        className={cn(
                                            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all min-h-[32px] sm:min-h-[40px] whitespace-nowrap",
                                            salesFilter === f 
                                                ? "bg-slate-900 text-white shadow-md scale-105" 
                                                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                        )}
                                    >
                                        {f} <span className="opacity-50 ml-0.5">({s.filter(tx => {
                                            if (f === 'all') return true;
                                            if (f === 'paid') return tx.dueAmount === 0;
                                            if (f === 'partial') return tx.dueAmount > 0 && tx.paidAmount > 0;
                                            if (f === 'due') return tx.paidAmount === 0;
                                            return false;
                                        }).length})</span>
                                    </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-3 sm:p-6 pt-2">
                        {sales.length === 0 ? (
                            <div className="py-8">
                                <EmptyState icon={<ShoppingBag size={40} />} title="No sales" subtitle="POS transaction needed" />
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4 pt-1 pb-40">
                                {sales.map(tx => (
                                    <DiaryItem key={tx._id} transaction={tx} isIncome={true} onClick={() => { setSelectedTransaction(tx); setIsInvoiceOpen(true); }} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Daily Expenses Column */}
                <div className={cn(
                    "flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden",
                    activeTab === 'expenses' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-rose-50">
                        <div className="flex justify-between items-center mb-2 sm:mb-4">
                            <div className="flex items-center gap-2">
                                <Receipt size={16} className="text-rose-600" />
                                <h3 className="text-base sm:text-lg font-black text-rose-900 tracking-tight">Daily Expenses</h3>
                            </div>
                            <div className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black">
                                {expenses.length}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {['all', 'restock', 'salary', 'vehicle', 'utility'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setExpenseFilter(f as any)}
                                        className={cn(
                                            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all min-h-[32px] sm:min-h-[40px] whitespace-nowrap",
                                            expenseFilter === f 
                                                ? "bg-slate-900 text-white shadow-md scale-105" 
                                                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                        )}
                                    >
                                        {f} <span className="opacity-50 ml-0.5">({e.filter(tx => {
                                            if (f === 'all') return true;
                                            const cat = (tx.category || tx.items?.[0]?.category || tx.items?.[0]?.name || '').toLowerCase().replace(/_/g, ' ');
                                            if (f === 'restock') return cat.includes('restock') || tx.type === 'RETURN';
                                            if (f === 'salary') return cat.includes('salary') || cat.includes('staff');
                                            if (f === 'vehicle') return cat.includes('vehicle') || cat.includes('fuel') || cat.includes('repair');
                                            if (f === 'utility') return cat.includes('utility') || cat.includes('bill') || cat.includes('electric');
                                            return false;
                                        }).length})</span>
                                    </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-3 sm:p-6 pt-2">
                        {expenses.length === 0 ? (
                            <div className="py-8">
                                <EmptyState icon={<Receipt size={40} />} title="No expenses" subtitle="Add an expense to see" />
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4 pt-1 pb-40">
                                {expenses.map(tx => (
                                    <DiaryItem key={tx._id} transaction={tx} isIncome={false} onClick={() => { setSelectedTransaction(tx); setIsInvoiceOpen(true); }} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            <HistoryInvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => {
                    setIsInvoiceOpen(false);
                    setTimeout(() => setSelectedTransaction(null), 200);
                }}
                transaction={selectedTransaction}
            />
        </div>
    );
};

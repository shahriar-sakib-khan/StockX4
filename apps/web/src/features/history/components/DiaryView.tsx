import { useMemo, useState } from 'react';
import { DiaryItem } from './DiaryItem';
import { HistoryInvoiceModal } from './HistoryInvoiceModal';
import { EmptyState } from './EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    const [salesFilter, setSalesFilter] = useState<'all' | 'paid' | 'partial' | 'due'>('all');
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

    const { sales, expenses, s, e } = useMemo(() => {
        const s_raw = filteredTransactions.filter(tx => tx.type === 'SALE' || tx.type === 'DUE_PAYMENT');
        const e_raw = filteredTransactions.filter(tx => tx.type === 'EXPENSE' || tx.type === 'RETURN');

        const filteredS = s_raw.filter(tx => {
            if (salesFilter === 'all') return true;
            if (salesFilter === 'paid') return tx.dueAmount === 0;
            if (salesFilter === 'partial') return tx.dueAmount > 0 && tx.paidAmount > 0;
            if (salesFilter === 'due') return tx.paidAmount === 0;
            return true;
        });

        const filteredE = e_raw.filter(tx => {
            if (expenseFilter === 'all') return true;
            const cat = (tx.category || tx.items?.[0]?.category || tx.items?.[0]?.name || '').toLowerCase().replace(/_/g, ' ');
            if (expenseFilter === 'restock') return cat.includes('restock') || tx.type === 'RETURN';
            if (expenseFilter === 'salary') return cat.includes('salary') || cat.includes('staff');
            if (expenseFilter === 'vehicle') return cat.includes('vehicle') || cat.includes('fuel') || cat.includes('repair');
            if (expenseFilter === 'utility') return cat.includes('utility') || cat.includes('bill') || cat.includes('electric');
            return true;
        });

        return { sales: filteredS, expenses: filteredE, s: s_raw, e: e_raw };
    }, [filteredTransactions, salesFilter, expenseFilter]);

    const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');

    if (isLoading) {
        return <div className="flex h-full items-center justify-center text-slate-400 font-black animate-pulse uppercase tracking-widest text-[10px] sm:text-xs min-h-[300px]">Loading Diary...</div>;
    }

    return (
        <div className="flex flex-col w-full space-y-3 sm:space-y-4">
            
            {/* PRISTINE MOBILE TOGGLE */}
            <div className="flex lg:hidden bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 shadow-inner w-full shrink-0">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={cn(
                        "relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-out z-10",
                        activeTab === 'sales' ? "text-emerald-700" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    {activeTab === 'sales' && (
                        <div className="absolute inset-0 bg-white rounded-lg shadow-[0_1px_6px_-1px_rgba(16,185,129,0.15)] border border-emerald-100/50 -z-10 animate-in zoom-in-[0.98] duration-200" />
                    )}
                    <ShoppingBag size={14} className={activeTab === 'sales' ? "text-emerald-500" : "opacity-60"} />
                    <span className="truncate">Sales ({sales.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={cn(
                        "relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-out z-10",
                        activeTab === 'expenses' ? "text-rose-700" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    {activeTab === 'expenses' && (
                        <div className="absolute inset-0 bg-white rounded-lg shadow-[0_1px_6px_-1px_rgba(244,63,94,0.15)] border border-rose-100/50 -z-10 animate-in zoom-in-[0.98] duration-200" />
                    )}
                    <Receipt size={14} className={activeTab === 'expenses' ? "text-rose-500" : "opacity-60"} />
                    <span className="truncate">Expenses ({expenses.length})</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[500px] lg:h-[600px]">
                
                {/* ---------------- DAILY SALES COLUMN ---------------- */}
                <div className={cn(
                    "flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] overflow-hidden h-full",
                    activeTab === 'sales' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="p-3 sm:p-5 pb-2 sm:pb-4 border-b border-slate-100 flex flex-col gap-3 sm:gap-4 shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600">
                                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">Daily Sales</h3>
                            </div>
                            <div className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-full text-[9px] sm:text-[11px] font-black shadow-inner">
                                {sales.length}
                            </div>
                        </div>

                        {/* THE FIX: Fully fluid, wrapping flex-container. No horizontal scrollbars ever. */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-inner w-full">
                            {['all', 'paid', 'partial', 'due'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setSalesFilter(f as any)}
                                    className={cn(
                                        "relative flex-auto min-w-[40%] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-300 ease-out outline-none z-10 text-center",
                                        salesFilter === f ? "text-emerald-800" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                    )}
                                >
                                    {/* Premium Gliding Pill Background */}
                                    {salesFilter === f && (
                                        <div className="absolute inset-0 bg-white rounded-lg sm:rounded-xl shadow-[0_1px_4px_-1px_rgba(0,0,0,0.1)] border border-slate-100 -z-10 animate-in zoom-in-95 duration-300 ease-out" />
                                    )}
                                    {f} 
                                    <span className={cn("ml-1 font-bold text-[8px] sm:text-[10px]", salesFilter === f ? "text-emerald-500" : "text-slate-400")}>
                                        ({s.filter(tx => {
                                            if (f === 'all') return true;
                                            if (f === 'paid') return tx.dueAmount === 0;
                                            if (f === 'partial') return tx.dueAmount > 0 && tx.paidAmount > 0;
                                            if (f === 'due') return tx.paidAmount === 0;
                                            return false;
                                        }).length})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-2 sm:p-5 pt-2 bg-slate-50/30">
                        {sales.length === 0 ? (
                            <div className="py-10 flex justify-center">
                                <EmptyState icon={<ShoppingBag size={32} className="text-slate-300" />} title="No sales" subtitle="No transactions found" />
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3 pb-8">
                                {sales.map(tx => (
                                    <DiaryItem key={tx._id} transaction={tx} isIncome={true} onClick={() => { setSelectedTransaction(tx); setIsInvoiceOpen(true); }} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* ---------------- DAILY EXPENSES COLUMN ---------------- */}
                <div className={cn(
                    "flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] overflow-hidden h-full",
                    activeTab === 'expenses' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="p-3 sm:p-5 pb-2 sm:pb-4 border-b border-slate-100 flex flex-col gap-3 sm:gap-4 shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600">
                                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">Daily Expenses</h3>
                            </div>
                            <div className="bg-rose-100 text-rose-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-full text-[9px] sm:text-[11px] font-black shadow-inner">
                                {expenses.length}
                            </div>
                        </div>

                        {/* THE FIX: Flex-wrap allows exactly 3 buttons on top row, 2 on bottom row automatically! */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-inner w-full">
                            {['all', 'restock', 'salary', 'vehicle', 'utility'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setExpenseFilter(f as any)}
                                    className={cn(
                                        "relative flex-auto min-w-[28%] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-300 ease-out outline-none z-10 text-center",
                                        expenseFilter === f ? "text-rose-800" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                    )}
                                >
                                    {/* Premium Gliding Pill Background */}
                                    {expenseFilter === f && (
                                        <div className="absolute inset-0 bg-white rounded-lg sm:rounded-xl shadow-[0_1px_4px_-1px_rgba(0,0,0,0.1)] border border-slate-100 -z-10 animate-in zoom-in-95 duration-300 ease-out" />
                                    )}
                                    {f} 
                                    <span className={cn("ml-1 font-bold text-[8px] sm:text-[10px]", expenseFilter === f ? "text-rose-500" : "text-slate-400")}>
                                        ({e.filter(tx => {
                                            if (f === 'all') return true;
                                            const cat = (tx.category || tx.items?.[0]?.category || tx.items?.[0]?.name || '').toLowerCase().replace(/_/g, ' ');
                                            if (f === 'restock') return cat.includes('restock') || tx.type === 'RETURN';
                                            if (f === 'salary') return cat.includes('salary') || cat.includes('staff');
                                            if (f === 'vehicle') return cat.includes('vehicle') || cat.includes('fuel') || cat.includes('repair');
                                            if (f === 'utility') return cat.includes('utility') || cat.includes('bill') || cat.includes('electric');
                                            return false;
                                        }).length})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-2 sm:p-5 pt-2 bg-slate-50/30">
                        {expenses.length === 0 ? (
                            <div className="py-10 flex justify-center">
                                <EmptyState icon={<Receipt size={32} className="text-slate-300" />} title="No expenses" subtitle="No transactions found" />
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3 pb-8">
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
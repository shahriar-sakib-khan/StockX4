import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '@/features/pos/api/transaction.api';
import { format, subDays, startOfMonth, startOfYear, endOfDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    BookOpen, 
    PlusCircle, 
    TrendingUp, 
    TrendingDown, 
    AlertCircle, 
    Wallet, 
    RefreshCcw, 
    Search,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { DiaryView } from '../components/DiaryView';
import { StatsView } from '../components/StatsView';
import { AddExpenseModal } from '@/features/pos/components/AddExpenseModal';
import { SummaryCard } from '../components/SummaryCard';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/features/store/components/setup/shared/InfoTooltip';

export const HistoryPage = () => {
    const { id: storeId } = useParams<{ id: string }>();
    const [viewMode, setViewMode] = useState<'daily' | 'stats'>('daily');
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [diaryMode, setDiaryMode] = useState<'CASH_FLOW' | 'PROFIT'>('CASH_FLOW');

    // Global Date Range State
    const [dateRange, setDateRange] = useState('today'); // today, yesterday, week, month, year, custom
    const [customRange, setCustomRange] = useState({
        start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    // --- Unified Date Filtering ---
    const getDateFilters = () => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (dateRange) {
            case 'today':
                start = startOfDay(today);
                end = endOfDay(today);
                break;
            case 'yesterday':
                start = startOfDay(subDays(today, 1));
                end = endOfDay(subDays(today, 1));
                break;
            case 'week':
                start = startOfDay(subDays(today, 6));
                end = endOfDay(today);
                break;
            case 'month':
                start = startOfDay(subDays(today, 29));
                end = endOfDay(today);
                break;
            case 'year':
                start = startOfYear(today);
                end = endOfDay(today);
                break;
            case 'custom':
                start = startOfDay(new Date(customRange.start));
                end = endOfDay(new Date(customRange.end));
                break;
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    };

    const currentFilters = getDateFilters();

    // --- Data Fetching ---
    const dailyQuery = useQuery({
        queryKey: ['history', storeId, 'daily', currentFilters.startDate, currentFilters.endDate],
        queryFn: () => transactionApi.getHistory(storeId!, {
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
            limit: 1000 // Get all transactions for the range
        }),
        enabled: !!storeId && viewMode === 'daily',
    });

    const dailyTransactions = dailyQuery.data?.data || [];

    const summaryQuery = useQuery({
        queryKey: ['transaction-summary', storeId, currentFilters.startDate, currentFilters.endDate],
        queryFn: () => transactionApi.getSummary(storeId!, {
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
        }),
        enabled: !!storeId && viewMode === 'daily',
    });

    const summary = summaryQuery.data;

    // Derived counts for summary cards
    const stats = useMemo(() => {
        const sales = dailyTransactions.filter((tx: any) => tx.type === 'SALE');
        const paidSales = sales.filter((s: any) => s.dueAmount === 0);
        const partialSales = sales.filter((s: any) => s.dueAmount > 0 && s.paidAmount > 0);
        const dueSales = sales.filter((s: any) => s.paidAmount === 0);

        return {
            paidCount: paidSales.length,
            partialCount: partialSales.length,
            dueCount: dueSales.length,
            totalSalesCount: sales.length,
            expenseCount: dailyTransactions.filter((tx: any) => tx.type === 'EXPENSE').length,
            paidAmount: paidSales.reduce((sum: number, s: any) => sum + s.finalAmount, 0),
            partialAmount: partialSales.reduce((sum: number, s: any) => sum + s.paidAmount, 0),
        };
    }, [dailyTransactions]);

    const dateToggles = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: 'Custom', value: 'custom' },
    ];

    const handleReset = () => {
        setDateRange('today');
        setSearchQuery('');
        setDiaryMode('CASH_FLOW');
    };

    return (
        <div className="space-y-4 h-full flex flex-col p-4 md:p-6 bg-slate-50/30">
            {/* Professional Header */}
            <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    Business Diary
                    <InfoTooltip content="Browse all past transactions — sales, purchases, expenses, and adjustments." />
                </h1>
            </div>

            {/* 5-Card Summary Row */}
            {viewMode === 'daily' && summary && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-4">
                    <SummaryCard 
                        title="TOTAL SALES" 
                        value={summary.totalSales} 
                        subtext={`${stats.totalSalesCount} transactions`}
                        color="emerald"
                        icon={<TrendingUp size={16} />}
                    />
                    <SummaryCard 
                        title="EXPENSES" 
                        value={summary.totalExpenses} 
                        subtext={`${stats.expenseCount} entries`}
                        color="rose"
                        icon={<TrendingDown size={16} />}
                    />
                    <SummaryCard 
                        title="NET PROFIT"
                        value={summary.totalSales - summary.totalExpenses} 
                        subtext="Sales - Expenses"
                        color="slate"
                        icon={<Wallet size={16} />}
                    />
                    <SummaryCard 
                        title="PAID" 
                        value={stats.paidAmount + stats.partialAmount} 
                        subtext={`${stats.paidCount + stats.partialCount} sales`}
                        color="cyan"
                        icon={<CheckCircle2 size={16} />}
                    />
                    <SummaryCard 
                        title="DUE" 
                        value={summary.totalDuePending} 
                        subtext={`${stats.dueCount} unpaid`}
                        color="red"
                        icon={<AlertCircle size={16} />}
                    />
                </div>
            )}

            {/* Control Bar: Filters (Left) and Search (Right) */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-end items-stretch md:items-center gap-4">

                    <div className="flex items-center gap-2">
                         <Button 
                            onClick={() => setIsAddExpenseOpen(true)}
                            size="lg"
                            className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white font-black px-6 rounded-xl shadow-lg h-12 uppercase text-sm active:scale-95"
                        >
                            <PlusCircle size={20} className="mr-2" /> Add Expense
                        </Button>

                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleReset}
                            className="rounded-xl border-slate-200 h-12 w-12 hover:bg-orange-50 hover:border-orange-200 transition-colors active:scale-95 shrink-0"
                            title="Reset to Today"
                        >
                            <RefreshCcw size={20} className="text-slate-500" />
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Date Toggles - Scrollable on Mobile */}
                        <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl overflow-x-auto no-scrollbar touch-pan-x">
                            {dateToggles.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setDateRange(item.value)}
                                    className={cn(
                                        "px-3 sm:px-5 py-2 sm:py-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all uppercase whitespace-nowrap min-h-[36px] sm:min-h-[44px] flex items-center justify-center",
                                        dateRange === item.value 
                                            ? "bg-orange-500 text-white shadow-md scale-105 z-10" 
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {dateRange === 'custom' && (
                            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl overflow-hidden min-h-12">
                                 <input 
                                    type="date" 
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="bg-transparent text-xs font-black border-none focus:ring-0 w-32 px-2 h-full"
                                 />
                                 <span className="text-slate-400 font-bold text-[10px] shrink-0">TO</span>
                                 <input 
                                    type="date" 
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="bg-transparent text-xs font-black border-none focus:ring-0 w-32 px-2 h-full"
                                 />
                            </div>
                        )}
                    </div>

                    <div className="relative group w-full lg:w-80">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        </div>
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 sm:h-12 pl-10 sm:pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus-visible:ring-2 focus-visible:ring-slate-900 font-extrabold text-[11px] sm:text-sm placeholder:text-slate-400 transition-all hover:bg-slate-100"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 pb-20 md:pb-0">
                {viewMode === 'daily' ? (
                    <DiaryView
                        transactions={dailyTransactions}
                        summary={summary}
                        searchQuery={searchQuery}
                        date={new Date(currentFilters.startDate)}
                        isLoading={dailyQuery.isLoading || summaryQuery.isLoading}
                    />
                ) : (
                    <div className="h-full overflow-y-auto">
                        <StatsView
                            storeId={storeId!}
                            filters={currentFilters}
                        />
                    </div>
                )}
            </div>
            <AddExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
            />
        </div>
    );
};

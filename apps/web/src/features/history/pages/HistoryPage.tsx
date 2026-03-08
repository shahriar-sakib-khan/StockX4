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

            {/* 6-Card Summary Row */}
            {viewMode === 'daily' && summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                        title={diaryMode === 'PROFIT' ? "EST. PROFIT" : "NET FLOW"}
                        value={diaryMode === 'PROFIT' ? (summary.totalSales - summary.totalExpenses) : summary.netCashFlow} 
                        subtext={diaryMode === 'PROFIT' ? "Sales - Expenses" : "Settled total"}
                        color={diaryMode === 'PROFIT' ? "orange" : "slate"}
                        icon={<Wallet size={16} />}
                    />
                    <SummaryCard 
                        title="PAID" 
                        value={stats.paidAmount} 
                        subtext={`${stats.paidCount} sales`}
                        color="cyan"
                        icon={<CheckCircle2 size={16} />}
                    />
                    <SummaryCard 
                        title="PARTIAL" 
                        value={stats.partialAmount} 
                        subtext={`Due: ৳${summary.totalDuePending}`}
                        color="amber"
                        icon={<Clock size={16} />}
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
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-xl mr-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDiaryMode('CASH_FLOW')}
                            className={cn(
                                "px-4 font-black text-[10px] uppercase tracking-tighter transition-all h-8",
                                diaryMode === 'CASH_FLOW' ? "bg-white text-slate-900 shadow-sm" : "opacity-50"
                            )}
                        >
                            Cash Flow
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDiaryMode('PROFIT')}
                            className={cn(
                                "px-4 font-black text-[10px] uppercase tracking-tighter transition-all h-8",
                                diaryMode === 'PROFIT' ? "bg-white text-slate-900 shadow-sm" : "opacity-50"
                            )}
                        >
                            Profit
                        </Button>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {dateToggles.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => setDateRange(item.value)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black transition-all uppercase whitespace-nowrap",
                                    dateRange === item.value 
                                        ? "bg-orange-500 text-white shadow-sm" 
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {dateRange === 'custom' && (
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                             <input 
                                type="date" 
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent text-[9px] font-black border-none focus:ring-0 w-20 px-1"
                             />
                             <span className="text-slate-400 font-bold text-[8px]">TO</span>
                             <input 
                                type="date" 
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent text-[9px] font-black border-none focus:ring-0 w-20 px-1"
                             />
                        </div>
                    )}

                    <Button 
                        onClick={() => setIsAddExpenseOpen(true)}
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 rounded-xl shadow-md h-8 uppercase text-[10px]"
                    >
                        <PlusCircle size={14} className="mr-1.5" /> Add
                    </Button>

                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleReset}
                        className="rounded-xl border-slate-200 h-8 w-8 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                        title="Reset to Today"
                    >
                        <RefreshCcw size={14} className="text-slate-500" />
                    </Button>
                </div>

                <div className="relative group w-full lg:w-72">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    </div>
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pl-10 pr-4 bg-slate-50 border-transparent rounded-xl focus-visible:ring-2 focus-visible:ring-slate-900 font-bold text-sm placeholder:text-slate-400 transition-all hover:bg-slate-100"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
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

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { transactionApi } from '@/features/pos/api/transaction.api';
import { format, subDays, startOfMonth, startOfYear, endOfDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    PlusCircle, 
    TrendingUp, 
    TrendingDown, 
    AlertCircle, 
    Wallet, 
    RefreshCcw, 
    Search,
    CheckCircle2
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

    const [dateRange, setDateRange] = useState('today'); 
    const [customRange, setCustomRange] = useState({
        start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    const getDateFilters = () => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (dateRange) {
            case 'today': start = startOfDay(today); end = endOfDay(today); break;
            case 'yesterday': start = startOfDay(subDays(today, 1)); end = endOfDay(subDays(today, 1)); break;
            case 'week': start = startOfDay(subDays(today, 6)); end = endOfDay(today); break;
            case 'month': start = startOfDay(subDays(today, 29)); end = endOfDay(today); break;
            case 'year': start = startOfYear(today); end = endOfDay(today); break;
            case 'custom': start = startOfDay(new Date(customRange.start)); end = endOfDay(new Date(customRange.end)); break;
        }
        return { startDate: start.toISOString(), endDate: end.toISOString() };
    };

    const currentFilters = getDateFilters();

    const dailyQuery = useQuery({
        queryKey: ['history', storeId, 'daily', currentFilters.startDate, currentFilters.endDate],
        queryFn: () => transactionApi.getHistory(storeId!, {
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
            limit: 1000 
        }),
        enabled: !!storeId && viewMode === 'daily',
        placeholderData: keepPreviousData,
    });

    const dailyTransactions = dailyQuery.data?.data || [];

    const summaryQuery = useQuery({
        queryKey: ['transaction-summary', storeId, currentFilters.startDate, currentFilters.endDate],
        queryFn: () => transactionApi.getSummary(storeId!, {
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
        }),
        enabled: !!storeId && viewMode === 'daily',
        placeholderData: keepPreviousData,
    });

    const summary = summaryQuery.data;
    
    // Smooth refetching state
    const isRefetching = dailyQuery.isFetching || summaryQuery.isFetching;

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
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-50/40 pb-0 sm:pb-8">
            
            <div className="flex flex-col gap-2.5 sm:gap-4 p-2 sm:p-4 md:p-6 pb-2">
                
                <div className="flex items-center gap-2 px-1 sm:px-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 leading-none">
                        Business Diary
                        <InfoTooltip content="Browse all past transactions — sales, purchases, expenses, and adjustments." />
                    </h1>
                </div>

                {/* Highly refined transition: Soft opacity fade instead of aggressive blur/scale */}
                <div className={cn(
                    "flex flex-col gap-2.5 sm:gap-4 transition-opacity duration-300 ease-in-out",
                    isRefetching ? "opacity-50" : "opacity-100"
                )}>
                    {viewMode === 'daily' && summary && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-4">
                            <div className="order-1">
                                <SummaryCard 
                                    title="TOTAL SALES" 
                                    value={summary.totalSales} 
                                    subtext={`${stats.totalSalesCount} transactions`}
                                    color="emerald"
                                    icon={<TrendingUp size={16} />}
                                />
                            </div>
                            <div className="order-2">
                                <SummaryCard 
                                    title="EXPENSES" 
                                    value={summary.totalExpenses} 
                                    subtext={`${stats.expenseCount} entries`}
                                    color="rose"
                                    icon={<TrendingDown size={16} />}
                                />
                            </div>
                            <div className="order-3 lg:order-4">
                                <SummaryCard 
                                    title="PAID" 
                                    value={stats.paidAmount + stats.partialAmount} 
                                    subtext={`${stats.paidCount + stats.partialCount} sales`}
                                    color="cyan"
                                    icon={<CheckCircle2 size={16} />}
                                />
                            </div>
                            <div className="order-4 lg:order-5">
                                <SummaryCard 
                                    title="DUE" 
                                    value={summary.totalDuePending} 
                                    subtext={`${stats.dueCount} unpaid`}
                                    color="red"
                                    icon={<AlertCircle size={16} />}
                                />
                            </div>
                            <div className="order-5 col-span-2 md:col-span-1 lg:col-span-1 lg:order-3">
                                <SummaryCard 
                                    title="NET PROFIT"
                                    value={summary.totalSales - summary.totalExpenses} 
                                    subtext="Sales - Expenses"
                                    color="slate"
                                    icon={<Wallet size={16} />}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* THE FIX: Premium Glassmorphism Control Bar */}
                <div className="flex flex-col gap-2 p-1.5 sm:p-4 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1rem] sm:rounded-[1.25rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full relative z-10 mt-1">
                    
                    <div className="flex flex-col xl:flex-row items-stretch justify-between gap-2 w-full">
                        
                        {/* Refined Track Background */}
                        <div className="flex items-center w-full bg-slate-200/40 p-1 rounded-xl sm:rounded-[14px] border border-slate-900/5 shadow-inner">
                            {dateToggles.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setDateRange(item.value)}
                                    className={cn(
                                        "flex-1 relative px-1 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-tighter sm:tracking-wider transition-all duration-300 ease-out outline-none select-none text-center group",
                                        dateRange === item.value 
                                            ? "text-orange-600 z-10" 
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {/* Ultra-smooth Apple-style selected pill */}
                                    {dateRange === item.value && (
                                        <div className="absolute inset-0 bg-white rounded-lg sm:rounded-xl shadow-[0_2px_8px_-2px_rgba(249,115,22,0.15),0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 -z-10 animate-in zoom-in-[0.96] duration-200 ease-out" />
                                    )}
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Refined Date Picker */}
                        {dateRange === 'custom' && (
                            <div className="flex items-center justify-between gap-1 sm:gap-2 bg-white/50 border border-slate-200/50 p-1 sm:p-1.5 rounded-xl sm:rounded-[14px] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] w-full xl:w-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                <input 
                                    type="date" 
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="flex-1 w-full min-w-0 bg-white border border-slate-200/50 rounded-lg text-[10px] sm:text-xs font-black focus:ring-2 focus:ring-orange-500/20 px-2 h-8 sm:h-9 text-slate-700 outline-none cursor-pointer text-center shadow-sm transition-all hover:border-slate-300"
                                />
                                <span className="text-slate-400 font-black text-[8px] sm:text-[9px] shrink-0 px-1 uppercase tracking-widest opacity-70">to</span>
                                <input 
                                    type="date" 
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="flex-1 w-full min-w-0 bg-white border border-slate-200/50 rounded-lg text-[10px] sm:text-xs font-black focus:ring-2 focus:ring-orange-500/20 px-2 h-8 sm:h-9 text-slate-700 outline-none cursor-pointer text-center shadow-sm transition-all hover:border-slate-300"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 w-full pt-1">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleReset}
                            className="rounded-xl sm:rounded-[14px] border-slate-200/80 h-10 w-10 sm:h-11 sm:w-11 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all duration-300 active:scale-95 shrink-0 shadow-sm bg-white/80 group"
                        >
                            <RefreshCcw size={15} className={cn("text-slate-500 group-hover:text-orange-500 transition-colors sm:w-[18px] sm:h-[18px]", isRefetching && "animate-spin text-orange-500")} />
                        </Button>

                        <div className="relative flex-1 min-w-0 group">
                            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 sm:pl-10 h-10 sm:h-11 w-full rounded-xl sm:rounded-[14px] bg-white/80 border-slate-200/80 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-400 transition-all duration-300 text-[11px] sm:text-xs font-bold shadow-sm"
                            />
                        </div>

                        <Button 
                            onClick={() => setIsAddExpenseOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 sm:px-6 rounded-xl sm:rounded-[14px] shadow-[0_4px_15px_-3px_rgba(15,23,42,0.25)] hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.35)] h-10 sm:h-11 uppercase text-[10px] sm:text-xs tracking-wider active:scale-[0.96] transition-all duration-300 shrink-0"
                        >
                            <PlusCircle size={15} className="sm:mr-2 sm:w-[18px] sm:h-[18px]" /> 
                            <span className="hidden sm:inline">Add Expense</span>
                            <span className="sm:hidden ml-1.5">Add</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Smooth list transition */}
            <div className={cn(
                "w-full px-1.5 sm:px-4 md:px-6 mt-1 flex flex-col transition-opacity duration-300 ease-in-out",
                isRefetching ? "opacity-50" : "opacity-100"
            )}>
                {viewMode === 'daily' ? (
                    <DiaryView
                        transactions={dailyTransactions}
                        summary={summary}
                        searchQuery={searchQuery}
                        date={new Date(currentFilters.startDate)}
                        isLoading={false} 
                    />
                ) : (
                    <div className="w-full">
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
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../features/transaction/api/transaction.api';
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
import { PieChart, BookOpen, PlusCircle, TrendingUp, TrendingDown, AlertCircle, Wallet } from 'lucide-react';
import { DiaryView } from '@/features/transaction/components/DiaryView';
import { StatsView } from '@/features/transaction/components/StatsView';
import { AddExpenseModal } from '@/features/transaction/components/AddExpenseModal';
import { Card, CardContent } from '@/components/ui/card';

export const HistoryPage = () => {
    const { id: storeId } = useParams<{ id: string }>();
    const [viewMode, setViewMode] = useState<'daily' | 'stats'>('daily');
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

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

    // Derived stats from daily transactions
    const { totalIncome, totalDue, totalExpense } = dailyTransactions.reduce((acc: any, tx: any) => {
        if (tx.type === 'SALE') {
            acc.totalIncome += (tx.paidAmount || 0);
            acc.totalDue += (tx.dueAmount || 0);
        } else if (tx.type === 'DUE_PAYMENT') {
            acc.totalIncome += (tx.paidAmount || 0);
        } else if (tx.type === 'EXPENSE' || tx.type === 'RETURN') {
            acc.totalExpense += (tx.finalAmount || 0);
        }
        return acc;
    }, { totalIncome: 0, totalDue: 0, totalExpense: 0 });

    const cashBox = totalIncome - totalExpense;



    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {viewMode === 'daily' ? 'Daily Diary' : 'Financial Overview'}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {dateRange === 'today' ? "Today's transactions and stats" :
                         dateRange === 'yesterday' ? "Yesterday's transactions and stats" :
                         dateRange === 'custom' ? `${format(new Date(customRange.start), 'dd MMM yyyy')} - ${format(new Date(customRange.end), 'dd MMM yyyy')}` :
                         'Aggregated analytics and reports'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {viewMode === 'daily' && (
                        <Button
                            onClick={() => setIsAddExpenseOpen(true)}
                            className="bg-expense hover:bg-expense/90 text-white mr-2"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Expense
                        </Button>
                    )}
                     <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="daily">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Diary
                            </TabsTrigger>
                            <TabsTrigger value="stats">
                                <PieChart className="w-4 h-4 mr-2" />
                                Stats
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Top Stats Cards */}
            {viewMode === 'daily' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-emerald-50 border-emerald-100">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Total Income</p>
                                <p className="text-2xl font-black text-emerald-900">৳{totalIncome}</p>
                            </div>
                            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-rose-50 border-rose-100">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-rose-600 uppercase tracking-wider">Total Expense</p>
                                <p className="text-2xl font-black text-rose-900">৳{totalExpense}</p>
                            </div>
                            <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                <TrendingDown className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Total Due</p>
                                <p className="text-2xl font-black text-amber-900">৳{totalDue}</p>
                            </div>
                            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Cash Box</p>
                                <p className="text-2xl font-black text-indigo-900">৳{cashBox}</p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-md border min-h-[56px]">
                <div className="flex flex-wrap items-center gap-2 w-full">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[200px] font-bold">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

                    {dateRange === 'custom' && (
                        <div className="flex items-center gap-2 ml-2">
                            <Input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-[140px] font-bold text-center"
                            />
                            <span className="text-muted-foreground font-medium">to</span>
                            <Input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-[140px] font-bold text-center"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {viewMode === 'daily' ? (
                    <DiaryView
                        transactions={dailyTransactions}
                        date={new Date(currentFilters.startDate)}
                        isLoading={dailyQuery.isLoading}
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


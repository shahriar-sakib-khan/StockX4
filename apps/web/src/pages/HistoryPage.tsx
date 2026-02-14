import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../features/transaction/api/transaction.api';
import { format, subDays, startOfMonth, startOfYear, endOfDay, startOfDay, addDays, isSameDay } from 'date-fns';
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, PieChart, BookOpen } from 'lucide-react';
import { DiaryView } from '@/features/transaction/components/DiaryView';
import { StatsView } from '@/features/transaction/components/StatsView';

export const HistoryPage = () => {
    const { id: storeId } = useParams<{ id: string }>();
    const [viewMode, setViewMode] = useState<'daily' | 'stats'>('daily');

    // Daily View State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Stats View State
    const [statsRange, setStatsRange] = useState('week'); // week, month, year, custom
    const [customRange, setCustomRange] = useState({
        start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    // --- Daily Data Fetching ---
    // We want the Full Day for the selected date.
    // The backend filters by startDate <= createdAt <= endDate
    // So we pass Start of Day and End of Day.
    const dailyQuery = useQuery({
        queryKey: ['history', storeId, 'daily', format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => transactionApi.getHistory(storeId!, {
            startDate: startOfDay(selectedDate).toISOString(),
            endDate: endOfDay(selectedDate).toISOString(),
            limit: 1000 // Get all transactions for the day
        }),
        enabled: !!storeId && viewMode === 'daily',
    });

    const dailyTransactions = dailyQuery.data?.data || [];

    // --- Stats Data Fetching ---
    // Compute range based on statsRange
    const getStatsFilters = () => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (statsRange) {
            case 'week':
                start = subDays(today, 7);
                break;
            case 'month':
                start = startOfMonth(today);
                break;
            case 'year':
                start = startOfYear(today);
                break;
            case 'custom':
                start = new Date(customRange.start);
                end = new Date(customRange.end);
                break;
        }

        // Ensure we cover the full end day
        end = endOfDay(end);
        start = startOfDay(start);

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {viewMode === 'daily' ? 'Daily Diary' : 'Financial Overview'}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {viewMode === 'daily'
                            ? format(selectedDate, 'EEEE, dd MMMM yyyy')
                            : 'Aggregated analytics and reports'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-2">
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

            {/* Controls Bar */}
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-md border">
                {viewMode === 'daily' ? (
                     <div className="flex items-center gap-2 w-full justify-center md:justify-start">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="relative">
                            <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="date"
                                value={format(selectedDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    if(e.target.value) setSelectedDate(new Date(e.target.value));
                                }}
                                className="pl-8 w-[160px] font-bold text-center"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                            disabled={isSameDay(selectedDate, new Date())} // Optional: disable future? No, maybe they want to see future entries if any
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDate(new Date())}
                            className="ml-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                            Today
                        </Button>
                     </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                        <Select value={statsRange} onValueChange={setStatsRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Last 7 Days</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {statsRange === 'custom' && (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-[140px]"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="date"
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-[140px]"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {viewMode === 'daily' ? (
                    <DiaryView
                        transactions={dailyTransactions}
                        date={selectedDate}
                        isLoading={dailyQuery.isLoading}
                    />
                ) : (
                    <div className="h-full overflow-y-auto">
                        <StatsView
                            storeId={storeId!}
                            filters={getStatsFilters()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


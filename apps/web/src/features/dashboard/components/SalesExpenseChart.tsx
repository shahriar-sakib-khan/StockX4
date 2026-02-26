import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

interface SalesExpenseChartProps {
    storeId: string;
}

export const SalesExpenseChart = ({ storeId }: SalesExpenseChartProps) => {
    const { data: chartData, isLoading } = useQuery({
        queryKey: ['dashboard-chart', storeId],
        queryFn: () => dashboardApi.getChartData(storeId, 14) // Last 14 days
    });

    if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

    const data = chartData || [];

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(d => Math.max(d.sales, d.expenses)), 100);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Sales vs Expenses</h3>
                        <p className="text-xs text-muted-foreground">Last 14 Days</p>
                    </div>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-slate-600">Sales</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="text-slate-600">Expenses</span>
                    </div>
                </div>
            </div>

            <div className="h-48 flex items-end gap-2 sm:gap-4 justify-between w-full">
                {data.map((item, index) => {
                    const salesHeight = (item.sales / maxValue) * 100;
                    const expensesHeight = (item.expenses / maxValue) * 100;

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] p-2 rounded pointer-events-none whitespace-nowrap z-10">
                                <div className="font-bold mb-1">{item.date}</div>
                                <div className="text-blue-200">Sales: ৳{item.sales}</div>
                                <div className="text-red-200">Exp: ৳{item.expenses}</div>
                            </div>

                            <div className="flex gap-[2px] sm:gap-1 w-full justify-center items-end h-full">
                                <div
                                    style={{ height: `${salesHeight}%` }}
                                    className={`w-1.5 sm:w-3 bg-blue-500 rounded-t-sm transition-all duration-500 ${salesHeight === 0 && 'h-[1px] bg-blue-100'}`}
                                ></div>
                                <div
                                    style={{ height: `${expensesHeight}%` }}
                                    className={`w-1.5 sm:w-3 bg-red-400 rounded-t-sm transition-all duration-500 ${expensesHeight === 0 && 'h-[1px] bg-red-100'}`}
                                ></div>
                            </div>

                            {/* Date Label (every 2nd or 3rd to avoid clutter) */}
                            <div className="mt-2 text-[10px] text-slate-400 hidden sm:block">
                                {index % 2 === 0 ? item.date.split('-')[2] : ''}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

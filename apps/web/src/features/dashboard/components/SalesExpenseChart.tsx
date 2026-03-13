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
        <div className="flex flex-col h-full bg-white rounded-lg p-3 sm:p-4">
             <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg text-blue-600 hidden sm:block">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-xs sm:text-base">Trend Analysis</h3>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Last 14 Days</p>
                    </div>
                </div>
                <div className="flex gap-2.5 sm:gap-4 text-[8px] sm:text-xs font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>
                        <span className="text-slate-500 italic">Sales</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400"></span>
                        <span className="text-slate-500 italic">Exp</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[140px] flex items-end gap-1 sm:gap-3 justify-between w-full pb-2">
                {data.map((item, index) => {
                    const salesHeight = (item.sales / maxValue) * 100;
                    const expensesHeight = (item.expenses / maxValue) * 100;

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[9px] p-2 rounded-lg pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl scale-90 group-hover:scale-100 origin-bottom">
                                <div className="font-black mb-1 border-b border-white/10 pb-1">{item.date}</div>
                                <div className="text-blue-300 font-bold tracking-tight text-[10px]">IN: ৳{(item.sales/1000).toFixed(1)}k</div>
                                <div className="text-red-300 font-bold tracking-tight text-[10px]">OUT: ৳{(item.expenses/1000).toFixed(1)}k</div>
                            </div>

                            <div className="flex gap-[0.5px] sm:gap-1 w-full justify-center items-end h-[calc(100%-20px)]">
                                <div
                                    style={{ height: `${salesHeight}%` }}
                                    className={`w-1 sm:w-2.5 bg-blue-500 rounded-t-[1px] sm:rounded-t-sm transition-all duration-700 delay-[${index * 30}ms] ${salesHeight === 0 && 'h-[1px] bg-blue-50'}`}
                                ></div>
                                <div
                                    style={{ height: `${expensesHeight}%` }}
                                    className={`w-1 sm:w-2.5 bg-red-400 rounded-t-[1px] sm:rounded-t-sm transition-all duration-700 delay-[${index * 30 + 10}ms] ${expensesHeight === 0 && 'h-[1px] bg-red-50'}`}
                                ></div>
                            </div>

                            {/* Date Label */}
                            <div className="mt-1.5 text-[7px] sm:text-[10px] font-black text-slate-400">
                                {index % 3 === 0 ? item.date.split('-')[2] : ''}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

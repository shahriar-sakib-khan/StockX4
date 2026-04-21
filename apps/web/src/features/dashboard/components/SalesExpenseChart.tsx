import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SalesExpenseChartProps {
    storeId: string;
}

export const SalesExpenseChart = ({ storeId }: SalesExpenseChartProps) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const { data: chartData, isLoading } = useQuery({
        queryKey: ['dashboard-chart', storeId],
        queryFn: () => dashboardApi.getChartData(storeId, 14)
    });

    if (isLoading) return <Skeleton className="h-[380px] w-full rounded-[2rem] bg-muted/20 animate-pulse" />;

    const rawData = chartData || [];
    
    // Force exactly 14 slots
    const displayData = [...rawData];
    while (displayData.length < 14) {
        displayData.push({ date: '', sales: 0, expenses: 0 });
    }

    const maxValue = Math.max(...rawData.map(d => Math.max(d.sales, d.expenses)), 1000);
    
    const formatYAxisLabel = (val: number) => {
        if (val === 0) return '0';
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
        return val.toString();
    };

    // --- SVG Coordinate System ---
    const svgWidth = 800;
    const svgHeight = 240;
    const padding = { top: 20, right: 10, bottom: 25, left: 45 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;
    
    const slotWidth = chartWidth / 14;
    const barWidth = 14; // Fixed pixel width for the SVG bars
    const barGap = 4;

    return (
        <div className="flex flex-col w-full h-full min-h-[380px] font-sans select-none">
            
            {/* Executive Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20 shadow-sm">
                        <BarChart3 size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground tracking-tight leading-none">Cash Flow Dynamics</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            14-Day Cycle
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-5 bg-background px-4 py-2 rounded-full border border-border/50 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expense</span>
                    </div>
                </div>
            </div>

            {/* Bulletproof SVG Canvas Area */}
            <div className="relative w-full flex-1 min-h-[260px]" onMouseLeave={() => setHoverIndex(null)}>
                
                <svg 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                    className="w-full h-full overflow-visible drop-shadow-sm"
                    preserveAspectRatio="none"
                >
                    {/* Y-Axis Grid & Labels */}
                    {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => {
                        const y = padding.top + chartHeight * (1 - tick);
                        return (
                            <g key={i}>
                                <text 
                                    x={padding.left - 10} 
                                    y={y + 4} 
                                    textAnchor="end" 
                                    className="text-[11px] font-bold fill-muted-foreground/50 tracking-tighter font-mono"
                                >
                                    {formatYAxisLabel(maxValue * tick)}
                                </text>
                                <line 
                                    x1={padding.left} 
                                    y1={y} 
                                    x2={svgWidth - padding.right} 
                                    y2={y} 
                                    stroke="currentColor" 
                                    className={tick === 0 ? "text-border/80" : "text-border/30"} 
                                    strokeWidth={tick === 0 ? 2 : 1}
                                    strokeDasharray={tick === 0 ? "none" : "6 6"}
                                />
                            </g>
                        );
                    })}

                    {/* Bars rendering */}
                    {displayData.map((item, index) => {
                        const hasData = item.date !== '';
                        const xOffset = padding.left + (index * slotWidth) + (slotWidth / 2);
                        
                        // Calculate Heights
                        const sH = hasData ? Math.max((item.sales / maxValue) * chartHeight, 4) : 0;
                        const eH = hasData ? Math.max((item.expenses / maxValue) * chartHeight, 4) : 0;
                        
                        // Calculate Y positions (bottom aligned)
                        const sY = padding.top + chartHeight - sH;
                        const eY = padding.top + chartHeight - eH;

                        const isHovered = hoverIndex === index;

                        return (
                            <g key={index} className="cursor-pointer" onMouseEnter={() => setHoverIndex(index)}>
                                {/* Invisible Hover Catch Area */}
                                <rect 
                                    x={xOffset - slotWidth / 2} 
                                    y={padding.top} 
                                    width={slotWidth} 
                                    height={chartHeight} 
                                    fill="transparent" 
                                />

                                {/* Hover Highlight Background */}
                                {isHovered && hasData && (
                                    <rect 
                                        x={xOffset - slotWidth / 2 + 4} 
                                        y={padding.top} 
                                        width={slotWidth - 8} 
                                        height={chartHeight} 
                                        className="fill-muted/40 transition-opacity" 
                                        rx="6"
                                    />
                                )}

                                {hasData ? (
                                    <>
                                        {/* Revenue Bar */}
                                        <rect 
                                            x={xOffset - barWidth - (barGap / 2)} 
                                            y={sY} 
                                            width={barWidth} 
                                            height={sH} 
                                            rx="3" 
                                            className="fill-emerald-500 transition-all duration-300 ease-out origin-bottom"
                                            style={{ filter: isHovered ? 'brightness(1.15)' : 'none' }}
                                        />
                                        {/* Expense Bar */}
                                        <rect 
                                            x={xOffset + (barGap / 2)} 
                                            y={eY} 
                                            width={barWidth} 
                                            height={eH} 
                                            rx="3" 
                                            className="fill-rose-500 transition-all duration-300 ease-out origin-bottom"
                                            style={{ filter: isHovered ? 'brightness(1.15)' : 'none' }}
                                        />
                                    </>
                                ) : (
                                    /* Empty State Dash */
                                    <rect 
                                        x={xOffset - 6} 
                                        y={padding.top + chartHeight - 2} 
                                        width={12} 
                                        height={2} 
                                        rx="1" 
                                        className="fill-border/60" 
                                    />
                                )}

                                {/* X-Axis Labels */}
                                {hasData && (index === 0 || index === displayData.length - 1 || index % 3 === 0) && (
                                    <text 
                                        x={xOffset} 
                                        y={svgHeight - 2} 
                                        textAnchor="middle" 
                                        className={`text-[10px] font-bold uppercase transition-colors ${isHovered ? 'fill-primary' : 'fill-muted-foreground/40'}`}
                                    >
                                        {index === 0 ? 'START' : index === rawData.length - 1 ? 'TODAY' : item.date.split('-')[2]}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Floating HTML Tooltip */}
                {hoverIndex !== null && displayData[hoverIndex]?.date && (
                    <div 
                        className="absolute z-50 bottom-full mb-2 bg-slate-900 text-white p-3 rounded-xl shadow-2xl pointer-events-none min-w-[140px] border border-white/10"
                        style={{ 
                            left: `calc(${padding.left / svgWidth * 100}% + ${(hoverIndex * slotWidth + slotWidth / 2) / chartWidth * (100 - (padding.left + padding.right) / svgWidth * 100)}%)`,
                            transform: 'translateX(-50%)' 
                        }}
                    >
                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest border-b border-white/10 pb-1.5 text-center">
                            {displayData[hoverIndex].date}
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-emerald-400">IN</span>
                                <span className="text-xs font-black">৳{displayData[hoverIndex].sales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-rose-400">OUT</span>
                                <span className="text-xs font-black">৳{displayData[hoverIndex].expenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Optimistic Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between px-2 border-t border-border/30">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-500">
                    <TrendingUp size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Financial Ledger Active</span>
                </div>
                <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} /> Sync Online
                </div>
            </div>

        </div>
    );
};
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface SummaryCardProps {
    title: string;
    value: number;
    subtext: string;
    color: 'emerald' | 'rose' | 'slate' | 'amber' | 'cyan' | 'red' | 'orange';
    icon: React.ReactNode;
}

export const SummaryCard = ({ title, value, subtext, color, icon }: SummaryCardProps) => {
    const colors = {
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm",
        rose: "bg-rose-50 border-rose-200 text-rose-700 shadow-sm",
        slate: "bg-slate-900 border-slate-800 text-white shadow-2xl",
        amber: "bg-amber-50 border-amber-200 text-amber-700 shadow-sm",
        cyan: "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm",
        red: "bg-red-50 border-red-200 text-red-700 shadow-sm",
        orange: "bg-orange-500 border-orange-600 text-white shadow-xl z-10",
    };

    return (
        <Card className={cn("border-none shadow-sm overflow-hidden", colors[color])}>
            <CardContent className="p-1.5 sm:p-5 pt-2 sm:pt-5 pb-2 sm:pb-5">
                <div className="flex items-center gap-1 sm:gap-3 mb-1 sm:mb-3">
                    <div className={cn("p-1 sm:p-2 rounded-md sm:rounded-xl", color === 'slate' || color === 'orange' ? "bg-white/20" : "bg-white/80 shadow-inner")}>
                        {React.cloneElement(icon as React.ReactElement, { size: 10, className: "sm:size-5" })}
                    </div>
                    <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-tight sm:tracking-[0.15em] opacity-80 leading-none truncate">{title}</span>
                </div>
                <div className="text-xs sm:text-4xl font-black mb-0 sm:mb-1 tracking-tight truncate">৳{value.toLocaleString()}</div>
                <div className="text-[6px] sm:text-xs font-black opacity-70 uppercase tracking-tighter sm:tracking-wider truncate">{subtext}</div>
            </CardContent>
        </Card>
    );
};

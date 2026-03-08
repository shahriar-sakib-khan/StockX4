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
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
        rose: "bg-rose-50 border-rose-100 text-rose-600",
        slate: "bg-slate-900 border-slate-800 text-white shadow-xl",
        amber: "bg-amber-50 border-amber-100 text-amber-600",
        cyan: "bg-cyan-50 border-cyan-100 text-cyan-600",
        red: "bg-red-50 border-red-100 text-red-600",
        orange: "bg-orange-500 border-orange-600 text-white shadow-lg",
    };

    return (
        <Card className={cn("border-none shadow-sm overflow-hidden", colors[color])}>
            <CardContent className="p-3 pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className={cn("p-1.5 rounded-lg", color === 'slate' ? "bg-white/10" : "bg-white/50")}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black mb-0.5">৳{value.toLocaleString()}</div>
                <div className="text-[10px] font-bold opacity-60 uppercase">{subtext}</div>
            </CardContent>
        </Card>
    );
};

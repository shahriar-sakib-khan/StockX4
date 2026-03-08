import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-dashed border-slate-200">
            {icon}
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-1">{title}</h4>
        <p className="text-xs font-bold text-slate-400 max-w-[200px]">{subtitle}</p>
    </div>
);

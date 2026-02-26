import { LucideIcon } from "lucide-react";
import React from "react";

interface StatsCardProps {
    title: string;
    value: string | number | React.ReactNode;
    subTitle: string;
    icon: LucideIcon;
    color?: 'primary' | 'blue' | 'orange' | 'red';
    onClick?: () => void;
    isActive?: boolean;
}

export const StatsCard = ({ title, value, subTitle, icon: Icon, color = 'primary', onClick, isActive }: StatsCardProps) => {
    const colorStyles = {
        primary: {
            bg: 'bg-primary/5',
            border: 'border-primary',
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-500',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-500',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-500',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
        }
    };

    const style = colorStyles[color];

    return (
        <div
            className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${isActive ? `${style.bg} ${style.border}` : 'bg-card'}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${style.iconBg} ${style.iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {subTitle && <p className="text-xs text-muted-foreground font-medium">{subTitle}</p>}
                </div>
            </div>
        </div>
    );
};

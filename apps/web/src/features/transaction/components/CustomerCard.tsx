
import { User, Store, Phone, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
    type: 'B2B' | 'B2C' | 'WALKIN';
    name: string;
    phone?: string;
    address?: string; // For B2B mainly
    balance?: number; // Positive = Due, Negative = Advance (Context dependent)
    isSelected?: boolean;
    onClick?: () => void;
}

export const CustomerCard = ({ type, name, phone, address, balance, isSelected, onClick }: CustomerCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between h-full bg-card",
                isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : "hover:border-primary/50"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        type === 'B2B' ? "bg-blue-100 text-blue-600" : (type === 'B2C' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600")
                    )}>
                        {type === 'B2B' ? <Store size={18} /> : <User size={18} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight line-clamp-1" title={name}>{name}</h3>
                         <span className={cn(
                            "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                             type === 'B2B' ? "bg-blue-100 text-blue-700" : (type === 'B2C' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")
                         )}>
                            {type === 'B2B' ? 'Shop' : (type === 'B2C' ? 'Customer' : 'Walk-in')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground mt-2">
                {phone && (
                    <div className="flex items-center gap-2">
                        <Phone size={12} />
                        <span>{phone}</span>
                    </div>
                )}
                {address && (
                     <div className="flex items-center gap-2 line-clamp-1" title={address}>
                        <Store size={12} />
                        <span>{address}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                 <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Wallet size={14} />
                    <span className="text-xs">Balance</span>
                 </div>
                 <div className={cn(
                     "font-bold text-sm",
                     (balance || 0) > 0 ? "text-warning" : "text-income"
                 )}>
                    {balance ? `৳${Math.abs(balance)} ${(balance > 0 ? 'Due' : 'Adv')}` : '৳0'}
                 </div>
            </div>
        </div>
    );
};

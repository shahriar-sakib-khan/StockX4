import { Button } from '@/components/ui/button';
import { AllocatedDue } from '../stores/pos.types';
import { cn } from '@/lib/utils';

interface POSCustomerDueInfoProps {
    selectedCustomer: any;
    dueAmount: number;
    totalDueCylinders: number;
    mappedDueItems: AllocatedDue[];
    onReturnClick: () => void;
}

export const POSCustomerDueInfo = ({
    selectedCustomer,
    dueAmount,
    totalDueCylinders,
    mappedDueItems,
    onReturnClick
}: POSCustomerDueInfoProps) => {
    
    // Premium Empty State
    if (!selectedCustomer) {
        return (
            <div className="flex items-center h-full">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-md text-[9px] sm:text-[11px] font-black uppercase tracking-widest border border-slate-200/60 shadow-inner">
                    New Customer
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-0 justify-center">
            
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                Current Due
            </span>
            
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Due Amount */}
                <span className={cn(
                    "text-[16px] sm:text-[22px] font-black leading-none tracking-tighter shrink-0",
                    dueAmount > 0 ? 'text-amber-600' : 'text-slate-700'
                )}>
                    ৳{dueAmount.toLocaleString()}
                </span>

                {/* Cylinder Due Section (Separated by a vertical line) */}
                {totalDueCylinders > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200 shrink-0">
                        
                        {/* Stacked Cylinder Avatars */}
                        <div className="flex items-center -space-x-1.5 sm:-space-x-2 shrink-0">
                            {mappedDueItems.slice(0, 3).map((item, i) => (
                                <div 
                                    key={item.productId + i} 
                                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden z-10" 
                                    title={`${item.brandName}: ${item.maxQty}`}
                                >
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain mix-blend-multiply" />
                                    ) : (
                                        <span className="text-[8px] sm:text-[10px] font-black text-slate-400">{item.brandName[0]}</span>
                                    )}
                                </div>
                            ))}
                            {mappedDueItems.length > 3 && (
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm text-[7px] sm:text-[9px] font-black text-slate-500 z-0">
                                    +{mappedDueItems.length - 3}
                                </div>
                            )}
                        </div>

                        {/* Cylinder Count & Action */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="flex flex-col justify-center">
                                <span className="text-[7px] sm:text-[8px] font-black text-orange-500 uppercase leading-none tracking-widest mb-[2px]">Due Cyl</span>
                                <span className="text-[11px] sm:text-[14px] font-black text-slate-700 leading-none">{totalDueCylinders}</span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="h-6 sm:h-8 px-2 sm:px-3 bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200/50 shadow-sm font-black text-[8px] sm:text-[10px] uppercase tracking-widest rounded-md sm:rounded-lg transition-colors ml-0.5 sm:ml-1 shrink-0"
                                onClick={onReturnClick}
                            >
                                Return
                            </Button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
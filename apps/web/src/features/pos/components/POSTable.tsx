import { PosItem, usePosStore } from '../stores/pos.store';
import { Button } from '@/components/ui/button';
import { X, ShoppingBag, ArrowDownLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface POSTableProps {
    title: string;
    items: PosItem[];
    variant: 'selling' | 'returned';
    isActive?: boolean;
    onClick?: () => void;
    isDisabled?: boolean;
}

export const POSTable = ({ title, items, variant, isActive, onClick, isDisabled }: POSTableProps) => {
    const { removeItemSpecific } = usePosStore();
    const isSelling = variant === 'selling';

    const totalItems = items.reduce((a, b) => a + b.quantity, 0);
    const totalPrice = items.reduce((a, b) => a + (b.unitPrice * b.quantity), 0);

    return (
        <div
            onClick={!isDisabled ? onClick : undefined}
            className={cn(
                "flex flex-col h-full rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 border bg-white",
                isSelling 
                    ? "border-emerald-200/60 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]" 
                    : "border-amber-200/60 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)]",
                isActive ? (isSelling ? "ring-2 ring-emerald-500 border-transparent" : "ring-2 ring-amber-500 border-transparent") : "",
                isDisabled ? "opacity-50 pointer-events-none grayscale" : "cursor-pointer"
            )}
        >
            {/* Premium Frosted Header */}
            <div className={cn(
                "flex items-center justify-between p-2.5 sm:p-3 border-b backdrop-blur-md z-10",
                isSelling ? "bg-emerald-50/80 border-emerald-100" : "bg-amber-50/80 border-amber-100"
            )}>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shadow-sm",
                        isSelling ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>
                        {isSelling ? <ShoppingBag size={14} strokeWidth={2.5} /> : <ArrowDownLeft size={14} strokeWidth={2.5} />}
                    </div>
                    <div className="flex flex-col">
                        <span className={cn(
                            "font-black text-[11px] sm:text-[13px] uppercase tracking-wider leading-none",
                            isSelling ? "text-emerald-900" : "text-amber-900"
                        )}>
                            {title}
                        </span>
                        <span className={cn(
                            "font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-0.5",
                            isSelling ? "text-emerald-600" : "text-amber-600"
                        )}>
                            {totalItems} Items
                        </span>
                    </div>
                </div>
                
                {/* Total Value in Header */}
                <div className={cn(
                    "px-2 py-1 rounded-md font-black text-[11px] sm:text-xs tracking-tight shadow-sm border",
                    isSelling ? "bg-white border-emerald-100 text-emerald-700" : "bg-white border-amber-100 text-amber-700"
                )}>
                    ৳{totalPrice.toLocaleString()}
                </div>
            </div>

            {/* Scrollable List Area (Replaces the rigid HTML Table) */}
            <div className="flex-1 overflow-hidden relative bg-slate-50/30">
             <ScrollArea className="h-full w-full">
                 {items.length === 0 ? (
                     // Premium Empty State
                     <div className="flex flex-col items-center justify-center h-32 sm:h-40 opacity-40">
                         {isSelling ? <ShoppingBag size={32} className="mb-2 text-slate-400" /> : <ArrowDownLeft size={32} className="mb-2 text-slate-400" />}
                         <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                             List is empty
                         </span>
                     </div>
                 ) : (
                     <div className="flex flex-col divide-y divide-slate-100/80 p-1 sm:p-1.5">
                         {items.map((item) => {
                             const lineTotal = item.unitPrice * item.quantity;
                             
                             return (
                                 <div key={item.productId} className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors group">
                                     
                                     {/* Left: Item Info */}
                                     <div className="flex flex-col flex-1 min-w-0 pr-2">
                                         <span className="font-extrabold text-slate-800 text-[11px] sm:text-[13px] uppercase tracking-tight truncate leading-tight">
                                             {item.name}
                                         </span>
                                         <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                                             {item.description}
                                         </span>
                                     </div>

                                     {/* Right: Math & Actions */}
                                     <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                         
                                         {/* Explicit Math Display */}
                                         <div className="flex flex-col items-end text-right">
                                             <span className="font-black text-slate-900 text-[11px] sm:text-[13px] tracking-tight leading-none">
                                                 ৳{lineTotal.toLocaleString()}
                                             </span>
                                             {item.quantity > 1 ? (
                                                 <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 tracking-widest mt-1 uppercase">
                                                     {item.quantity} × ৳{item.unitPrice}
                                                 </span>
                                             ) : (
                                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest mt-1 uppercase">
                                                     Qty: {item.quantity}
                                                </span>
                                             )}
                                         </div>

                                         {/* Premium Remove Button */}
                                         <Button
                                             variant="ghost"
                                             size="icon"
                                             className="h-7 w-7 sm:h-8 sm:w-8 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 removeItemSpecific(item.productId, isSelling ? 'SALE' : 'RETURN');
                                             }}
                                         >
                                             <X size={16} strokeWidth={2.5} />
                                         </Button>
                                     </div>

                                 </div>
                             );
                         })}
                     </div>
                 )}
             </ScrollArea>
            </div>
        </div>
    );
};
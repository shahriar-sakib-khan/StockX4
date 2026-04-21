import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PosItem } from '../stores/pos.store';
import { ShoppingBag, ArrowDownLeft, PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSCartProps {
  title: string;
  items: PosItem[];
  totalCount?: number; 
  variant: 'selling' | 'returned';
}

export const POSCart = ({ title, items, variant }: POSCartProps) => {
  const isSelling = variant === 'selling';
  
  // Calculate total quantity across all items
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={cn(
        "flex flex-row items-stretch p-1.5 sm:p-2 gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl transition-all duration-300 border shadow-sm",
        isSelling 
            ? "bg-emerald-50/60 border-emerald-100/80 shadow-[0_2px_10px_-2px_rgba(16,185,129,0.1)]" 
            : "bg-amber-50/60 border-amber-100/80 shadow-[0_2px_10px_-2px_rgba(245,158,11,0.1)]"
    )}>
      
      {/* --- SUMMARY PANEL (LEFT) --- */}
      <div className={cn(
          "flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px] px-2 py-2 sm:py-3 rounded-lg sm:rounded-xl border shadow-sm shrink-0",
          isSelling ? "bg-white border-emerald-100" : "bg-white border-amber-100"
      )}>
        <div className={cn(
            "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md mb-1 shadow-sm",
            isSelling ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
        )}>
            {isSelling ? <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.5} /> : <ArrowDownLeft size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.5} />}
        </div>
        <span className={cn(
            "text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none text-center", 
            isSelling ? "text-emerald-700" : "text-amber-700"
        )}>
            {title}
        </span>
        <div className="flex items-baseline gap-0.5 mt-0.5 sm:mt-1">
            <span className={cn(
                "text-[14px] sm:text-[18px] font-black leading-none tracking-tight", 
                isSelling ? "text-emerald-600" : "text-amber-600"
            )}>
                {totalQuantity}
            </span>
            <span className="text-[6px] sm:text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                Qty
            </span>
        </div>
      </div>

      {/* --- SCROLLABLE ITEMS PANEL (RIGHT) --- */}
      <ScrollArea className="flex-1 w-full bg-white/60 border border-white rounded-lg sm:rounded-xl overflow-hidden">
        <div className="flex items-center h-full gap-1.5 sm:gap-2 p-1.5 sm:p-2 min-h-[50px] sm:min-h-[60px]">
          
          {items.length === 0 ? (
            
            // Elegant Empty State
            <div className="flex items-center gap-1.5 px-3 opacity-50">
                <PackageOpen size={14} className="text-slate-400" />
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">
                    Cart is empty
                </span>
            </div>

          ) : (
            
            // Render Items as Sleek Horizontal Pills
            items.map((item) => (
              <div 
                  key={item.productId} 
                  className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200/80 rounded-md sm:rounded-lg p-1 sm:p-1.5 pr-2.5 sm:pr-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0 transition-colors hover:border-slate-300"
              >
                
                {/* Quantity Badge */}
                <div className={cn(
                    "flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded sm:rounded-md text-[9px] sm:text-[11px] font-black border",
                    isSelling ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                )}>
                  x{item.quantity}
                </div>
                
                {/* Item Details */}
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] sm:text-[11px] font-extrabold text-slate-800 uppercase truncate max-w-[80px] sm:max-w-[120px] leading-tight">
                      {item.name}
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[80px] sm:max-w-[120px] mt-[1px]">
                      {item.description}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>
        
        {/* Subtle, thin scrollbar */}
        <ScrollBar orientation="horizontal" className="h-1.5 sm:h-2 opacity-50 hover:opacity-100 transition-opacity" />
      </ScrollArea>
      
    </div>
  );
};
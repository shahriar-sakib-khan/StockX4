import { useMemo } from 'react';
import { PosItem, usePosStore } from '../stores/pos.store';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X, ShoppingBag, ArrowDownLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSItemListProps {
  items: PosItem[];
  title: string;
  emptyMsg: string;
  listType: 'SALE' | 'RETURN';
}

export const POSItemList = ({ items, title, emptyMsg, listType }: POSItemListProps) => {
  const { updateQuantity, setQuantity, removeItemSpecific, setDueModalOpen, saleItems, mismatchCount } = usePosStore();

  const sectionTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const sectionQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const refillQty = saleItems.filter(i => i.saleType === 'REFILL').reduce((sum, i) => sum + i.quantity, 0);

  const isReturn = listType === 'RETURN';

  const sortedItems = useMemo(() => {
    if (listType === 'RETURN') return items;
    return [...items].sort((a, b) => {
      if (a.saleType === 'PACKAGED' && b.saleType !== 'PACKAGED') return -1;
      if (a.saleType !== 'PACKAGED' && b.saleType === 'PACKAGED') return 1;
      return 0; 
    });
  }, [items, listType]);

  // Dynamic Theme
  const theme = isReturn 
      ? { text: "text-rose-600", accent: "bg-rose-500 text-white", icon: <ArrowDownLeft size={14} strokeWidth={3} /> }
      : { text: "text-blue-600", accent: "bg-blue-600 text-white", icon: <ShoppingBag size={14} strokeWidth={2.5} /> };

  return (
    <div className="flex flex-col h-[260px] sm:h-full w-full relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-2 sm:px-4 pt-2 sm:pt-3 pb-1.5 sm:pb-2.5 shrink-0 sm:border-b sm:border-slate-100">
          <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shadow-sm shrink-0", theme.accent)}>
                  {theme.icon}
              </div>
              <h4 className={cn("font-black text-[11px] sm:text-[12px] uppercase tracking-widest leading-none mt-0.5", theme.text)}>
                  {title}
              </h4>
          </div>
      </div>

      {/* LOCKED LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-0 space-y-1.5 sm:space-y-0 sm:divide-y sm:divide-slate-100/80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {sortedItems.length === 0 ? (
          
          <div className="w-full h-full flex flex-col items-center justify-center opacity-40 py-8">
            <div className={cn("w-10 h-10 mb-2 rounded-full flex items-center justify-center", isReturn ? "bg-rose-100" : "bg-slate-200")}>
                <Plus size={20} className={isReturn ? "text-rose-400" : "text-slate-400"} />
            </div>
            <p className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-widest italic text-center", isReturn ? "text-rose-400" : "text-slate-400")}>
                {emptyMsg}
            </p>
          </div>

        ) : (

          sortedItems.map((item, idx) => (
            <div
              key={`${item.productId}-${item.saleType || 'return'}-${item.isDue ? 'due' : 'normal'}-${idx}`}
              className={cn(
                  "w-full flex flex-row items-center p-1.5 sm:p-2 sm:px-4 gap-1.5 sm:gap-3 relative group transition-all duration-300 cursor-default",
                  // Mobile: Cards with shadows and borders
                  "rounded-lg border shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
                  // PC: Flat, flush rows
                  "sm:rounded-none sm:border-0 sm:shadow-none",
                  // ENHANCED HOVER EFFECTS
                  item.isDue ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50/80 sm:hover:bg-amber-100/50' :
                  isReturn ? 'bg-white border-rose-100 hover:bg-rose-50/60 sm:hover:bg-rose-50/80' : 
                  'bg-white border-slate-200/80 hover:bg-slate-50/60 sm:hover:bg-slate-100/80'
              )}
            >
              
              {/* MOBILE ONLY: Floating Remove Button */}
              {!item.isDue && (
                  <button
                      onClick={(e) => { e.stopPropagation(); removeItemSpecific(item.productId, listType, item.saleType); }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm z-10 sm:hidden"
                  >
                      <X size={10} strokeWidth={3} />
                  </button>
              )}

              {/* Micro Thumbnail */}
              <div className="w-10 h-12 sm:w-10 sm:h-12 rounded-md bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 relative">
                <div className="absolute inset-0 opacity-20 blur-md" style={{ backgroundColor: item.color || (isReturn ? '#f43f5e' : '#cbd5e1') }} />
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-[85%] w-[85%] object-contain mix-blend-multiply relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.15]" 
                  />
                ) : (
                  <span className="text-[7px] font-black text-slate-300 uppercase">IMG</span>
                )}
              </div>

              {/* CENTER INFO BLOCK */}
              <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0 justify-center gap-0.5 sm:gap-3">
                
                {/* Badge Row */}
                <div className="flex flex-wrap items-center gap-1 shrink-0 order-1 sm:order-2">
                    {item.isDue && <span className="px-1 py-[1px] bg-amber-500 text-white text-[7px] sm:text-[8px] font-black uppercase rounded-[3px] tracking-wider leading-none shadow-sm">Due</span>}
                    {item.isSettled && <span className="px-1 py-[1px] bg-blue-600 text-white text-[7px] sm:text-[8px] font-black uppercase rounded-[3px] tracking-wider leading-none shadow-sm">Settle</span>}
                    
                    {!item.isDue && !item.isSettled && !isReturn && item.type === 'CYLINDER' && item.saleType === 'PACKAGED' && (
                        <span className="px-1 py-[1px] bg-blue-100 text-blue-700 text-[7px] sm:text-[8px] font-black uppercase rounded-[3px] tracking-wider leading-none border border-blue-200">PKG</span>
                    )}
                    {!item.isDue && !item.isSettled && !isReturn && item.type === 'CYLINDER' && item.saleType === 'REFILL' && (
                        <span className="px-1 py-[1px] bg-orange-100 text-orange-700 text-[7px] sm:text-[8px] font-black uppercase rounded-[3px] tracking-wider leading-none border border-orange-200">RFL</span>
                    )}
                    {isReturn && !item.isDue && !item.isSettled && item.type === 'CYLINDER' && (
                        <span className="px-1 py-[1px] bg-slate-100 text-slate-600 text-[7px] sm:text-[8px] font-black uppercase rounded-[3px] tracking-wider leading-none border border-slate-200">Empty</span>
                    )}
                </div>

                {/* Name */}
                <span className="font-black text-slate-800 text-[10px] sm:text-[13px] uppercase truncate leading-tight order-2 sm:order-1">
                    {item.name}
                </span>
                
                {/* PC ONLY: Flex Spacer */}
                <div className="hidden sm:block flex-1 order-3" />

                {/* Price */}
                {!isReturn && (
                    <span className="font-black text-[12px] sm:text-[14px] text-slate-900 leading-none mt-0.5 sm:mt-0 shrink-0 order-3 sm:order-4">
                        ৳{item.subtotal.toLocaleString()}
                    </span>
                )}
              </div>

              {/* TALLER Seamless Unified Stepper */}
              <div className={cn(
                  "flex items-center border rounded-md h-8 sm:h-9 shrink-0 overflow-hidden shadow-sm mr-1 sm:mr-0 transition-colors duration-300",
                  item.isDue ? "opacity-50 pointer-events-none bg-slate-50/50 border-slate-200/50" : "bg-slate-100/80 border-slate-200/80 group-hover:bg-white"
              )}>
                  <button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1, listType, item.saleType); }}
                      className="h-full w-8 sm:w-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                      <Minus strokeWidth={3} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  
                  <input
                      type="number" min={1} value={item.quantity}
                      onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) setQuantity(item.productId, val, listType, item.saleType);
                      }}
                      className="w-8 sm:w-10 h-full text-center font-black text-[11px] sm:text-[13px] text-slate-800 bg-white border-x border-slate-200/50 p-0 focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  
                  <button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1, listType, item.saleType); }}
                      className="h-full w-8 sm:w-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                      <Plus strokeWidth={3} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
              </div>

              {/* PC ONLY: Embedded Trash Icon */}
              {!item.isDue && (
                  <button
                      onClick={(e) => { e.stopPropagation(); removeItemSpecific(item.productId, listType, item.saleType); }}
                      className="hidden sm:flex h-8 w-8 rounded-md items-center justify-center text-slate-300 group-hover:text-slate-400 hover:!text-rose-600 hover:bg-rose-100 transition-colors shrink-0 ml-1"
                  >
                      <Trash2 size={16} strokeWidth={2.5} />
                  </button>
              )}
              {/* Spacer for PC */}
              {item.isDue && <div className="hidden sm:block w-8 ml-1 shrink-0" />}

            </div>
          ))
        )}
      </div>

      {/* COMPACT FOOTER SUMMARY */}
      {(items.length > 0 || isReturn) && (
        <div className="bg-white/80 backdrop-blur-md border-t border-slate-100 p-1.5 sm:p-2 sm:px-4 shrink-0 z-10 mt-auto rounded-b-xl">
          
          {isReturn ? (
            
            <div className="flex items-center justify-between w-full px-1">
              
              <div className="flex flex-col items-center">
                <span className="text-[7px] sm:text-[8px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-0.5">RFL</span>
                <span className="font-black text-[12px] sm:text-[14px] leading-none text-slate-700">{refillQty}</span>
              </div>
              
              <div className="h-5 w-px bg-slate-200"></div>
              
              <div className="flex flex-col items-center">
                <span className="text-[7px] sm:text-[8px] uppercase font-bold tracking-widest text-rose-400 leading-none mb-0.5">RET</span>
                <span className="font-black text-[12px] sm:text-[14px] leading-none text-rose-600">{items.filter(i => !i.isDue).reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              
              <div className="h-5 w-px bg-slate-200"></div>
              
              <div className="flex flex-col items-center relative">
                <span className="text-[7px] sm:text-[8px] uppercase font-bold tracking-widest text-amber-500 leading-none mb-0.5">DUE</span>
                <div className="flex items-center gap-1">
                    <span className="font-black text-[12px] sm:text-[14px] leading-none text-amber-600">{items.filter(i => i.isDue).reduce((sum, i) => sum + i.quantity, 0)}</span>
                    {mismatchCount > 0 && (
                      <button
                        onClick={() => setDueModalOpen(true)}
                        className="h-3.5 sm:h-4 px-1.5 bg-amber-100 border border-amber-200 text-amber-700 rounded text-[6px] sm:text-[7px] font-black uppercase tracking-wider hover:bg-amber-200 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                </div>
              </div>
              
              <div className="h-5 w-px bg-slate-200"></div>
              
              <div className="flex flex-col items-end">
                <span className="text-[7px] sm:text-[8px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-0.5">Total</span>
                <span className="font-black text-[12px] sm:text-[14px] leading-none text-slate-800">{sectionQty}</span>
              </div>

            </div>

          ) : (
            
            <div className="flex items-center justify-between w-full px-2 sm:px-0">
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-0.5">Quantity</span>
                <span className="font-black text-[14px] sm:text-[16px] leading-none text-slate-800">{sectionQty}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-0.5">Subtotal</span>
                <span className="font-black text-[14px] sm:text-[16px] leading-none text-blue-600">৳{sectionTotal.toLocaleString()}</span>
              </div>
            </div>

          )}
        </div>
      )}

    </div>
  );
};
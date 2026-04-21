import { PosItem, usePosStore } from '../stores/pos.store';
import { Minus, Plus, X, ArrowDownLeft, PackageOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSReturnSectionProps {
  items: PosItem[];
  title: string;
  emptyMsg: string;
}

export const POSReturnSection = ({ items, title, emptyMsg }: POSReturnSectionProps) => {
  const { updateQuantity, setQuantity, removeItemSpecific } = usePosStore();
  const sectionQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-transparent">
      
      {/* PREMIUM HEADER */}
      <div className="flex items-center justify-between px-3 sm:px-5 pt-2.5 sm:pt-4 pb-2 sm:pb-3 shrink-0 bg-gradient-to-b from-white/60 to-white/10 border-b border-rose-100/50">
          <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-all bg-rose-500 text-white shadow-rose-200">
                  <ArrowDownLeft size={16} strokeWidth={3} className="sm:w-5 sm:h-5" />
              </div>
              <h4 className="font-black text-[12px] sm:text-[15px] uppercase tracking-widest leading-none mt-0.5 text-rose-700">
                  {title}
              </h4>
          </div>
      </div>

      {/* RESPONSIVE GRID / VERTICAL LIST */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4 content-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {items.length === 0 ? (
          
          /* Elegant Empty State */
          <div className="col-span-full w-full h-full flex flex-col items-center justify-center opacity-50 py-10 min-h-[160px] transition-opacity hover:opacity-70">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full flex items-center justify-center transition-all shadow-inner bg-rose-50">
                <PackageOpen className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300" strokeWidth={1.5} />
            </div>
            <p className="text-[10px] sm:text-[13px] font-bold uppercase tracking-widest text-rose-400">
                {emptyMsg}
            </p>
          </div>

        ) : (

          items.map((item, idx) => (
            /* PREMIUM ITEM CARD */
            <div
              key={`${item.productId}-${item.saleType || 'return'}-${idx}`}
              className="w-full bg-white rounded-xl sm:rounded-2xl border flex flex-row items-center p-2 sm:p-3 gap-2 sm:gap-4 relative group shadow-sm hover:shadow-md transition-all duration-300 border-rose-100/80 hover:border-rose-200"
            >
              
              {/* Floating Remove Button (Appears on Hover for PC, Always visible on mobile) */}
              <button
                  onClick={(e) => { e.stopPropagation(); removeItemSpecific(item.productId, 'RETURN', item.saleType); }}
                  className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white border border-rose-100 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md flex items-center justify-center transition-all z-10 shadow-sm sm:opacity-0 sm:scale-90 group-hover:opacity-100 group-hover:scale-100"
              >
                  <X strokeWidth={3} className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* Elevated Thumbnail */}
              <div className="w-12 h-14 sm:w-16 sm:h-20 lg:w-16 lg:h-20 rounded-lg sm:rounded-xl bg-gradient-to-b from-rose-50/30 to-rose-100/50 flex items-center justify-center shrink-0 overflow-hidden border border-rose-100/80 relative transition-all shadow-inner">
                <div className="absolute inset-0 opacity-15 blur-xl" style={{ backgroundColor: item.color || '#f43f5e' }} />
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-[85%] w-[85%] object-contain mix-blend-multiply relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-[8px] sm:text-[10px] font-black text-rose-300 uppercase">IMG</span>
                )}
              </div>

              {/* Data Block */}
              <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0 justify-center sm:justify-between pr-1 sm:pr-2">
                
                {/* Left Group: Badges & Name */}
                <div className="flex flex-col min-w-0 gap-0.5 sm:gap-1.5">
                    {/* Refined Badges */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 shrink-0 mb-0.5 sm:mb-0">
                        <span className="px-1.5 py-[2px] bg-rose-50 text-rose-600 text-[8px] sm:text-[9px] font-extrabold uppercase rounded-md tracking-wider leading-none border border-rose-100/50">Return</span>
                    </div>

                    {/* Name */}
                    <span className="font-extrabold text-slate-800 text-[11px] sm:text-[14px] uppercase truncate leading-tight tracking-tight">
                        {item.name}
                    </span>
                </div>
                
                {/* PC ONLY: Flex Spacer to push steppers to the right */}
                <div className="hidden sm:block flex-1" />

              </div>

              {/* Premium Seamless Stepper */}
              <div className="flex items-center rounded-lg sm:rounded-xl h-7 sm:h-10 shrink-0 overflow-hidden shadow-sm transition-all border bg-slate-50/80 hover:bg-slate-100 border-slate-200/60">
                  <button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1, 'RETURN', item.saleType); }}
                      className="h-full w-7 sm:w-10 flex items-center justify-center text-slate-400 hover:text-slate-800 active:bg-slate-200/60 transition-colors"
                  >
                      <Minus strokeWidth={3} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  
                  <input
                      type="number" min={1} value={item.quantity}
                      onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) setQuantity(item.productId, val, 'RETURN', item.saleType);
                      }}
                      className="w-6 sm:w-10 h-full text-center font-black text-[11px] sm:text-[14px] text-slate-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  
                  <button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1, 'RETURN', item.saleType); }}
                      className="h-full w-7 sm:w-10 flex items-center justify-center text-slate-400 hover:text-slate-800 active:bg-slate-200/60 transition-colors"
                  >
                      <Plus strokeWidth={3} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
              </div>

              {/* PC ONLY: Embedded Trash Icon */}
              <button
                  onClick={(e) => { e.stopPropagation(); removeItemSpecific(item.productId, 'RETURN', item.saleType); }}
                  className="hidden sm:flex h-7 w-7 sm:h-10 sm:w-10 rounded-xl items-center justify-center text-slate-300 group-hover:text-rose-400 hover:!text-white hover:!bg-rose-500 transition-colors shrink-0 ml-1"
              >
                  <Trash2 size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
              </button>

            </div>
          ))
        )}
      </div>

      {/* PREMIUM FOOTER SUMMARY */}
      {items.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md border-t border-rose-100/80 p-2 sm:p-4 shrink-0 z-10 mt-auto rounded-b-xl sm:rounded-b-2xl shadow-[0_-4px_20px_rgba(244,63,94,0.03)]">
          
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-center w-full px-2 sm:px-4">
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[11px] uppercase font-bold tracking-widest text-rose-400 leading-none mb-1 sm:mb-1.5">Total Empty Returns</span>
                <span className="font-black text-[16px] sm:text-[24px] leading-none text-rose-600 tracking-tighter">{sectionQty}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
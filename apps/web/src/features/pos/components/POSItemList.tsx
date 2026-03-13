import { useMemo } from 'react';
import { PosItem, usePosStore } from '../stores/pos.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';

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
      // Packaged always at top
      if (a.saleType === 'PACKAGED' && b.saleType !== 'PACKAGED') return -1;
      if (a.saleType !== 'PACKAGED' && b.saleType === 'PACKAGED') return 1;
      return 0; // Maintain relative order for others
    });
  }, [items, listType]);

  const onCheckout = () => {
      // Trigger checkout logic (this is handled in POSControls usually, but added here for the button)
      // Actually, POSControls handles navigation. I'll just keep the button here as a placeholder or linked to the store.
  };

  return (
    <div className={`border rounded-xl p-1.5 sm:p-2.5 flex flex-col h-full relative overflow-hidden ${isReturn ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/50 border-slate-200'}`}>
      <h4 className={`font-black text-xs uppercase mb-1.5 sm:mb-2 px-1 tracking-widest ${isReturn ? 'text-red-700/60' : 'text-slate-400'}`}>{title}</h4>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {sortedItems.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
            <div className={`text-5xl mb-2 font-thin ${isReturn ? 'text-red-200' : 'text-slate-300'}`}>{isReturn ? '-' : '+'}</div>
            <p className={`text-xs italic ${isReturn ? 'text-red-400' : 'text-slate-400'}`}>{emptyMsg}</p>
          </div>
        ) : (
          sortedItems.map((item, idx) => (
            <div
              key={`${item.productId}-${item.saleType || 'return'}-${item.isDue ? 'due' : 'normal'}-${idx}`}
              className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border shadow-sm transition-colors ${
                item.isDue
                  ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
                  : isReturn ? 'bg-white border-red-100 hover:border-red-300' : 'bg-white border-slate-100 hover:border-slate-300'
              } active:scale-[0.99]`}
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-12 h-16 relative flex items-center justify-center rounded bg-slate-50 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20 blur-md"
                  style={{ backgroundColor: item.color || (isReturn ? '#f87171' : '#cbd5e1') }}
                />
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain relative z-10 drop-shadow-sm" />
                ) : (
                  <div className="w-8 h-12 rounded shadow-inner opacity-80 relative z-10" style={{ backgroundColor: item.color || (isReturn ? '#ef4444' : '#64748b') }} />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 mb-0">
                    <span className="font-black text-xs sm:text-sm text-slate-800 truncate uppercase tracking-tight">{item.name}</span>
                    {item.isDue && (
                        <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-amber-500 rounded border border-amber-600 shadow-sm shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-tight">Due</span>
                        </div>
                    )}
                    {item.isSettled && (
                        <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-600 rounded border border-blue-700 shadow-sm shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-tight">Settle</span>
                        </div>
                    )}
                    {!item.isDue && !item.isSettled && !isReturn && item.type === 'CYLINDER' && item.saleType === 'PACKAGED' && (
                        <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded shadow-sm shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tight">PKG</span>
                        </div>
                    )}
                    {!item.isDue && !item.isSettled && !isReturn && item.type === 'CYLINDER' && item.saleType === 'REFILL' && (
                        <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded shadow-sm shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tight">RFL</span>
                        </div>
                    )}
                    {isReturn && !item.isDue && !item.isSettled && item.type === 'CYLINDER' && (
                        <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded shadow-sm shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tight">Empty</span>
                        </div>
                    )}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{item.description}</span>
                {!isReturn && (
                  <span className="text-xs sm:text-sm font-black text-slate-500 tracking-tight">৳{item.unitPrice}</span>
                )}
              </div>

              {/* Quantity Input */}
              <div className="flex flex-col items-center gap-1 shrink-0 px-1 border-l border-dashed border-slate-200 ml-1 pl-2 sm:pl-4">
                <div className={`flex items-center gap-1.5 sm:gap-2 ${item.isDue ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 shadow-sm active:scale-95 transition-all ${isReturn ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100'}`}
                    onClick={() => updateQuantity(item.productId, -1, listType, item.saleType)}
                  >
                    <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) {
                        setQuantity(item.productId, val, listType, item.saleType);
                      }
                    }}
                    className={`h-10 w-12 sm:w-14 text-center font-black px-1 text-base sm:text-lg border-0 shadow-none focus-visible:ring-1 rounded-lg ${isReturn ? 'text-red-700 focus-visible:ring-red-300 bg-red-50/50' : 'text-slate-800 focus-visible:ring-slate-300 bg-slate-50'}`}
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 shadow-sm active:scale-95 transition-all ${isReturn ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100'}`}
                    onClick={() => updateQuantity(item.productId, 1, listType, item.saleType)}
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>
                <span className={`text-[9px] sm:text-[10px] uppercase font-black tracking-widest ${isReturn ? 'text-red-400' : 'text-slate-400'}`}>
                  Qty
                </span>
              </div>

              {/* Subtotal & Remove */}
              <div className="flex flex-col items-end gap-0.5 shrink-0 min-w-[50px] sm:min-w-[70px] ml-1 sm:ml-2">
                {!item.isDue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all"
                    onClick={() => removeItemSpecific(item.productId, listType, item.saleType)}
                  >
                    <X className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                )}

                <span className={`font-black text-xs sm:text-base mt-auto tracking-tighter ${isReturn ? 'text-red-500 opacity-60' : 'text-indigo-600'}`}>
                  ৳{item.subtotal}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary */}
      {(items.length > 0 || isReturn) && (
        <div className={`mt-auto border-t pt-1.5 flex items-center justify-between px-3 sm:px-4 ${isReturn ? 'border-red-100 bg-red-50/20' : 'border-slate-200 bg-slate-50/40'} rounded-b-lg -mx-2 sm:-mx-3 -mb-2 sm:-mb-3 pb-2 sm:pb-3 mt-1.5`}>
          {isReturn ? (
            <div className="flex items-center gap-3 sm:gap-6 w-full">
              <div className="text-center flex flex-col">
                <span className="text-[8px] sm:text-xs uppercase font-black tracking-widest text-slate-400 leading-none mb-1">RFL</span>
                <span className="font-black text-base sm:text-xl leading-none text-slate-600">{refillQty}</span>
              </div>
              <div className="h-7 sm:h-9 w-px bg-red-100/50"></div>
              <div className="text-center flex flex-col">
                <span className="text-[8px] sm:text-xs uppercase font-black tracking-widest text-red-400 leading-none mb-1">RET</span>
                <span className="font-black text-base sm:text-xl leading-none text-red-700">{items.filter(i => !i.isDue).reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              <div className="h-7 sm:h-9 w-px bg-red-100/50"></div>
              <div className="text-center flex flex-col">
                <span className="text-[8px] sm:text-xs uppercase font-black tracking-widest text-amber-500 leading-none mb-1">DUE</span>
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-black text-base sm:text-xl leading-none text-amber-600">{items.filter(i => i.isDue).reduce((sum, i) => sum + i.quantity, 0)}</span>
                    {mismatchCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 sm:h-7 px-2 sm:px-2.5 text-[8px] sm:text-xs font-black uppercase text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 pointer-events-auto rounded-[4px]"
                        onClick={() => setDueModalOpen(true)}
                      >
                        Edit
                      </Button>
                    )}
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="text-right flex flex-col">
                <span className="text-[8px] sm:text-xs uppercase font-black tracking-widest text-slate-400 leading-none mb-1">Total Qty</span>
                <span className="font-black text-base sm:text-xl leading-none text-slate-700">{sectionQty}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="text-center flex flex-col">
                <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-slate-400 leading-none mb-1">Quantity</span>
                <span className="font-black text-lg sm:text-xl leading-none text-slate-800">{sectionQty}</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-slate-400 leading-none mb-1">Subtotal</span>
                <span className="font-black text-lg sm:text-xl leading-none text-indigo-600">৳{sectionTotal}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

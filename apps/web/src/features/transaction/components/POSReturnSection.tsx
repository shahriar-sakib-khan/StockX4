import { PosItem, usePosStore } from '../stores/pos.store';

interface POSReturnSectionProps {
  items: PosItem[];
  title: string;
  emptyMsg: string;
}

export const POSReturnSection = ({ items, title, emptyMsg }: POSReturnSectionProps) => {
  const { updateQuantity, removeItemSpecific } = usePosStore();
  const sectionQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="border rounded-xl p-3 flex flex-col h-full bg-red-50/50 relative overflow-hidden group">
      <h4 className="font-bold text-xs uppercase text-red-800/60 mb-2 px-1 tracking-wider">{title}</h4>

      <div className="flex-1 flex gap-3 overflow-x-auto pb-2 items-center px-2 scrollbar-hide">
         {items.length === 0 ? (
             <div className="w-full text-center py-8 opacity-40">
                 <div className="text-5xl text-red-200 mb-2 font-thin">-</div>
                 <p className="text-xs italic text-red-400">{emptyMsg}</p>
             </div>
         ) : (
             <>
                 {items.map((item, idx) => (
                    <div key={idx} className="shrink-0 w-[160px] h-[220px] border-2 border-red-100 bg-slate-50 rounded-xl flex flex-col items-center justify-between p-2 shadow-sm relative overflow-hidden group/card hover:border-red-300 transition-colors">
                        {/* Quantity & Controls Header */}
                        <div className="w-full flex items-center justify-between border-b border-red-50 pb-2 mb-1 shrink-0 bg-red-50/50 rounded-t-lg -mx-2 -mt-2 pt-2 px-2">
                                <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.productId, -1, 'RETURN', item.saleType);
                                  }}
                                  className="w-7 h-7 rounded-sm bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
                                  title="Decrease Quantity"
                                >
                                    <span className="text-xl font-bold leading-none mb-[2px]">-</span>
                                </button>

                                <div className="text-center flex flex-col">
                                    <span className="text-2xl font-black text-red-700 tracking-tighter leading-none">{item.quantity}</span>
                                    <span className="text-[9px] text-red-400 uppercase leading-none font-bold">Returned</span>
                                </div>

                                <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      removeItemSpecific(item.productId, 'RETURN', item.saleType);
                                  }}
                                  className="w-7 h-7 rounded-sm bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                                  title="Remove Item"
                                >
                                    <span className="text-sm font-bold leading-none">✕</span>
                                </button>
                        </div>

                        {/* Visual / Image */}
                        <div className="flex-1 w-full flex items-center justify-center p-0 relative min-h-0 overflow-visible my-1">
                              {/* Colored Glow/Backdrop */}
                              <div
                                className="absolute w-12 h-16 rounded-full opacity-20 blur-xl"
                                style={{ backgroundColor: item.color || '#f87171' }}
                              ></div>

                              {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-contain relative z-10 drop-shadow-sm opacity-90"
                                  />
                              ) : (
                                  <div className={`w-16 h-24 rounded-lg shadow-inner ring-1 ring-black/5 relative z-10 opacity-70`} style={{ backgroundColor: item.color || '#ef4444' }}></div>
                              )}
                        </div>

                        <div className="text-xs font-bold text-slate-700 truncate w-full text-center mt-1 px-1 border-t border-slate-50 pt-2 shrink-0">
                             <span className="block truncate text-sm">{item.name}</span>
                             <div className="mt-1 text-red-400 font-bold text-xs opacity-60">৳{item.subtotal}</div>
                        </div>
                    </div>
                 ))}
             </>
         )}
      </div>

       {/* Section Summary (Bottom Footer) */}
        {items.length > 0 && (
            <div className="mt-auto border-t border-red-100 pt-2 flex items-center justify-around bg-red-50/30 p-1">
                <div className="text-center">
                    <div className="text-[9px] text-red-400 uppercase tracking-widest">Total Returned</div>
                    <div className="font-black text-lg text-red-700 leading-none">{sectionQty}</div>
                </div>
            </div>
        )}
    </div>
  );
};

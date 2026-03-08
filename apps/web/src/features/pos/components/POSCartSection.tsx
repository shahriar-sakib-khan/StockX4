import { PosItem, usePosStore } from '../stores/pos.store';

interface POSCartSectionProps {
  items: PosItem[];
  title: string;
  emptyMsg: string;
}

export const POSCartSection = ({ items, title, emptyMsg }: POSCartSectionProps) => {
  const { updateQuantity, removeItemSpecific } = usePosStore();
  const sectionTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const sectionQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="border rounded-xl p-3 flex flex-col h-full bg-slate-50 relative overflow-hidden group">
        <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2 px-1 tracking-wider">{title}</h4>

        <div className="flex-1 flex gap-3 overflow-x-auto pb-2 items-center px-2 scrollbar-hide">
           {items.length === 0 ? (
               <div className="w-full text-center py-8 opacity-40">
                   <div className="text-5xl text-slate-300 mb-2 font-thin">+</div>
                   <p className="text-xs italic">{emptyMsg}</p>
               </div>
           ) : (
               <>
                   {items.map((item, idx) => (
                      <div key={idx} className="shrink-0 w-[160px] h-[220px] border-2 border-slate-200 bg-white rounded-xl flex flex-col items-center justify-between p-2 shadow-sm relative overflow-hidden group/card hover:border-slate-400 transition-colors">
                          {/* Quantity & Controls Header */}
                          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2 mb-1 shrink-0 bg-slate-50/50 rounded-t-lg -mx-2 -mt-2 pt-2 px-2">
                                  <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.productId, -1, 'SALE', item.saleType);
                                    }}
                                    className="w-7 h-7 rounded-sm bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                                    title="Decrease Quantity"
                                  >
                                      <span className="text-xl font-bold leading-none mb-[2px]">-</span>
                                  </button>

                                  <div className="text-center flex flex-col">
                                      <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{item.quantity}</span>
                                      <span className="text-[9px] text-slate-400 uppercase leading-none font-bold">Qty</span>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeItemSpecific(item.productId, 'SALE', item.saleType);
                                    }}
                                    className="w-7 h-7 rounded-sm bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
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
                                style={{ backgroundColor: item.color || '#cbd5e1' }}
                              ></div>

                              {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-contain relative z-10 drop-shadow-md transition-transform transform hover:scale-110 duration-300"
                                  />
                              ) : (
                                  <div className={`w-16 h-24 rounded-lg shadow-inner opacity-90 ring-1 ring-black/5 relative z-10`} style={{ backgroundColor: item.color || '#64748b' }}></div>
                              )}
                          </div>

                          <div className="text-xs font-bold text-slate-700 truncate w-full text-center mt-1 px-1 border-t border-slate-50 pt-2 shrink-0">
                              <span className="block truncate text-sm">{item.name}</span>
                              <span className="text-[10px] text-muted-foreground font-normal block">{item.description}</span>
                              <div className="mt-1 text-primary font-black text-sm">৳{item.subtotal}</div>
                          </div>
                      </div>
                   ))}
               </>
           )}
        </div>

        {/* Section Summary (Bottom Footer) */}
        {items.length > 0 && (
            <div className="mt-auto border-t pt-2 flex items-center justify-around bg-slate-50/50 p-1">
                <div className="text-center">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Total Qty</div>
                    <div className="font-black text-lg text-slate-800 leading-none">{sectionQty}</div>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="text-center">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Total Price</div>
                    <div className="font-black text-lg text-primary leading-none">৳{sectionTotal}</div>
                </div>
            </div>
        )}
    </div>
  );
};

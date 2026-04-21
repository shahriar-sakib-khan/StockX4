import { PosItem, usePosStore } from '../stores/pos.store';
import { Plus, Minus, X, ShoppingBag, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSCartSectionProps {
  items: PosItem[];
  title: string;
  emptyMsg: string;
  variant?: 'selling' | 'returned';
}

export const POSCartSection = ({ items, title, emptyMsg, variant }: POSCartSectionProps) => {
  const { updateQuantity, removeItemSpecific } = usePosStore();
  
  const sectionTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const sectionQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const isReturned = variant === 'returned' || title.toLowerCase().includes('return');
  
  // Dynamic theme
  const theme = isReturned 
      ? { border: "border-rose-200/80", bg: "bg-rose-50/40", text: "text-rose-600", accent: "bg-rose-500", icon: <ArrowDownLeft size={14} strokeWidth={3} /> }
      : { border: "border-blue-200/80", bg: "bg-blue-50/40", text: "text-blue-600", accent: "bg-blue-600", icon: <ShoppingBag size={14} strokeWidth={2.5} /> };

  return (
    <div className={cn("flex flex-col h-full bg-white border-2 rounded-xl overflow-hidden shadow-sm", theme.border)}>
        
        {/* HEADER */}
        <div className={cn("flex items-center justify-between px-3 py-2.5 border-b border-slate-100", theme.bg)}>
            <div className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-white shadow-sm shrink-0", theme.accent)}>
                    {theme.icon}
                </div>
                <h4 className={cn("font-black text-[12px] sm:text-[13px] uppercase tracking-widest leading-none mt-0.5", theme.text)}>
                    {title}
                </h4>
            </div>
        </div>

        {/* LOCKED VERTICAL LIST - NO HORIZONTAL SCROLLING */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 bg-slate-50/30 min-h-[150px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {items.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center py-8 opacity-40">
                    <ShoppingBag size={28} className="mb-2 text-slate-400" strokeWidth={1.5} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic text-center px-4">{emptyMsg}</p>
                </div>
            ) : (
                items.map((item, idx) => (
                    
                    // COMPACT HORIZONTAL ROW
                    <div key={idx} className="w-full bg-white border border-slate-200/80 rounded-lg flex flex-row items-center p-1.5 gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative group">
                        
                        {/* Floating Remove Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); removeItemSpecific(item.productId, isReturned ? 'RETURN' : 'SALE', item.saleType); }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 hover:bg-rose-500 hover:text-white transition-colors z-10 shadow-sm"
                        >
                            <X size={10} strokeWidth={3} />
                        </button>

                        {/* Thumbnail */}
                        <div className="w-12 h-14 bg-slate-50 rounded-md flex items-center justify-center shrink-0 border border-slate-100 relative overflow-hidden">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="h-[85%] w-[85%] object-contain mix-blend-multiply relative z-10" />
                            ) : (
                                <span className="text-[8px] font-black text-slate-300">IMG</span>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <span className="px-1.5 py-[1px] bg-slate-100 text-slate-600 text-[8px] font-black uppercase rounded border border-slate-200 self-start mb-0.5">
                                {item.saleType}
                            </span>
                            <span className="font-black text-slate-800 text-[11px] uppercase truncate leading-tight">
                                {item.name}
                            </span>
                            <span className="font-black text-[13px] text-slate-900 leading-none mt-1">
                                ৳{item.subtotal.toLocaleString()}
                            </span>
                        </div>

                        {/* SLEEK STEPPER (No more overlapping circles) */}
                        <div className="flex items-center bg-slate-100/80 border border-slate-200/80 rounded-md h-7 shrink-0 mr-1 overflow-hidden shadow-sm">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1, isReturned ? 'RETURN' : 'SALE', item.saleType); }}
                                className="h-full w-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                            >
                                <Minus size={12} strokeWidth={3} />
                            </button>
                            <div className="w-5 flex items-center justify-center font-black text-[11px] text-slate-800 bg-white border-x border-slate-200/50 h-full">
                                {item.quantity}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1, isReturned ? 'RETURN' : 'SALE', item.saleType); }}
                                className="h-full w-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                            >
                                <Plus size={12} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-slate-100 p-2 shrink-0 z-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Quantity</span>
                    <span className="font-black text-[16px] text-slate-800 leading-none">{sectionQty}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Subtotal</span>
                    <span className={cn("font-black text-[16px] leading-none", theme.text)}>
                        ৳{sectionTotal.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>

    </div>
  );
};
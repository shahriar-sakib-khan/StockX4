import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface POSCylinderCardProps {
  product: any; 
}

export const POSCylinderCard = ({ product }: POSCylinderCardProps) => {
  const { addItem, mode, transactionMode, saleItems, returnItems } = usePosStore();
  
  const [qty, setQty] = useState<number | ''>(1);

  const isPackaged = mode === 'PACKAGED';
  const isEmpty = mode === 'EMPTY';
  const isRefill = !isPackaged && !isEmpty;

  const packagedSaleQty = saleItems.filter((i) => i.productId === product._id && i.saleType === 'PACKAGED').reduce((s, i) => s + i.quantity, 0);
  const refillSaleQty = saleItems.filter((i) => i.productId === product._id && i.saleType === 'REFILL').reduce((s, i) => s + i.quantity, 0);
  const emptyReturnQty = returnItems.filter((i) => i.productId === product._id).reduce((s, i) => s + i.quantity, 0);

  const currentPackagedStock = (product.counts?.packaged || 0) - packagedSaleQty;
  const currentRefillStock = (product.counts?.full || 0) - refillSaleQty;
  const currentEmptyStock = (product.counts?.empty || 0) + emptyReturnQty;

  const unitPrice = isPackaged
      ? (transactionMode === 'wholesale' ? product.prices?.wholesalePriceFull : product.prices?.retailPriceFull) || 0
      : isEmpty ? 0 : (transactionMode === 'wholesale' ? product.prices?.wholesalePriceGas : product.prices?.retailPriceGas) || 0;

  const numericQty = typeof qty === 'number' ? qty : 1;
  const totalPrice = unitPrice * numericQty;

  const handleAdd = () => {
     const finalQty = numericQty;
     if (isPackaged && finalQty > currentPackagedStock) return toast.error(`Stock low. Only ${currentPackagedStock} packaged available.`);
     if (!isPackaged && !isEmpty && finalQty > currentRefillStock) return toast.error(`Stock low. Only ${currentRefillStock} refill available.`);

     addItem({
        ...product,
        brandName: product.brandId?.name || product.brandName,
        image: product.brandId?.cylinderImage || product.variant?.cylinderImage,
        color: product.brandId?.color || product.variant?.cylinderColor
     }, finalQty);
     setQty(1); 
  };

  const handleIncrement = (e: React.MouseEvent) => { e.stopPropagation(); setQty(numericQty + 1); };
  const handleDecrement = (e: React.MouseEvent) => { e.stopPropagation(); setQty(Math.max(1, numericQty - 1)); };

  return (
    <Card
      className={cn(
          "group relative flex flex-col h-full w-full overflow-hidden border bg-white cursor-pointer select-none transition-all duration-200 rounded-xl sm:rounded-[20px]",
          isPackaged ? "hover:border-blue-400 hover:shadow-[0_4px_15px_-4px_rgba(59,130,246,0.15)] border-slate-200/80 shadow-sm" :
          isEmpty ? "hover:border-slate-400 hover:shadow-[0_4px_15px_-4px_rgba(100,116,139,0.15)] border-slate-200/80 shadow-sm" :
          "hover:border-orange-400 hover:shadow-[0_4px_15px_-4px_rgba(249,115,22,0.15)] border-slate-200/80 shadow-sm"
      )}
      onClick={handleAdd}
    >
      {/* PERFECTED IMAGE STAGE */}
      <div className="relative h-[90px] sm:h-[120px] bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center p-1.5 sm:p-2 border-b border-slate-100 overflow-hidden">
        
        {/* Floating Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-col gap-1 items-start">
            <span className="bg-white/80 backdrop-blur-md border border-white/60 text-slate-800 text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-[0_2px_8px_rgba(0,0,0,0.04)] uppercase tracking-wider leading-none">
                {product.variant?.size}
            </span>
            <span className={cn(
                "text-[7px] sm:text-[9px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.04)] border leading-none bg-white/80 backdrop-blur-md",
                product.variant?.regulator === '22mm' 
                    ? "border-orange-200/60 text-orange-700" 
                    : "border-blue-200/60 text-blue-700"
            )}>
                {product.variant?.regulator}
            </span>
        </div>

        {/* Floating Price / Quantity */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex flex-col gap-0.5 items-end">
            {isEmpty ? (
                numericQty > 1 && (
                    <div className="bg-white/85 backdrop-blur-md border border-white/60 text-slate-900 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-end leading-none transition-all">
                        <span className="text-[11px] sm:text-[14px] font-black tracking-tight">{numericQty} QTY</span>
                    </div>
                )
            ) : (
                <div className="bg-white/85 backdrop-blur-md border border-white/60 text-slate-900 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-end leading-none transition-all">
                    {numericQty > 1 && (
                        <span className="text-[7px] sm:text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-[2px]">
                            {numericQty} × ৳{unitPrice}
                        </span>
                    )}
                    <span className="text-[11px] sm:text-[14px] font-black tracking-tight">৳{totalPrice.toLocaleString()}</span>
                </div>
            )}
        </div>

        {/* Mobile Brand Overlay */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 sm:hidden z-10 flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-md border border-white/60 py-0.5 px-2.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.04)] max-w-[90%]">
             <div className="w-3.5 h-3.5 flex items-center justify-center bg-white rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-50">
                  {product.brandId?.logo ? <img src={product.brandId.logo} className="max-h-full max-w-full object-contain" /> : <span className="text-[5px] font-black text-slate-400">L</span>}
             </div>
             <span className="font-extrabold text-slate-800 text-[8px] uppercase tracking-wider truncate leading-none pt-[1px]">
                  {product.brandId?.name || product.brandName}
             </span>
        </div>

        <img
            src={product.brandId?.cylinderImage || product.variant?.cylinderImage}
            alt={product.brandName}
            className="w-auto h-[85%] sm:h-[95%] mb-3 sm:mb-0 object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>

      {/* PERFECTED CONTENT */}
      <div className="flex flex-col flex-1 p-1.5 sm:p-2.5">
          
          {/* Desktop Brand Header */}
          <div className="hidden sm:flex items-center gap-2 mb-2">
              <div className="w-6 h-6 border border-slate-100 rounded-md flex items-center justify-center bg-slate-50 text-[8px] text-slate-400 font-extrabold uppercase overflow-hidden shrink-0 shadow-inner">
                  {product.brandId?.logo ? <img src={product.brandId.logo} alt="Logo" className="max-h-full max-w-full object-contain p-0.5" /> : 'L'}
              </div>
              <h3 className="font-extrabold text-slate-800 text-[13px] uppercase tracking-tight leading-tight truncate">
                  {product.brandId?.name || product.brandName}
              </h3>
          </div>

          <div className="flex-1" />

          {/* Micro Segmented Inventory */}
          <div className="flex items-center my-1 sm:my-1.5 bg-slate-50 border border-slate-100/80 rounded-md shadow-inner overflow-hidden divide-x divide-slate-100">
             <div className={cn("flex-1 flex flex-col items-center py-0.5 sm:py-1 transition-colors", isPackaged ? "bg-blue-50/80" : "opacity-60")}>
                 <span className={cn("text-[9px] sm:text-[11px] font-black leading-none", currentPackagedStock <= 0 ? "text-rose-500" : (isPackaged ? "text-blue-700" : "text-slate-600"))}>{currentPackagedStock}</span>
                 <span className="text-[5px] sm:text-[6px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">Pkg</span>
             </div>
             <div className={cn("flex-1 flex flex-col items-center py-0.5 sm:py-1 transition-colors", isRefill ? "bg-orange-50/80" : "opacity-60")}>
                 <span className={cn("text-[9px] sm:text-[11px] font-black leading-none", currentRefillStock <= 0 ? "text-rose-500" : (isRefill ? "text-orange-700" : "text-slate-600"))}>{currentRefillStock}</span>
                 <span className="text-[5px] sm:text-[6px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">Refill</span>
             </div>
             <div className={cn("flex-1 flex flex-col items-center py-0.5 sm:py-1 transition-colors", isEmpty ? "bg-slate-100" : "opacity-60")}>
                 <span className={cn("text-[9px] sm:text-[11px] font-black leading-none", isEmpty ? "text-slate-800" : "text-slate-600")}>{currentEmptyStock}</span>
                 <span className="text-[5px] sm:text-[6px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">Empty</span>
             </div>
          </div>

          {/* HYBRID ACTION ROW: Full-width Stepper */}
          <div className="flex flex-col mt-auto pt-1.5 sm:pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
              
              {/* Seamless Stepper - Adjusted for Mobile Comfort */}
              <div className="w-full flex items-center bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 rounded-lg h-9 sm:h-11 transition-all focus-within:border-slate-300 focus-within:shadow-sm overflow-hidden">
                  <button 
                      className="h-full w-10 sm:w-14 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 active:bg-slate-300/60 shrink-0 transition-colors"
                      onClick={handleDecrement}
                  >
                      <Minus className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  </button>
                  
                  <input
                      type="number" min={1} value={qty}
                      onChange={(e) => { const val = e.target.value; setQty(val === '' ? '' : parseInt(val, 10)); }}
                      onBlur={() => { if (qty === '' || qty < 1) setQty(1); }}
                      className="flex-1 w-full min-w-0 h-full text-center font-black text-[12px] sm:text-[15px] bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-slate-900 m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  
                  <button 
                      className="h-full w-10 sm:w-14 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 active:bg-slate-300/60 shrink-0 transition-colors"
                      onClick={handleIncrement}
                  >
                      <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  </button>
              </div>

          </div>
      </div>
    </Card>
  );
};
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';
import { toast } from 'sonner';

interface POSCylinderCardProps {
  product: any; // Type to be refined
}

export const POSCylinderCard = ({ product }: POSCylinderCardProps) => {
  const { addItem, mode, transactionMode, saleItems, returnItems } = usePosStore();
  const [qty, setQty] = useState(1);

  // Dynamic Logic based on Mode
  const isPackaged = mode === 'PACKAGED';
  const isEmpty = mode === 'EMPTY';

  // Calculate dynamic projected stock
  const packagedSaleQty = saleItems
    .filter((item) => item.productId === product._id && item.saleType === 'PACKAGED')
    .reduce((sum, item) => sum + item.quantity, 0);

  const refillSaleQty = saleItems
    .filter((item) => item.productId === product._id && item.saleType === 'REFILL')
    .reduce((sum, item) => sum + item.quantity, 0);

  const emptyReturnQty = returnItems
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const currentPackagedStock = (product.counts?.packaged || 0) - packagedSaleQty;
  const currentRefillStock = (product.counts?.full || 0) - refillSaleQty;
  const currentEmptyStock = (product.counts?.empty || 0) + emptyReturnQty;

  // Price Logic
  const price = isPackaged
      ? (transactionMode === 'wholesale' ? product.prices?.wholesalePriceFull : product.prices?.retailPriceFull) || 0
      : isEmpty ? 0 : (transactionMode === 'wholesale' ? product.prices?.wholesalePriceGas : product.prices?.retailPriceGas) || 0;

  const handleAdd = () => {
     if (isPackaged && qty > currentPackagedStock) {
         toast.error(`Not enough stock. Only ${currentPackagedStock} packaged available.`);
         return;
     }
     if (!isPackaged && !isEmpty && qty > currentRefillStock) {
         toast.error(`Not enough stock. Only ${currentRefillStock} refill available.`);
         return;
     }

     // Explicitly attach image to ensure store picks it up (bypassing potential nesting issues)
     const productWithImage = {
        ...product,
        brandName: product.brandId?.name || product.brandName,
        image: product.brandId?.cylinderImage || product.variant?.cylinderImage,
        color: product.brandId?.color || product.variant?.cylinderColor
     };
     addItem(productWithImage, qty);
     setQty(1); // Reset after add
  };

  return (
    <Card
      className={`w-full h-auto min-h-full hover:shadow-lg transition-all border rounded-xl sm:rounded-2xl cursor-pointer ${
        isPackaged ? 'hover:border-blue-400 bg-white' :
        isEmpty ? 'hover:border-slate-400 bg-slate-50' :
        'hover:border-orange-400 bg-white'
      } active:scale-[0.98]`}
      onClick={handleAdd}
    >
      <div className="p-2 sm:p-3 flex flex-col h-full bg-transparent relative">

        {/* Top Row: Brand Info (Left) vs Specs (Right) */}
        <div className="flex justify-between items-start mb-2">
            {/* Left: Brand Name & Logo */}
            <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="font-black text-[10px] sm:text-sm leading-tight max-w-[100px] sm:max-w-[120px] text-slate-800 uppercase tracking-tight">{product.brandId?.name || product.brandName}</div>
                <div className="w-12 h-6 sm:w-16 sm:h-8 border border-slate-100 rounded flex items-center justify-center bg-slate-50 text-[8px] sm:text-[10px] text-slate-400 font-extrabold uppercase overflow-hidden">
                    {product.brandId?.logo ? <img src={product.brandId.logo} alt="Logo" className="max-h-full max-w-full object-contain" /> : 'Logo'}
                </div>
            </div>

            {/* Right: Size & Regulator */}
            <div className="flex flex-col gap-1 items-end">
                <Badge variant="outline" className="h-6 sm:h-7 min-w-[50px] sm:min-w-[60px] justify-center bg-slate-50 text-[8px] sm:text-[10px] font-black">{product.variant?.size}</Badge>
                <Badge variant="outline" className={`h-6 sm:h-7 min-w-[50px] sm:min-w-[60px] justify-center border-0 font-black text-[8px] sm:text-[10px] ${product.variant?.regulator === '22mm' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>{product.variant?.regulator}</Badge>
            </div>
        </div>

        {/* Middle Row: Image (Center) & Price (Right) */}
        <div className="flex justify-between items-center mb-1.5 sm:mb-2 relative min-h-[80px] sm:min-h-[100px]">
            {/* Image (Centered relative to container width mostly, but we use flex spacer) */}
            <div className="flex-1 flex justify-center">
                 <div className="w-14 h-20 sm:w-20 sm:h-28 relative">
                     <div
                        className="absolute w-12 h-16 sm:w-16 sm:h-24 rounded opacity-20 blur-xl top-1 sm:top-2 left-1 sm:left-2"
                        style={{ backgroundColor: product.brandId?.color || product.variant?.cylinderColor || '#ccc' }}
                     ></div>
                     {(product.brandId?.cylinderImage || product.variant?.cylinderImage) && (
                        <img
                            src={product.brandId?.cylinderImage || product.variant?.cylinderImage}
                            alt="Cylinder"
                            className="h-full object-contain relative z-10 drop-shadow-sm transition-transform group-hover:scale-110"
                        />
                     )}
                 </div>
        </div>
            {/* Price (Right aligned, vertically centered in this row) */}
            {!isEmpty && (
                <div className="border border-slate-200 rounded px-2 py-3 shadow-sm bg-slate-50 min-w-[60px] flex flex-col items-center justify-center h-14 absolute right-0 top-1/2 -translate-y-1/2">
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase">Price</span>
                    <span className="font-bold text-sm">৳{price}</span>
                </div>
            )}
        </div>

        {/* Inventory Counts Row */}
        <div className="grid grid-cols-3 gap-1 w-full mb-2">
             <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-lg py-1">
                <span className={`font-black text-sm lg:text-base ${currentPackagedStock < 0 ? 'text-red-500' : 'text-slate-700'}`}>{currentPackagedStock}</span>
                <span className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-bold">Pkg</span>
             </div>
             <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-lg py-1">
                <span className={`font-black text-sm lg:text-base ${currentRefillStock < 0 ? 'text-red-500' : 'text-slate-700'}`}>{currentRefillStock}</span>
                <span className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-bold">Refill</span>
             </div>
             <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-lg py-1">
                <span className="font-black text-slate-400 text-sm lg:text-base">{currentEmptyStock}</span>
                <span className="text-[8px] lg:text-[9px] text-muted-foreground uppercase font-bold">Empty</span>
             </div>
        </div>

        {/* Spacer to push bottom section down if card height grows */}
        <div className="flex-1"></div>

        {/* Stepper Row */}
        <div className="flex items-center justify-between border border-slate-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4 px-1.5 sm:px-2 py-0.5 sm:py-1 h-12 w-full bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-slate-200 active:scale-90 transition-all" onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}>
                <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            </Button>
            <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) setQty(val);
                }}
                className="font-black text-base sm:text-xl w-12 sm:w-16 text-center border-none bg-transparent focus:outline-none focus:ring-0 rounded"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-12 sm:w-12 rounded-full hover:bg-slate-200 active:scale-90 transition-all" onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }}>
                <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-slate-600" />
            </Button>
        </div>
 
        {/* Add Button */}
        <Button
            className={`w-full font-black h-12 uppercase tracking-widest shadow-lg transition-all active:scale-95 text-[11px] sm:text-sm rounded-lg sm:rounded-xl ${
                isPackaged ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                isEmpty ? 'bg-slate-600 hover:bg-slate-700 text-white' :
                'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
        >
            Add To Cart
        </Button>

      </div>
    </Card>
  );
};

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';
// import { IStoreInventory } from '@/features/cylinder/types'; // Need shared types or local types

interface POSCylinderCardProps {
  product: any; // Type to be refined
}

export const POSCylinderCard = ({ product }: POSCylinderCardProps) => {
  const { addItem, mode, saleItems, returnItems } = usePosStore();
  const [qty, setQty] = useState(1);

  // Dynamic Logic based on Mode
  const isPackaged = mode === 'PACKAGED';
  const isEmpty = mode === 'EMPTY';

  // Calculate dynamic stock
  const saleQty = saleItems
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const returnQty = returnItems
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const currentFullStock = (product.counts?.full || 0) - saleQty;
  const currentEmptyStock = (product.counts?.empty || 0) + returnQty;

  // Price Logic
  const price = isPackaged
      ? (product.prices?.fullCylinder || 0)
      : isEmpty ? 0 : (product.prices?.gasOnly || 0);

  const handleAdd = () => {
     // Explicitly attach image to ensure store picks it up (bypassing potential nesting issues)
     const productWithImage = {
        ...product,
        image: product.variant?.cylinderImage,
        color: product.variant?.cylinderColor
     };
     addItem(productWithImage, qty);
     setQty(1); // Reset after add
  };

  return (
    <Card className={`w-full h-auto min-h-full hover:shadow-lg transition-all border rounded-xl ${
        isPackaged ? 'hover:border-blue-200 bg-white' :
        isEmpty ? 'hover:border-slate-300 bg-slate-50' :
        'hover:border-orange-200 bg-white'
    }`}>
      <div className="p-3 flex flex-col h-full bg-transparent relative">

        {/* Top Row: Brand Info (Left) vs Specs (Right) */}
        <div className="flex justify-between items-start mb-2">
            {/* Left: Brand Name & Logo */}
            <div className="flex flex-col gap-1">
                <div className="font-bold text-sm leading-tight max-w-[120px] text-foreground">{product.brandName}</div>
                <div className="w-16 h-8 border rounded flex items-center justify-center bg-gray-50 text-[10px] text-muted-foreground font-semibold">
                    Logo
                </div>
            </div>

            {/* Right: Size & Regulator */}
            <div className="flex flex-col gap-1 items-end">
                <Badge variant="outline" className="h-7 min-w-[60px] justify-center bg-slate-50">{product.variant?.size}</Badge>
                <Badge variant="outline" className="h-7 min-w-[60px] justify-center bg-slate-50">{product.variant?.regulator}</Badge>
            </div>
        </div>

        {/* Middle Row: Image (Center) & Price (Right) */}
        <div className="flex justify-between items-center mb-2 relative min-h-[100px]">
            {/* Image (Centered relative to container width mostly, but we use flex spacer) */}
            <div className="flex-1 flex justify-center">
                 <div className="w-20 h-28 relative">
                     <div
                        className="absolute w-16 h-24 rounded opacity-20 blur-xl top-2 left-2"
                        style={{ backgroundColor: product.variant?.cylinderColor || '#ccc' }}
                     ></div>
                     {product.variant?.cylinderImage && (
                        <img
                            src={product.variant.cylinderImage}
                            alt="Cylinder"
                            className="h-full object-contain relative z-10 drop-shadow-sm"
                        />
                     )}
                 </div>
            </div>

            {/* Price (Right aligned, vertically centered in this row) */}
            <div className="border border-slate-200 rounded px-2 py-3 shadow-sm bg-slate-50 min-w-[60px] flex flex-col items-center justify-center h-14 absolute right-0 top-1/2 -translate-y-1/2">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase">Price</span>
                <span className="font-bold text-sm">৳{price}</span>
            </div>
        </div>

        {/* Inventory Counts Row */}
        <div className="grid grid-cols-2 gap-2 w-full mb-2">
             <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-lg py-1">
                <span className={`font-black text-base ${currentFullStock < 0 ? 'text-red-500' : 'text-slate-700'}`}>{currentFullStock}</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Full Stock</span>
             </div>
             <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-lg py-1">
                <span className="font-black text-slate-400 text-base">{currentEmptyStock}</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Empty</span>
             </div>
        </div>

        {/* Spacer to push bottom section down if card height grows */}
        <div className="flex-1"></div>

        {/* Stepper Row */}
        <div className="flex items-center justify-between border-2 border-slate-100 rounded-lg mb-2 px-2 py-1 h-9 w-full">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-slate-100" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus className="w-3 h-3" />
            </Button>
            <span className="font-bold text-sm w-12 text-center">{qty}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-slate-100" onClick={() => setQty(qty + 1)}>
                <Plus className="w-3 h-3" />
            </Button>
        </div>

        {/* Add Button */}
        <Button
            className={`w-full font-bold h-10 uppercase tracking-wider shadow-sm text-xs ${
                isPackaged ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                isEmpty ? 'bg-slate-500 hover:bg-slate-600 text-white' :
                'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
            onClick={handleAdd}
        >
            Add To Cart
        </Button>

      </div>
    </Card>
  );
};

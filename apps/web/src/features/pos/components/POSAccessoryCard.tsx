import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';
import { toast } from 'sonner';

interface POSAccessoryCardProps {
  product: any;
}

export const POSAccessoryCard = ({ product }: POSAccessoryCardProps) => {
  const { addItem, saleItems } = usePosStore();
  const [qty, setQty] = useState(1);

  // Calculate dynamic stock
  const saleQty = saleItems
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Schema Mapping
  const stock = product.counts?.full || product.stock || 0;
  const currentStock = stock - saleQty;

  // Use correct mode for pricing if it's inventory
  const { transactionMode } = usePosStore();
  const price = product.prices
    ? (transactionMode === 'wholesale' ? product.prices.wholesalePriceFull : product.prices.retailPriceFull)
    : (product.sellingPrice || 0);

  const isStove = product.category === 'stove' || product.type === 'stove';
  const brand = product.brandId?.name || product.brandName || product.brand || 'N/A';
  const image = product.brandId?.cylinderImage || product.image;

  // Subtext logic based on Product Type
  const subtext = isStove
      ? `${product.variant?.burners || product.burnerCount} Burner${(product.variant?.burners || product.burnerCount) !== 1 ? 's' : ''}`
      : (product.variant?.size || product.size);

  const handleAdd = () => {
     if (qty > currentStock) {
         toast.error(`Not enough stock. Only ${currentStock} available.`);
         return;
     }

     // Prepare PosItem adaptable object
     const itemToAdd = {
         _id: product._id,
         productId: product.productId || product._id,
         brandName: brand, // Map brand to brandName for compatibility
         category: product.category || product.type, // 'stove' or 'regulator'
         prices: { accessoryPrice: price }, // Adapt price structure
         image: image,
         stock: stock,
         variant: { // Adapt variant structure if needed by store logic (though store mainly uses flat props now)
             cylinderImage: image,
             burners: Number(product.variant?.burners || product.burnerCount),
             regulator: product.variant?.size || product.size
         }
     };
     addItem(itemToAdd, qty);
     setQty(1);
  };

  return (
    <Card
      className="w-full h-auto min-h-full hover:shadow-lg transition-all border bg-white rounded-xl hover:border-slate-400 cursor-pointer"
      onClick={handleAdd}
    >
      <div className="p-3 flex flex-col h-full bg-white relative">

        {/* Top Row: Brand Info */}
        <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
                <div className="font-bold text-sm leading-tight max-w-[120px] text-foreground">{brand}</div>
                 {/* Optional: Generic Logo or Category Icon */}
                <Badge variant="secondary" className="w-fit text-[10px] h-5">{isStove ? 'Stove' : 'Regulator'}</Badge>
            </div>

            <div className="flex flex-col gap-1 items-end">
                <Badge variant="outline" className="h-7 min-w-[60px] justify-center bg-slate-50">{subtext}</Badge>
            </div>
        </div>

        {/* Middle Row: Image & Price */}
        <div className="flex justify-between items-center mb-2 relative min-h-[100px]">
            <div className="flex-1 flex justify-center">
                 <div className="w-24 h-24 relative flex items-center justify-center bg-slate-50 rounded-lg">
                     {image ? (
                        <img src={image} alt="Accessory" className="h-20 w-20 object-contain drop-shadow-md" />
                     ) : (
                        <span className="text-xs text-muted-foreground">No Image</span>
                     )}
                 </div>
            </div>

            <div className="border border-slate-200 rounded px-2 py-3 shadow-sm bg-slate-50 min-w-[60px] flex flex-col items-center justify-center h-14 absolute right-0 top-1/2 -translate-y-1/2">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase">Price</span>
                <span className="font-bold text-sm">৳{price || 0}</span>
            </div>
        </div>

        {/* Inventory Count */}
        <div className="w-full mb-2">
             <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-lg py-1">
                <span className={`font-black text-base ${currentStock < 0 ? 'text-red-500' : 'text-slate-700'}`}>{currentStock}</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold">In Stock</span>
             </div>
        </div>

        <div className="flex-1"></div>

        {/* Stepper */}
        <div className="flex items-center justify-between border-2 border-slate-100 rounded-xl mb-4 px-2 py-1 h-12 w-full bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-200 active:scale-90 transition-all" onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}>
                <Minus className="w-5 h-5 text-slate-600" />
            </Button>
            <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) setQty(val);
                }}
                className="font-black text-lg w-16 text-center border-none bg-transparent focus:outline-none focus:ring-0 rounded"
            />
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-200 active:scale-90 transition-all" onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }}>
                <Plus className="w-5 h-5 text-slate-600" />
            </Button>
        </div>
 
        {/* Add Button */}
        <Button
            className="w-full font-black h-12 uppercase tracking-widest shadow-lg transition-all active:scale-95 text-xs sm:text-sm rounded-xl bg-slate-800 hover:bg-slate-900 text-white"
            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
        >
            Add To Cart
        </Button>

      </div>
    </Card>
  );
};

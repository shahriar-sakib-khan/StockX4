import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';

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
  const stock = product.stock || 0;
  const currentStock = stock - saleQty;
  const price = product.sellingPrice || 0;
  const isStove = product.type === 'stove';
  const brand = product.brand || 'N/A';
  const name = product.name;

  // Subtext logic based on Product Type
  const subtext = isStove
      ? `${product.burnerCount} Burner${product.burnerCount !== '1' ? 's' : ''}`
      : product.size;

  const handleAdd = () => {
     // Prepare PosItem adaptable object
     const itemToAdd = {
         _id: product._id,
         brandName: brand, // Map brand to brandName for compatibility
         category: product.type, // 'stove' or 'regulator'
         prices: { accessoryPrice: price }, // Adapt price structure
         image: product.image,
         stock: stock,
         variant: { // Adapt variant structure if needed by store logic (though store mainly uses flat props now)
             cylinderImage: product.image,
             burners: Number(product.burnerCount),
             regulator: product.size
         }
     };
     addItem(itemToAdd, qty);
     setQty(1);
  };

  return (
    <Card className="w-full h-auto min-h-full hover:shadow-lg transition-all border bg-white rounded-xl hover:border-slate-300">
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
                     {product.image ? (
                        <img src={product.image} alt="Accessory" className="h-20 w-20 object-contain" />
                     ) : (
                        <span className="text-xs text-muted-foreground">No Image</span>
                     )}
                 </div>
            </div>

            <div className="border border-slate-200 rounded px-2 py-3 shadow-sm bg-slate-50 min-w-[60px] flex flex-col items-center justify-center h-14 absolute right-0 top-1/2 -translate-y-1/2">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase">Price</span>
                <span className="font-bold text-sm">৳{price}</span>
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
            className="w-full font-bold h-10 uppercase tracking-wider shadow-sm text-xs bg-slate-800 hover:bg-slate-900 text-white"
            onClick={handleAdd}
        >
            Add To Cart
        </Button>

      </div>
    </Card>
  );
};

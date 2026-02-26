
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

export const StoreProductsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground">Manage your store inventory and products.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center border-dashed">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Package className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No Products Found</h3>
        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
          You haven't added any products to this store yet. Start building your inventory to track stock and sales.
        </p>
        <Button variant="outline">Import Products</Button>
      </div>
    </div>
  );
};


import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export const StoreOrdersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Orders</h2>
        <p className="text-muted-foreground">View and manage customer orders.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center border-dashed">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No Orders Yet</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Orders from your customers will appear here once they start purchasing.
        </p>
      </div>
    </div>
  );
};

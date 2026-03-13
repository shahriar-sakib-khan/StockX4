
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export const StoreOrdersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Orders</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">View and manage customer orders.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border-dashed">
        <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">No Orders Yet</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-2">
          Orders from your customers will appear here once they start purchasing.
        </p>
      </div>
    </div>
  );
};

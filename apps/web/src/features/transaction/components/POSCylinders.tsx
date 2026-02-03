import { useInventory } from '@/features/cylinder/hooks/useCylinders';
import { POSCylinderCard } from './POSCylinderCard';
import { Loader2 } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';

interface POSCylindersProps {
  storeId: string;
}

export const POSCylinders = ({ storeId }: POSCylindersProps) => {
  const { data: inventory, isLoading } = useInventory(storeId);
  const { filterSearch, filterSize, filterRegulator } = usePosStore();

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  // Ensure inventory is an array.
  const items = Array.isArray(inventory) ? inventory : (inventory as any)?.inventory || [];

  const filteredItems = items.filter((item: any) => {
    // 0. Category Filter (Safety)
    if (item.category && item.category !== 'cylinder') return false;

    // 1. Search Filter
    const matchesSearch = item.brandName.toLowerCase().includes(filterSearch.toLowerCase()) ||
                          item.variant?.size.toLowerCase().includes(filterSearch.toLowerCase());

    // 2. Size Filter
    const matchesSize = filterSize === 'all' || item.variant?.size === filterSize;

    // 3. Regulator Filter
    const matchesRegulator = filterRegulator === 'all' || item.variant?.regulator === filterRegulator;

    return matchesSearch && matchesSize && matchesRegulator;
  });

  return (
    <div className="h-full flex flex-col p-2 w-full">
      {/* Slider / Horizontal Scroll Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 px-1 pt-1">
          <div className="flex gap-4 h-full items-start min-w-max">
            {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center w-full min-h-[100px] text-muted-foreground border-2 border-dashed rounded-lg bg-muted/50">
                    No items found matching your filters.
                </div>
            ) : (
                filteredItems.map((item: any) => (
                    <div key={item._id} className="w-[260px] flex-shrink-0">
                        <POSCylinderCard product={item} />
                    </div>
                ))
            )}
          </div>
      </div>
    </div>
  );
};

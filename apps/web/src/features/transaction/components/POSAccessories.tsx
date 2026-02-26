import { useInventory } from '@/features/cylinder/hooks/useCylinders';
import { POSAccessoryCard } from './POSAccessoryCard';
import { Loader2 } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';

interface POSAccessoriesProps {
  storeId: string;
  category: 'stove' | 'regulator';
}

export const POSAccessories = ({ storeId, category }: POSAccessoriesProps) => {
  const { data: inventory, isLoading } = useInventory(storeId);
  const { filterSearch, filterBurner, filterRegulator } = usePosStore();

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  const items = Array.isArray(inventory) ? inventory : (inventory as any)?.inventory || [];

  // Filter for Category + Search + Specific Filters
  const filteredItems = items.filter((item: any) => {
    // 0. Safety Check
    if (!item || typeof item !== 'object') return false;

    // 1. Category Match
    if (item.category !== category) return false;

    // 2. Search Filter
    const brandName = item.brandId?.name || item.brandName || '';
    const searchTarget = brandName.toLowerCase();
    const searchFilter = (filterSearch || '').toLowerCase(); // Ensure string
    const matchesSearch = searchTarget.includes(searchFilter);

    // 3. Specific Filters
    if (category === 'stove') {
         // Burner Filter
         if (filterBurner !== 'all') {
             if (item.variant?.burners !== Number(filterBurner)) return false;
         }
    } else if (category === 'regulator') {
         // Regulator Filter
         if (filterRegulator !== 'all') {
             if (item.variant?.size !== filterRegulator) return false;
         }
    }

    return matchesSearch;
  });

  return (
    <div className="h-full flex flex-col p-2 w-full">
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 px-1 pt-1">
          <div className="flex gap-4 h-full items-start min-w-max">
            {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center w-full min-h-[100px] text-muted-foreground border-2 border-dashed rounded-lg bg-muted/50">
                    No {category}s found.
                </div>
            ) : (
                filteredItems.map((item: any, idx: number) => (
                    <div key={item._id || idx} className="w-[260px] flex-shrink-0">
                        <POSAccessoryCard product={item} />
                    </div>
                ))
            )}
          </div>
      </div>
    </div>
  );
};

import { useInventory } from '@/features/cylinder/hooks/useCylinders';
import { POSAccessoryCard } from './POSAccessoryCard';
import { Loader2, PackageX } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';
import { useStoreBrands } from '@/features/brand/hooks/useBrands';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface POSAccessoriesProps {
  storeId: string;
  category: 'stove' | 'regulator';
}

export const POSAccessories = ({ storeId, category }: POSAccessoriesProps) => {
  const { data: inventory, isLoading } = useInventory(storeId);
  const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);
  const { filterSearch, filterBurner, filterRegulator } = usePosStore();

  // Fix schema mappings for POS
  const displayInventory = useMemo(() => {
        const raw = Array.isArray(inventory) ? inventory : (inventory as any)?.inventory || [];
        const brandMap = new Map<string, any>();
        for (const b of (brandsData?.brands || [])) brandMap.set(b._id.toString(), b);

        return raw
            .filter((item: any) => item.product?.category === category)
            .map((item: any) => {
                const details = item.product?.details || {};
                const brand = brandMap.get(details.brandId?.toString?.() || '') || null;
                return {
                    _id: item.productId,
                    productId: item.productId,
                    category: item.product?.category,
                    brandId: brand || { _id: details.brandId, name: item.product?.name || '?' },
                    brandName: brand?.name || item.product?.name || '?',
                    variant: {
                        size: details.size || details.type || '',
                        regulator: details.regulatorType || '',
                        burners: details.burners,
                        model: details.model
                    },
                    counts: item.counts || { full: 0, empty: 0, defected: 0 },
                    prices: item.prices || {},
                    image: item.product?.image || '' 
                };
            });
   }, [inventory, brandsData, category]);

  if (isLoading || isBrandsLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full opacity-50 space-y-3 min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Inventory...</span>
        </div>
    );
  }

  // Filter for Category + Search + Specific Filters
  const filteredItems = displayInventory.filter((item: any) => {
    // 0. Safety Check
    if (!item || typeof item !== 'object') return false;

    // 1. Category Match (already handled in useMemo, but keeping for safety in case we reuse this)
    if (item.category !== category) return false;

    // 2. Search Filter
    const brandName = item.brandName || '';
    const searchTarget = brandName.toLowerCase();
    const searchFilter = (filterSearch || '').toLowerCase(); 
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
    // THE FIX 1: Container allows vertical scrolling internally so it never breaks the parent POS layout
    <div className="h-full flex flex-col w-full">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-32 sm:pb-6 px-1 pt-1">
        
        {filteredItems.length === 0 ? (
            // Premium Empty State
            <div className="flex flex-col items-center justify-center w-full min-h-[250px] text-slate-400 border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/50 mt-4 animate-in fade-in duration-300">
                <PackageX className="w-10 h-10 mb-3 text-slate-300" strokeWidth={1.5} />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest">No {category}s found</span>
                {filterSearch && <span className="text-[9px] sm:text-[10px] font-bold mt-1 opacity-70">Clear your search to see more</span>}
            </div>
        ) : (
            // THE FIX 2: CSS Grid instead of Flex Row!
            // grid-cols-2 on mobile phones, jumping to 3, 4, 5, or 6 columns as the screen gets wider.
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
                {filteredItems.map((item: any, idx: number) => (
                    <div key={item._id || idx} className="w-full h-full">
                        <POSAccessoryCard product={item} />
                    </div>
                ))}
            </div>
        )}
        
      </div>
    </div>
  );
};
import { useInventory } from '@/features/cylinder/hooks/useCylinders';
import { POSCylinderCard } from './POSCylinderCard';
import { Loader2 } from 'lucide-react';
import { usePosStore } from '../stores/pos.store';
import { useStoreBrands } from '@/features/brand/hooks/useBrands';
import { useMemo } from 'react';

interface POSCylindersProps {
  storeId: string;
}

export const POSCylinders = ({ storeId }: POSCylindersProps) => {
  const { data: inventory, isLoading } = useInventory(storeId);
  const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);
  const { filterSearch, filterSize, filterRegulator, mode } = usePosStore();

  // Map nested objects to flat structure expected by POSCylinderCard
  const displayInventory = useMemo(() => {
        const raw = Array.isArray(inventory) ? inventory : (inventory as any)?.inventory || [];
        const brandMap = new Map<string, any>();
        for (const b of (brandsData?.brands || [])) brandMap.set(b._id.toString(), b);

        return raw
            .filter((item: any) => item.product?.category === 'cylinder')
            .map((item: any) => {
                const details = item.product?.details || {};
                const brand = brandMap.get(details.brandId?.toString?.() || '') || null;
                return {
                    _id: item._id,
                    productId: item.productId,
                    category: item.product?.category,
                    brandId: brand || { _id: details.brandId, name: item.product?.name?.split(' ')?.[0] || '?', logo: '', cylinderImage: '' },
                    brandName: brand?.name || item.product?.name?.split(' LPG')?.[0] || item.product?.name || '?',
                    variant: {
                        size: details.size || '?',
                        regulator: details.regulatorType || '?',
                        cylinderImage: brand?.cylinderImage || '',
                        cylinderColor: brand?.color || ''
                    },
                    counts: item.counts || { full: 0, empty: 0, defected: 0 },
                    prices: item.prices || {}
                };
            });
   }, [inventory, brandsData]);

  if (isLoading || isBrandsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  const filteredItems = displayInventory.filter((item: any) => {
    // 1. Search Filter
    const brandName = item.brandName || '';
    const size = item.variant?.size || '';
    const search = (filterSearch || '').toLowerCase();

    const matchesSearch = brandName.toLowerCase().includes(search) ||
                          size.toLowerCase().includes(search);

    // 2. Size Filter
    const matchesSize = filterSize === 'all' || item.variant?.size === filterSize;

    // 3. Regulator Filter
    const matchesRegulator = filterRegulator === 'all' || item.variant?.regulator === filterRegulator;

    // 4. Stock Match Constraint
    let hasStock = true;
    if (mode === 'PACKAGED' || mode === 'REFILL') {
        hasStock = (item.counts?.full || 0) > 0;
    }
    // EMPTY mode always shows everything because customers can return any brand empty cylinder.

    return matchesSearch && matchesSize && matchesRegulator && hasStock;
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

import { useInventory } from '@/features/cylinder/hooks/useCylinders';
import { POSCylinderCard } from './POSCylinderCard';
import { Loader2, PackageX } from 'lucide-react';
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

        const invProducts = raw
            .filter((item: any) => item.product?.category === 'cylinder')
            .map((item: any) => {
                const details = item.product?.details || {};
                const brand = brandMap.get(details.brandId?.toString?.() || '') || null;
                return {
                    _id: item.productId, // Use productId as the key for POS card
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

        if (mode === 'EMPTY') {
            // In EMPTY mode, ensure ALL store active brands are shown, even if no inventory exists.
            const existingBrandProducts = new Set(invProducts.map((p: any) => p.brandId?._id?.toString()));

            const virtualProducts: any[] = [];
            brandMap.forEach((brand, brandId) => {
                if (!existingBrandProducts.has(brandId)) {
                    virtualProducts.push({
                        _id: `v_${brandId}`,
                        productId: `v_${brandId}`,
                        category: 'cylinder',
                        brandId: brand,
                        brandName: brand.name,
                        variant: {
                            size: '12kg', // Default common size
                            regulator: brand.regulator || '22mm',
                            cylinderImage: brand.cylinderImage,
                            cylinderColor: brand.color
                        },
                        counts: { full: 0, empty: 0, defected: 0 },
                        prices: {}
                    });
                }
            });
            return [...invProducts, ...virtualProducts];
        }

        return invProducts;
   }, [inventory, brandsData, mode]);

  if (isLoading || isBrandsLoading) {
    return (
        <div className="flex flex-col items-center justify-center w-full opacity-50 space-y-3 min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Cylinders...</span>
        </div>
    );
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
        hasStock = (item.counts?.full || 0) > 0 || (item.counts?.packaged || 0) > 0; // Added packaged check
    }
    // EMPTY mode always shows everything because customers can return any brand empty cylinder.
    if (mode === 'EMPTY') hasStock = true;

    return matchesSearch && matchesSize && matchesRegulator && hasStock;
  });

  return (
    // THE FIX: Mobile is h-auto (fluid), PC (sm and lg) gets locked height and hidden smooth vertical scrolling
    <div className="w-full flex flex-col pt-2 sm:pt-3 pb-4 h-auto sm:h-[550px] lg:h-[60vh] xl:h-[65vh] sm:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {filteredItems.length === 0 ? (
              // Premium Empty State
              <div className="flex flex-col items-center justify-center w-full min-h-[250px] text-slate-400 border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/50 animate-in fade-in duration-300">
                  <PackageX className="w-10 h-10 mb-3 text-slate-300" strokeWidth={1.5} />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest">No Cylinders Found</span>
                  {(filterSearch || filterSize !== 'all' || filterRegulator !== 'all') && (
                      <span className="text-[9px] sm:text-[10px] font-bold mt-1 opacity-70">Clear your filters to see more</span>
                  )}
              </div>
          ) : (
              // Perfectly responsive Grid
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {filteredItems.map((item: any) => (
                      <div key={item._id} className="w-full h-full">
                          <POSCylinderCard product={item} />
                      </div>
                  ))}
              </div>
          )}
          
    </div>
  );
};
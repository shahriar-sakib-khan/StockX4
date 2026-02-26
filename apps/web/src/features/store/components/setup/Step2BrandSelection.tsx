import { useState } from 'react';
import { useGlobalBrands } from '@/features/brand/hooks/useBrands';
import { AlertTriangle } from 'lucide-react';
import type { SetupCylinderState } from './Step3CylinderSetup';
import { SetupBrandCard } from './brands/SetupBrandCard';

interface Step2Props {
  payload: { brandIds: string[]; cylinders: SetupCylinderState[] };
  updatePayload: (data: Partial<{ brandIds: string[]; cylinders: SetupCylinderState[] }>) => void;
}

export const Step2BrandSelection = ({ payload, updatePayload }: Step2Props) => {
  const { data: globalData, isLoading } = useGlobalBrands();
  const [pendingDeselect, setPendingDeselect] = useState<{ id: string; name: string } | null>(null);

  const availableBrands = globalData?.brands?.filter((b: any) => b.isActive) || [];

  const hasCylinderData = (brandId: string) => {
    return payload.cylinders.some(c =>
      c.brandId === brandId && (
        c.counts.packaged > 0 || c.counts.refill > 0 || c.counts.empty > 0 || c.counts.defected > 0 ||
        c.prices.packaged.buying > 0 || c.prices.packaged.retail > 0 || c.prices.packaged.wholesale > 0 ||
        c.prices.refill.buying > 0 || c.prices.refill.retail > 0 || c.prices.refill.wholesale > 0
      )
    );
  };

  const toggleBrand = (brand: any) => {
    const isSelected = payload.brandIds.includes(brand._id);
    if (!isSelected) {
      updatePayload({ brandIds: [...payload.brandIds, brand._id] });
    } else {
      // Check if this brand has any data entered in Step 3
      if (hasCylinderData(brand._id)) {
        setPendingDeselect({ id: brand._id, name: brand.name });
      } else {
        // No data — safe to deselect, also clean up empty cylinder states
        updatePayload({
          brandIds: payload.brandIds.filter(id => id !== brand._id),
          cylinders: payload.cylinders.filter(c => c.brandId !== brand._id),
        });
      }
    }
  };

  const isAllSelected = availableBrands.length > 0 && payload.brandIds.length === availableBrands.length;

  const handleSelectAll = () => {
    if (!isAllSelected) {
      // Select All
      const allIds = availableBrands.map((b: any) => b._id);
      updatePayload({ brandIds: allIds });
    } else {
      // Deselect All - check if ANY selected brand has data
      const hasAnyData = payload.brandIds.some(id => hasCylinderData(id));
      if (hasAnyData) {
        setPendingDeselect({ id: 'ALL', name: 'All Brands' });
      } else {
        updatePayload({ brandIds: [], cylinders: [] });
      }
    }
  };

  const confirmDeselect = () => {
    if (!pendingDeselect) return;

    if (pendingDeselect.id === 'ALL') {
      updatePayload({ brandIds: [], cylinders: [] });
    } else {
      updatePayload({
        brandIds: payload.brandIds.filter(id => id !== pendingDeselect.id),
        cylinders: payload.cylinders.filter(c => c.brandId !== pendingDeselect.id),
      });
    }
    setPendingDeselect(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Select Brands</h2>
          <p className="text-muted-foreground">Select the Gas Cylinder brands your store carries. (Mandatory)</p>
        </div>
        <button
          onClick={handleSelectAll}
          className={`px-4 py-2 shrink-0 rounded-lg text-sm font-bold border-2 transition-all ${
            isAllSelected
              ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Deselect warning modal */}
      {pendingDeselect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl shrink-0"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-lg">Remove {pendingDeselect.name}?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You have already entered stock or price data for this brand in Step 3. Removing it will <strong>delete all that data</strong> from this setup.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingDeselect(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-muted transition-colors"
              >Cancel</button>
              <button
                onClick={confirmDeselect}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {availableBrands.map((brand: any) => {
            const isSelected = payload.brandIds.includes(brand._id);
            const hasData = isSelected && hasCylinderData(brand._id);
            return (
              <SetupBrandCard
                key={brand._id}
                brand={brand}
                isSelected={isSelected}
                hasData={hasData}
                onToggle={toggleBrand}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

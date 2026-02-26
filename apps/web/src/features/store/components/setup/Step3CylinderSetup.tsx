import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandApi } from '@/features/brand/api/brand.api';
import { useSystemSettings } from '@/features/system/hooks/useSystemSettings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { CylinderSetupCard } from './cylinder/CylinderSetupCard';
import { CylinderSizeSelector } from './cylinder/CylinderSizeSelector';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SetupCylinderState {
  brandId: string;
  size: string;               // any size string e.g. '5.5kg', '12kg', '35kg'
  regulatorType: '22mm' | '20mm';
  counts: { packaged: number; refill: number; empty: number; defected: number };
  prices: {
    packaged: { buying: number; retail: number; wholesale: number };
    refill:   { buying: number; retail: number; wholesale: number };
  };
}

interface Step3Props {
  payload: {
    brandIds: string[];
    cylinders: SetupCylinderState[];
    cylinderSizes?: string[];
  };
  updatePayload: (data: Partial<{ cylinders: SetupCylinderState[]; cylinderSizes: string[] }>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emptyState = (brandId: string, size: string, regulatorType: '22mm' | '20mm'): SetupCylinderState => ({
  brandId, size, regulatorType,
  counts: { packaged: 0, refill: 0, empty: 0, defected: 0 },
  prices: {
    packaged: { buying: 0, retail: 0, wholesale: 0 },
    refill:   { buying: 0, retail: 0, wholesale: 0 },
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_GLOBAL_SIZES = ['12kg'];

export const Step3CylinderSetup = ({ payload, updatePayload }: Step3Props) => {
  const { data: globalSizes = DEFAULT_GLOBAL_SIZES } = useSystemSettings<string[]>('DEFAULT_CYLINDER_SIZES');

  const activeSizes: string[] = payload.cylinderSizes && payload.cylinderSizes.length > 0
    ? payload.cylinderSizes
    : globalSizes;

  const [activeSize, setActiveSize]       = useState(activeSizes[0] ?? globalSizes[0]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [cardRegulators, setCardRegulators]   = useState<Record<string, '22mm' | '20mm'>>({});
  const [sizeToDelete, setSizeToDelete]       = useState<string | null>(null);

  // Keep activeSize in sync if sizes list changes
  useEffect(() => {
    if (!activeSizes.includes(activeSize)) setActiveSize(activeSizes[0] ?? globalSizes[0]);
  }, [activeSizes.join(',')]);

  const { data: globalData, isLoading: brandsLoading } = useQuery({
    queryKey: ['globalBrands'],
    queryFn: () => brandApi.getGlobalBrands(),
    staleTime: 1000 * 60 * 10,
  });

  const selectedBrands = (globalData?.brands || []).filter((b: any) => payload.brandIds.includes(b._id));

  // Auto-add missing cylinder states for all (brand × size × regType) combos
  useEffect(() => {
    if (payload.brandIds.length === 0 || activeSizes.length === 0) return;
    const missing: SetupCylinderState[] = [];
    payload.brandIds.forEach(brandId => {
      activeSizes.forEach(size => {
        (['22mm', '20mm'] as const).forEach(regType => {
          const exists = payload.cylinders.some(c => c.brandId === brandId && c.size === size && c.regulatorType === regType);
          if (!exists) missing.push(emptyState(brandId, size, regType));
        });
      });
    });
    if (missing.length > 0) updatePayload({ cylinders: [...payload.cylinders, ...missing] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.brandIds.join(','), activeSizes.join(',')]);

  const getRecord = useCallback((brandId: string, size: string, regType: '22mm' | '20mm') =>
    payload.cylinders.find(c => c.brandId === brandId && c.size === size && c.regulatorType === regType)
    || emptyState(brandId, size, regType),
  [payload.cylinders]);

  const handleUpdate = useCallback((brandId: string, size: string, regType: '22mm' | '20mm', path: string[], value: number) => {
    const newCylinders = payload.cylinders.map(c => {
      if (c.brandId !== brandId || c.size !== size || c.regulatorType !== regType) return c;
      const updated = JSON.parse(JSON.stringify(c));
      let target: any = updated;
      for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
      target[path[path.length - 1]] = value;
      return updated;
    });
    updatePayload({ cylinders: newCylinders });
  }, [payload.cylinders, updatePayload]);

  const toggleSize = (size: string) => {
    setActiveSize(size);
  };

  // Check if a size has any non-zero data
  const hasDataForSize = useCallback((size: string) => {
    return payload.cylinders.some(c => {
      if (c.size !== size) return false;
      const { counts, prices } = c;
      const hasCounts = Object.values(counts).some(v => v > 0);
      const hasPrices = Object.values(prices.packaged).some(v => v > 0) || Object.values(prices.refill).some(v => v > 0);
      return hasCounts || hasPrices;
    });
  }, [payload.cylinders]);

  const requestDeleteSize = (size: string) => {
    if (activeSizes.length <= 1) return;
    if (hasDataForSize(size)) {
      setSizeToDelete(size);
    } else {
      confirmDeleteSize(size);
    }
  };

  const confirmDeleteSize = (size: string) => {
    const newSizes = activeSizes.filter(s => s !== size);
    updatePayload({
      cylinderSizes: newSizes,
      cylinders: payload.cylinders.filter(c => c.size !== size) // cleanup orphaned data
    });
    if (activeSize === size) setActiveSize(newSizes[0]);
    setSizeToDelete(null);
  };

  const addCustomSize = () => {
    const val = customSizeInput.trim();
    if (!val) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;

    // Format: "22kg" or "22.5kg"
    const withKg = `${num}kg`;

    if (!activeSizes.includes(withKg)) {
      updatePayload({ cylinderSizes: [...activeSizes, withKg] });
    }
    setCustomSizeInput('');
    setActiveSize(withKg);
  };

  // Helper to parse weight for sorting
  const parseSize = (s: string) => {
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  };
  const sortedSizes = [...activeSizes].sort((a, b) => parseSize(a) - parseSize(b));


  // ─── Guards ─────────────────────────────────────────────────────────────────

  if (brandsLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading brand catalog…</span>
      </div>
    );
  }

  if (payload.brandIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p>Please go back and select at least one brand first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Cylinder Inventory Setup</h2>
        <p className="text-muted-foreground text-sm">
          Select the sizes your store carries, then enter initial stock and prices per brand.
          Toggle <span className="font-semibold text-orange-500">22mm</span> / <span className="font-semibold text-yellow-600">20mm</span> on each card for both variants.
        </p>
      </div>

      {/* ── Size Selector ─────────────────────────────────────────────────── */}
      <CylinderSizeSelector
        activeSizes={activeSizes}
        activeSize={activeSize}
        sortedSizes={sortedSizes}
        customSizeInput={customSizeInput}
        setCustomSizeInput={setCustomSizeInput}
        toggleSize={toggleSize}
        requestDeleteSize={requestDeleteSize}
        addCustomSize={addCustomSize}
        hasDataForSize={hasDataForSize}
      />

      {/* ── Brand Cards for active size ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5">
        {selectedBrands.map((brand: any) => {
          const cardKey = brand._id;
          return (
            <CylinderSetupCard
              key={cardKey}
              brand={brand}
              globalSize={activeSize}
              activeGlobalSizes={sortedSizes}
              regulatorType={cardRegulators[cardKey] || '22mm'}
              onToggleRegulator={t => setCardRegulators(prev => ({ ...prev, [cardKey]: t }))}
              getRecord={(size, regType) => getRecord(brand._id, size, regType)}
              onUpdate={(size, regType, path, value) => handleUpdate(brand._id, size, regType, path, value)}
            />
          );
        })}
      </div>
      <Modal isOpen={!!sizeToDelete} onClose={() => setSizeToDelete(null)} title="Warning: Data Loss">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Are you sure you want to remove the {sizeToDelete} size?</p>
              <p>You have already entered initial inventory or prices for this size. Removing the size will <strong>permanently delete</strong> that data from your setup draft.</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setSizeToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => sizeToDelete && confirmDeleteSize(sizeToDelete)}>Yes, Delete Size</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

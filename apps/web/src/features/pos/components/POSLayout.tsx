import { useMemo, useEffect } from 'react';
import { PosItem, usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { POSCustomerSection } from './POSCustomerSection';

import { POSHeader } from './POSHeader';
import { POSControls } from './POSControls';
import { POSItemList } from './POSItemList';

interface POSLayoutProps {
  children: React.ReactNode;
  storeId?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const POSLayout = ({ children, storeId, userName, userRole, onLogout }: POSLayoutProps) => {
  const {
    saleItems,
    returnItems,
    allocatedDueCylinders,
    settledDueCylinders,
    setMode,
    mode,
    activeCategory,
    setActiveCategory
  } = usePosStore();

  // 1. Reset POS Defaults on Mount
  useEffect(() => {
    setActiveCategory('cylinder');
    setMode('REFILL');
  }, [setActiveCategory, setMode]);

  const { staff } = useStaffStore();

  // Resolve storeId (Prop for Owner, Staff Store for Staff)
  const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

  // Filter Sale Items into Sections
  // Safety check for hydrated state
  const safeSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const safeReturnItems = Array.isArray(returnItems) ? returnItems : [];

  // Merge allocatedDueCylinders and settledDueCylinders into return items for display
  const combinedReturnItems = useMemo(() => {
    // 1. Due Allocations
    const dueItems: PosItem[] = (allocatedDueCylinders || []).map((d: any) => ({
        productId: d.productId,
        name: d.brandName,
        type: 'CYLINDER' as const,
        category: 'cylinder' as const,
        quantity: d.selectedQty,
        unitPrice: 0,
        subtotal: 0,
        image: d.image,
        size: d.size,
        regulator: d.regulator,
        isDue: true,
        description: 'Due Return'
    })).filter((i: any) => i.quantity > 0);

    // 2. Due Settlements (already returned but tracked in transaction)
    const settlementItems: PosItem[] = (settledDueCylinders || []).map((s: any) => ({
        productId: s.productId,
        name: s.brandName,
        type: 'CYLINDER' as const,
        category: 'cylinder' as const,
        quantity: s.selectedQty,
        unitPrice: 0,
        subtotal: 0,
        image: s.image,
        size: s.size,
        regulator: s.regulator,
        isSettled: true,
        description: 'Due Settlement'
    })).filter((i: any) => i.quantity > 0);

    // 3. Normal Empty Returns
    const empties = safeReturnItems;

    // Ordered: Empty -> Settle -> Due
    return [...empties, ...settlementItems, ...dueItems];
  }, [safeReturnItems, allocatedDueCylinders, settledDueCylinders]);

    const isLocked = activeCategory === 'stove' || activeCategory === 'regulator';

  return (
    <div className="flex flex-col h-full gap-1.5 sm:gap-2 p-1.5 sm:p-2 relative overflow-y-auto pb-12">

      {/* 1. Header Bar */}
      <POSHeader storeId={storeId} userName={userName} userRole={userRole} onLogout={onLogout} />

      {/* 2. Main Cart Grid (Responsive) */}
      <div className="flex flex-col lg:flex-row gap-2 h-auto lg:h-[35vh] shrink-0 min-h-[200px] sm:min-h-[300px]">
          {/* LEFT: Selling Window */}
          <div
            onClick={() => setMode('REFILL')}
            className={`flex-1 border-2 md:border-4 rounded-xl p-1.5 sm:p-2 bg-white/50 flex flex-col h-40 sm:h-60 lg:h-full cursor-pointer transition-all ${
              (mode === 'REFILL' || mode === 'PACKAGED') ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-slate-200 opacity-80'
            }`}
          >
               <POSItemList
                 items={safeSaleItems}
                 title="Selling"
                 emptyMsg="No items"
                 listType="SALE"
               />
          </div>

          {/* RIGHT: Returned Window */}
          <div
            onClick={() => !isLocked && setMode('EMPTY')}
            className={`flex-1 border-2 md:border-4 rounded-xl p-1.5 sm:p-2 bg-white/50 flex flex-col h-40 sm:h-60 lg:h-full transition-all relative ${
              isLocked ? 'border-slate-100 cursor-not-allowed' :
              mode === 'EMPTY' ? 'border-slate-500 shadow-md ring-2 ring-slate-100 cursor-pointer' :
              'border-slate-200 opacity-80 cursor-pointer'
            }`}
          >
              <POSItemList
                items={combinedReturnItems}
                title="Returned"
                emptyMsg="No items"
                listType="RETURN"
              />

              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-xl pointer-events-none">
                   <div className="bg-white/80 p-4 rounded-full shadow-lg border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                   </div>
                </div>
              )}
          </div>
      </div>

      {/* 3. Controls Bar */}
      <POSControls storeId={effectiveStoreId} />

      {/* 4. Bottom Section: Inventory Slider */}
      <div className="flex-1 overflow-visible bg-white/50 rounded-lg border border-dashed relative min-h-[400px]">
        {children}
      </div>

      {/* 5. Embedded Customer Section */}
      <POSCustomerSection storeId={effectiveStoreId} />


    </div>
  );
};

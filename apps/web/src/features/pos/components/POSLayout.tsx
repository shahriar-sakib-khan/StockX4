import { useMemo, useEffect, useState } from 'react';
import { PosItem, usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { POSCustomerSection } from './POSCustomerSection';

import { POSHeader } from './POSHeader';
import { POSControls } from './POSControls';
import { POSItemList } from './POSItemList';
import { cn } from '@/lib/utils';
import { Lock, ShoppingBag, ArrowDownLeft, Columns } from 'lucide-react';

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

  // MOBILE VIEW STATE: Controls the toggle
  const [mobileView, setMobileView] = useState<'SALE' | 'RETURN' | 'SPLIT'>('SALE');

  useEffect(() => {
    setActiveCategory('cylinder');
    setMode('REFILL');
  }, [setActiveCategory, setMode]);

  const { staff } = useStaffStore();
  const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

  const safeSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const safeReturnItems = Array.isArray(returnItems) ? returnItems : [];

  const combinedReturnItems = useMemo(() => {
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

    const empties = safeReturnItems;
    return [...empties, ...settlementItems, ...dueItems];
  }, [safeReturnItems, allocatedDueCylinders, settledDueCylinders]);

  const isLocked = activeCategory === 'stove' || activeCategory === 'regulator';

  return (
    // Outer Scrollable Viewport
    <div className="flex flex-col h-full relative overflow-y-auto bg-slate-50/50">

      {/* ==============================================================
          THE FIX: THE "STICKY BOUNDARY" WRAPPER 
          This wrapper contains the Cart and the Inventory. 
          When the Inventory ends, the Cart stops sticking and scrolls away!
      ============================================================== */}
      <div className="flex flex-col relative w-full pb-2 sm:pb-4">

        {/* === STICKY CART SECTION === */}
        <div className="sticky top-0 z-40 flex flex-col gap-2 sm:gap-3 p-1.5 sm:p-2 md:p-3 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm sm:static sm:bg-transparent sm:border-none sm:shadow-none transition-all">

          {/* Header Bar */}
          <POSHeader storeId={storeId} userName={userName} userRole={userRole} onLogout={onLogout} />

          {/* View Toggle Switch (Mobile Only) */}
          <div className="flex sm:hidden items-center bg-slate-200/60 p-1 rounded-[10px] shrink-0 w-full mb-0 border border-slate-200/80 shadow-inner">
             <button
                onClick={() => { setMobileView('SALE'); setMode('REFILL'); }}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", mobileView === 'SALE' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700")}
             >
                <ShoppingBag size={14} strokeWidth={2.5} /> Sale
             </button>
             <button
                onClick={() => { setMobileView('RETURN'); if(!isLocked) setMode('EMPTY'); }}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", mobileView === 'RETURN' ? "bg-white text-rose-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700")}
             >
                <ArrowDownLeft size={14} strokeWidth={3} /> Return
             </button>
             <button
                onClick={() => setMobileView('SPLIT')}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", mobileView === 'SPLIT' ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700")}
             >
                <Columns size={14} strokeWidth={2.5} /> Split
             </button>
          </div>

          {/* Main Carts */}
          <div className={cn("flex shrink-0 gap-2 sm:gap-3 w-full", mobileView === 'SPLIT' ? "flex-col lg:flex-row" : "flex-col lg:flex-row")}>
              
              {/* Selling Window */}
              <div
                onClick={() => setMode('REFILL')}
                className={cn(
                    // THE FIX: lg:h-[380px] locks the height to fit roughly 2 items on PC
                    "flex-1 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex-col h-[260px] sm:h-[240px] lg:h-[380px] lg:min-h-[280px] cursor-pointer transition-all duration-300 relative bg-white overflow-hidden",
                    (mode === 'REFILL' || mode === 'PACKAGED') 
                        ? 'border-2 border-blue-500 shadow-[0_8px_30px_-6px_rgba(59,130,246,0.2)] ring-4 ring-blue-500/10 z-10 scale-[1.01] lg:scale-100' 
                        : 'border border-slate-200/80 shadow-sm opacity-80 hover:opacity-100 hover:border-slate-300',
                    mobileView === 'RETURN' ? 'hidden sm:flex' : 'flex'
                )}
              >
                   <POSItemList
                     items={safeSaleItems}
                     title="Selling Cart"
                     emptyMsg="Add items to sell"
                     listType="SALE"
                   />
              </div>

              {/* Returned Window */}
              <div
                onClick={() => !isLocked && setMode('EMPTY')}
                className={cn(
                    // THE FIX: lg:h-[380px] locks the height to fit roughly 2 items on PC
                    "flex-1 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex-col h-[260px] sm:h-[240px] lg:h-[380px] lg:min-h-[280px] transition-all duration-300 relative bg-white overflow-hidden",
                    isLocked 
                        ? 'border border-slate-200 bg-slate-50/50 cursor-not-allowed grayscale-[0.5]' :
                    mode === 'EMPTY' 
                        ? 'border-2 border-rose-500 shadow-[0_8px_30px_-6px_rgba(244,63,94,0.2)] ring-4 ring-rose-500/10 cursor-pointer z-10 scale-[1.01] lg:scale-100' :
                    'border border-slate-200/80 shadow-sm opacity-80 hover:opacity-100 hover:border-slate-300 cursor-pointer',
                    mobileView === 'SALE' ? 'hidden sm:flex' : 'flex'
                )}
              >
                  <POSItemList
                    items={combinedReturnItems}
                    title="Returned Cylinders"
                    emptyMsg="Add empty returns"
                    listType="RETURN"
                  />

                  {isLocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm pointer-events-none transition-all duration-300">
                       <div className="bg-white/90 p-3 sm:p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/80 text-slate-400 mb-2">
                          <Lock size={24} strokeWidth={2} className="sm:w-7 sm:h-7" />
                       </div>
                       <span className="font-bold text-[10px] sm:text-xs tracking-widest uppercase text-slate-500 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-slate-100">
                           Cylinders Only
                       </span>
                    </div>
                  )}
              </div>
          </div>

        </div>

        {/* === SCROLLING INVENTORY SECTION === */}
        <div className="flex flex-col gap-2 sm:gap-3 px-1.5 sm:px-2 md:px-3 pt-1.5 sm:pt-0 flex-1 w-full relative z-0">
            
            {/* Controls Bar */}
            <div className="w-full shrink-0 relative z-10">
                <POSControls storeId={effectiveStoreId} />
            </div>

            {/* Bottom Section: Inventory Grid */}
            <div className="flex-1 w-full relative min-h-[400px] sm:min-h-[500px]">
              {children}
            </div>
            
        </div>

      </div> 
      {/* End of "Sticky Boundary" wrapper */}

      {/* ==============================================================
          THE CUSTOMER SECTION (Sits safely below the sticky boundary)
          When the user scrolls down to here, the Cart scrolls away!
      ============================================================== */}
      <div className="shrink-0 px-1.5 sm:px-2 md:px-3 pb-12 lg:pb-4 w-full">
          <POSCustomerSection storeId={effectiveStoreId} />
      </div>

    </div>
  );
};
import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';

import { POSHeader } from './POSHeader';
import { POSControls } from './POSControls';
import { POSCartSection } from './POSCartSection';
import { POSReturnSection } from './POSReturnSection';

interface POSLayoutProps {
  children: React.ReactNode;
  storeId?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const POSLayout = ({ children, storeId, userName, userRole, onLogout }: POSLayoutProps) => {
  const { saleItems, returnItems, customer } = usePosStore();
  const { staff } = useStaffStore();

  // Resolve storeId (Prop for Owner, Staff Store for Staff)
  const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

  // Filter Sale Items into Sections
  // Safety check for hydrated state
  const safeSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const safeReturnItems = Array.isArray(returnItems) ? returnItems : [];

  const refillItems = safeSaleItems.filter(i => i.saleType === 'REFILL');
  const packagedItems = safeSaleItems.filter(i => i.saleType === 'PACKAGED');
   const stoveItems = safeSaleItems.filter(i => i.category === 'stove');
   const regulatorItems = safeSaleItems.filter(i => i.category === 'regulator');

  return (
    <div className="flex flex-col h-full gap-2 p-2 relative">

      {/* 1. Header Bar */}
      <POSHeader storeId={storeId} userName={userName} userRole={userRole} onLogout={onLogout} />

      {/* 2. Main Cart Grid (Responsive) */}
      <div className="flex flex-col lg:flex-row gap-2 h-auto lg:h-[35vh] shrink-0 min-h-[300px]">
          {/* LEFT: Selling Window */}
          <div className="flex-[3] border-2 border-slate-300 rounded-xl p-1 flex flex-col md:flex-row gap-1 bg-white/50 overflow-hidden">
               {/* Cylinders Group (Refill | Packaged) */}
               <div className="flex-[3] flex flex-col sm:flex-row gap-1 min-w-0">
                   <div className="flex-1 min-w-0 h-40 sm:h-full">
                      <POSCartSection items={refillItems} title="Refill Cylinders" emptyMsg="No refill items" />
                   </div>
                   <div className="flex-1 min-w-0 h-40 sm:h-full">
                      <POSCartSection items={packagedItems} title="Packaged Cylinders" emptyMsg="No packaged items" />
                   </div>
               </div>

               {/* Accessories Columns (Stoves & Regulators Side-by-Side) */}
               <div className="flex-1 flex flex-row md:flex-col gap-1 min-w-[200px]">
                   <div className="flex-1 min-w-0 h-40 md:h-full">
                       <POSCartSection items={stoveItems} title="Stoves" emptyMsg="No stoves" />
                   </div>
                   <div className="flex-1 min-w-0 h-40 md:h-full">
                       <POSCartSection items={regulatorItems} title="Regulators" emptyMsg="No regulators" />
                   </div>
               </div>
          </div>

          {/* RIGHT: Returned Window */}
          <div className="flex-1 border-2 border-slate-300 rounded-xl p-2 bg-white/50 flex flex-col h-40 lg:h-full">
              <div className="h-full">
                  <POSReturnSection items={safeReturnItems} title="Returned Cylinders" emptyMsg="No returned cylinders" />
              </div>
          </div>
      </div>

      {/* 3. Controls Bar */}
      <POSControls />

      {/* 4. Bottom Section: Inventory Slider */}
      <div className="flex-1 overflow-hidden bg-white/50 rounded-lg border border-dashed relative">
        {children}
      </div>


    </div>
  );
};

import { usePosStore } from '../stores/pos.store';
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
  const { saleItems, returnItems } = usePosStore();
  const { staff } = useStaffStore();

  // Resolve storeId (Prop for Owner, Staff Store for Staff)
  const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

  // Filter Sale Items into Sections
  // Safety check for hydrated state
  const safeSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const safeReturnItems = Array.isArray(returnItems) ? returnItems : [];

  return (
    <div className="flex flex-col h-full gap-2 p-2 relative overflow-y-auto pb-12">

      {/* 1. Header Bar */}
      <POSHeader storeId={storeId} userName={userName} userRole={userRole} onLogout={onLogout} />

      {/* 2. Main Cart Grid (Responsive) */}
      <div className="flex flex-col lg:flex-row gap-2 h-auto lg:h-[35vh] shrink-0 min-h-[300px]">
          {/* LEFT: Selling Window */}
          <div className="flex-1 border-2 border-slate-300 rounded-xl p-2 bg-white/50 flex flex-col h-60 lg:h-full">
               <POSItemList
                 items={safeSaleItems}
                 title="Selling Items"
                 emptyMsg="No items added for sale"
                 listType="SALE"
               />
          </div>

          {/* RIGHT: Returned Window */}
          <div className="flex-1 border-2 border-slate-300 rounded-xl p-2 bg-white/50 flex flex-col h-60 lg:h-full">
              <POSItemList
                items={safeReturnItems}
                title="Returned Items"
                emptyMsg="No returned items"
                listType="RETURN"
              />
          </div>
      </div>

      {/* 3. Controls Bar */}
      <POSControls />

      {/* 4. Bottom Section: Inventory Slider */}
      <div className="flex-1 overflow-visible bg-white/50 rounded-lg border border-dashed relative min-h-[400px]">
        {children}
      </div>

      {/* 5. Embedded Customer Section */}
      <POSCustomerSection storeId={effectiveStoreId} />


    </div>
  );
};

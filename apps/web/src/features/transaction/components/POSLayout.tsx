import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { CustomerSelect } from './CustomerSelect';
import { Modal } from '@/components/ui/Modal';
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

  // Filter Sale Items into Sections
  const refillItems = saleItems.filter(i => i.saleType === 'REFILL');
  const packagedItems = saleItems.filter(i => i.saleType === 'PACKAGED');
   const stoveItems = saleItems.filter(i => i.category === 'stove');
   const regulatorItems = saleItems.filter(i => i.category === 'regulator');

  return (
    <div className="flex flex-col h-full gap-2 p-2 relative">

      {/* 1. Header Bar */}
      {/* 1. Header Bar */}
      <POSHeader storeId={storeId} userName={userName} userRole={userRole} onLogout={onLogout} />

      {/* 2. Main Cart Grid (Left: Selling [65%], Right: Returned [35%]) */}
      <div className="flex gap-2 h-[35vh] shrink-0 min-h-[300px]">
          {/* LEFT: Selling Window (4 Split Sections) */}
          {/* LEFT: Selling Window (Split: Cylinders Stack | Accessories Columns) */}
          <div className="flex-[3] border-2 border-slate-300 rounded-xl p-1 flex gap-1 bg-white/50 overflow-hidden">
               {/* Cylinders Group (Refill | Packaged) */}
               <div className="flex-[3] flex gap-1 min-w-0">
                   <div className="flex-1 min-w-0 h-full">
                      <POSCartSection items={refillItems} title="Refill Cylinders" emptyMsg="No refill items" />
                   </div>
                   <div className="flex-1 min-w-0 h-full">
                      <POSCartSection items={packagedItems} title="Packaged Cylinders" emptyMsg="No packaged items" />
                   </div>
               </div>

               {/* Accessories Columns (Stoves & Regulators Side-by-Side) */}
               <div className="flex-1 flex gap-1 min-w-[200px]">
                   <div className="flex-1 min-w-0 h-full">
                       <POSCartSection items={stoveItems} title="Stoves" emptyMsg="No stoves" />
                   </div>
                   <div className="flex-1 min-w-0 h-full">
                       <POSCartSection items={regulatorItems} title="Regulators" emptyMsg="No regulators" />
                   </div>
               </div>
          </div>

          {/* RIGHT: Returned Window */}
          <div className="flex-1 border-2 border-slate-300 rounded-xl p-2 bg-white/50 flex flex-col">
              <div className="h-full">
                  <POSReturnSection items={returnItems} title="Returned Cylinders" emptyMsg="No returned cylinders" />
              </div>
          </div>
      </div>

      {/* 3. Controls Bar */}
      <POSControls />

      {/* 4. Bottom Section: Inventory Slider */}
      <div className="flex-1 overflow-hidden bg-white/50 rounded-lg border border-dashed relative">
        {children}
      </div>

      {/* Blocking Modal */}
      <Modal
        isOpen={!customer && !!staff?.storeId}
        onClose={() => {}}
        title="Start Transaction"
        className="max-w-md"
      >
        <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
                Please select a Customer or Shop to begin the transaction.
            </p>
            {(storeId || staff?.storeId) && (
                <div className="relative z-50">
                     <CustomerSelect storeId={storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id)} />
                </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

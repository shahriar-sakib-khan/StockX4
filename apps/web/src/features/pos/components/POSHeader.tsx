import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, ArrowDown, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DueCylinderModal } from './DueCylinderModal';
import { cn } from '@/lib/utils';

interface POSHeaderProps {
    storeId?: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

export const POSHeader = ({ storeId, userName, userRole, onLogout }: POSHeaderProps) => {
    const { getTotals, clearCart, customer, saleItems, returnItems, allocatedDueCylinders } = usePosStore();
    const { staff } = useStaffStore();
    const { netTotal } = getTotals();
    const navigate = useNavigate();

    // Use passed storeId or fallback to staff's storeId (safely handled)
    const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

    const {
        setAllocatedDueCylinders,
        isDueModalOpen: isMismatchModalOpen,
        setDueModalOpen: setIsMismatchModalOpen,
        calculateMismatch,
        mismatchCount: storeMismatchCount,
        getIsBalanced
    } = usePosStore();

    // Mismatch State
    const mismatchCount = storeMismatchCount;
    const isBalanced = getIsBalanced();

    const handleCheckoutScroll = () => {
        if (netTotal === 0 && saleItems.length === 0 && returnItems.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        // 1. Calculate Cylinder Mismatch
        const mismatch = calculateMismatch();
        const currentAllocation = allocatedDueCylinders.reduce((acc, b) => acc + (b.selectedQty || 0), 0);

        if (mismatch > 0 && currentAllocation !== mismatch && !isMismatchModalOpen) {
            setIsMismatchModalOpen(true);
            return;
        }

        const customerSection = document.getElementById('pos-customer-section');
        if (customerSection) {
            customerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            proceedToCheckout();
        }
    };

    const proceedToCheckout = () => {
        if (!customer) {
            const customerSection = document.getElementById('pos-customer-section');
            if (customerSection) {
                customerSection.scrollIntoView({ behavior: 'smooth' });
                toast.info("Please select a customer first", { id: 'cust-select' });
            } else {
                // Fallback scroll to bottom
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
            return;
        }
        navigate(effectiveStoreId ? `/stores/${effectiveStoreId}/pos/checkout` : '/pos/checkout');
    };

    const handleExitPos = () => {
        clearCart();
        if (onLogout) onLogout();
        if (!staff) {
             navigate(effectiveStoreId ? `/stores/${effectiveStoreId}/dashboard` : '/');
        }
    };

    return (
        <>
            <header className="flex items-center justify-between w-full bg-white/90 backdrop-blur-md border border-slate-200/80 px-2 py-1.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] z-20 gap-2 overflow-hidden shrink-0">
              
              {/* LEFT: Exit Action & Branding */}
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                 <button 
                    onClick={handleExitPos}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center shadow-inner transition-colors shrink-0"
                    title="Exit POS"
                 >
                    {staff ? <LogOut size={14} strokeWidth={2.5} className="sm:w-5 sm:h-5" /> : <ArrowLeft size={14} strokeWidth={2.5} className="sm:w-5 sm:h-5" />}
                 </button>

                 <div className="flex flex-col justify-center min-w-0 w-full">
                    
                    {/* === DESKTOP VIEW (All inline) === */}
                    <div className="hidden sm:flex items-center min-w-0">
                        <h1 className="text-[16px] font-black uppercase tracking-widest text-slate-800 leading-none flex items-center shrink-0">
                            POS <span className="text-slate-300 mx-2">•</span>
                        </h1>
                        
                        <div className="flex items-center text-[12px] font-bold uppercase tracking-wider leading-none truncate mt-[2px]">
                            {/* Name */}
                            <span className="text-slate-500 truncate max-w-[180px]">
                                {customer ? customer.name : (userName || 'Cashier')}
                            </span>
                            
                            {/* Role / Customer Tag */}
                            <span className="text-slate-300 mx-2 shrink-0">•</span>
                            <span className={cn("shrink-0", customer ? "text-emerald-500" : "text-slate-400")}>
                                {customer ? 'CUSTOMER' : userRole}
                            </span>
                        </div>
                    </div>

                    {/* === MOBILE VIEW (Stacked POS on top, FirstName • Role on bottom) === */}
                    <div className="flex sm:hidden flex-col min-w-0">
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-800 leading-none mb-1">
                            POS
                        </span>
                        <div className="flex items-center text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">
                            {/* Gets only the first name safely using optional chaining and split */}
                            <span className="text-slate-700 truncate min-w-0">
                                {customer ? customer.name?.split(' ')[0] : (userName?.split(' ')[0] || 'Cashier')}
                            </span>
                            <span className="text-slate-300 mx-1 shrink-0">•</span>
                            <span className={cn("shrink-0", customer ? "text-emerald-500" : "text-slate-400")}>
                                {customer ? 'CUST' : userRole}
                            </span>
                        </div>
                    </div>

                 </div>
              </div>

              {/* RIGHT: Live Total & Checkout Action */}
              <div className="flex items-center gap-2 sm:gap-5 shrink-0">
                 
                 {/* Live Total */}
                 <div className="flex flex-col items-end sm:flex-row sm:items-baseline gap-0 sm:gap-1.5 shrink-0">
                    <span className="text-[7px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-0">
                      Total
                    </span>
                    <span className="text-[14px] sm:text-[22px] font-black text-orange-600 leading-none tracking-tighter">
                      ৳{netTotal.toLocaleString()}
                    </span>
                 </div>
                 
                 {/* Sleek Checkout Button */}
                 <Button 
                    onClick={handleCheckoutScroll}
                    className={cn(
                        "h-8 sm:h-11 px-2.5 sm:px-6 rounded-full font-black text-[9px] sm:text-[12px] uppercase tracking-widest shadow-md transition-all active:scale-95 shrink-0",
                        isBalanced 
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_14px_-4px_rgba(16,185,129,0.4)]" 
                            : "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_14px_-4px_rgba(245,158,11,0.4)]"
                    )}
                 >
                    <span className="hidden sm:inline">{isBalanced ? 'Checkout' : 'Add Due'}</span>
                    <span className="sm:hidden">{isBalanced ? 'Pay' : 'Due'}</span>
                    <ArrowDown size={12} strokeWidth={3} className="ml-1 sm:ml-1.5 sm:w-4 sm:h-4 opacity-80" />
                 </Button>

              </div>
            </header>

            {/* Cylinder Mismatch Modal */}
            <DueCylinderModal
                isOpen={isMismatchModalOpen}
                onClose={() => setIsMismatchModalOpen(false)}
                title="Due Cylinders Detected"
                mode="ALLOCATE"
                items={allocatedDueCylinders}
                maxTotal={mismatchCount}
                onConfirm={(allocated: any[]) => {
                    setAllocatedDueCylinders(allocated);
                    setIsMismatchModalOpen(false);
                }}
            />
        </>
    );
};
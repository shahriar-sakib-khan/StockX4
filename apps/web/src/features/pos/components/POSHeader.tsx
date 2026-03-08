import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { DueCylinderModal } from './DueCylinderModal';

interface POSHeaderProps {
    storeId?: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

export const POSHeader = ({ storeId, userName, userRole, onLogout }: POSHeaderProps) => {
    const { getTotals, clearCart, customer, saleItems, returnItems, transactionMode, allocatedDueCylinders } = usePosStore();
    const { staff } = useStaffStore();
    const { netTotal } = getTotals();
    const navigate = useNavigate();

    // Use passed storeId or fallback to staff's storeId (safely handled)
    const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

    const {
        setTransactionMode,
        setAllocatedDueCylinders,
        isDueModalOpen: isMismatchModalOpen,
        setDueModalOpen: setIsMismatchModalOpen,
        calculateMismatch,
        mismatchCount: storeMismatchCount,
        getIsBalanced
    } = usePosStore();

    // Mismatch State (Now from Store)
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
            customerSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            proceedToCheckout();
        }
    };

    const proceedToCheckout = () => {
        if (!customer) {
            // Unlikely to reach here if the initial button click guarded it,
            // but just in case they cleared the cart or bypassed it:
            const customerSection = document.getElementById('pos-customer-section');
            if (customerSection) {
                customerSection.scrollIntoView({ behavior: 'smooth' });
                toast.info("Please select a customer first", { id: 'cust-select' });
            }
            return;
        }
        navigate(effectiveStoreId ? `/stores/${effectiveStoreId}/pos/checkout` : '/pos/checkout');
    };

    return (
        <div className="flex items-center justify-between border rounded-lg p-2 bg-white shadow-sm shrink-0 min-h-[56px] gap-2 flex-wrap sm:flex-nowrap">
           <div className="flex items-center gap-4">
               {staff ? (
                   <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                            clearCart();
                            if (onLogout) onLogout();
                        }}
                    >
                       <LayoutDashboard className="h-5 w-5" />
                   </Button>
               ) : (
                   <Link
                       to={effectiveStoreId ? `/stores/${effectiveStoreId}/dashboard` : '/'}
                       onClick={() => clearCart()}
                   >
                       <Button variant="outline" size="icon" className="h-10 w-10">
                           <LayoutDashboard className="h-5 w-5 text-slate-600" />
                       </Button>
                   </Link>
               )}

               <div className="flex flex-col">
                   <h1 className="font-bold text-base sm:text-lg leading-none">POS</h1>
                   {customer && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            {customer.name}
                        </span>
                   )}
               </div>

                {/* Transaction Tier */}
                <div className="hidden sm:flex items-center border rounded-md overflow-hidden bg-slate-100 p-1 gap-1 justify-center ml-2 sm:ml-4">
                    <button
                       className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${transactionMode === 'wholesale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                       onClick={() => setTransactionMode('wholesale')}
                    >
                       Wholesale
                    </button>
                    <button
                       className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${transactionMode === 'retail' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                       onClick={() => setTransactionMode('retail')}
                    >
                       Retail
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden lg:block" />

                <div className="hidden lg:flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-10 text-slate-500 font-bold px-4 rounded-xl hover:bg-slate-100"
                    >
                        <Link to={effectiveStoreId ? `/stores/${effectiveStoreId}/history` : '/history'}>
                            <History size={18} className="mr-2" /> History
                        </Link>
                    </Button>
                </div>
           </div>

           <div className="flex items-center gap-4">
                {(userName || userRole) && (
                    <div className="hidden md:block text-right mr-4 border-r pr-4">
                        <div className="text-sm font-semibold">{userName}</div>
                        <div className="text-xs text-muted-foreground uppercase">{userRole}</div>
                    </div>
                )}

                <div className="text-right">
                    <span className="text-xs text-muted-foreground block uppercase">Net Total</span>
                    <span className="text-xl font-black text-primary">৳{netTotal}</span>
                </div>
                <Button
                    id="pos-checkout-btn"
                    onClick={handleCheckoutScroll}
                    className={`h-10 px-4 sm:px-8 rounded font-bold uppercase tracking-wider shadow transition-all duration-300 text-xs sm:text-sm ${
                        isBalanced
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                >
                    {isBalanced ? 'Go to customer' : 'Add Due'} <span className="ml-2 text-[10px] opacity-70">↓</span>
                </Button>
           </div>

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

        </div>
    );
};

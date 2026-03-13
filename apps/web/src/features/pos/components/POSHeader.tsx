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
        <div className="flex items-center justify-between border rounded-lg p-2 sm:p-3 bg-white shadow-sm shrink-0 min-h-[56px] sm:min-h-[64px] gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
           <div className="flex items-center gap-4 flex-1 sm:flex-none">
                {staff ? (
                    <Button
                         variant="outline"
                         size="icon"
                         className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 hover:text-red-600 hover:bg-red-50 active:scale-95"
                         onClick={() => {
                             clearCart();
                             if (onLogout) onLogout();
                         }}
                     >
                        <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                ) : (
                    <Link
                        to={effectiveStoreId ? `/stores/${effectiveStoreId}/dashboard` : '/'}
                        onClick={() => clearCart()}
                    >
                        <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 active:scale-95">
                            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                        </Button>
                    </Link>
                )}
 
                <div className="flex flex-col">
                    <h1 className="font-black text-lg sm:text-2xl leading-none tracking-tighter uppercase">POS</h1>
                    {customer && (
                         <span className="text-xs sm:text-sm text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider mt-0.5 sm:mt-1 truncate max-w-[120px] sm:max-w-none">
                             {customer.name}
                         </span>
                    )}
                </div>
                {/* Transaction Tier */}
                <div className="hidden sm:flex items-center border-2 border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-1 gap-1 justify-center ml-4">
                    <button
                       className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-lg uppercase transition-all active:scale-95 ${transactionMode === 'wholesale' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                       onClick={() => setTransactionMode('wholesale')}
                    >
                       Wholesale
                    </button>
                    <button
                       className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-lg uppercase transition-all active:scale-95 ${transactionMode === 'retail' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                       onClick={() => setTransactionMode('retail')}
                    >
                       Retail
                    </button>
                </div>
 
                <div className="h-10 w-px bg-slate-100 mx-4 hidden lg:block" />
 
                <div className="hidden lg:flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        asChild
                        className="h-12 text-slate-500 font-black px-6 rounded-xl hover:bg-slate-100 uppercase text-xs tracking-widest active:scale-95"
                    >
                        <Link to={effectiveStoreId ? `/stores/${effectiveStoreId}/history` : '/history'}>
                            <History size={20} className="mr-2" /> History
                        </Link>
                    </Button>
                </div>
            </div>

           <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {(userName || userRole) && (
                    <div className="hidden md:block text-right mr-4 border-r pr-4">
                        <div className="text-sm font-black uppercase tracking-tight">{userName}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{userRole}</div>
                    </div>
                )}
 
                <div className="text-right flex flex-col items-end pr-1 sm:pr-2">
                    <span className="text-xs sm:text-sm text-muted-foreground uppercase font-black tracking-widest mb-0.5">Total</span>
                    <span className="text-xl sm:text-3xl font-black text-primary leading-none">৳{netTotal}</span>
                </div>
                <Button
                    id="pos-checkout-btn"
                    onClick={handleCheckoutScroll}
                    className={`h-12 sm:h-14 px-6 sm:px-10 rounded-lg sm:rounded-xl font-black uppercase tracking-widest shadow-xl transition-all duration-300 text-xs sm:text-base active:scale-95 ${
                        isBalanced
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                >
                    {isBalanced ? 'Checkout' : 'Add Due'} <span className="ml-1 sm:ml-2 text-xs opacity-70">↓</span>
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

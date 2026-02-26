import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface POSHeaderProps {
    storeId?: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

export const POSHeader = ({ storeId, userName, userRole, onLogout }: POSHeaderProps) => {
    const { getTotals, clearCart, customer } = usePosStore();
    const { staff } = useStaffStore();
    const { netTotal } = getTotals();
    const navigate = useNavigate();

    // Use passed storeId or fallback to staff's storeId (safely handled)
    const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

    const { transactionMode, setTransactionMode } = usePosStore();

    const handleCheckoutScroll = () => {
        if (netTotal === 0) {
            toast.error("Cart is empty");
            return;
        }

        if (customer) {
            navigate(effectiveStoreId ? `/stores/${effectiveStoreId}/pos/checkout` : '/pos/checkout');
            return;
        }

        // Scroll to customer selection area smoothly
        const customerSection = document.getElementById('pos-customer-section');
        if (customerSection) {
            customerSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex items-center justify-between border rounded-lg p-2 bg-white shadow-sm shrink-0 h-16">
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
                   <h1 className="font-bold text-lg leading-none">POS Terminal</h1>
                   {customer && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            {customer.name}
                        </span>
                   )}
               </div>

               {/* Transaction Tier */}
               <div className="flex items-center border rounded-md overflow-hidden bg-slate-100 p-1 gap-1 w-full md:w-auto justify-center ml-4">
                   <button
                      className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${transactionMode === 'retail' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      onClick={() => setTransactionMode('retail')}
                   >
                      Retail
                   </button>
                   <button
                      className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${transactionMode === 'wholesale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      onClick={() => setTransactionMode('wholesale')}
                   >
                      Wholesale
                   </button>
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
                    onClick={handleCheckoutScroll}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 px-8 rounded font-bold uppercase tracking-wider shadow"
                >
                    Checkout <span className="ml-2 text-[10px] opacity-70">↓</span>
                </Button>
           </div>
        </div>
    );
};

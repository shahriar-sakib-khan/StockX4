import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

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

    const { transactionMode, setTransactionMode, saleItems, returnItems, setAllocatedDueCylinders, allocatedDueCylinders } = usePosStore();

    // Mismatch State
    const [isMismatchModalOpen, setIsMismatchModalOpen] = useState(false);
    const [mismatchCount, setMismatchCount] = useState(0);

    const handleCheckoutScroll = () => {
        if (netTotal === 0 && saleItems.length === 0 && returnItems.length === 0) {
            toast.error("Cart is empty");
            return;
        }
        // The customer check is handled in proceedToCheckout()
        // after resolving any mismatch.

        // 1. Calculate Cylinder Mismatch
        let refillCylindersCount = 0;
        let emptyReturnsCount = 0;

        saleItems.forEach(item => {
            if (item.type === 'CYLINDER' && item.saleType === 'REFILL') refillCylindersCount += item.quantity;
        });

        returnItems.forEach(item => {
            if (item.type === 'CYLINDER') emptyReturnsCount += item.quantity;
        });

        const mismatch = refillCylindersCount - emptyReturnsCount;
        const currentAllocation = allocatedDueCylinders.reduce((acc, b) => acc + (b.selectedQty || 0), 0);

        if (mismatch > 0 && currentAllocation !== mismatch && !isMismatchModalOpen) {
            setMismatchCount(mismatch);

            // Extract distinct Refill brands from saleItems to allow user to allocate
            const refillBrandsArray = saleItems
                .filter(item => item.type === 'CYLINDER' && item.saleType === 'REFILL')
                .map(item => ({
                    productId: item.productId,
                    brandName: item.name,
                    maxQty: item.quantity,
                    selectedQty: 0,
                    image: item.image,
                    size: item.size,
                    regulator: item.regulator
                }));

            const uniqueBrandsMap = new Map();
            refillBrandsArray.forEach(b => {
                if(uniqueBrandsMap.has(b.productId)) {
                     uniqueBrandsMap.get(b.productId).maxQty += b.maxQty;
                } else {
                     uniqueBrandsMap.set(b.productId, { ...b });
                }
            });

            setAllocatedDueCylinders(Array.from(uniqueBrandsMap.values()));
            setIsMismatchModalOpen(true);
            return;
        }

        proceedToCheckout();
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
                    id="pos-checkout-btn"
                    onClick={handleCheckoutScroll}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 px-8 rounded font-bold uppercase tracking-wider shadow"
                >
                    Checkout <span className="ml-2 text-[10px] opacity-70">↓</span>
                </Button>
           </div>

           {/* Cylinder Mismatch Modal from CheckoutPage moved here */}
           <Modal
               isOpen={isMismatchModalOpen}
               onClose={() => setIsMismatchModalOpen(false)}
               title="Due Cylinders Detected"
           >
               <div className="space-y-4 py-4 min-w-[350px]">
                   <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex items-start gap-3 border border-orange-200">
                       <Info className="w-5 h-5 shrink-0 mt-0.5" />
                       <div>
                           <p className="font-semibold text-sm">Cylinder Count Mismatch</p>
                           <p className="text-sm mt-1">
                               You are selling <strong className="font-bold">{saleItems.filter(i => i.saleType === 'REFILL').reduce((acc, i) => acc + i.quantity, 0)}</strong> refill(s)
                               but receiving <strong className="font-bold">{returnItems.reduce((acc, i) => acc + i.quantity, 0)}</strong> empty cylinder(s).
                               <br/>
                               <span className="font-black text-orange-900 mt-2 block">{mismatchCount} cylinder(s) will be kept as DUE.</span>
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3 mt-4">
                       <p className="text-sm font-semibold text-slate-700">Please select which brand's cylinders were NOT returned:</p>

                       {allocatedDueCylinders.map((brand, idx) => (
                           <div key={brand.productId} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                               <div className="flex items-center gap-3">
                                  {brand.image ? (
                                      <img src={brand.image} alt={brand.brandName} className="w-10 h-10 object-contain mix-blend-multiply" />
                                  ) : (
                                      <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400">No Img</div>
                                  )}
                                  <div>
                                      <div className="font-bold text-slate-800 leading-tight">{brand.brandName}</div>
                                      <div className="flex gap-1 mt-1">
                                          {brand.size && <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{brand.size}</span>}
                                          {brand.regulator && <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">{brand.regulator}</span>}
                                      </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                   <Button
                                       variant="outline" size="sm" className="h-8 w-8 p-0"
                                       onClick={() => {
                                           const newArr = [...allocatedDueCylinders];
                                           if (newArr[idx].selectedQty > 0) newArr[idx].selectedQty--;
                                           setAllocatedDueCylinders(newArr);
                                       }}
                                   >-</Button>
                                   <span className="w-8 text-center font-bold text-lg">{brand.selectedQty}</span>
                                   <Button
                                       variant="outline" size="sm" className="h-8 w-8 p-0"
                                       onClick={() => {
                                           const currentTotalAllocated = allocatedDueCylinders.reduce((acc, b) => acc + b.selectedQty, 0);
                                           const newArr = [...allocatedDueCylinders];
                                           if (newArr[idx].selectedQty < brand.maxQty && currentTotalAllocated < mismatchCount) {
                                               newArr[idx].selectedQty++;
                                               setAllocatedDueCylinders(newArr);
                                           }
                                       }}
                                   >+</Button>
                               </div>
                           </div>
                       ))}
                   </div>

                   <div className="text-right text-sm">
                       <span className={allocatedDueCylinders.reduce((acc, b) => acc + b.selectedQty, 0) === mismatchCount ? "text-green-600 font-bold" : "text-amber-600"}>
                           Allocated: {allocatedDueCylinders.reduce((acc, b) => acc + b.selectedQty, 0)} / {mismatchCount}
                       </span>
                   </div>
               </div>

               <div className="flex justify-end gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={() => setIsMismatchModalOpen(false)}>Back to Cart</Button>
                   <Button
                       disabled={allocatedDueCylinders.reduce((acc, b) => acc + b.selectedQty, 0) !== mismatchCount}
                       onClick={() => {
                           setIsMismatchModalOpen(false);
                           proceedToCheckout();
                       }}
                   >
                       Proceed to Checkout \u2192
                   </Button>
               </div>
           </Modal>
        </div>
    );
};

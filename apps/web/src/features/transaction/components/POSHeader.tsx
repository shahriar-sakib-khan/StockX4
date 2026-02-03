import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { CustomerSelect } from './CustomerSelect';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface POSHeaderProps {
    storeId?: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

export const POSHeader = ({ storeId, userName, userRole, onLogout }: POSHeaderProps) => {
    const { getTotals, clearCart } = usePosStore();
    const { staff } = useStaffStore();
    const { netTotal } = getTotals();
    const navigate = useNavigate();

    // Use passed storeId or fallback to staff's storeId (safely handled)
    const effectiveStoreId = storeId || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);

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

               <div className="w-[300px]">
                   {effectiveStoreId && <CustomerSelect storeId={effectiveStoreId} />}
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
                    onClick={() => navigate(effectiveStoreId ? `/stores/${effectiveStoreId}/pos/checkout` : '/pos/checkout')}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 px-8 rounded font-bold uppercase tracking-wider shadow"
                >
                    Done
                </Button>
           </div>
        </div>
    );
};

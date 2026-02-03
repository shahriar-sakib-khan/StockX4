import { POSAccessories } from '@/features/transaction/components/POSAccessories';
import { usePosStore } from '@/features/transaction/stores/pos.store';
import { useStaffStore } from '../stores/staff.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { POSLayout } from '@/features/transaction/components/POSLayout';
import { POSCylinders } from '@/features/transaction/components/POSCylinders';

export const StaffDashboardPage = () => {
  const { staff, clearAuth } = useStaffStore();
  const { user } = useAuthStore();
  const { activeCategory, clearCart } = usePosStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCart();
    clearAuth();
    navigate('/staff/login');
  };

  const { id } = useParams<{ id: string }>();
  const rawStoreId = staff?.storeId;
  // Prioritize URL param (for owners/managers), then fallback to staff's assigned store
  const storeId = id || (typeof rawStoreId === 'object' ? (rawStoreId as any)._id : rawStoreId);

  const userName = staff ? staff.name : user?.name || 'Owner';
  const userRole = staff ? staff.role : user?.role || 'Admin';

  if (!storeId) {
    return <div className="p-8 text-center text-red-500">Error: Staff not associated with a store.</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}


      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4">
         <POSLayout storeId={storeId} userName={userName} userRole={userRole} onLogout={handleLogout}>
            {activeCategory === 'cylinder' && <POSCylinders storeId={storeId} />}
            {activeCategory === 'stove' && <POSAccessories storeId={storeId} category="stove" />}
            {activeCategory === 'regulator' && <POSAccessories storeId={storeId} category="regulator" />}
         </POSLayout>
      </main>
    </div>
  );
};

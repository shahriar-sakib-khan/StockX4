import { POSAccessories } from '@/features/pos/components/POSAccessories';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { usePosStore } from '@/features/pos/stores/pos.store';
import { useStaffStore } from '../stores/staff.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useNavigate, useParams } from 'react-router-dom';
import { POSLayout } from '@/features/pos/components/POSLayout';
import { POSCylinders } from '@/features/pos/components/POSCylinders';

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
    return (
        <div className="flex h-[100dvh] items-center justify-center p-8 text-center text-rose-500 font-black uppercase tracking-widest text-sm">
            Error: Staff not associated with a store.
        </div>
    );
  }

  return (
    // THE FIX: Changed h-screen to h-[100dvh] to fix mobile browser URL bar cutoff issues.
    // Removed background colors that clash with POSLayout.
    <div className="h-[100dvh] flex flex-col w-full overflow-hidden bg-slate-50/50">
      
      {/* THE FIX: Removed p-2 sm:p-4 so the POSLayout header touches the absolute edges of the screen */}
      <main className="flex-1 overflow-hidden w-full">
        <ErrorBoundary>
             <POSLayout storeId={storeId} userName={userName} userRole={userRole} onLogout={handleLogout}>
                {activeCategory === 'cylinder' && <POSCylinders storeId={storeId} />}
                {activeCategory === 'stove' && <POSAccessories storeId={storeId} category="stove" />}
                {activeCategory === 'regulator' && <POSAccessories storeId={storeId} category="regulator" />}
             </POSLayout>
        </ErrorBoundary>
      </main>
      
    </div>
  );
};
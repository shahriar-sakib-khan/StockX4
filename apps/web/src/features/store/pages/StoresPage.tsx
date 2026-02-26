import { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StoreList } from '../components/StoreList';
import { CreateStoreModal } from '../components/CreateStoreModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../hooks/useStores';

export const StoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { staff, isAuthenticated: isStaffAuth } = useStaffStore();
  const navigate = useNavigate();
  // We need to fetch stores here so we can auto-redirect if store length is 1 or auto-open modal if 0
  const { data, isLoading } = useStores();

  useEffect(() => {
    // If logged in as Manager, redirect to their store immediately
    // They shouldn't see the "My Stores" list which is for Owners
    if (isStaffAuth && staff?.role === 'manager' && staff?.storeId) {
        navigate(`/stores/${staff.storeId}`);
    }
  }, [isStaffAuth, staff, navigate]);

  useEffect(() => {
    // If we've loaded the store list and the user is an owner
    if (!isLoading && data?.stores) {
        const stores = data.stores;
        if (stores.length === 1) {
            // Only 1 store -> Bypass portal, go directly to that specific store
            navigate(`/stores/${stores[0]._id}/dashboard`, { replace: true });
        } else if (stores.length === 0) {
            // 0 stores -> Automatically start creating one
            setIsModalOpen(true);
        }
    }
  }, [isLoading, data, navigate]);

  if (isStaffAuth && staff?.role === 'manager') return null; // Avoid flash

  // Also avoid flash while loading stores or about to redirect the owner to their single store
  if (isLoading || (data?.stores && data.stores.length === 1)) return null;

  return (
    <PortalLayout>
      <ErrorBoundary>
        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Stores</h1>
            <p className="text-muted-foreground mt-1">Manage your store locations and staff</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Store
            </Button>
        </div>

        <StoreList isLoadingProp={isLoading} cachedStores={data?.stores} />

        {isModalOpen && <CreateStoreModal onClose={() => {
            // Only allow closing if they have at least 1 store, otherwise they MUST make one
            if (data?.stores && data.stores.length > 0) {
                setIsModalOpen(false);
            }
        }} />}
      </ErrorBoundary>
    </PortalLayout>
  );
};

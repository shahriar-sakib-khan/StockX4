import { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StoreList } from '../components/StoreList';
import { CreateStoreModal } from '../components/CreateStoreModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { useNavigate } from 'react-router-dom';

export const StoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { staff, isAuthenticated: isStaffAuth } = useStaffStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If logged in as Manager, redirect to their store immediately
    // They shouldn't see the "My Stores" list which is for Owners
    if (isStaffAuth && staff?.role === 'manager' && staff?.storeId) {
        navigate(`/stores/${staff.storeId}`);
    }
  }, [isStaffAuth, staff, navigate]);

  if (isStaffAuth && staff?.role === 'manager') return null; // Avoid flash

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

        <StoreList />

        {isModalOpen && <CreateStoreModal onClose={() => setIsModalOpen(false)} />}
      </ErrorBoundary>
    </PortalLayout>
  );
};

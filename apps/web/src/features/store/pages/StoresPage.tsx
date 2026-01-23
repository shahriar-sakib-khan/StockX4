import { useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StoreList } from '../components/StoreList';
import { CreateStoreModal } from '../components/CreateStoreModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const StoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

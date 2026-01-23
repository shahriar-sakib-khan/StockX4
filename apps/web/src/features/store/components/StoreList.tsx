import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStores, useDeleteStore } from '../hooks/useStores';
import { Button } from '@/components/ui/button';
import { Store as StoreIcon, Trash2, Pencil } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EditStoreModal } from './EditStoreModal';

export const StoreList = () => {
  const { data, isLoading, error } = useStores();
  const deleteStore = useDeleteStore();
  const navigate = useNavigate();
  const [editingStore, setEditingStore] = useState<{ _id: string; name: string } | null>(null);
  const [deletingStore, setDeletingStore] = useState<{ _id: string; name: string } | null>(null);

  if (isLoading) return <div className="text-muted-foreground">Loading stores...</div>;
  if (error) return <div className="text-destructive">Failed to load stores</div>;

  const stores = Array.isArray(data?.stores) ? data.stores : [];

  const handleDelete = () => {
    if (deletingStore) {
        deleteStore.mutate(deletingStore._id);
        setDeletingStore(null);
    }
  };

  return (
    <div className="space-y-4">
      {stores.length === 0 ? (
        <div className="p-8 border border-border rounded-xl text-center bg-card shadow-sm">
            <StoreIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl text-foreground font-medium mb-2">No stores yet</h3>
            <p className="text-muted-foreground mb-4">Create your first store to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store: any) => (
            <div key={store._id} className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <StoreIcon className="w-8 h-8 text-primary" />
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStore(store)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                        title="Edit Store"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingStore(store)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        title="Delete Store"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{store.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4">{store.slug}</p>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/stores/${store._id}/dashboard`)}
              >
                Enter Store
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingStore && (
        <EditStoreModal
            store={editingStore}
            onClose={() => setEditingStore(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingStore}
        onClose={() => setDeletingStore(null)}
        onConfirm={handleDelete}
        title="Delete Store"
        description={(
            <p>
                Are you sure you want to delete <span className="font-bold text-foreground">{deletingStore?.name}</span>?
                This action cannot be undone.
            </p>
        )}
        confirmLabel="Delete Store"
      />
    </div>
  );
};

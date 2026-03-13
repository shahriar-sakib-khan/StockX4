import { useParams } from 'react-router-dom';
import { useStore, useUpdateStore } from '../hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateStoreSchema, UpdateStoreInput } from '@repo/shared';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Store as StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CreateStoreModal } from '../components/CreateStoreModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const StoreSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data, isLoading } = useStore(id!);
  const store = data?.store;
  const updateStore = useUpdateStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<UpdateStoreInput | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateStoreInput>({
    resolver: zodResolver(updateStoreSchema),
  });

  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        code: store.code || '',
        ownerName: store.ownerName || user?.name || '',
        ownerPhone: store.ownerPhone || ''
      });
    }
  }, [store, reset, user]);

  const onSubmit = (data: UpdateStoreInput) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const getChangesDiff = () => {
    if (!pendingData || !store) return null;
    const changes: JSX.Element[] = [];

    // Helper to safely compare to avoid undefined vs empty string mismatch
    const formatOld = (val: string | undefined) => val ? val : '(empty)';
    const formatNew = (val: string | undefined) => val ? val : '(empty)';

    if (pendingData.name !== store.name) {
        changes.push(<li key="name"><strong>Name:</strong> <span className="text-rose-600 line-through">{formatOld(store.name)}</span> &rarr; <span className="text-emerald-700 font-bold">{formatNew(pendingData.name)}</span></li>);
    }
    if ((pendingData.code || '') !== (store.code || '')) {
        changes.push(<li key="code"><strong>Code:</strong> <span className="text-rose-600 line-through">{formatOld(store.code)}</span> &rarr; <span className="text-emerald-700 font-bold">{formatNew(pendingData.code)}</span></li>);
    }
    if ((pendingData.ownerName || '') !== (store.ownerName || '')) {
        changes.push(<li key="ownerName"><strong>Owner Name:</strong> <span className="text-rose-600 line-through">{formatOld(store.ownerName)}</span> &rarr; <span className="text-emerald-700 font-bold">{formatNew(pendingData.ownerName)}</span></li>);
    }
    if ((pendingData.ownerPhone || '') !== (store.ownerPhone || '')) {
        changes.push(<li key="ownerPhone"><strong>Owner Phone:</strong> <span className="text-rose-600 line-through">{formatOld(store.ownerPhone)}</span> &rarr; <span className="text-emerald-700 font-bold">{formatNew(pendingData.ownerPhone)}</span></li>);
    }

    return changes;
  };

  const handleConfirmSave = () => {
    if (!id || !pendingData) return;
    updateStore.mutate({ id, data: pendingData }, {
      onSuccess: () => {
        toast.success("Store details updated successfully");
        setIsConfirmOpen(false);
      },
    });
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!store) return <div className="p-8 text-destructive">Store not found</div>;

  return (
    <div className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Store Settings</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage details and configuration for {store.name}</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold shadow-sm w-full sm:w-auto min-h-[48px] sm:min-h-[40px]">
                <Plus className="w-4 h-4 mr-2" />
                Create New Store
            </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                    <StoreIcon className="w-6 h-6" />
                </div>
                <div>
                     <h2 className="text-xl font-bold">Edit Store Details</h2>
                     <p className="text-xs text-muted-foreground mt-0.5">Update your basic store information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md w-full">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">Store Name</label>
                <Input
                {...register('name')}
                placeholder="e.g. Test Store"
                className="h-12 sm:h-10 text-base font-medium"
                />
                {errors.name && <p className="text-destructive text-xs font-semibold">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">Store Code</label>
                <Input
                {...register('code')}
                placeholder="e.g. ST-001"
                className="h-12 sm:h-10 text-base font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">Owner Name</label>
                <Input
                {...register('ownerName')}
                placeholder="e.g. John Doe"
                className="h-12 sm:h-10 text-base font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">Owner Phone</label>
                <Input
                {...register('ownerPhone')}
                placeholder="e.g. 01700000000"
                className="h-12 sm:h-10 text-base font-medium"
                />
            </div>

            <Button
                type="submit"
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 sm:h-10 px-8 w-full sm:w-auto"
                disabled={updateStore.isPending}
            >
                {updateStore.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
            </Button>
            </form>
        </div>

        {isCreateModalOpen && <CreateStoreModal onClose={() => setIsCreateModalOpen(false)} />}

        <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={handleConfirmSave}
            title="Confirm Changes"
            description={
                <div className="space-y-3 mt-2">
                    <p className="text-sm text-foreground">Are you sure you want to save these changes to your store settings?</p>
                    {isConfirmOpen && getChangesDiff()?.length ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Changes Detected</p>
                            <ul className="text-sm space-y-1">
                                {getChangesDiff()}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm italic text-muted-foreground bg-slate-50 border border-slate-200 rounded-lg p-3">No actual changes detected.</p>
                    )}
                </div>
            }
            confirmLabel="Save Changes"
        />
    </div>
  );
};

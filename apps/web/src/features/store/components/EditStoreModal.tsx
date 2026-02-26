import { useUpdateStore } from '../hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateStoreSchema, UpdateStoreInput } from '@repo/shared';

interface EditStoreModalProps {
  store: { _id: string; name: string };
  onClose: () => void;
}

export const EditStoreModal = ({ store, onClose }: EditStoreModalProps) => {
  const updateStore = useUpdateStore();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateStoreInput>({
    resolver: zodResolver(updateStoreSchema),
    defaultValues: {
      name: store.name,
    },
  });

  const onSubmit = (data: UpdateStoreInput) => {
    updateStore.mutate({ id: store._id, data }, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Store">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Store Name</label>
            <Input
              {...register('name')}
              placeholder="e.g. My Coffee Shop"
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={updateStore.isPending}
          >
            {updateStore.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
    </Modal>
  );
};

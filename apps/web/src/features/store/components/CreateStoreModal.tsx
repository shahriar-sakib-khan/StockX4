import { useCreateStore } from '../hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStoreSchema, CreateStoreInput } from '@repo/shared';

interface CreateStoreModalProps {
  onClose: () => void;
}

export const CreateStoreModal = ({ onClose }: CreateStoreModalProps) => {
  const createStore = useCreateStore();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
  });

  const onSubmit = (data: CreateStoreInput) => {
    createStore.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create New Store">
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
            disabled={createStore.isPending}
          >
            {createStore.isPending ? 'Creating...' : 'Create Store'}
          </Button>
        </form>
    </Modal>
  );
};

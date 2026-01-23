import { useCreateStaff } from '../hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStaffSchema, CreateStaffInput } from '@repo/shared';

interface AddStaffModalProps {
  storeId: string;
  onClose: () => void;
}

export const AddStaffModal = ({ storeId, onClose }: AddStaffModalProps) => {
  const createStaff = useCreateStaff();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
        role: 'staff'
    }
  });

  const onSubmit = (data: CreateStaffInput) => {
    createStaff.mutate({ storeId, data }, {
      onSuccess: () => {
        onClose();
      },
      onError: (error: any) => {
          // Ideally handle error message from backend
          // Here we rely on useAuth or global toaster if setup, or hook onError
          // Ky throws errors which react-query captures.
      }
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Staff Member">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              {...register('name')}
              placeholder="e.g. John Doe"
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">Staff ID or Email</label>
             <Input
               {...register('staffId')}
               placeholder="e.g. 001 or john@store.com"
             />
             {errors.staffId && <p className="text-destructive text-xs">{errors.staffId.message}</p>}
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">Password</label>
             <Input
               {...register('password')}
               placeholder="******"
               type="password"
             />
             {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              {...register('role')}
              className="w-full bg-background border border-border rounded-md p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="staff">Staff</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
            </select>
             {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={createStaff.isPending}
          >
            {createStaff.isPending ? 'Adding...' : 'Add Staff'}
          </Button>
        </form>
    </Modal>
  );
};

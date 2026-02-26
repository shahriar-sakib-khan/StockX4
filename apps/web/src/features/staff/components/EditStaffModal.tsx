import { useUpdateStaff } from '../hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateStaffSchema, UpdateStaffInput } from '@repo/shared';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface EditStaffModalProps {
  storeId: string;
  staff: any;
  onClose: () => void;
}

export const EditStaffModal = ({ storeId, staff, onClose }: EditStaffModalProps) => {
  const updateStaff = useUpdateStaff();
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
        image: staff.image || '',
    }
  });

  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    reset({
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
        image: staff.image || '',
        salary: staff.salary || 0,
        contact: staff.contact || '',
        salaryEnabled: staff.salaryEnabled ?? (staff.role === 'owner' ? false : true),
    });
  }, [staff, reset]);

  const onSubmit = (data: UpdateStaffInput) => {
    // Clean up empty password
    if (!data.password) {
        delete data.password;
    }

    updateStaff.mutate({ storeId, staffId: staff._id, data }, {
      onSuccess: () => {
        toast.success('Staff member updated successfully');
        onClose();
      },
      onError: (error: any) => {
          toast.error(error.message || 'Failed to update staff');
      }
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Staff Member">
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
             <label className="text-sm font-medium text-foreground">Phone / Email</label>
             <Input
               {...register('contact')}
               placeholder="e.g. 01711111111 or john@store.com"
             />
             {errors.contact && <p className="text-destructive text-xs">{errors.contact.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              {...register('role')}
              className="w-full bg-background border border-border rounded-md p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
                <option value="owner">Owner</option>
            </select>
             {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">Monthly Salary</label>
             <Input
               {...register('salary')}
               type="number"
               placeholder="0.00"
               min="0"
             />
             {errors.salary && <p className="text-destructive text-xs">{errors.salary.message}</p>}
          </div>

          {staff.role === 'owner' && (
              <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
                  <div>
                      <label className="text-sm font-medium text-foreground">Salary Visibility</label>
                      <p className="text-xs text-muted-foreground mt-0.5">Show or hide your salary amount across the store.</p>
                  </div>
                  <Controller
                      control={control}
                      name="salaryEnabled"
                      render={({ field }) => (
                          <Button
                              type="button"
                              onClick={() => field.onChange(field.value === false)}
                              variant={field.value !== false ? "outline" : "default"}
                              size="sm"
                              className={field.value === false ? "bg-primary text-primary-foreground font-bold" : "font-semibold"}
                          >
                              {field.value !== false ? 'Hide Salary' : 'Show Salary'}
                          </Button>
                      )}
                  />
              </div>
          )}

          <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">Profile Image (Optional)</label>
             <Controller
                control={control}
                name="image"
                render={({ field }) => (
                    <ImageUpload
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={updateStaff.isPending}
                    />
                )}
             />
             {errors.image && <p className="text-destructive text-xs">{errors.image.message}</p>}
          </div>

          <div className="space-y-2 border-t border-border pt-4 mt-4">
             <div className="flex justify-between items-center">
                 <label className="text-sm font-medium text-foreground">Password</label>
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs bg-muted/50 hover:bg-muted"
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                 >
                    {showPasswordInput ? 'Cancel Reset' : 'Reset Password'}
                 </Button>
             </div>

             {showPasswordInput && (
                 <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                     <Input
                        {...register('password')}
                        placeholder="Enter new password"
                        type="password"
                     />
                     <p className="text-xs text-muted-foreground mt-1">Enter a new password to update it.</p>
                     {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                 </div>
             )}
          </div>

           <div className="flex items-center space-x-2 mt-4">
                <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active Account</label>
           </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={updateStaff.isPending}
          >
            {updateStaff.isPending ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
    </Modal>
  );
};

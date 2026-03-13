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
import { cn } from '@/lib/utils';

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Full Name</label>
                <Input
                  {...register('name')}
                  placeholder="e.g. John Doe"
                  className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
                />
                {errors.name && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Phone / Email</label>
                 <Input
                   {...register('contact')}
                   placeholder="e.g. 01711111111"
                   className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
                 />
                 {errors.contact && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.contact.message}</p>}
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Role</label>
                <select
                  {...register('role')}
                  className="w-full h-12 sm:h-14 bg-white border-2 border-slate-100 rounded-2xl px-5 py-2 text-slate-700 font-bold focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat transition-all"
                >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="driver">Driver</option>
                    <option value="owner">Owner</option>
                </select>
                 {errors.role && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.role.message}</p>}
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Monthly Salary (৳)</label>
                 <Input
                   {...register('salary')}
                   type="number"
                   placeholder="0"
                   min="0"
                   className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
                 />
                 {errors.salary && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.salary.message}</p>}
              </div>
          </div>

          {staff.role === 'owner' && (
              <div className="flex items-center justify-between p-4 sm:p-5 border-2 border-indigo-50 rounded-2xl bg-indigo-50/50">
                  <div className="space-y-1">
                      <label className="text-xs font-black text-indigo-900 uppercase tracking-tight">Salary Visibility</label>
                      <p className="text-[10px] text-indigo-600 font-bold mt-0.5">Show or hide your salary across the store.</p>
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
                              className={cn(
                                "h-12 px-6 rounded-xl font-black uppercase tracking-tighter text-[10px]",
                                field.value === false ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-indigo-600 border-2 border-indigo-100"
                              )}
                          >
                              {field.value !== false ? 'Hide Salary' : 'Show Salary'}
                          </Button>
                      )}
                  />
              </div>
          )}

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Profile Image</label>
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
             {errors.image && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.image.message}</p>}
          </div>

          <div className="space-y-2 border-t-2 border-slate-100 pt-5 mt-2">
             <div className="flex justify-between items-center mb-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Security</label>
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-10 px-4 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all",
                        showPasswordInput ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                 >
                    {showPasswordInput ? 'Cancel Reset' : 'Reset Password'}
                 </Button>
             </div>

             {showPasswordInput && (
                 <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                     <Input
                        {...register('password')}
                        placeholder="Enter new 6-digit password"
                        type="password"
                        className="h-12 rounded-2xl border-2 border-rose-100 focus:border-rose-300 font-bold text-slate-700 px-5"
                     />
                     <p className="text-[10px] text-slate-500 font-bold mt-1.5 ml-1">Security Note: Passwords must be at least 6 characters.</p>
                     {errors.password && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.password.message}</p>}
                 </div>
             )}
          </div>

           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 mt-2">
                <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-5 w-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-black text-slate-700 cursor-pointer uppercase tracking-tight">Account Active</label>
           </div>

          <Button
            type="submit"
            className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 active:scale-[0.98]"
            disabled={updateStaff.isPending}
          >
            {updateStaff.isPending ? 'Saving Changes...' : 'Update Staff Profile'}
          </Button>
        </form>
    </Modal>
  );
};

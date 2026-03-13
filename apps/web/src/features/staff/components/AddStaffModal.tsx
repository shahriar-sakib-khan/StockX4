import { useCreateStaff } from '../hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStaffSchema, CreateStaffInput } from '@repo/shared';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface AddStaffModalProps {
  storeId: string;
  onClose: () => void;
}

export const AddStaffModal = ({ storeId, onClose }: AddStaffModalProps) => {
  const createStaff = useCreateStaff();
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateStaffInput>({
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
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
               placeholder="e.g. 01711111111 or john@store.com"
               className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
             />
             {errors.contact && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.contact.message}</p>}
          </div>
 
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Secure Password</label>
             <Input
               {...register('password')}
               placeholder="******"
               type="password"
               className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
             />
             {errors.password && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.password.message}</p>}
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
 
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Profile Image</label>
             <Controller
                control={control}
                name="image"
                render={({ field }) => (
                     <ImageUpload
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={createStaff.isPending}
                    />
                )}
             />
             {errors.image && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.image.message}</p>}
          </div>
 
          <Button
            type="submit"
            className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 active:scale-[0.98]"
            disabled={createStaff.isPending}
          >
            {createStaff.isPending ? 'Processing...' : 'Complete Registration'}
          </Button>
        </form>
    </Modal>
  );
};

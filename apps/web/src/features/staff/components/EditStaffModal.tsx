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
import { CalendarClock } from 'lucide-react';

interface EditStaffModalProps {
  storeId: string;
  staff: any;
  onClose: () => void;
}

/** Generate 6 month options */
const getMonthOptions = () => {
  const now = new Date();
  const options: { value: string; label: string }[] = [
    { value: 'immediate', label: `This month (${now.toLocaleDateString('en-US', { month: 'long' })})` },
  ];
  
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  options.push({
    value: nextMonth.toISOString(),
    label: `From next month (${nextMonth.toLocaleDateString('en-US', { month: 'long' })})`,
  });

  for (let i = 2; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      value: d.toISOString(),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  return options;
};

export const EditStaffModal = ({ storeId, staff, onClose }: EditStaffModalProps) => {
  const updateStaff = useUpdateStaff();
  const { register, handleSubmit, formState: { errors, isDirty }, reset, control, watch, setValue } = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
        image: staff.image || '',
    }
  });

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [salaryEffective, setSalaryEffective] = useState('immediate');
  const [isChangingSalary, setIsChangingSalary] = useState(false);

  const currentSalary = staff.salary || 0;
  const watchedSalary = watch('salary');
  const salaryChanged = watchedSalary != null && Number(watchedSalary) !== currentSalary;

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
    if (!data.password) delete data.password;

    // Handle salary effective date
    if (salaryChanged && salaryEffective !== 'immediate') {
      // Schedule the salary change for a future date
      data.pendingSalary = Number(data.salary);
      data.salaryEffectiveDate = salaryEffective;
      // Keep the current salary unchanged
      data.salary = currentSalary;
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

  const monthOptions = getMonthOptions();

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Staff Member">
        {/* THE FIX: Removed space-y classes, made it relative so the button can stick to the bottom */}
        <form 
            id="edit-staff-form"
            onSubmit={handleSubmit(onSubmit)} 
            className="max-h-[75vh] sm:max-h-[80vh] overflow-y-auto relative px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Full Name</label>
                <Input
                  {...register('name')}
                  placeholder="e.g. John Doe"
                  className="h-11 sm:h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-4 sm:px-5 text-sm sm:text-base bg-white"
                />
                {errors.name && <p className="text-rose-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ml-1">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1 sm:gap-1.5">
                 <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Phone / Email</label>
                 <Input
                   {...register('contact')}
                   placeholder="e.g. 01711111111"
                   className="h-11 sm:h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-4 sm:px-5 text-sm sm:text-base bg-white"
                 />
                 {errors.contact && <p className="text-rose-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ml-1">{errors.contact.message}</p>}
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Role</label>
                <select
                  {...register('role')}
                  className="w-full h-11 sm:h-12 bg-white border-2 border-slate-100 rounded-xl px-4 sm:px-5 py-2 text-slate-700 font-bold text-sm sm:text-base focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:16px_16px] sm:bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat transition-all"
                >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="driver">Driver</option>
                    <option value="owner">Owner</option>
                </select>
                  {errors.role && <p className="text-rose-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ml-1">{errors.role.message}</p>}
              </div>

              <div className={cn("flex flex-col gap-1 sm:gap-1.5 border-2 border-slate-100 rounded-xl p-3 sm:p-4 bg-slate-50 transition-all", isChangingSalary ? "col-span-1 sm:col-span-2" : "")}>
                 <div className="flex justify-between items-center mb-1">
                     <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Monthly Salary</label>
                     {!isChangingSalary && (
                         <button 
                             type="button" 
                             onClick={() => setIsChangingSalary(true)}
                             className="text-[9px] sm:text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-100/50 px-2.5 py-1 rounded-full transition-all"
                         >
                             Change
                         </button>
                     )}
                 </div>
                 
                 {!isChangingSalary ? (
                     <div className="font-black text-slate-700 text-base sm:text-lg">
                         ৳{currentSalary.toLocaleString()}
                     </div>
                 ) : (
                     <div className="flex flex-col gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-1">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                             <div className="flex flex-col gap-1 sm:gap-1.5">
                                 <label className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">New Amount (৳)</label>
                                 <Input
                                   {...register('salary')}
                                   type="number"
                                   placeholder="0"
                                   min="0"
                                   className="h-10 sm:h-12 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 font-bold text-slate-700 transition-all px-3 sm:px-4 bg-white text-sm sm:text-base"
                                 />
                                 {errors.salary && <p className="text-rose-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ml-1">{errors.salary.message}</p>}
                             </div>

                             <div className="flex flex-col gap-1 sm:gap-1.5">
                                 <label className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none flex items-center gap-1">
                                     <CalendarClock className="w-3.5 h-3.5" /> Effective Date
                                 </label>
                                 <select
                                     value={salaryEffective}
                                     onChange={(e) => setSalaryEffective(e.target.value)}
                                     className="w-full h-10 sm:h-12 bg-white border-2 border-amber-200 rounded-lg px-3 sm:px-4 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%23D97706%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:14px_14px] sm:bg-[length:16px_16px] bg-[right_0.5rem_center] sm:bg-[right_0.75rem_center] bg-no-repeat transition-all"
                                 >
                                     {monthOptions.map((opt) => (
                                         <option key={opt.value} value={opt.value}>{opt.label}</option>
                                     ))}
                                 </select>
                                 {salaryEffective !== 'immediate' && (
                                     <p className="text-[8px] sm:text-[9px] text-amber-600 font-bold ml-1 mt-1 leading-tight">
                                         Current salary ৳{currentSalary.toLocaleString()} stays until chosen month.
                                     </p>
                                 )}
                             </div>
                         </div>
                         
                         <div className="flex justify-end pt-2 border-t border-slate-200">
                             <button 
                                 type="button" 
                                 onClick={() => {
                                     setIsChangingSalary(false);
                                     setValue('salary', currentSalary);
                                     setSalaryEffective(monthOptions[1].value); 
                                 }}
                                 className="text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-700 w-full sm:w-auto text-center px-4 py-1.5 sm:py-2"
                             >
                                 Cancel
                             </button>
                         </div>
                     </div>
                 )}
              </div>
          </div>


          {/* Pending Salary Indicator */}
          {staff.pendingSalary != null && staff.salaryEffectiveDate && (
              <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-100 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 sm:mb-4">
                  <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Scheduled Change</span>
                      <p className="text-[9px] sm:text-[10px] text-blue-500 font-bold">
                          Effective {new Date(staff.salaryEffectiveDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                  </div>
                  <span className="font-black text-base sm:text-lg text-blue-700">৳{staff.pendingSalary.toLocaleString()}</span>
              </div>
          )}

          {/* Owner Salary Visibility */}
          {staff.role === 'owner' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-2 border-indigo-50 rounded-xl bg-indigo-50/50 gap-3 mb-3 sm:mb-4">
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] sm:text-xs font-black text-indigo-900 uppercase tracking-tight">Salary Visibility</label>
                      <p className="text-[9px] sm:text-[10px] text-indigo-600 font-bold mt-0.5">Show/hide your salary across the store.</p>
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
                                "h-10 sm:h-12 px-4 sm:px-6 rounded-lg font-black uppercase tracking-tighter text-[9px] sm:text-[10px] w-full sm:w-auto",
                                field.value === false ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white text-indigo-600 border-2 border-indigo-100"
                              )}
                          >
                              {field.value !== false ? 'Hide Salary' : 'Show Salary'}
                          </Button>
                      )}
                  />
              </div>
          )}

          <div className="flex flex-col gap-1 sm:gap-1.5 mb-3 sm:mb-4">
             <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Profile Image</label>
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
             {errors.image && <p className="text-rose-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ml-1">{errors.image.message}</p>}
          </div>

          <div className="flex flex-col gap-2 border-t-2 border-slate-100 pt-3 mb-3 sm:mb-4">
             <div className="flex justify-between items-center mb-1">
                 <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Security</label>
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all",
                        showPasswordInput ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                 >
                    {showPasswordInput ? 'Cancel Reset' : 'Reset Password'}
                 </Button>
             </div>

             {showPasswordInput && (
                 <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 pt-1">
                     <Input
                        {...register('password')}
                        placeholder="Enter new 6-digit password"
                        type="password"
                        className="h-11 sm:h-12 rounded-xl border-2 border-rose-100 focus:border-rose-300 font-bold text-slate-700 px-4 sm:px-5 text-sm sm:text-base bg-white"
                     />
                     <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-1.5 ml-1">Security Note: Passwords must be at least 6 characters.</p>
                     {errors.password && <p className="text-rose-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ml-1">{errors.password.message}</p>}
                 </div>
             )}
          </div>

           <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border-2 border-slate-100 mb-6 sm:mb-8">
                <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 sm:h-5 sm:w-5 rounded border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                />
                <label htmlFor="isActive" className="text-[10px] sm:text-sm font-black text-slate-700 cursor-pointer uppercase tracking-tight">Account Active</label>
           </div>

           {/* THE FIX: Sticky Bottom Button container hides any ghost space below it */}
           <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-1 z-10 border-t border-slate-100/50">
              <Button
                type="submit"
                className={cn(
                    "w-full h-12 sm:h-14 transition-all shadow-lg rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs",
                    isDirty 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_14px_-4px_rgba(16,185,129,0.4)] active:scale-[0.98]" 
                        : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                )}
                disabled={updateStaff.isPending || !isDirty}
              >
                {updateStaff.isPending ? 'Updating...' : 'Update Staff Profile'}
              </Button>
           </div>
           
        </form>
    </Modal>
  );
};
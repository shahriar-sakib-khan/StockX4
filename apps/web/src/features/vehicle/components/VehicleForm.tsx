import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateVehicle, useUpdateVehicle } from '../hooks/useVehicles';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VehicleFormProps {
    onSuccess?: () => void;
    initialData?: VehicleInput & { _id?: string };
}

export const VehicleForm = ({ onSuccess, initialData }: VehicleFormProps) => {
    const createMutation = useCreateVehicle();
    const updateMutation = useUpdateVehicle();
    const [uploading, setUploading] = useState(false);

    const isEditing = !!initialData?._id;
    const isPending = createMutation.isPending || updateMutation.isPending || uploading;

    const form = useForm<VehicleInput>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: initialData || {
            licensePlate: '',
            vehicleModel: '',
            driverName: '',
            driverPhone: '',
            imageUrl: ''
        }
    });

    const imageUrl = form.watch('imageUrl');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('upload', {
                body: formData,
            }).json<{ url: string }>();

            form.setValue('imageUrl', res.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = (data: VehicleInput) => {
        if (isEditing && initialData?._id) {
            updateMutation.mutate({ id: initialData._id, data }, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                }
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                }
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 p-1 sm:p-2">
            
             {/* === PREMIUM IMAGE UPLOAD === */}
             <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
                 <div className="relative group shrink-0">
                     {imageUrl ? (
                         <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                             <img src={imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                 <button
                                     type="button"
                                     onClick={() => form.setValue('imageUrl', '')}
                                     className="bg-white text-rose-500 rounded-full p-2 hover:bg-rose-50 hover:scale-110 shadow-sm transition-all"
                                 >
                                     <X size={16} className="stroke-[3]" />
                                 </button>
                             </div>
                         </div>
                     ) : (
                         <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-500 transition-all group/upload cursor-pointer overflow-hidden shadow-sm">
                             <ImagePlus size={24} className="group-hover/upload:scale-110 transition-all mb-1" />
                             <span className="text-[9px] font-bold uppercase tracking-wider">Add Photo</span>
                         </div>
                     )}
                     <input
                         type="file"
                         accept="image/*"
                         onChange={handleFileUpload}
                         disabled={uploading}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                         title="Upload vehicle image"
                     />
                 </div>
                 
                 <div className="flex-1 space-y-1.5 text-center sm:text-left flex flex-col justify-center sm:h-28">
                     <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Vehicle Photo</h4>
                     <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[240px] sm:max-w-none mx-auto sm:mx-0">
                         {uploading ? 'Processing high-quality upload...' : 'Upload a clear photo to help your team identify this vehicle quickly.'}
                     </p>
                     {uploading && (
                          <div className="w-full sm:max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 mx-auto sm:mx-0">
                             <div className="bg-indigo-500 h-full animate-progress" style={{ width: '60%' }} />
                          </div>
                     )}
                 </div>
             </div>

            {/* === FORM FIELDS === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">License Plate *</label>
                    <Input 
                        {...form.register('licensePlate')} 
                        placeholder="e.g. DHAKA-METRO-GA-1234" 
                        className={cn(
                            "h-12 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50 shadow-sm uppercase",
                            form.formState.errors.licensePlate && "border-rose-300 focus:border-rose-500 focus:ring-rose-50"
                        )}
                    />
                    {form.formState.errors.licensePlate && (
                        <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">
                            {form.formState.errors.licensePlate.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Vehicle Model</label>
                    <Input 
                        {...form.register('vehicleModel')} 
                        placeholder="e.g. Tata Ace (Small Truck)" 
                        className="h-12 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50 shadow-sm"
                    />
                    {form.formState.errors.vehicleModel && (
                        <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">
                            {form.formState.errors.vehicleModel.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-700 ml-1">Driver Name</label>
                   <Input 
                        {...form.register('driverName')} 
                        placeholder="e.g. Rahim Uddin" 
                        className="h-12 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50 shadow-sm"
                    />
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-700 ml-1">Driver Mobile</label>
                   <Input 
                        {...form.register('driverPhone')} 
                        placeholder="01XXXXXXXXX" 
                        className="h-12 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50 shadow-sm"
                    />
                </div>
            </div>

            {/* === ACTIONS === */}
            <div className="pt-2 sm:pt-4">
                <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full h-12 sm:h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold tracking-wide shadow-md active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{isEditing ? 'Saving Changes...' : 'Registering Vehicle...'}</span>
                        </div>
                    ) : (isEditing ? 'Save Changes' : 'Register Vehicle')}
                </Button>
            </div>
        </form>
    );
};
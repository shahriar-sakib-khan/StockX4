import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateVehicle, useUpdateVehicle } from '../hooks/useVehicles';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
            toast.success('Image uploaded');
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-8 p-1 sm:p-2">
             {/* Image Upload - Premium Aesthetic */}
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Vehicle Appearance</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative group shrink-0">
                        {imageUrl ? (
                            <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                                <img src={imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('imageUrl', '')}
                                        className="bg-rose-500 text-white rounded-xl p-2 hover:bg-rose-600 shadow-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center bg-slate-50 text-slate-300 hover:bg-slate-100 hover:border-indigo-200 transition-all group/upload cursor-pointer overflow-hidden">
                                <Upload size={24} className="group-hover/upload:scale-110 group-hover/upload:text-indigo-400 transition-all mb-1" />
                                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">Empty Profile</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                    </div>
                    
                    <div className="flex-1 space-y-1 sm:space-y-2 text-center sm:text-left">
                        <h4 className="font-black text-slate-800 uppercase tracking-tight text-base sm:text-lg">Identity Photo</h4>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px] sm:max-w-none">
                            {uploading ? 'Processing high-quality upload...' : 'Click or drag a clear photo of the vehicle to help staff identify it quickly.'}
                        </p>
                        {uploading && (
                             <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                                <div className="bg-indigo-500 h-full animate-progress" style={{ width: '60%' }} />
                             </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">License Plate</label>
                    <Input 
                        {...form.register('licensePlate')} 
                        placeholder="e.g. DHAKA-METRO-GA-1234" 
                        className="h-12 sm:h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/10 uppercase text-xs sm:text-sm"
                    />
                    {form.formState.errors.licensePlate && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{form.formState.errors.licensePlate.message}</p>}
                </div>

                <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle Model</label>
                    <Input 
                        {...form.register('vehicleModel')} 
                        placeholder="e.g. Tata Ace (Small Truck)" 
                        className="h-12 sm:h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/10 text-xs sm:text-sm"
                    />
                    {form.formState.errors.vehicleModel && <p className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-1">{form.formState.errors.vehicleModel.message}</p>}
                </div>

                <div className="space-y-1 sm:space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Driver Name</label>
                   <Input 
                        {...form.register('driverName')} 
                        placeholder="Full Name" 
                        className="h-12 sm:h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/10 text-xs sm:text-sm"
                    />
                </div>

                <div className="space-y-1 sm:space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Driver Mobile</label>
                   <Input 
                        {...form.register('driverPhone')} 
                        placeholder="01XXXXXXXXX" 
                        className="h-12 sm:h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/10 text-xs sm:text-sm"
                    />
                </div>
            </div>

            <div className="pt-4 sm:pt-6 border-t-2 border-slate-50">
                <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full h-14 sm:h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 text-xs sm:text-sm"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{isEditing ? 'Syncing...' : 'Registering...'}</span>
                        </div>
                    ) : (isEditing ? 'Update Vehicle Profile' : 'Confirm Registration')}
                </Button>
            </div>
        </form>
    );
};

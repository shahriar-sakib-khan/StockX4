import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateVehicle, useUpdateVehicle } from '../hooks/useVehicles';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, X } from 'lucide-react';
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             {/* Image Upload */}
             <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Vehicle Image</label>
                <div className="flex items-center gap-4">
                    {imageUrl ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => form.setValue('imageUrl', '')}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-lg border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground">
                            <Upload size={24} />
                        </div>
                    )}
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {uploading ? 'Uploading...' : 'Upload a photo of the vehicle'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium">License Plate</label>
                <Input {...form.register('licensePlate')} placeholder="e.g. DHAKA-METRO-GA-1234" />
                {form.formState.errors.licensePlate && <p className="text-red-500 text-xs">{form.formState.errors.licensePlate.message}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Vehicle Model (Optional)</label>
                <Input {...form.register('vehicleModel')} placeholder="e.g. Tata Ace" />
                {form.formState.errors.vehicleModel && <p className="text-red-500 text-xs">{form.formState.errors.vehicleModel.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Driver Name</label>
                   <Input {...form.register('driverName')} placeholder="Driver Name" />
                </div>
                <div>
                   <label className="text-sm font-medium">Driver Phone</label>
                   <Input {...form.register('driverPhone')} placeholder="017..." />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Vehicle' : 'Add Vehicle')}
                </Button>
            </div>
        </form>
    );
};

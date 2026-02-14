import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shopSchema, ShopInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateShop, useUpdateShop } from '../hooks/useShops';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, X, Store } from 'lucide-react';
import { toast } from 'sonner';

interface ShopFormProps {
    onSuccess?: () => void;
    initialData?: ShopInput & { _id?: string };
}

export const ShopForm = ({ onSuccess, initialData }: ShopFormProps) => {
    const createMutation = useCreateShop();
    const updateMutation = useUpdateShop();
    const [uploading, setUploading] = useState(false);

    // Determine if we are editing
    const isEditing = !!initialData?._id;
    const isPending = createMutation.isPending || updateMutation.isPending || uploading;

    const form = useForm<ShopInput>({
        resolver: zodResolver(shopSchema),
        defaultValues: initialData || {
            name: '',
            phone: '',
            address: '',
            ownerName: '',
            district: '',
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

    const onSubmit = (data: ShopInput) => {
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
                <label className="text-sm font-medium">Shop Image</label>
                <div className="flex items-center gap-4">
                    {imageUrl ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={imageUrl} alt="Shop" className="w-full h-full object-cover" />
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
                            <Store size={24} />
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
                            {uploading ? 'Uploading...' : 'Upload a photo of the shop'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium">Shop Name</label>
                <Input {...form.register('name')} placeholder="Enter shop name" />
                {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Phone</label>
                <Input {...form.register('phone')} placeholder="017..." />
                {form.formState.errors.phone && <p className="text-red-500 text-xs">{form.formState.errors.phone.message}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Address</label>
                <Input {...form.register('address')} placeholder="Shop address" />
                {form.formState.errors.address && <p className="text-red-500 text-xs">{form.formState.errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Owner Name (Optional)</label>
                   <Input {...form.register('ownerName')} placeholder="Owner name" />
                </div>
                <div>
                   <label className="text-sm font-medium">District (Optional)</label>
                   <Input {...form.register('district')} placeholder="District" />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Shop' : 'Create Shop')}
                </Button>
            </div>
        </form>
    );
};

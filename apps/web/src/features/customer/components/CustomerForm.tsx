import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerFormProps {
    onSuccess?: () => void;
    initialData?: CustomerInput & { _id?: string };
    defaultType?: 'retail' | 'wholesale';
}

export const CustomerForm = ({ onSuccess, initialData, defaultType = 'retail' }: CustomerFormProps) => {
    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer();
    const [uploading, setUploading] = useState(false);

    const isEditing = !!initialData?._id;
    const isPending = createMutation.isPending || updateMutation.isPending || uploading;

    const form = useForm<CustomerInput>({
        resolver: zodResolver(customerSchema),
        defaultValues: initialData || {
            name: '',
            phone: '',
            address: '',
            imageUrl: '',
            type: defaultType,
            ownerName: '',
            district: ''
        }
    });

    const imageUrl = form.watch('imageUrl');
    const formType = form.watch('type');

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

    const onSubmit = (data: CustomerInput) => {
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
            {/* Customer Type Toggle */}
            <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border items-center">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input type="radio" value="retail" {...form.register('type')} className="accent-primary" />
                    Retail Customer
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input type="radio" value="wholesale" {...form.register('type')} className="accent-primary" />
                    Wholesale (Shop)
                </label>
            </div>

             {/* Image Upload */}
             <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Customer Image</label>
                <div className="flex items-center gap-4">
                    {imageUrl ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={imageUrl} alt="Customer" className="w-full h-full object-cover" />
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
                            <User size={24} />
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
                            {uploading ? 'Uploading...' : 'Upload a photo of the customer'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium">{formType === 'wholesale' ? 'Shop Name' : 'Customer Name'}</label>
                <Input {...form.register('name')} placeholder={formType === 'wholesale' ? 'Enter shop name' : 'Enter customer name'} />
                {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
            </div>

            {formType === 'wholesale' && (
                <>
                <div>
                    <label className="text-sm font-medium">Owner Name</label>
                    <Input {...form.register('ownerName')} placeholder="Enter owner name" />
                    {form.formState.errors.ownerName && <p className="text-red-500 text-xs">{form.formState.errors.ownerName.message}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium">District</label>
                    <Input {...form.register('district')} placeholder="Enter district (e.g. Dhaka)" />
                    {form.formState.errors.district && <p className="text-red-500 text-xs">{form.formState.errors.district.message}</p>}
                </div>
                </>
            )}

            <div>
                <label className="text-sm font-medium">Phone</label>
                <Input {...form.register('phone')} placeholder="017..." />
                {form.formState.errors.phone && <p className="text-red-500 text-xs">{form.formState.errors.phone.message}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Address (Optional)</label>
                <Input {...form.register('address')} placeholder="Customer address" />
                {form.formState.errors.address && <p className="text-red-500 text-xs">{form.formState.errors.address.message}</p>}
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Customer' : 'Add Customer')}
                </Button>
            </div>
        </form>
    );
};

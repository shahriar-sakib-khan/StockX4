import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, X, User, Store } from 'lucide-react';
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Type Toggle */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 items-start sm:items-center shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:mr-2">Entity Type</span>
                <div className="flex w-full gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${formType === 'retail' ? 'bg-white border-indigo-200 text-indigo-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>
                        <input type="radio" value="retail" {...form.register('type')} className="hidden" />
                        <User className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-tight">Retail</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${formType === 'wholesale' ? 'bg-white border-sky-200 text-sky-600 shadow-md' : 'bg-slate-100 border-transparent text-slate-400'}`}>
                        <input type="radio" value="wholesale" {...form.register('type')} className="hidden" />
                        <Store className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-tight">Wholesale</span>
                    </label>
                </div>
            </div>

             {/* Image Upload */}
             <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Entity Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {imageUrl ? (
                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0 group">
                            <img src={imageUrl} alt="Customer" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => form.setValue('imageUrl', '')}
                                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-2 shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 text-slate-300 flex-shrink-0 shadow-inner">
                            <User size={40} className="mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Photo</span>
                        </div>
                    )}
                    <div className="flex-1 w-full space-y-2">
                        <div className="relative">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                id="entity-photo-upload"
                            />
                            <label 
                                htmlFor="entity-photo-upload"
                                className={`flex items-center justify-center gap-2 min-h-12 w-full sm:w-auto px-6 rounded-xl border-2 border-slate-200 bg-white font-black text-sm uppercase tracking-widest cursor-pointer hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span>{imageUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                                    </>
                                )}
                            </label>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold text-center sm:text-left">
                            Recommended: Square photo, max 2MB.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{formType === 'wholesale' ? 'Shop Name' : 'Customer Name'}</label>
                    <Input {...form.register('name')} placeholder={formType === 'wholesale' ? 'e.g. Haque Enterprise' : 'e.g. John Doe'} className="min-h-[56px] rounded-xl text-lg font-black bg-slate-50/50 border-2 border-slate-100 focus:bg-white transition-all shadow-sm px-5" />
                    {form.formState.errors.name && <p className="text-rose-500 text-[10px] font-black uppercase">{form.formState.errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <Input {...form.register('phone')} placeholder="017-XXXX-XXXX" className="min-h-[56px] rounded-xl text-lg font-black bg-slate-50/50 border-2 border-slate-100 focus:bg-white transition-all shadow-sm px-5" />
                    {form.formState.errors.phone && <p className="text-rose-500 text-[10px] font-black uppercase">{form.formState.errors.phone.message}</p>}
                </div>
            </div>

            {formType === 'wholesale' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Owner Name</label>
                        <Input {...form.register('ownerName')} placeholder="Director/Proprietor" className="min-h-[56px] rounded-xl text-lg font-black bg-slate-50/50 border-2 border-slate-100 focus:bg-white transition-all shadow-sm px-5" />
                        {form.formState.errors.ownerName && <p className="text-rose-500 text-[10px] font-black uppercase">{form.formState.errors.ownerName.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">District</label>
                        <Input {...form.register('district')} placeholder="e.g. Gazipur, Dhaka" className="min-h-[56px] rounded-xl text-lg font-black bg-slate-50/50 border-2 border-slate-100 focus:bg-white transition-all shadow-sm px-5" />
                        {form.formState.errors.district && <p className="text-rose-500 text-[10px] font-black uppercase">{form.formState.errors.district.message}</p>}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Address (Optional)</label>
                <Input {...form.register('address')} placeholder="Village, Union, Post Code..." className="min-h-[56px] rounded-xl text-lg font-black bg-slate-50/50 border-2 border-slate-100 focus:bg-white transition-all shadow-sm px-5" />
                {form.formState.errors.address && <p className="text-rose-500 text-[10px] font-black uppercase">{form.formState.errors.address.message}</p>}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <Button type="submit" disabled={isPending} className="min-h-14 sm:min-w-[200px] rounded-2xl text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    {isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                            <span>Saving...</span>
                        </>
                    ) : (isEditing ? 'Update Entity' : 'Create Entity')}
                </Button>
            </div>
        </form>
    );
};

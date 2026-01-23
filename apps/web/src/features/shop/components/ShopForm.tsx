import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shopSchema, ShopInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateShop } from '../hooks/useShops';
import { useState } from 'react';

interface ShopFormProps {
    onSuccess?: () => void;
}

export const ShopForm = ({ onSuccess }: ShopFormProps) => {
    const { mutate, isPending } = useCreateShop();
    const form = useForm<ShopInput>({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            ownerName: '',
            district: ''
        }
    });

    const onSubmit = (data: ShopInput) => {
        mutate(data, {
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    {isPending ? 'Creating...' : 'Create Shop'}
                </Button>
            </div>
        </form>
    );
};

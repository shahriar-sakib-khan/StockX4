import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateCustomer } from '../hooks/useCustomers';

interface CustomerFormProps {
    onSuccess?: () => void;
}

export const CustomerForm = ({ onSuccess }: CustomerFormProps) => {
    const { mutate, isPending } = useCreateCustomer();
    const form = useForm<CustomerInput>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: ''
        }
    });

    const onSubmit = (data: CustomerInput) => {
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
                <label className="text-sm font-medium">Customer Name</label>
                <Input {...form.register('name')} placeholder="Enter customer name" />
                {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
            </div>

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
                    {isPending ? 'Adding...' : 'Add Customer'}
                </Button>
            </div>
        </form>
    );
};

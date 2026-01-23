import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CustomerInput } from '@repo/shared';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export const useCustomers = () => {
    const { id: storeId } = useParams<{ id: string }>();

    return useQuery({
        queryKey: ['customers', storeId],
        queryFn: async () => {
            const res = await api.get('customers', { headers: { 'x-store-id': storeId } }).json<{ customers: any[] }>();
            return res.customers;
        },
        enabled: !!storeId,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (data: CustomerInput) => {
            return api.post('customers', {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
            toast.success('Customer added successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add customer');
        }
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (customerId: string) => {
            return api.delete(`customers/${customerId}`, {
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
             toast.success('Customer deleted');
        }
    });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CustomerInput } from '@repo/shared';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export const useCustomers = (storeIdOverride?: string) => {
    const { id } = useParams<{ id: string }>();
    const storeId = storeIdOverride || id;

    return useQuery({
        queryKey: ['customers', storeId],
        queryFn: async () => {
             if (!storeId) return [];
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

export const useCustomer = (customerId: string) => {
    const { id: storeId } = useParams<{ id: string }>();

    return useQuery({
        queryKey: ['customer', customerId],
        queryFn: async () => {
            if (!customerId) return null;
            const res = await api.get(`customers/${customerId}`, { headers: { 'x-store-id': storeId } }).json<{ customer: any }>();
            return res.customer;
        },
        enabled: !!customerId && !!storeId,
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CustomerInput }) => {
            return api.patch(`customers/${id}`, {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
            queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
            toast.success('Customer updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update customer');
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

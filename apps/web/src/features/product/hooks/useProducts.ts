import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductInput } from '@repo/shared';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export const useProducts = () => {
    const { id: storeId } = useParams<{ id: string }>();

    return useQuery({
        queryKey: ['products', storeId],
        queryFn: async () => {
            const res = await api.get('products', { headers: { 'x-store-id': storeId } }).json<{ products: any[] }>();
            return res.products;
        },
        enabled: !!storeId,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (data: ProductInput) => {
            return api.post('products', {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', storeId] });
            toast.success('Product added successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add product');
        }
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (productId: string) => {
            return api.delete(`products/${productId}`, {
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['products', storeId] });
             toast.success('Product deleted');
        }
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async ({ productId, data }: { productId: string; data: Partial<ProductInput> }) => {
            return api.patch(`products/${productId}`, {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['products', storeId] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update product');
        }
    });
};

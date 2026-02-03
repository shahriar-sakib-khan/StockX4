import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShopInput, shopSchema } from '@repo/shared';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export const useShops = (storeIdOverride?: string) => {
    const { id } = useParams<{ id: string }>();
    const storeId = storeIdOverride || id;

    return useQuery({
        queryKey: ['shops', storeId],
        queryFn: async () => {
            if (!storeId) return [];
            const res = await api.get('shops', { headers: { 'x-store-id': storeId } }).json<{ shops: any[] }>();
            return res.shops;
        },
        enabled: !!storeId,
    });
};

export const useCreateShop = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (data: ShopInput) => {
            return api.post('shops', {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops', storeId] });
            toast.success('Shop created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create shop');
        }
    });
};

export const useDeleteShop = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (shopId: string) => {
            return api.delete(`shops/${shopId}`, {
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['shops', storeId] });
             toast.success('Shop deleted');
        }
    });
};

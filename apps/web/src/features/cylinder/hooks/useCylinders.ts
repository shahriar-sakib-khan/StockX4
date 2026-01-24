import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cylinderApi } from '../api/cylinder.api';
import { SubscribeBrandInput, UpdateInventoryInput } from '@repo/shared';



export const useInventory = (storeId: string) => {
    return useQuery({
        queryKey: ['inventory', storeId],
        queryFn: () => cylinderApi.getInventory(storeId),
        enabled: !!storeId,
    });
};

export const useSubscribeBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: SubscribeBrandInput }) =>
            cylinderApi.subscribeBrand(storeId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

export const useSubscribeBatchBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, globalBrandIds }: { storeId: string; globalBrandIds: string[] }) =>
            cylinderApi.subscribeBatchBrand(storeId, globalBrandIds),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

export const useRemoveBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, globalBrandId }: { storeId: string; globalBrandId: string }) =>
            cylinderApi.removeBrand(storeId, globalBrandId),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

export const useUpdateInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, inventoryId, data }: { storeId: string; inventoryId: string; data: UpdateInventoryInput }) =>
            cylinderApi.updateInventory(storeId, inventoryId, data),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

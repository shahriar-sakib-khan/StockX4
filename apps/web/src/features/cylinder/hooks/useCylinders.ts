import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, storeProductApi } from '../api/cylinder.api';
import { UpdateInventoryInput } from '@repo/shared';

export const useInventory = (storeId: string) => {
    return useQuery({
        queryKey: ['inventory', storeId],
        queryFn: () => inventoryApi.getInventory(storeId),
        enabled: !!storeId,
    });
};

export const useUpdateInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: any }) =>
            inventoryApi.upsertInventory(storeId, data),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

export const useInventoryService = () => {
    const queryClient = useQueryClient();

    const upsertInventory = useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: any }) =>
            inventoryApi.upsertInventory(storeId, data),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });

    return { upsertInventory };
};

export const useAddStoveProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: any }) =>
            storeProductApi.addStove(storeId, data),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

export const useAddRegulatorProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: any }) =>
            storeProductApi.addRegulator(storeId, data),
        onSuccess: (_, variables) => {
             queryClient.invalidateQueries({ queryKey: ['inventory', variables.storeId] });
        },
    });
};

export const useSyncCylinders = () => {
     const queryClient = useQueryClient();
     return useMutation({
         mutationFn: (storeId: string) => storeProductApi.syncCylinderMatrix(storeId),
         onSuccess: (_, storeId) => {
              queryClient.invalidateQueries({ queryKey: ['inventory', storeId] });
         },
     });
};

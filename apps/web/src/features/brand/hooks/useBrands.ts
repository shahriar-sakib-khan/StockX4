import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';
import { GlobalBrandInput } from '@repo/shared';

// --- Global Brands (master catalog, cylinder-only) ---

export const useGlobalBrands = () => {
    return useQuery({
        queryKey: ['global-brands'],
        queryFn: brandApi.getGlobalBrands,
        staleTime: 1000 * 60 * 60, // 1 hour — rarely changes
    });
};

export const useCreateGlobalBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => brandApi.createGlobalBrand(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['global-brands'] }),
    });
};

export const useUpdateGlobalBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => brandApi.updateGlobalBrand(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['global-brands'] }),
    });
};

export const useDeleteGlobalBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => brandApi.deleteGlobalBrand(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['global-brands'] }),
    });
};

// --- Store Brands (per-store, populated from GlobalBrand at query time) ---

export const useStoreBrands = (storeId?: string) => {
    return useQuery({
        queryKey: ['store-brands', storeId],
        queryFn: () => brandApi.getStoreBrands(storeId!),
        enabled: !!storeId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useAddStoreBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, globalBrandId }: { storeId: string; globalBrandId: string }) =>
            brandApi.addStoreBrand(storeId, globalBrandId),
        onSuccess: (_, { storeId }) => queryClient.invalidateQueries({ queryKey: ['store-brands', storeId] }),
    });
};

export const useCreateCustomBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: any }) =>
            brandApi.createCustomBrand(storeId, data),
        onSuccess: (_, { storeId }) => queryClient.invalidateQueries({ queryKey: ['store-brands', storeId] }),
    });
};

export const useDeleteStoreBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, id }: { storeId: string; id: string }) =>
            brandApi.deleteStoreBrand(storeId, id),
        onSuccess: (_, { storeId }) => queryClient.invalidateQueries({ queryKey: ['store-brands', storeId] }),
    });
};

export const useUpdateStoreBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, id, data }: { storeId: string; id: string; data: any }) =>
            brandApi.updateStoreBrand(storeId, id, data),
        onSuccess: (_, { storeId }) => queryClient.invalidateQueries({ queryKey: ['store-brands', storeId] }),
    });
};

// Bulk toggle which GlobalBrands are active for a store
// Custom brands are NOT managed here — they always stay active once created
export const useUpdateStoreBrandsBulk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, globalBrandIds }: { storeId: string; globalBrandIds: string[] }) =>
            brandApi.updateStoreBrandsBulk(storeId, globalBrandIds),
        onSuccess: (_, { storeId }) => {
            queryClient.invalidateQueries({ queryKey: ['store-brands', storeId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', storeId] });
        },
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: (file: File) => brandApi.uploadImage(file),
    });
};

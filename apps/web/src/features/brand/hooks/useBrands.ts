import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';
import { GlobalBrandInput } from '@repo/shared';

// --- Unified Brands Hook ---
export const useBrands = (storeId?: string) => {
    const globalQuery = useGlobalBrands();
    const storeQuery = useStoreBrands(storeId);

    const isLoading = globalQuery.isLoading || storeQuery.isLoading;
    const isError = globalQuery.isError || storeQuery.isError;

    // Merge logic:
    // 1. Start with Global Brands (Master List)
    // 2. Add Custom Brands from Store Brands (those with isCustom: true)
    // 3. Mark which Global Brands are "active" in the store (isExisting)

    const globalBrands = globalQuery.data?.brands || [];
    const storeBrands = storeQuery.data?.brands || [];

    const customBrands = storeBrands.filter((b: any) => b.isCustom);

    // Combine: Global + Custom
    // Note: This gives a "Master Catalog" view where Custom brands appear effectively as new Global brands for this user.
    const combinedBrands = [...globalBrands, ...customBrands];

    // Create a set of "Active" brand IDs from the store for easy lookup
    // This is useful if the UI needs to know what is already enabled.
    // However, the UI typically passes `existingBrandIds` itself.

    return {
        data: { brands: combinedBrands },
        isLoading,
        isError,
        refetch: () => { globalQuery.refetch(); storeQuery.refetch(); }
    };
};

export const useStoreBrands = (storeId?: string) => {
    return useQuery({
        queryKey: ['store-brands', storeId],
        queryFn: () => storeId ? brandApi.getStoreBrands(storeId) : Promise.resolve({ brands: [] }),
        enabled: !!storeId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useAddStoreBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, globalBrandId }: { storeId: string; globalBrandId: string }) =>
            brandApi.addStoreBrand(storeId, globalBrandId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['store-brands', variables.storeId] });
        },
    });
};

export const useCreateCustomBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string; data: any }) =>
            brandApi.createCustomBrand(storeId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['store-brands', variables.storeId] });
        },
    });
};

export const useDeleteStoreBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, id }: { storeId: string; id: string }) =>
            brandApi.deleteStoreBrand(storeId, id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['store-brands', variables.storeId] });
        },
    });
};

export const useUpdateStoreBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, id, data }: { storeId: string; id: string; data: any }) =>
            brandApi.updateStoreBrand(storeId, id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['store-brands', variables.storeId] });
        },
    });
};

export const useUpdateStoreBrandsBulk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, globalBrandIds, customBrandIds }: { storeId: string; globalBrandIds: string[]; customBrandIds: string[] }) =>
            brandApi.updateStoreBrandsBulk(storeId, globalBrandIds, customBrandIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['store-brands', variables.storeId] });
        },
    });
};

export const useGlobalBrands = () => {
    return useQuery({
        queryKey: ['global-brands'],
        queryFn: brandApi.getGlobalBrands,
        staleTime: 1000 * 60 * 60, // 1 hour (Master data changes rarely)
    });
};

export const useCreateGlobalBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => brandApi.createGlobalBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-brands'] });
        },
    });
};

export const useUpdateGlobalBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => brandApi.updateGlobalBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-brands'] });
        },
    });
};

export const useDeleteGlobalBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => brandApi.deleteGlobalBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-brands'] });
        },
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: (file: File) => brandApi.uploadImage(file),
    });
};

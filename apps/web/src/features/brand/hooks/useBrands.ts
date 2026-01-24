import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';
import { GlobalBrandInput } from '@repo/shared';

export const useBrands = () => {
    return useQuery({
        queryKey: ['brands'],
        queryFn: brandApi.getBrands,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: GlobalBrandInput) => brandApi.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useUpdateBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: GlobalBrandInput }) => brandApi.updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useDeleteBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => brandApi.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: (file: File) => brandApi.uploadImage(file),
    });
};

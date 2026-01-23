import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../api/staff.api';
import { CreateStaffInput } from '@repo/shared';

export const useStaffList = (storeId: string) => {
  return useQuery({
    queryKey: ['staff', storeId],
    queryFn: () => staffApi.list(storeId),
    enabled: !!storeId,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: CreateStaffInput }) => staffApi.create(storeId, data),
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['staff', variables.storeId] });
    },
  });
};

export const useUpdateStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, staffId, data }: { storeId: string; staffId: string; data: Partial<CreateStaffInput> }) =>
            staffApi.update(storeId, staffId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['staff', variables.storeId] });
        },
    });
};

export const useDeleteStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, staffId }: { storeId: string; staffId: string }) => staffApi.delete(storeId, staffId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['staff', variables.storeId] });
        },
    });
};

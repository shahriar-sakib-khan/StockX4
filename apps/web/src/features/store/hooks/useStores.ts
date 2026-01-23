import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '../api/store.api';
import { CreateStoreInput, UpdateStoreInput } from '@repo/shared';

export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: storeApi.list,
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: ['stores', id],
    queryFn: () => storeApi.get(id),
    enabled: !!id,
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreInput) => storeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreInput }) => storeApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores', data.store._id] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

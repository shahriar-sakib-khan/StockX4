import { api } from '@/lib/api';
import { CreateStoreInput, UpdateStoreInput, SetupStoreInput } from '@repo/shared';

export const storeApi = {
  list: async () => {
    return api.get('stores').json<{ stores: any[] }>(); // Use strict types if available
  },

  setup: async (data: SetupStoreInput) => {
    return api.post('stores/setup', { json: data }).json<{ store: any }>();
  },

  create: async (data: CreateStoreInput) => {
    return api.post('stores', { json: data }).json<{ store: any }>();
  },

  get: async (id: string) => {
    return api.get(`stores/${id}`).json<{ store: any }>();
  },

  update: async (id: string, data: UpdateStoreInput & { cylinderSizes?: string[] }) => {
    return api.put(`stores/${id}`, { json: data }).json<{ store: any }>();
  },

  delete: async (id: string) => {
    return api.delete(`stores/${id}`).json();
  }
};

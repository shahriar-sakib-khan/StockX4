import { api } from '@/lib/api';
import { CreateStaffInput } from '@repo/shared';

export const staffApi = {
  login: async (data: { storeId: string; contact: string; password: string }) => {
    return api.post('staff/login', { json: data }).json<{ staff: any; accessToken: string }>();
  },

  list: async (storeId: string) => {
    return api.get(`stores/${storeId}/staff`).json<{ staff: any[] }>();
  },

  create: async (storeId: string, data: CreateStaffInput) => {
    return api.post(`stores/${storeId}/staff`, { json: data }).json<{ staff: any }>();
  },

  update: async (storeId: string, staffDocId: string, data: Partial<CreateStaffInput>) => {
    return api.patch(`stores/${storeId}/staff/${staffDocId}`, { json: data }).json<{ staff: any }>();
  },

  delete: async (storeId: string, staffDocId: string) => {
    return api.delete(`stores/${storeId}/staff/${staffDocId}`).json<{ success: boolean }>();
  },
};

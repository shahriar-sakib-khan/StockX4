import { api } from '@/lib/api';
import { CreateStaffInput } from '@repo/shared';

export const staffApi = {
  login: async (data: any) => {
      return api.post('staff/login', { json: data }).json<{ staff: any; accessToken: string }>(); // staff is optional for owner login via other means, but this is staff login
  },

  list: async (storeId: string) => {
    return api.get(`stores/${storeId}/staff`).json<{ staff: any[] }>();
  },

  create: async (storeId: string, data: CreateStaffInput) => {
    return api.post(`stores/${storeId}/staff`, { json: data }).json<{ staff: any }>();
  },

  update: async (storeId: string, staffId: string, data: Partial<CreateStaffInput>) => {
    return api.patch(`stores/${storeId}/staff/${staffId}`, { json: data }).json<{ staff: any }>();
  },

  delete: async (storeId: string, staffId: string) => {
    return api.delete(`stores/${storeId}/staff/${staffId}`).json<{ success: boolean }>();
  }
};

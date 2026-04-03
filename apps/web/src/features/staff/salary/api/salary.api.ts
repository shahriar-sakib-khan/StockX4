import { api } from '@/lib/api';

export interface PaySalaryData {
  amount: number;
  bonusAmount?: number;
  bonusNote?: string;
  paymentMethod?: 'CASH' | 'DIGITAL';
}

export interface SalaryHistoryResponse {
  data: any[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const salaryApi = {
  pay: async (storeId: string, staffId: string, data: PaySalaryData) => {
    return api
      .post(`stores/${storeId}/staff/${staffId}/salary/pay`, { json: data })
      .json<{ transaction: any }>();
  },

  getHistory: async (
    storeId: string,
    staffId: string,
    params: { page?: number; limit?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    return api
      .get(`stores/${storeId}/staff/${staffId}/salary/history?${searchParams.toString()}`)
      .json<SalaryHistoryResponse>();
  },

  processAccruals: async (storeId: string, staffId: string) => {
    return api
      .post(`stores/${storeId}/staff/${staffId}/salary/accrue`)
      .json<{ success: boolean }>();
  },
};

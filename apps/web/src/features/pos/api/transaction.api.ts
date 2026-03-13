import { api } from '@/lib/api';
import { CreateTransactionInput } from '@repo/shared';

export const transactionApi = {
    create: async (storeId: string, data: CreateTransactionInput) => {
        return api.post('transactions', {
            json: data,
            headers: { 'x-store-id': storeId }
        }).json<any>();
    },

    getHistory: async (storeId: string, params: any = {}) => {
         // Filter out undefined/null/empty params
         const searchParams = new URLSearchParams();
         Object.keys(params).forEach(key => {
             if (params[key]) searchParams.append(key, params[key]);
         });

    return api.get(`transactions?${searchParams.toString()}`, {
            headers: { 'x-store-id': storeId }
        }).json<{ data: any[], meta: any }>();
    },

    getSummary: async (storeId: string, params: any = {}) => {
         const searchParams = new URLSearchParams();
         Object.keys(params).forEach(key => {
             if (params[key]) searchParams.append(key, params[key]);
         });

         return api.get(`transactions/summary?${searchParams.toString()}`, {
             headers: { 'x-store-id': storeId }
         }).json<any>();
    }
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useTransactions = (storeId: string, params: any) => {
    return useQuery({
        queryKey: ['transactions', storeId, params],
        queryFn: () => transactionApi.getHistory(storeId, params),
        enabled: !!storeId,
    });
};

export const useTransactionSummary = (storeId: string, params: any) => {
    return useQuery({
        queryKey: ['transaction-summary', storeId, params],
        queryFn: () => transactionApi.getSummary(storeId, params),
        enabled: !!storeId,
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeId, data }: { storeId: string, data: CreateTransactionInput }) =>
            transactionApi.create(storeId, data),
        onSuccess: (_, { storeId }) => {
            queryClient.invalidateQueries({ queryKey: ['transactions', storeId] });
            queryClient.invalidateQueries({ queryKey: ['transaction-summary', storeId] });
            queryClient.invalidateQueries({ queryKey: ['customers', storeId] }); // Important for due counts
            queryClient.invalidateQueries({ queryKey: ['products', storeId] }); // Important for inventory UI matching backend
            queryClient.invalidateQueries({ queryKey: ['inventory', storeId] }); // Added for auto-refresh
        },
        onError: (error: any) => {
            toast.error(error.message || 'Transaction failed');
        }
    });
};

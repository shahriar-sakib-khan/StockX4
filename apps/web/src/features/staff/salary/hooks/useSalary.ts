import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryApi, PaySalaryData } from '../api/salary.api';
import { toast } from 'sonner';

export const usePaySalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      storeId,
      staffId,
      data,
    }: {
      storeId: string;
      staffId: string;
      data: PaySalaryData;
    }) => salaryApi.pay(storeId, staffId, data),
    onSuccess: (_, variables) => {
      toast.success('Salary payment processed');
      // Refresh staff list so salaryDue is updated
      queryClient.invalidateQueries({ queryKey: ['staff', variables.storeId] });
      // Refresh salary history if open
      queryClient.invalidateQueries({
        queryKey: ['salary-history', variables.storeId, variables.staffId],
      });
      // Refresh transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary', variables.storeId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Salary payment failed');
    },
  });
};

export const useSalaryHistory = (storeId: string, staffId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['salary-history', storeId, staffId, params],
    queryFn: () => salaryApi.getHistory(storeId, staffId, params),
    enabled: !!storeId && !!staffId,
  });
};

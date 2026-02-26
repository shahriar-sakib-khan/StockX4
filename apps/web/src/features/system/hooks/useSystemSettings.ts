import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useSystemSettings = <T,>(key: string, defaultValue?: T) => {
  return useQuery({
    queryKey: ['system', 'settings', key],
    queryFn: async () => {
      try {
        const res = await api.get(`system/settings/${key}`).json<{ key: string; value: T }>();
        return res.value;
      } catch (err: any) {
        // If not found or API fails, fallback to default value
        if (err?.response?.status === 404 && defaultValue !== undefined) {
          return defaultValue;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // global settings rarely change, cache for 1 hour
    retry: 1, // Only retry once to avoid freezing the UI on fail
  });
};

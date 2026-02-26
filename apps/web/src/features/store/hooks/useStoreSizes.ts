import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { storeApi } from '@/features/store/api/store.api';
import { useSystemSettings } from '@/features/system/hooks/useSystemSettings';

export const parseSizeKg = (size: string): number => {
  const n = parseFloat(size.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

export const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => parseSizeKg(a) - parseSizeKg(b));

export const useStoreSizes = (storeId: string | null | undefined) => {
  const { data: globalSizes = ['12kg'] } = useSystemSettings<string[]>('DEFAULT_CYLINDER_SIZES');

  const { data, isLoading: storeLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storeApi.get(storeId!),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const storeSizesStr = JSON.stringify((data?.store as any)?.cylinderSizes || []);
  const archivedSizesStr = JSON.stringify((data?.store as any)?.archivedCylinderSizes || []);
  const globalSizesStr = JSON.stringify(globalSizes || []);

  const sizes: string[] = useMemo(() => sortSizes(
    (data?.store as any)?.cylinderSizes?.length
      ? (data?.store as any).cylinderSizes
      : globalSizes
  ), [storeSizesStr, globalSizesStr]);

  const archivedSizes: string[] = useMemo(() => sortSizes(
    (data?.store as any)?.archivedCylinderSizes || []
  ), [archivedSizesStr]);

  return { sizes, archivedSizes, isLoading: storeLoading };
};

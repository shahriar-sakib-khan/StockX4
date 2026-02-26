import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface GlobalProductTemplate {
  _id: string;
  key: string;
  name: string;
  type: 'stove' | 'regulator';
  burnerCount?: '1' | '2' | '3' | '4';
  size?: '22mm' | '20mm';
  image: string; // Cloudinary URL
}

export const useGlobalProducts = () => {
  return useQuery({
    queryKey: ['catalog', 'global-products'],
    queryFn: async () => {
      const res = await api.get('products/catalog').json<{ products: GlobalProductTemplate[] }>();
      return res.products;
    },
    staleTime: 1000 * 60 * 5, // 5 min — catalog rarely changes but changes should reflect quickly
  });
};

/** Returns a stable lookup: burnerCount → Cloudinary image URL (for stoves) */
export const useStoveImages = () => {
  const { data } = useGlobalProducts();
  return useMemo(() => {
    const map: Record<string, string> = {};
    if (data) {
      data.filter(p => p.type === 'stove').forEach(p => {
        if (p.burnerCount) map[p.burnerCount] = p.image;
      });
    }
    return map;
  }, [data]);
};

/** Returns a stable lookup: regulatorType → Cloudinary image URL (for regulators) */
export const useRegulatorImages = () => {
  const { data } = useGlobalProducts();
  return useMemo(() => {
    const map: Record<string, string> = {};
    if (data) {
      data.filter(p => p.type === 'regulator').forEach(p => {
        const regType = (p as any).regulatorType || p.size;
        if (regType) map[regType] = p.image;
      });
    }
    return map;
  }, [data]);
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PosState } from './pos.types';
import { createCartSlice } from './slices/cart.slice';
import { createFilterSlice } from './slices/filter.slice';
import { createSettingsSlice } from './slices/settings.slice';

export * from './pos.types';

export const usePosStore = create<PosState>()(
  persist(
    (set, get, api) => ({
      ...createCartSlice(set, get, api),
      ...createFilterSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
    }),
    {
      name: 'pos-storage',
      partialize: (state) => {
        // Exclude UI state and modes that should reset on sessions
        const { mode, activeCategory, transactionMode, ...rest } = state;
        return rest;
      },
    }
  )
);

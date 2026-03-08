import { StateCreator } from 'zustand';
import { PosState, PosSettingsSlice, PosMode } from '../pos.types';

export const createSettingsSlice: StateCreator<PosState, [], [], PosSettingsSlice> = (set, get) => ({
  mode: 'REFILL',
  transactionMode: 'wholesale',
  activeWindow: 'SELLING',
  customer: null,
  isDueModalOpen: false,

  setMode: (mode: PosMode) => {
    set({ mode });
    get().syncPrices();
  },
  setTransactionMode: (mode: 'retail' | 'wholesale') => {
    set({ transactionMode: mode });
    get().syncPrices();
  },
  setActiveWindow: (window: 'SELLING' | 'RETURN') => set({ activeWindow: window }),
  setCustomer: (customer) => set({ customer }),
  setAllocatedDueCylinders: (dueCylinders) => set({ allocatedDueCylinders: dueCylinders }),
  setSettledDueCylinders: (dueCylinders) => set({ settledDueCylinders: dueCylinders }),
  setDueModalOpen: (open: boolean) => set({ isDueModalOpen: open }),
});

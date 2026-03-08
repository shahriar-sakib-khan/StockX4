import { StateCreator } from 'zustand';
import { PosState, PosFilterSlice } from '../pos.types';

export const createFilterSlice: StateCreator<PosState, [], [], PosFilterSlice> = (set) => ({
  filterSearch: '',
  filterSize: '12kg',
  filterRegulator: '22mm',
  filterBurner: 'all',
  activeCategory: 'cylinder',

  setActiveCategory: (val) => set({ activeCategory: val }),
  setFilterSearch: (val) => set({ filterSearch: val }),
  setFilterSize: (val) => set({ filterSize: val }),
  setFilterRegulator: (val) => set({ filterRegulator: val }),
  setFilterBurner: (val) => set({ filterBurner: val }),
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StaffUser {
  _id: string;
  name: string;
  role: string;
  storeId: string;
}

interface StaffAuthState {
  staff: StaffUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (staff: StaffUser, token: string) => void;
  clearAuth: () => void;
}

export const useStaffStore = create<StaffAuthState>()(
  persist(
    (set) => ({
      staff: null,
      token: null,
      isAuthenticated: false,
      setAuth: (staff, token) => set({ staff, token, isAuthenticated: true }),
      clearAuth: () => set({ staff: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'staff-auth-storage',
    }
  )
);

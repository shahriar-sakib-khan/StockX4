export type PosMode = 'PACKAGED' | 'REFILL' | 'EMPTY';

export interface PosItem {
  productId: string;
  name: string;
  type: 'CYLINDER' | 'ACCESSORY' | 'EXPENSE' | 'REFILL' | 'EMPTY' | 'PACKAGED' | 'SERVICE' | 'FUEL' | 'REPAIR' | 'REFUND';
  category: 'cylinder' | 'stove' | 'regulator' | 'expense';
  saleType?: 'PACKAGED' | 'REFILL' | 'RETURN' | 'DUE';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  description?: string;
  image?: string;
  color?: string;
  size?: string;
  regulator?: string;
  isDue?: boolean;
  isSettled?: boolean;
  burners?: number;
  prices?: any;
}

export interface AllocatedDue {
  productId: string;
  brandName: string;
  maxQty: number;
  selectedQty: number;
  image?: string;
  size?: string;
  regulator?: string;
}

export interface PosCartSlice {
  saleItems: PosItem[];
  returnItems: PosItem[];
  allocatedDueCylinders: AllocatedDue[];
  settledDueCylinders: AllocatedDue[];
  mismatchCount: number;

  addItem: (product: any, qty: number) => void;
  updateQuantity: (productId: string, delta: number, list: 'SALE' | 'RETURN', saleType?: string) => void;
  setQuantity: (productId: string, qty: number, list: 'SALE' | 'RETURN', saleType?: string) => void;
  removeItem: (productId: string, list: 'SALE' | 'RETURN') => void;
  removeItemSpecific: (productId: string, list: 'SALE' | 'RETURN', saleType?: string) => void;
  clearCart: () => void;
  calculateMismatch: () => number;
  syncPrices: () => void;
  getTotals: () => { saleTotal: number; returnTotal: number; netTotal: number };
  getIsBalanced: () => boolean;
}

export interface PosFilterSlice {
  filterSearch: string;
  filterSize: string;
  filterRegulator: string;
  filterBurner: string;
  activeCategory: 'cylinder' | 'stove' | 'regulator';

  setActiveCategory: (val: 'cylinder' | 'stove' | 'regulator') => void;
  setFilterSearch: (val: string) => void;
  setFilterSize: (val: string) => void;
  setFilterRegulator: (val: string) => void;
  setFilterBurner: (val: string) => void;
}

export interface PosSettingsSlice {
  mode: PosMode;
  transactionMode: 'retail' | 'wholesale';
  activeWindow: 'SELLING' | 'RETURN';
  customer: { id: string; name: string; type: 'Customer' | 'Shop' | 'Vehicle'; phone?: string; address?: string } | null;
  isDueModalOpen: boolean;

  setMode: (mode: PosMode) => void;
  setTransactionMode: (mode: 'retail' | 'wholesale') => void;
  setActiveWindow: (window: 'SELLING' | 'RETURN') => void;
  setCustomer: (customer: { id: string; name: string; type: 'Customer' | 'Shop'; phone?: string; address?: string } | null) => void;
  setAllocatedDueCylinders: (dueCylinders: AllocatedDue[]) => void;
  setSettledDueCylinders: (dueCylinders: AllocatedDue[]) => void;
  setDueModalOpen: (open: boolean) => void;
}

export interface PosState extends PosCartSlice, PosFilterSlice, PosSettingsSlice {}

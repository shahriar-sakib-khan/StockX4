import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PosMode = 'PACKAGED' | 'REFILL' | 'EMPTY';

export interface PosItem {
  productId: string;
  name: string;
  type: 'CYLINDER' | 'ACCESSORY';
  category: 'cylinder' | 'stove' | 'regulator';
  saleType?: 'PACKAGED' | 'REFILL'; // Distinguish between refill and full package sales
  quantity: number;
  unitPrice: number;
  subtotal: number;
  description?: string;
  image?: string;
  color?: string;
  size?: string;
  regulator?: string;
}

interface PosState {
  mode: PosMode;
  activeWindow: 'SELLING' | 'RETURNED';
  saleItems: PosItem[];
  returnItems: PosItem[];
  customer: { id: string; name: string; type: 'Customer' | 'Shop' } | null;

  // Global Filters (Lifted from component)
  filterSearch: string;
  filterSize: string;
  filterRegulator: string;
  filterBurner: string; // New filter for stoves
  activeCategory: 'cylinder' | 'stove' | 'regulator';

  // Actions
  setMode: (mode: PosMode) => void;
  setActiveWindow: (window: 'SELLING' | 'RETURNED') => void;
  setCustomer: (customer: { id: string; name: string; type: 'Customer' | 'Shop' } | null) => void;
  addItem: (product: any, quantity: number) => void;
  updateQuantity: (productId: string, delta: number, listType: 'SALE' | 'RETURN', saleType?: 'PACKAGED' | 'REFILL') => void;
  removeItemSpecific: (productId: string, listType: 'SALE' | 'RETURN', saleType?: 'PACKAGED' | 'REFILL') => void;
  clearCart: () => void;

  // Filter Actions
  setFilterSearch: (val: string) => void;
  setFilterSize: (val: string) => void;
  setFilterRegulator: (val: string) => void;
  setFilterBurner: (val: string) => void;
  setActiveCategory: (val: 'cylinder' | 'stove' | 'regulator') => void;

  // Computed
  getTotals: () => { saleTotal: number; returnTotal: number; netTotal: number };
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      mode: 'REFILL',
      activeWindow: 'SELLING',
      saleItems: [],
      returnItems: [],
      customer: null,

      filterSearch: '',
      filterSize: '12kg', // Default as requested
      filterRegulator: '22mm', // Default as requested
      filterBurner: 'all', // Default
      activeCategory: 'cylinder',

      setMode: (mode) => set({ mode }),
      setActiveWindow: (window) => set({ activeWindow: window }),
      setFilterSearch: (filterSearch) => set({ filterSearch }),
      setFilterSize: (filterSize) => set({ filterSize }),
      setFilterRegulator: (filterRegulator) => set({ filterRegulator }),
      setFilterBurner: (filterBurner) => set({ filterBurner }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),

      addItem: (product, quantity) => {
        const { mode, saleItems } = get();

        // Helper to add/update item
        const updateList = (list: PosItem[], price: number, itemSaleType?: 'PACKAGED' | 'REFILL'): PosItem[] => {
             // We must match productId AND saleType (if applicable) to merge
             const existingItemIndex = list.findIndex(item =>
                item.productId === product._id && item.saleType === itemSaleType
             );

             let updated = [...list];

             if (existingItemIndex > -1) {
                  updated[existingItemIndex].quantity += quantity;
                  updated[existingItemIndex].subtotal = updated[existingItemIndex].quantity * price;
                  if (updated[existingItemIndex].quantity <= 0) {
                      updated = updated.filter((_, i) => i !== existingItemIndex);
                  }
             } else {
                 if (quantity <= 0) return list;

                 // Determine description based on category
                 let desc = '';
                 if (product.category === 'cylinder') desc = `${product.variant?.size}`;
                 else if (product.category === 'stove') desc = `${product.variant?.burners} Burner`;
                 else if (product.category === 'regulator') desc = `${product.variant?.regulator}`;

                 updated.push({
                     productId: product._id,
                     name: product.brandName,
                     type: product.category === 'cylinder' ? 'CYLINDER' : 'ACCESSORY',
                     category: product.category || 'cylinder',
                     saleType: itemSaleType,
                     quantity: quantity,
                     unitPrice: price,
                     subtotal: quantity * price,
                     description: desc,
                     image: product.variant?.cylinderImage || product.image,
                     color: product.variant?.cylinderColor || product.color,
                     size: product.variant?.size,
                     regulator: product.variant?.regulator
                 });
             }
             return updated;
        };

        const { category } = product;

        if (category === 'stove' || category === 'regulator') {
            const price = product.prices?.accessoryPrice || 0;
            set({ saleItems: updateList(saleItems, price) }); // No saleType for accessories
        } else {
            // Cylinder Logic (Full / Refill)
            // ... existing cylinder logic ...
            const { returnItems } = get();
            let newSaleItems = [...saleItems];
            let newReturnItems = [...returnItems];

            if (mode === 'PACKAGED') {
                const price = product.prices?.fullCylinder || 0;
                newSaleItems = updateList(newSaleItems, price, 'PACKAGED');
            } else if (mode === 'REFILL') {
                const gasPrice = product.prices?.gasOnly || 0;
                newSaleItems = updateList(newSaleItems, gasPrice, 'REFILL');

                // Handle Empty Return logic (Refill implies exchange)
                const existingReturnIndex = newReturnItems.findIndex(i => i.productId === product._id);
                if (existingReturnIndex > -1) {
                    newReturnItems[existingReturnIndex].quantity += quantity;
                    // subtotal 0
                } else {
                    newReturnItems.push({
                        productId: product._id,
                        name: product.brandName,
                        type: 'CYLINDER',
                        category: 'cylinder',
                        quantity,
                        unitPrice: 0,
                        subtotal: 0,
                        description: 'Empty Return',
                        image: product.variant?.cylinderImage || product.image,
                        color: product.variant?.cylinderColor || product.color,
                        size: product.variant?.size,
                        regulator: product.variant?.regulator
                    });
                }
            } else if (mode === 'EMPTY') {
                // Empty Mode: Only add to Return Items (Empty Return), no Sale Item
                const existingReturnIndex = newReturnItems.findIndex(i => i.productId === product._id);
                if (existingReturnIndex > -1) {
                    newReturnItems[existingReturnIndex].quantity += quantity;
                } else {
                     newReturnItems.push({
                        productId: product._id,
                        name: product.brandName,
                        type: 'CYLINDER',
                        category: 'cylinder',
                        quantity,
                        unitPrice: 0,
                        subtotal: 0,
                        description: 'Empty Return',
                        image: product.variant?.cylinderImage || product.image,
                        color: product.variant?.cylinderColor || product.color,
                        size: product.variant?.size,
                        regulator: product.variant?.regulator
                    });
                }
            }
            set({ saleItems: newSaleItems, returnItems: newReturnItems });
        }
      },

      setCustomer: (customer) => set({ customer }),

      updateQuantity: (productId, delta, listType, saleType) => {
          const { saleItems, returnItems } = get();

          if (listType === 'SALE') {
              const updated = saleItems.map(item => {
                  if (item.productId === productId && item.saleType === saleType) {
                      const newQty = item.quantity + delta;
                      return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
                  }
                  return item;
              }).filter(item => item.quantity > 0);
              set({ saleItems: updated });
          } else {
              const updated = returnItems.map(item => {
                  if (item.productId === productId) { // Return items don't have saleType distinction usually
                      const newQty = item.quantity + delta;
                      return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
                  }
                  return item;
              }).filter(item => item.quantity > 0);
              set({ returnItems: updated });
          }
      },

      removeItemSpecific: (productId, listType, saleType) => {
          set((state) => ({
              saleItems: listType === 'SALE'
                ? state.saleItems.filter(i => !(i.productId === productId && i.saleType === saleType))
                : state.saleItems,
              returnItems: listType === 'RETURN'
                ? state.returnItems.filter(i => i.productId !== productId)
                : state.returnItems
          }));
      },

      clearCart: () => set({ saleItems: [], returnItems: [], mode: 'REFILL', customer: null }),

      getTotals: () => {
        const { saleItems, returnItems } = get();
        const saleTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
        const returnTotal = returnItems.reduce((sum, item) => sum + item.subtotal, 0);
        return { saleTotal, returnTotal, netTotal: saleTotal - returnTotal };
      }
    }),
    {
      name: 'pos-storage',
    }
  )
);

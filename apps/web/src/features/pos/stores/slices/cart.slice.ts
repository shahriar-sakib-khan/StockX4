import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { PosState, PosCartSlice } from '../pos.types';

export const createCartSlice: StateCreator<PosState, [], [], PosCartSlice> = (set, get) => ({
  saleItems: [],
  returnItems: [],
  allocatedDueCylinders: [],
  settledDueCylinders: [],
  mismatchCount: 0,

  addItem: (product, qty) => {
    const { mode, saleItems, returnItems, transactionMode } = get();
    const isReturn = mode === 'EMPTY';

    if (isReturn) {
      if (product.category === 'stove' || product.category === 'regulator') {
        toast.info("Accessories can only be sold. Switching to selling mode.");
        set({ mode: 'PACKAGED' }); // Switch to a sale mode
        get().addItem(product, qty); // Recursively call with the new mode
        return;
      }

      const refillTotal = saleItems.filter(i => i.saleType === 'REFILL').reduce((sum, i) => sum + i.quantity, 0);
      const returnTotal = returnItems.reduce((sum, i) => sum + i.quantity, 0);

      if (returnTotal + qty > refillTotal) {
        toast.error(`Limit exceeded: You can return maximal ${refillTotal} cylinders.`);
        return;
      }

      const existing = returnItems.find((i) => i.productId === product.productId || i.productId === product._id);
      if (existing) {
        set({
          returnItems: returnItems.map((i) =>
            (i.productId === product.productId || i.productId === product._id)
            ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.unitPrice }
            : i
          ),
        });
      } else {
        set({
          returnItems: [
            ...returnItems,
            {
              productId: product.productId || product._id,
              name: product.name || product.brandName,
              type: 'CYLINDER',
              category: 'cylinder',
              quantity: qty,
              unitPrice: 0,
              subtotal: 0,
              image: product.image || product.variant?.cylinderImage,
              color: product.color || product.variant?.cylinderColor,
              size: product.size || product.variant?.size,
              regulator: product.regulator || product.variant?.regulator,
            },
          ],
        });
      }
    } else {
       const { category } = product;
       if (category === 'stove' || category === 'regulator') {
           const price = transactionMode === 'wholesale'
                ? (product.prices?.wholesalePriceFull || product.prices?.accessoryPrice || 0)
                : (product.prices?.retailPriceFull || product.prices?.accessoryPrice || 0);

           const existing = saleItems.find(i => i.productId === product._id);
           if (existing) {
                set({
                    saleItems: saleItems.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.unitPrice } : i)
                });
           } else {
                set({
                    saleItems: [...saleItems, {
                        productId: product.productId || product._id,
                        name: product.name || product.brandName,
                        type: 'ACCESSORY',
                        category: product.category,
                        quantity: qty,
                        unitPrice: price,
                        subtotal: qty * price,
                        image: product.image,
                        size: product.variant?.size,
                        regulator: product.variant?.regulator,
                        prices: product.prices,
                        burners: product.variant?.burners || product.burnerCount
                    }]
                });
           }
       } else {
           const saleType = mode as any;
           const price = mode === 'PACKAGED'
            ? (transactionMode === 'wholesale' ? product.prices?.wholesalePriceFull : product.prices?.retailPriceFull)
            : (transactionMode === 'wholesale' ? product.prices?.wholesalePriceGas : product.prices?.retailPriceGas);

           const existing = saleItems.find((i) => (i.productId === product.productId || i.productId === product._id) && i.saleType === saleType);
           if (existing) {
             set({
               saleItems: saleItems.map((i) =>
                 (i.productId === product.productId || i.productId === product._id) && i.saleType === saleType
                   ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * (price || 0) }
                   : i
               ),
             });
           } else {
             set({
               saleItems: [
                 ...saleItems,
                 {
                   productId: product.productId || product._id,
                   name: product.name || product.brandName,
                   type: 'CYLINDER',
                   category: 'cylinder',
                   saleType,
                   quantity: qty,
                   unitPrice: price || 0,
                   subtotal: qty * (price || 0),
                   image: product.image || product.variant?.cylinderImage,
                   color: product.color || product.variant?.cylinderColor,
                   size: product.size || product.variant?.size,
                   regulator: product.regulator || product.variant?.regulator,
                   prices: product.prices
                 },
               ],
             });
           }
       }
    }
    get().calculateMismatch();
  },

  updateQuantity: (productId, delta, list, saleType) => {
    const { saleItems, returnItems } = get();
    if (list === 'SALE') {
      const item = saleItems.find(i => i.productId === productId && i.saleType === saleType);
      if (item && item.quantity === 1 && delta === -1) {
        set({ saleItems: saleItems.filter(i => !(i.productId === productId && i.saleType === saleType)) });
      } else {
        set({
          saleItems: saleItems.map((i) =>
            i.productId === productId && i.saleType === saleType
              ? { ...i, quantity: Math.max(1, i.quantity + delta), subtotal: Math.max(1, i.quantity + delta) * i.unitPrice }
              : i
          ),
        });
      }
    } else {
      const refillTotal = saleItems.filter(i => i.saleType === 'REFILL').reduce((sum, i) => sum + i.quantity, 0);
      const returnTotal = returnItems.reduce((sum, i) => sum + i.quantity, 0);

      if (delta > 0 && returnTotal + delta > refillTotal) {
        toast.error(`Limit exceeded: Maximal return allowed is ${refillTotal}.`);
        return;
      }

      const item = returnItems.find(i => i.productId === productId);
      if (item && item.quantity === 1 && delta === -1) {
        set({ returnItems: returnItems.filter(i => i.productId !== productId) });
      } else {
        set({
          returnItems: returnItems.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, i.quantity + delta), subtotal: Math.max(1, i.quantity + delta) * i.unitPrice }
              : i
          ),
        });
      }
    }
    get().calculateMismatch();
  },

  setQuantity: (productId, qty, list, saleType) => {
    const { saleItems, returnItems } = get();
    if (list === 'SALE') {
      set({
        saleItems: saleItems.map((i) =>
          i.productId === productId && i.saleType === saleType
            ? { ...i, quantity: qty, subtotal: qty * i.unitPrice }
            : i
        ),
      });
    } else {
      const refillTotal = saleItems.filter(i => i.saleType === 'REFILL').reduce((sum, i) => sum + i.quantity, 0);
      const otherReturnsTotal = returnItems.filter(i => i.productId !== productId).reduce((sum, i) => sum + i.quantity, 0);

      if (qty > refillTotal - otherReturnsTotal) {
        const allowed = Math.max(0, refillTotal - otherReturnsTotal);
        toast.error(`Limit exceeded: Only ${allowed} more cylinders can be returned.`);
        return;
      }

      set({
        returnItems: returnItems.map((i) =>
          i.productId === productId ? { ...i, quantity: qty, subtotal: qty * i.unitPrice } : i
        ),
      });
    }
    get().calculateMismatch();
  },

  removeItem: (productId, list) => {
    const { saleItems, returnItems } = get();
    if (list === 'SALE') {
      set({ saleItems: saleItems.filter((i) => i.productId !== productId) });
    } else {
      set({ returnItems: returnItems.filter((i) => i.productId !== productId) });
    }
    get().calculateMismatch();
  },

  removeItemSpecific: (productId, list, saleType) => {
    const { saleItems, returnItems } = get();
    if (list === 'SALE') {
      set({ saleItems: saleItems.filter((i) => !(i.productId === productId && i.saleType === saleType)) });
    } else {
      set({ returnItems: returnItems.filter((i) => i.productId !== productId) });
    }
    get().calculateMismatch();
  },

  clearCart: () => {
    set({
      saleItems: [],
      returnItems: [],
      customer: null,
      allocatedDueCylinders: [],
      settledDueCylinders: [],
      mismatchCount: 0
    });
  },

  calculateMismatch: () => {
    const { saleItems, returnItems, allocatedDueCylinders } = get();

    let refillCylindersCount = 0;
    let emptyReturnsCount = 0;

    saleItems.forEach(item => {
        if (item.type === 'CYLINDER' && item.saleType === 'REFILL') refillCylindersCount += item.quantity;
    });

    returnItems.forEach(item => {
        if (item.type === 'CYLINDER') emptyReturnsCount += item.quantity;
    });

    const mismatch = refillCylindersCount - emptyReturnsCount;
    set({ mismatchCount: mismatch });

    if (mismatch > 0) {
        const refillBrandsArray = saleItems
            .filter(item => item.type === 'CYLINDER' && item.saleType === 'REFILL')
            .map(item => ({
                productId: item.productId,
                brandName: item.name,
                maxQty: item.quantity,
                selectedQty: 0,
                image: item.image,
                size: item.size,
                regulator: item.regulator
            }));

        const uniqueBrandsMap = new Map();
        refillBrandsArray.forEach(b => {
            const key = `${b.productId}_${b.size}_${b.regulator}`;
            if(uniqueBrandsMap.has(key)) {
                 uniqueBrandsMap.get(key).maxQty += b.maxQty;
            } else {
                 uniqueBrandsMap.set(key, { ...b });
            }
        });

        const currentAlloc = allocatedDueCylinders;
        const newAllocation = Array.from(uniqueBrandsMap.values()).map(b => {
            const existing = currentAlloc.find(ex => ex.productId === b.productId && ex.size === b.size && ex.regulator === b.regulator);
            return existing ? { ...b, selectedQty: existing.selectedQty } : b;
        });

        set({ allocatedDueCylinders: newAllocation });
    } else {
        set({ allocatedDueCylinders: [], mismatchCount: 0 });
    }

    return Math.max(0, mismatch);
  },

  syncPrices: () => {
    const { saleItems, transactionMode } = get();
    set({
      saleItems: saleItems.map(item => {
        if (!item.prices) return item;

        let newPrice = item.unitPrice;
        if (item.category === 'stove' || item.category === 'regulator') {
          newPrice = transactionMode === 'wholesale'
            ? (item.prices.wholesalePriceFull || item.prices.accessoryPrice || 0)
            : (item.prices.retailPriceFull || item.prices.accessoryPrice || 0);
        } else {
          // Cylinder
          if (item.saleType === 'PACKAGED') {
            newPrice = transactionMode === 'wholesale' ? item.prices.wholesalePriceFull : item.prices.retailPriceFull;
          } else if (item.saleType === 'REFILL') {
            newPrice = transactionMode === 'wholesale' ? item.prices.wholesalePriceGas : item.prices.retailPriceGas;
          }
        }

        return {
          ...item,
          unitPrice: newPrice || 0,
          subtotal: item.quantity * (newPrice || 0)
        };
      })
    });
  },

  getTotals: () => {
    const { saleItems, returnItems } = get();
    const saleTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const returnTotal = returnItems.reduce((sum, item) => sum + item.subtotal, 0);
    return { saleTotal, returnTotal, netTotal: saleTotal - returnTotal };
  },

  getIsBalanced: () => {
    const { saleItems, returnItems, allocatedDueCylinders } = get();
    const refillQty = saleItems
        .filter(i => i.saleType === 'REFILL')
        .reduce((sum, i) => sum + i.quantity, 0);

    const returnedQty = returnItems.reduce((sum, i) => sum + i.quantity, 0);
    const allocatedDueQty = allocatedDueCylinders.reduce((sum, i) => sum + i.selectedQty, 0);

    return refillQty === (returnedQty + allocatedDueQty);
  }
});

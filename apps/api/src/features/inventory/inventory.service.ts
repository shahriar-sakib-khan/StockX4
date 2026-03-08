import { StoreInventory } from './inventory.model';
import { StoreProduct, IStoreProduct } from '../product/store-product.model';
import { Transaction } from '../transaction/transaction.model';
import { GlobalProduct, IGlobalProduct } from '../product/global-product.model';

export class InventoryService {
    /**
     * Upserts an inventory ledger record for a specific StoreProduct (SKU).
     */
    static async upsertInventory(
        storeId: string,
        productId: string,
        updates: {
            counts?: { packaged?: number, full?: number, empty?: number, defected?: number },
            prices?: {
                buyingPriceFull?: number,
                buyingPriceGas?: number,
                retailPriceFull?: number,
                retailPriceGas?: number,
                wholesalePriceFull?: number,
                wholesalePriceGas?: number
            }
        }
    ) {
        // Build the update query dynamically to only overwrite provided fields
        const $set: any = {};
        if (updates.counts) {
            if (updates.counts.packaged !== undefined) $set['counts.packaged'] = updates.counts.packaged;
            if (updates.counts.full !== undefined) $set['counts.full'] = updates.counts.full;
            if (updates.counts.empty !== undefined) $set['counts.empty'] = updates.counts.empty;
            if (updates.counts.defected !== undefined) $set['counts.defected'] = updates.counts.defected;
        }
        if (updates.prices) {
            Object.entries(updates.prices).forEach(([key, value]) => {
                if (value !== undefined) {
                    $set[`prices.${key}`] = value;
                }
            });
        }

        const inv = await StoreInventory.findOneAndUpdate(
            { storeId, productId },
            { $set },
            { upsert: true, new: true }
        );

        return inv;
    }

    /**
     * Gets the entire unified inventory ledger for a store.
     * It maps ALL active StoreProducts (SKUs) and joins their matching StoreInventory ledger records.
     * This avoids the frontend needing to guess "virtual" products.
     */
    static async getStoreInventory(storeId: string) {
        // 1. Fetch all active SKUs for the store
        const products = await StoreProduct.find({ storeId, isArchived: false, isActive: true })
            .populate({
                path: 'details.brandId',
                populate: {
                    path: 'globalBrandId' // Fallback for logos
                }
            });

        // 1.1 Fetch Global Products for accessory images (fallback for existing data)
        const globalProducts = await GlobalProduct.find({ isActive: true });

        // 2. Fetch all inventory ledgers for the store
        // Guard: skip stale ledger docs that might not have a productId (pre-refactor data)
        const ledgers = await StoreInventory.find({ storeId, productId: { $exists: true, $ne: null } });
        const ledgerMap = new Map(ledgers.map(l => [l.productId.toString(), l]));

        // 3. Join them
        return products.map(product => {
            const pId = (product._id as any).toString();
            const ledger = ledgerMap.get(pId);

            // On-the-fly image population for accessories if missing
            let image = product.image || '';
            if (!image) {
                if (product.category === 'stove') {
                    const gp = globalProducts.find((g: any) => g.type === 'stove' && String(g.burnerCount) === String(product.details.burners));
                    image = gp?.image || '';
                } else if (product.category === 'regulator') {
                    const gp = globalProducts.find((g: any) => g.type === 'regulator' && g.regulatorType === product.details.type);
                    image = gp?.image || '';
                }
            }

            return {
                _id: ledger?._id || `virtual-${pId}`, // Fake ID for react keys if no ledger yet
                storeId: product.storeId,
                productId: pId,

                // Keep `product` attached for clean rendering
                product: { ...product.toObject(), image },

                // Use ledger counts/prices or fallback to 0s
                counts: ledger?.counts || { packaged: 0, full: 0, empty: 0, defected: 0 },
                prices: ledger?.prices || {
                    buyingPriceFull: 0, buyingPriceGas: 0,
                    retailPriceFull: 0, retailPriceGas: 0,
                    wholesalePriceFull: 0, wholesalePriceGas: 0
                }
            };
        });
    }

    /**
     * Gets statistics for a particular cylinder size to determine if it can be hard-deleted or if it must be archived.
     */
    static async getSizeStats(storeId: string, size: string) {
        // Find all StoreProduct records for this store matching the size
        const products = await StoreProduct.find({ storeId, category: 'cylinder', 'details.size': size });
        if (!products.length) return { cylinders: 0, brands: 0, transactions: 0 };

        const productIds = products.map(p => p._id);
        const productIdStrings = products.map(p => p._id.toString());

        // 1. Transactions referencing these products
        const txCount = await Transaction.countDocuments({
            storeId,
            'items.productId': { $in: productIdStrings }
        } as any);

        // 2. Active Inventory Ledgers checking for ANY data (counts > 0 or prices > 0)
        const ledgers = await StoreInventory.find({ storeId, productId: { $in: productIds } });

        let cylinderDataCount = 0;
        const brandIdsWithData = new Set<string>();

        for (const ledger of ledgers) {
            const hasStock = (ledger.counts?.packaged || 0) > 0 || (ledger.counts?.full || 0) > 0 || (ledger.counts?.empty || 0) > 0 || (ledger.counts?.defected || 0) > 0;
            const hasPrices = (ledger.prices?.buyingPriceFull || 0) > 0 || (ledger.prices?.retailPriceFull || 0) > 0;

            if (hasStock || hasPrices) {
                cylinderDataCount++;
                // Find matching product to track unique brands
                const matchedProduct = products.find(p => p._id.toString() === ledger.productId.toString());
                if (matchedProduct?.details?.brandId) {
                    brandIdsWithData.add(matchedProduct.details.brandId.toString());
                }
            }
        }

        // If it was involved in a transaction, the brands/cylinders involved might have zero stock NOW,
        // but they still "have data" historically. We must include them.
        if (txCount > 0) {
            // we could count all products as having data if transaction exists, but let's just use the active snapshot + transactions.
            // Actually, if there's a transaction, the size HAS data.
        }

        return {
            cylinders: cylinderDataCount,
            brands: brandIdsWithData.size,
            transactions: txCount
        };
    }
}

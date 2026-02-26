import { StoreInventory } from './cylinder.model';
import { BrandService } from '../brand/brand.service';
import { UpdateInventoryInput } from '@repo/shared';

export class CylinderService {

    // --- Store: Inventory Management ---

    // Subscribe/Add Brand to Store
    static async addBrandToStore(storeId: string, globalBrandId: string) {
        // Implementation disabled due to schema mismatch.
        // GlobalBrand does not have 'variants' or specific color fields anymore.
        // Inventory management is now done via UpsertInventory or direct management.
        throw new Error("Method not implemented. Use UpsertInventory.");
    }

    // Get Store Inventory (Grouped logic can be handled in frontend or aggregation here)
    // For now, simple list
    static async getStoreInventory(storeId: string) {
        return await StoreInventory.find({ storeId } as any)
            .populate('brandId', 'name logo cylinderImage color')
            .sort({ 'variant.size': 1 }); // Removed sort by brandName as it is not on the root doc
    }

    // Update specific variant stock/price
    static async updateInventory(storeId: string, inventoryId: string, data: UpdateInventoryInput) {
        const inventory = await StoreInventory.findOne({ _id: inventoryId, storeId } as any);
        if (!inventory) throw new Error('Inventory item not found');

        if (data.counts) {
            inventory.counts = { ...inventory.counts, ...data.counts };
        }
        if (data.prices) {
            inventory.prices = { ...inventory.prices, ...data.prices };
        }

        return await inventory.save();
    }
    // Batch Subscribe
    static async addBatchBrandsToStore(storeId: string, globalBrandIds: string[]) {
         return []; // Disabled
    }
    // Remove Brand from Store
    static async removeBrandFromStore(storeId: string, globalBrandId: string): Promise<any> {
        // We delete all inventory items for this brand in this store
        // This includes all sizes/variants.
        const result = await StoreInventory.deleteMany({ storeId, brandId: globalBrandId } as any);
        return result;
    }
    // Upsert Inventory (For Stoves/Regulators mainly, but can work for Cylinders too)
    // Checks if item exists (Store + Brand + Variant). Update counts/prices if yes, Create if no.
    static async upsertInventory(storeId: string, data: any) {
        const { brandId, brandName, category, variant, counts, prices } = data;

        // 1. Try to find existing item
        const query: any = {
            storeId,
            brandId,
            category
        };

        if (variant.size) query['variant.size'] = variant.size;
        if (variant.regulator) query['variant.regulator'] = variant.regulator;
        if (variant.burners) query['variant.burners'] = variant.burners;

        let inventoryItem = await StoreInventory.findOne(query);

        if (inventoryItem) {
            // Update existing
            if (counts) {
                if (counts.full !== undefined) inventoryItem.counts.full = (counts.full || 0);
                if (counts.empty !== undefined) inventoryItem.counts.empty = (counts.empty || 0);
                if (counts.defected !== undefined) inventoryItem.counts.defected = (counts.defected || 0);
            }
            if (prices) {
                if (prices.fullCylinder !== undefined) inventoryItem.prices.fullCylinder = prices.fullCylinder;
                if (prices.gasOnly !== undefined) inventoryItem.prices.gasOnly = prices.gasOnly;
            }
            await inventoryItem.save();
        } else {
            // Create new
            inventoryItem = await StoreInventory.create({
                storeId,
                brandId,
                category,
                variant,
                counts: counts || { full: 0, empty: 0, defected: 0 },
                prices: prices || { fullCylinder: 0, gasOnly: 0, buyingPriceFull: 0, buyingPriceGas: 0 }
            });
        }

        return inventoryItem;
    }
}

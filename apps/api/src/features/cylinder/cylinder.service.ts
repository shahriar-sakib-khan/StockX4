import { StoreInventory } from './cylinder.model';
import { BrandService } from '../brand/brand.service';
import { UpdateInventoryInput } from '@repo/shared';

export class CylinderService {

    // --- Store: Inventory Management ---

    // Subscribe/Add Brand to Store
    static async addBrandToStore(storeId: string, globalBrandId: string) {
        const brand = await BrandService.getGlobalBrandById(globalBrandId);
        if (!brand) throw new Error('Global Brand not found');

        // Create inventory items for ALL variants of this brand
        const inventoryItems = brand.variants.map(variant => ({
            storeId,
            brandId: brand._id,
            brandName: brand.name,
            variant: {
                size: variant.size,
                regulator: variant.regulator,
                cylinderColor: variant.regulator === '22mm' ? brand.color22mm : brand.color20mm,
                cylinderImage: variant.cylinderImage
            },
            counts: { full: 0, empty: 0, defected: 0 },
            prices: { fullCylinder: 0, gasOnly: 0 }
        }));

        // InsertMany (will fail if duplicates exist due to compound index, which is what we want)
        try {
            return await StoreInventory.insertMany(inventoryItems);
        } catch (error: any) {
             if (error.code === 11000) {
                 throw new Error('This brand is already added to your store');
             }
             throw error;
        }
    }

    // Get Store Inventory (Grouped logic can be handled in frontend or aggregation here)
    // For now, simple list
    static async getStoreInventory(storeId: string) {
        return await StoreInventory.find({ storeId } as any)
            .populate('brandId', 'logo')
            .sort({ brandName: 1, 'variant.size': 1 });
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
        const brands = await BrandService.getGlobalBrandByIds(globalBrandIds);
        if (brands.length === 0) return [];

        let allInventoryItems: any[] = [];

        brands.forEach(brand => {
            const items = brand.variants.map(variant => ({
                storeId,
                brandId: brand._id,
                brandName: brand.name,
                variant: {
                    size: variant.size,
                    regulator: variant.regulator,
                    cylinderColor: variant.regulator === '22mm' ? brand.color22mm : brand.color20mm,
                    cylinderImage: variant.cylinderImage
                },
                counts: { full: 0, empty: 0, defected: 0 },
                prices: { fullCylinder: 0, gasOnly: 0 }
            }));
            allInventoryItems = [...allInventoryItems, ...items];
        });

        if (allInventoryItems.length === 0) return [];

        try {
            const result = await StoreInventory.insertMany(allInventoryItems, { ordered: false });
            return result;
        } catch (error: any) {
             if (error.code === 11000 || error.name === 'MongoBulkWriteError') {
                 // Return successfully inserted ones if available, or just empty array if all failed
                 // For MongoBulkWriteError, successfully inserted docs might be in error.insertedDocs or result.insertedDocs
                 // But typically duplicate errors on batch insert are fine to ignore if we just want to ensure they exist.
                 return error.insertedDocs || [];
             }
             throw error;
        }
    }
    // Remove Brand from Store
    static async removeBrandFromStore(storeId: string, globalBrandId: string): Promise<any> {
        // We delete all inventory items for this brand in this store
        // This includes all sizes/variants.
        const result = await StoreInventory.deleteMany({ storeId, brandId: globalBrandId } as any);
        return result;
    }
}

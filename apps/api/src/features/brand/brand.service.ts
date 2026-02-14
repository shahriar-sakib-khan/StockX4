import { GlobalBrand } from './brand.model';
import { StoreBrand } from './store-brand.model';
import { GlobalBrandInput } from '@repo/shared';

// We need a StoreBrandInput interface, define locally or import if available
// We need a StoreBrandInput interface, define locally or import if available
interface StoreBrandInput {
    globalBrandId?: string;
    name: string;
    logo?: string;
    color: string;
    cylinderImage?: string;
    type?: 'cylinder' | 'stove' | 'regulator';
}

export class BrandService {
    // --- Global Brands (Master Data) ---
    static async createGlobalBrand(data: GlobalBrandInput) {
        return await GlobalBrand.create(data);
    }

    static async getAllGlobalBrands() {
        return await GlobalBrand.find({ isActive: true });
    }

    static async getGlobalBrandById(id: string) {
        return await GlobalBrand.findById(id);
    }

    static async updateGlobalBrand(id: string, data: GlobalBrandInput) {
        const updatedBrand = await GlobalBrand.findByIdAndUpdate(id, data, { new: true });

        if (updatedBrand) {
            // Cascade Update: Update all store copies of this brand
            await StoreBrand.updateMany(
                { globalBrandId: id },
                {
                    $set: {
                        name: updatedBrand.name,
                        logo: updatedBrand.logo,
                        cylinderImage: updatedBrand.cylinderImage,
                        color: updatedBrand.color,
                        type: updatedBrand.type
                    }
                }
            );
        }

        return updatedBrand;
    }

    static async deleteGlobalBrand(id: string) {
        return await GlobalBrand.findByIdAndDelete(id);
    }

    // --- Store Brands (Local Data) ---
    static async getStoreBrands(storeId: string) {
        return await StoreBrand.find({ storeId });
    }

    static async addStoreBrand(storeId: string, globalBrandId: string) {
        const globalBrand = await GlobalBrand.findById(globalBrandId);
        if (!globalBrand) throw new Error('Global Brand not found');

        // Check if already exists
        const existing = await StoreBrand.findOne({ storeId, globalBrandId });
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                // Ensure type is synced if it was missing
                existing.type = globalBrand.type;
                await existing.save();
            }
            return existing;
        }

        return await StoreBrand.create({
            storeId,
            globalBrandId,
            name: globalBrand.name,
            logo: globalBrand.logo,
            cylinderImage: globalBrand.cylinderImage,
            color: globalBrand.color,
            type: globalBrand.type,
            isCustom: false,
            isActive: true
        });
    }

    static async createCustomBrand(storeId: string, data: StoreBrandInput) {
        return await StoreBrand.create({
            storeId,
            ...data,
            // Default custom brands to cylinder if not specified?
            // Or allow user to select. For now assume cylinder or pass from data.
            type: data.type || 'cylinder',
            isCustom: true,
            isActive: true
        });
    }

    static async updateStoreBrand(storeId: string, brandId: string, data: Partial<StoreBrandInput>) {
        return await StoreBrand.findOneAndUpdate(
            { _id: brandId, storeId },
            { $set: data },
            { new: true }
        );
    }

    static async deleteStoreBrand(storeId: string, brandId: string) {
        // Soft delete
        return await StoreBrand.findOneAndUpdate(
            { _id: brandId, storeId },
            { $set: { isActive: false } },
            { new: true }
        );
    }

    static async updateStoreBrandsBulk(storeId: string, globalBrandIds: string[], customBrandIds: string[] = []) {
        // 1. Deactivate all global-linked brands for this store
        // We only want to touch brands that are NOT in the new list.
        // But the previous logic was "Deactivate ALL, then Activate specific ones".
        // This is fine as long as we don't lose data.

        await StoreBrand.updateMany(
            { storeId, globalBrandId: { $exists: true, $ne: null } },
            { $set: { isActive: false } }
        );

        // 1b. Deactivate all CUSTOM brands (so we can re-activate only the selected ones)
        // This ensures unselected custom brands are hidden.
        await StoreBrand.updateMany(
            { storeId, isCustom: true },
            { $set: { isActive: false } }
        );

        // 2. Activate or Create selected Global brands
        const globalOps = globalBrandIds.map(async (globalBrandId) => {
            return this.addStoreBrand(storeId, globalBrandId);
        });

        // 3. Activate selected Custom brands
        const customOps = customBrandIds.map(async (customBrandId) => {
             return StoreBrand.findOneAndUpdate(
                 { _id: customBrandId, storeId, isCustom: true },
                 { $set: { isActive: true } },
                 { new: true }
             );
        });

        await Promise.all([...globalOps, ...customOps]);

        return await this.getStoreBrands(storeId);
    }
}

import { GlobalBrand } from './brand.model';
import { StoreBrand, IStoreBrand } from './store-brand.model';
import { GlobalBrandInput } from '@repo/shared';
import { StoreProductService } from '../product/store-product.service';

interface CustomBrandInput {
    customName: string;
    customLogo?: string;
    customColor: string;
    customCylinderImage?: string;
}

/** Merges a StoreBrand with its populated GlobalBrand into a flat display object. */
const resolveBrandDisplay = (sb: any) => {
    const gb = sb.globalBrandId; // populated GlobalBrand doc (or null for custom)
    return {
        _id: sb._id,
        storeId: sb.storeId,
        globalBrandId: gb?._id || null,
        isActive: sb.isActive,
        isCustom: sb.isCustom,
        // Fields resolved from GlobalBrand (or custom overrides)
        name: sb.isCustom ? sb.customName : gb?.name,
        logo: sb.isCustom ? sb.customLogo : gb?.logo,
        color: sb.isCustom ? sb.customColor : gb?.color,
        cylinderImage: sb.isCustom ? sb.customCylinderImage : gb?.cylinderImage,
        createdAt: sb.createdAt,
        updatedAt: sb.updatedAt,
    };
};

export class BrandService {
    // --- Global Brands (Master Data, admin-only) ---
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
        // Reference+Override: no cascade needed — store brands read from GlobalBrand at query time
        return await GlobalBrand.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteGlobalBrand(id: string) {
        return await GlobalBrand.findByIdAndDelete(id);
    }

    // --- Store Brands (Per-store, cylinder brands only) ---
    /** Returns all store brands for a store, with name/logo/color resolved from GlobalBrand. */
    static async getStoreBrands(storeId: string) {
        const storeBrands = await StoreBrand.find({ storeId }).populate('globalBrandId');
        return storeBrands.map(resolveBrandDisplay);
    }

    /** Activate a global brand for a store (creates StoreBrand copy if it doesn't exist). */
    static async addStoreBrand(storeId: string, globalBrandId: string) {
        const globalBrand = await GlobalBrand.findById(globalBrandId);
        if (!globalBrand) throw new Error('Global Brand not found');

        const existing = await StoreBrand.findOne({ storeId, globalBrandId });
        if (existing) {
            if (!existing.isActive) { existing.isActive = true; await existing.save(); }
            return existing;
        }

        return await StoreBrand.create({ storeId, globalBrandId, isCustom: false, isActive: true });
    }

    /** Create a custom brand scoped to one store. */
    static async createCustomBrand(storeId: string, data: CustomBrandInput) {
        const brand = await StoreBrand.create({
            storeId,
            isCustom: true,
            isActive: true,
            customName: data.customName,
            customLogo: data.customLogo,
            customColor: data.customColor,
            customCylinderImage: data.customCylinderImage,
        });
        await StoreProductService.syncCylinderMatrix(storeId);
        return brand;
    }

    static async updateStoreBrand(storeId: string, brandId: string, data: Partial<CustomBrandInput>) {
        return await StoreBrand.findOneAndUpdate(
            { _id: brandId, storeId },
            { $set: data },
            { new: true }
        );
    }

    static async deleteStoreBrand(storeId: string, brandId: string) {
        // Hard delete for custom brands; soft delete (isActive: false) for global-linked
        const brand = await StoreBrand.findOne({ _id: brandId, storeId });
        if (!brand) throw new Error('StoreBrand not found');
        if (brand.isCustom) {
            await brand.deleteOne();
            await StoreProductService.syncCylinderMatrix(storeId);
            return { deleted: true };
        }
        brand.isActive = false;
        await brand.save();
        await StoreProductService.syncCylinderMatrix(storeId);
        return brand;
    }

    /**
     * Bulk update which GlobalBrands are active for a store.
     * Custom brands are NOT managed here — they're always active once created.
     */
    static async updateStoreBrandsBulk(storeId: string, globalBrandIds: string[]) {
        // Deactivate all global-linked brands
        await StoreBrand.updateMany(
            { storeId, isCustom: false },
            { $set: { isActive: false } }
        );

        // Activate (or create) selected ones
        await Promise.all(globalBrandIds.map(id => this.addStoreBrand(storeId, id)));

        // Automatically sync product catalog
        await StoreProductService.syncCylinderMatrix(storeId);

        return await this.getStoreBrands(storeId);
    }
}

import { StoreProduct } from './store-product.model';
import { StoreBrand } from '../brand/store-brand.model';
import { StoreModel } from '../store/store.model';
import mongoose from 'mongoose';

export class StoreProductService {
    /**
     * Re-syncs the Cylinder SKU matrix for a store based on their active brands and sizes.
     */
    static async syncCylinderMatrix(storeId: string) {
        const store = await StoreModel.findById(storeId);
        if (!store) throw new Error('Store not found');

        const activeBrands = await StoreBrand.find({ storeId, isActive: true }).populate('globalBrandId');
        const activeSizes = store.cylinderSizes && store.cylinderSizes.length > 0 ? store.cylinderSizes : ['12kg'];
        const regulatorTypes = ['20mm', '22mm'];

        for (const brand of activeBrands) {
            // Calculate effective brand name from resolution logic
            const brandName = brand.isCustom ? brand.customName : (brand.globalBrandId as any)?.name;

            for (const size of activeSizes) {
                for (const regType of regulatorTypes) {
                    const friendlyName = `${brandName} ${size} (${regType})`;

                    // Upsert pattern
                    await StoreProduct.updateOne(
                        {
                            storeId,
                            category: 'cylinder',
                            'details.brandId': brand._id,
                            'details.size': size,
                            'details.regulatorType': regType
                        },
                        {
                            $set: {
                                name: friendlyName,
                                isActive: true,
                                isArchived: false
                            }
                        },
                        { upsert: true }
                    );
                }
            }
        }

        // Logical cleanup: If a store removed a size or disabled a brand, mark the old SKUs as archived
        // if they have no inventory, or simply deactivate them so they disappear from UI but remain in DB.
        // We do this by finding all cylinder products, and if they don't match the current matrix, flag them.
        const allCylinders = await StoreProduct.find({ storeId, category: 'cylinder' });
        const activeBrandIds = activeBrands.map(b => b._id.toString());

        for (const p of allCylinders) {
            const bId = p.details.brandId?.toString();
            if (!bId || !activeBrandIds.includes(bId) || !activeSizes.includes(p.details.size || '')) {
                // Not in active matrix anymore
                p.isActive = false;
                await p.save();
            }
        }
    }

    /**
     * Explicitly add or update a Stove SKU.
     */
    static async upsertStoveProduct(storeId: string, details: { brandName: string, model?: string, burners: 1|2|3|4 }) {
        const normalizedModel = details.model?.trim() || '';
        const modelPart = normalizedModel ? ` (${normalizedModel})` : '';
        const name = `${details.brandName} ${details.burners}-Burner Stove${modelPart}`;
        const normalizedDetails = { ...details, model: normalizedModel };

        // Identity: brandName + burners + normalized model (empty == no model)
        const doc = await StoreProduct.findOneAndUpdate(
            {
                storeId,
                category: 'stove',
                isArchived: false,
                'details.brandName': details.brandName,
                'details.burners': details.burners,
                'details.model': normalizedModel,
            },
            { $set: { name, isActive: true, isArchived: false, details: normalizedDetails } },
            { upsert: true, new: true }
        );
        return doc;
    }

    /**
     * Explicitly add or update a Regulator SKU.
     */
    static async upsertRegulatorProduct(storeId: string, details: { brandName: string, model?: string, type: '20mm'|'22mm' }) {
        const normalizedModel = details.model?.trim() || '';
        const modelPart = normalizedModel ? ` (${normalizedModel})` : '';
        const name = `${details.brandName} ${details.type} Regulator${modelPart}`;
        const normalizedDetails = { ...details, model: normalizedModel };

        // Identity: brandName + type + normalized model (empty == no model)
        const doc = await StoreProduct.findOneAndUpdate(
            {
                storeId,
                category: 'regulator',
                isArchived: false,
                'details.brandName': details.brandName,
                'details.type': details.type,
                'details.model': normalizedModel,
            },
            { $set: { name, isActive: true, isArchived: false, details: normalizedDetails } },
            { upsert: true, new: true }
        );
        return doc;
    }

    /**
     * Flags all StoreProduct listings matching a specific size as archived and triggers a matrix rebuild.
     */
    static async archiveCylinderSize(storeId: string, size: string) {
        // Find existing ones and archive them
        await StoreProduct.updateMany(
            { storeId, category: 'cylinder', 'details.size': size, isArchived: false },
            { $set: { isArchived: true, isActive: false } }
        );

        // A new StoreProduct generation might happen next if the user starts fresh and adds the size back
        // but wait, if the size isn't in `Store.cylinderSizes`, syncCylinderMatrix will just ignore it.
        // If the user *just* re-added it, the size will be in `cylinderSizes`.
        await this.syncCylinderMatrix(storeId);
    }
}

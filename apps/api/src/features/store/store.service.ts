import { StoreModel } from './store.model';
import { CreateStoreInput, UpdateStoreInput, SetupStoreInput } from '@repo/shared';
import { BrandService } from '../brand/brand.service';
import { StoreProductService } from '../product/store-product.service';
import { InventoryService } from '../inventory/inventory.service';
import { StoreProduct } from '../product/store-product.model';
import { StaffService } from '../staff/staff.service';
import { User } from '../user/user.model';
import { GlobalBrand } from '../brand/brand.model';
import { StoreBrand } from '../brand/store-brand.model';
import mongoose from 'mongoose';

export class StoreService {
  /**
   * Generates a unique 4-character code (A-Z, 0-9)
   */
  private static async generateUniqueCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await StoreModel.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
    }
    return code;
  }

  static async create(ownerId: string, data: CreateStoreInput) {
    // Generate unique 6-char ID for slug
    const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    let slug = data.slug || generateId();

    // Simple collision check for slug
    while (await StoreModel.findOne({ slug })) {
        slug = generateId();
    }

    const code = await this.generateUniqueCode();

    const store = await StoreModel.create({
      ...data,
      slug,
      code,
      ownerId,
    });
    return store;
  }

  static async findByOwner(ownerId: string) {
    return StoreModel.find({ ownerId });
  }

  static async findOne(storeId: string, ownerId: string) {
    const store = await StoreModel.findOne({ _id: storeId, ownerId });
    if (!store) {
      throw new Error('Store not found'); // Handled by controller or global error handler
    }
    return store;
  }

  static async update(storeId: string, ownerId: string, data: UpdateStoreInput) {
    const store = await StoreModel.findOneAndUpdate(
      { _id: storeId, ownerId },
      { $set: data },
      { new: true }
    );
    if (!store) {
      throw new Error('Store not found');
    }

    // Auto-sync the cylinder matrix if sizes were modified so that new sizes immediately appear in inventory
    if (data.cylinderSizes) {
        await StoreProductService.syncCylinderMatrix(storeId);
    }

    return store;
  }

  static async delete(storeId: string, ownerId: string) {
    const result = await StoreModel.deleteOne({ _id: storeId, ownerId });
    if (result.deletedCount === 0) {
      throw new Error('Store not found');
    }
    return true;
  }

  /**
   * Atomic Setup: Creates the store, links brands, and seeds cylinder inventory.
   * Called once from the Setup Wizard. No partial data is persisted.
   */
  static async setupStore(ownerId: string, data: SetupStoreInput) {
    const { name, location, code, brandIds, cylinders, cylinderSizes } = data;
    const effectiveSizes = cylinderSizes && cylinderSizes.length > 0
      ? cylinderSizes
      : ['12kg'];

    const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    // --- UPSERT: find existing store for this owner, or create a new one ---
    let store = await StoreModel.findOne({ ownerId });

    if (store) {
      // Update existing store info
      store.name = name;
      store.location = location;
      // If store exists but has no code (legacy), generate one
      if (!store.code) {
        store.code = await this.generateUniqueCode();
      }
      store.isSetupComplete = true;
      (store as any).cylinderSizes = effectiveSizes;
      await store.save();
    } else {
      let slug = generateId();
      while (await StoreModel.findOne({ slug })) slug = generateId();
      const storeCode = await this.generateUniqueCode();

      store = await StoreModel.create({
        name, location, slug, code: storeCode, ownerId, isSetupComplete: true, cylinderSizes: effectiveSizes,
      });
    }

    const storeId = (store._id as any).toString();

    try {
      // 2. Sync ALL GlobalBrands → StoreBrand for this store (upsert)
      const allGlobalBrands = await GlobalBrand.find({ isActive: true });
      const selectedSet = new Set(brandIds);

      await Promise.all(allGlobalBrands.map(gb => {
        const gId = (gb._id as any).toString();
        return StoreBrand.findOneAndUpdate(
          { storeId, globalBrandId: gb._id },
          { storeId, globalBrandId: gb._id, isActive: selectedSet.has(gId), isCustom: false },
          { upsert: true, new: true }
        );
      }));

      // Build lookup: globalBrandId → storeBrand._id (for selected brands only)
      const globalToStore = new Map<string, string>();
      for (const gb of allGlobalBrands) {
        const gId = (gb._id as any).toString();
        if (selectedSet.has(gId)) {
          const sb = await StoreBrand.findOne({ storeId, globalBrandId: gb._id });
          if (sb) globalToStore.set(gId, (sb._id as any).toString());
        }
      }

      // 3. Sync cylinder SKU matrix
      await StoreProductService.syncCylinderMatrix(storeId);

      // 4. Seed/update cylinder inventory ledger
      if (cylinders && cylinders.length > 0) {
        await Promise.all(cylinders.map(async (cyl) => {
          const storeBrandId = globalToStore.get(cyl.brandId);
          if (!storeBrandId) return;

          const product = await StoreProduct.findOne({
               storeId,
               category: 'cylinder',
               'details.brandId': new mongoose.Types.ObjectId(storeBrandId),
               'details.size': cyl.size,
               'details.regulatorType': cyl.regulatorType
          });

          if (!product) return;

          return InventoryService.upsertInventory(storeId, (product._id as any).toString(), {
            counts: {
              packaged: cyl.counts.packaged || 0,
              full: cyl.counts.refill || 0,
              empty: cyl.counts.empty || 0,
              defected: cyl.counts.defected || 0,
            },
            prices: {
              buyingPriceFull: cyl.prices.packaged.buying || 0,
              buyingPriceGas: cyl.prices.refill.buying || 0,
              retailPriceFull: cyl.prices.packaged.retail || 0,
              retailPriceGas: cyl.prices.refill.retail || 0,
              wholesalePriceFull: cyl.prices.packaged.wholesale || 0,
              wholesalePriceGas: cyl.prices.refill.wholesale || 0,
            },
          });
        }));
      }

      // 5. Auto-create owner staff record (idempotent — ignores duplicate)
      const owner = await User.findById(ownerId).select('name email phone');
      if (owner) {
        const contact = (owner as any).phone || (owner as any).email || ownerId;
        const ownerName = (owner as any).name || 'Owner';
        await StaffService.createOwnerStaff(storeId, contact, ownerName).catch(() => {});
      }
    } catch (err) {
      // Only rollback if this was a fresh creation (existing stores are kept as-is)
      if (!(await StoreModel.findOne({ ownerId, isSetupComplete: true }))) {
        await StoreModel.deleteOne({ _id: store._id });
      }
      throw err;
    }

    return store;
  }
}

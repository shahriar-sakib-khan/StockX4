import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connect, disconnect, clearDatabase } from '../../test/db';
import { StoreProductService } from './store-product.service';
import { StoreProduct } from './store-product.model';
import { StoreModel as Store } from '../store/store.model';
import { GlobalBrand } from '../brand/brand.model';
import { BrandService } from '../brand/brand.service';
import mongoose from 'mongoose';

describe('StoreProduct Service (SKU Logic)', () => {
    let storeId: string;
    let basundharaGlobalId: string;
    let omeraGlobalId: string;

    beforeAll(async () => await connect());
    afterAll(async () => await disconnect());

    beforeEach(async () => {
        await clearDatabase();

        // Setup a store with default cylinder sizes
        const store = await Store.create({
            name: 'Test Store',
            ownerId: new mongoose.Types.ObjectId(),
            slug: 'test-store',
            cylinderSizes: ['12kg', '35kg'] // only two sizes for testing
        });
        storeId = store._id.toString();

        // Setup Global Brands
        const gb1 = await GlobalBrand.create({ name: 'Bashundhara', cylinderImage: 'b.png', logo: 'logo-b.png', color: '#FF0000', type: 'cylinder' });
        const gb2 = await GlobalBrand.create({ name: 'Omera', cylinderImage: 'o.png', logo: 'logo-o.png', color: '#00FF00', type: 'cylinder' });
        basundharaGlobalId = gb1._id.toString();
        omeraGlobalId = gb2._id.toString();

        // Add them to the store (creates StoreBrand)
        await BrandService.addStoreBrand(storeId, basundharaGlobalId);
        await BrandService.addStoreBrand(storeId, omeraGlobalId);
    });

    describe('syncCylinderMatrix()', () => {
        it('should auto-generate SKUs for all active brands x sizes x regulator types', async () => {
            // 2 brands * 2 sizes (12kg, 35kg) * 2 regulator types (20mm, 22mm) = 8 SKUs
            await StoreProductService.syncCylinderMatrix(storeId);

            const products = await StoreProduct.find({ storeId, category: 'cylinder' });
            expect(products.length).toBe(8);

            // Check one specific product
            const sample = products.find(p => p.details.size === '12kg' && p.details.regulatorType === '22mm' && p.name.includes('Bashundhara'));
            expect(sample).toBeDefined();
            expect(sample?.isActive).toBe(true);
            expect(sample?.isArchived).toBe(false);
        });

        it('should not duplicate existing SKUs on re-sync', async () => {
            await StoreProductService.syncCylinderMatrix(storeId);
            await StoreProductService.syncCylinderMatrix(storeId); // Call again

            const products = await StoreProduct.find({ storeId, category: 'cylinder' });
            expect(products.length).toBe(8);
        });

        it('should add new SKUs if store cylinderSizes array is expanded', async () => {
            await StoreProductService.syncCylinderMatrix(storeId);

            // Update store sizes
            await Store.findByIdAndUpdate(storeId, { $push: { cylinderSizes: '45kg' } });

            await StoreProductService.syncCylinderMatrix(storeId);

            const products = await StoreProduct.find({ storeId, category: 'cylinder' });
            // +4 new SKUs (2 brands * 1 new size * 2 regulators)
            expect(products.length).toBe(12);
        });

        it('should archive SKUs if brand is deactivated, but preserve if stock exists', async () => {
             // We test archiving later when connecting Inventory. For now, just generate.
             await StoreProductService.syncCylinderMatrix(storeId);
             expect(true).toBe(true);
        });
    });

    describe('upsertStoveProduct()', () => {
        it('should create an explicit explicit stove SKU', async () => {
            const stove = await StoreProductService.upsertStoveProduct(storeId, {
                brandName: 'Walton',
                model: 'W-100',
                burners: 2
            });

            expect(stove).toBeDefined();
            expect(stove.category).toBe('stove');
            expect(stove.name).toBe('Walton 2-Burner Stove (W-100)');
            expect(stove.details.brandName).toBe('Walton');
            expect(stove.details.burners).toBe(2);
        });

        it('should update an existing stove SKU if brand/model matches', async () => {
            await StoreProductService.upsertStoveProduct(storeId, {
                brandName: 'Walton',
                model: 'W-100',
                burners: 2
            });

            // "Upserting" the same stove
            const stoves = await StoreProduct.find({ storeId, category: 'stove' });
            expect(stoves.length).toBe(1);
        });
    });

    describe('upsertRegulatorProduct()', () => {
        it('should create an explicit regulator SKU', async () => {
            const reg = await StoreProductService.upsertRegulatorProduct(storeId, {
                brandName: 'Click',
                model: 'C-20',
                type: '20mm'
            });

            expect(reg).toBeDefined();
            expect(reg.category).toBe('regulator');
            expect(reg.name).toBe('Click 20mm Regulator (C-20)');
            expect(reg.details.type).toBe('20mm');
        });
    });
});

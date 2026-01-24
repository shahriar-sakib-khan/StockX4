import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { connect, disconnect, clearDatabase } from '../../test/db';
import { GlobalBrand } from '../brand/brand.model';
import { User } from '../user/user.model';
import { StoreModel as Store } from '../store/store.model';
import { createToken } from '../../lib/jwt';
import { CylinderRoutes } from './cylinder.routes';
import { BrandRoutes } from '../brand/brand.routes';

// Ensure routes are mounted if not global
// app.use('/cylinders', CylinderRoutes); // Already mounted in app.ts? Yes.

describe('Cylinder Batch Feature', () => {
    let token: string;
    let storeId: string;
    let userId: string;
    let brandId1: string;
    let brandId2: string;

    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await disconnect();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Setup User & Store
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'user'
        });
        userId = user._id.toString();

        const store = await Store.create({
            name: 'Test Store',
            ownerId: userId,
            slug: 'test-store'
        });
        storeId = store._id.toString();

        token = createToken({ userId, role: user.role });

        // Create 2 Global Brands
        const b1 = await GlobalBrand.create({
            name: 'Brand 1',
            color20mm: '#FF0000',
            color22mm: '#00FF00',
            variants: [{ size: '12kg', regulator: '20mm', price: { full: 1000, gas: 800 } }]
        });
        brandId1 = b1._id.toString();

        const b2 = await GlobalBrand.create({
            name: 'Brand 2',
            color20mm: '#0000FF',
            color22mm: '#FFFF00',
            variants: [{ size: '35kg', regulator: '22mm', price: { full: 2000, gas: 1500 } }]
        });
        brandId2 = b2._id.toString();
    });

    it('should add multiple brands to inventory in batch', async () => {
        const res = await request(app)
            .post('/cylinders/inventory/batch')
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId)
            .send({
                globalBrandIds: [brandId1, brandId2]
            });

        expect(res.status).toBe(201);
        expect(res.body.inventory).toHaveLength(2); // 1 variant from each brand

        // Verify names
        const names = res.body.inventory.map((i: any) => i.brandName).sort();
        expect(names).toEqual(['Brand 1', 'Brand 2']);
    });

    it('should handle duplicates gracefully (ignore or fail partial)', async () => {
        // Add Brand 1 first
        await request(app)
            .post('/cylinders/inventory/batch')
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId)
            .send({ globalBrandIds: [brandId1] });

        // Add Brand 1 and Brand 2
        const res = await request(app)
            .post('/cylinders/inventory/batch')
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId)
            .send({ globalBrandIds: [brandId1, brandId2] });

        // Depending on service logic (ordered: false), it should insert the new one (Brand 2)
        // and fail on Brand 1, but return success or partial.
        // Our service returns error.insertedDocs if 11000.

        // If the service throws 11000 but returns insertedDocs, it might be 201 or 500 depending on controller.
        // Controller catches error. If service returns array from catch, it returns 201.
        // Wait, service returns array from catch block?
        // Let's check service logic:
        // catch(error) { if 11000 return insertedDocs || [] }
        // So it returns array. Controller sees array, returns 201.

        expect(res.status).toBe(201);
        // Should contain Brand 2 inventory?
        // Brand 1 was duplicate. Brand 2 should be inserted.
        // However, if we sent [brand1, brand2], and brand1 failed, brand2 might succeed if ordered: false.

        // Let's verify inventory count
        const inventoryRes = await request(app)
            .get('/cylinders/inventory')
            .set('Authorization', `Bearer ${token}`)
            .set('x-store-id', storeId);

        expect(inventoryRes.body.inventory).toHaveLength(2);
    });
});

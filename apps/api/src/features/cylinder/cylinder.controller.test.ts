import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { connect, disconnect, clearDatabase } from '../../test/db';
import { StoreInventory } from './cylinder.model';
import { GlobalBrand } from '../brand/brand.model';
import { CylinderService } from './cylinder.service';
import { User } from '../user/user.model';
import { StoreModel as Store } from '../store/store.model';
import { createToken } from '../../lib/jwt';
import mongoose from 'mongoose';
import { CylinderRoutes } from './cylinder.routes';
import { BrandRoutes } from '../brand/brand.routes';
import { vi } from 'vitest';

// Mock shared schema validation to pass whatever we send
vi.mock('@repo/shared', async () => {
    const actual = await vi.importActual('@repo/shared');
    return {
        ...(actual as any),
        globalBrandSchema: {
            safeParse: (data: any) => ({ success: true, data }),
        }
    };
});

// Fix for route mounting in tests if not already done globally
app.use('/cylinders', CylinderRoutes);
app.use('/brands', BrandRoutes);

describe('Cylinder Feature', () => {
    let token: string;
    let storeId: string;
    let userId: string;

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
    });

    describe('POST /brands', () => {
        it('should create a new global brand', async () => {
            const res = await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Bashundhara',
                    logo: 'logo.png',
                    cylinderImage: 'cyl.png',
                    color: '#FF0000',
                    type: 'cylinder'
                });

            expect(res.status).toBe(201);
            expect(res.body.brand).toHaveProperty('_id');
            expect(res.body.brand.name).toBe('Bashundhara');
        });

        it('should fail if brand name is duplicate', async () => {
            await GlobalBrand.create({
                name: 'Bashundhara',
                logo: 'logo.png',
                cylinderImage: 'cyl.png',
                color: '#FF0000',
                type: 'cylinder'
            });

            const res = await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Bashundhara',
                    logo: 'logo.png',
                    cylinderImage: 'cyl.png',
                    color: '#FF0000',
                    type: 'cylinder'
                });

            expect(res.status).toBe(409);
        });
    });

    describe('POST /cylinders/inventory/upsert', () => {
        let globalBrandId: string;

        beforeEach(async () => {
            const brand = await GlobalBrand.create({
                name: 'Bashundhara',
                logo: 'logo.png',
                cylinderImage: 'cyl.png',
                color: '#FF0000',
                type: 'cylinder'
            });
            globalBrandId = brand._id.toString();
        });

        it('should upsert inventory item (Cylinder)', async () => {
            const res = await request(app)
                .post('/cylinders/inventory/upsert')
                .set('Authorization', `Bearer ${token}`)
                .set('x-store-id', storeId)
                .send({
                    brandId: globalBrandId,
                    brandName: 'Bashundhara',
                    category: 'cylinder',
                    variant: { size: '12kg', regulator: '20mm' },
                    counts: { full: 10, empty: 5 }
                });

            expect(res.status).toBe(200);
            expect(res.body.inventory.storeId).toBe(storeId);
            expect(res.body.inventory.counts.full).toBe(10);
        });

        it('should upsert inventory item (Stove)', async () => {
            // 1. Create Stove Brand
            const stoveBrand = await GlobalBrand.create({
                name: 'RFL Stove',
                logo: 'stove.png',
                cylinderImage: 'stove_img.png',
                color: '#000000',
                type: 'stove'
            });

            // 2. Upsert
            const res = await request(app)
                .post('/cylinders/inventory/upsert')
                .set('Authorization', `Bearer ${token}`)
                .set('x-store-id', storeId)
                .send({
                    brandId: stoveBrand._id.toString(),
                    brandName: 'RFL Stove',
                    category: 'stove',
                    variant: { burners: 2 },
                    counts: { full: 5 }
                });

             expect(res.status).toBe(200);
             expect(res.body.inventory.category).toBe('stove');
             expect(res.body.inventory.variant.burners).toBe(2);
             expect(res.body.inventory.counts.full).toBe(5);
        });
    });

    describe('PATCH /cylinders/inventory/:id', () => {
        let inventoryId: string;

        beforeEach(async () => {
            const brand = await GlobalBrand.create({
                name: 'Bashundhara',
                logo: 'logo.png',
                cylinderImage: 'cyl.png',
                color: '#FF0000',
                type: 'cylinder'
            });
            const inv = await CylinderService.upsertInventory(storeId, {
                brandId: brand._id.toString(),
                brandName: 'Bashundhara',
                category: 'cylinder',
                variant: { size: '12kg', regulator: '20mm' },
                counts: { full: 0, empty: 0 }
            });
            inventoryId = inv._id.toString();
        });

        it('should update stock counts', async () => {
            const res = await request(app)
                .patch(`/cylinders/inventory/${inventoryId}`)
                .set('Authorization', `Bearer ${token}`)
                .set('x-store-id', storeId)
                .send({
                    counts: { full: 10, empty: 5 }
                });

            expect(res.status).toBe(200);
            expect(res.body.inventory.counts.full).toBe(10);
            expect(res.body.inventory.counts.empty).toBe(5);
        });
    });
});

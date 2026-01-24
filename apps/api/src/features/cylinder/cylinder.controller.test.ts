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
                    color20mm: '#FF0000',
                    color22mm: '#00FF00',
                    variants: [
                        { size: '12kg', regulator: '20mm', price: { full: 1000, gas: 800 } },
                        { size: '35kg', regulator: '22mm', price: { full: 2000, gas: 1500 } }
                    ]
                });

            expect(res.status).toBe(201);
            expect(res.body.brand).toHaveProperty('_id');
            expect(res.body.brand.name).toBe('Bashundhara');
        });

        it('should fail if brand name is duplicate', async () => {
            await GlobalBrand.create({
                name: 'Bashundhara',
                color20mm: '#FF0000',
                color22mm: '#00FF00',
                variants: [{ size: '12kg', regulator: '20mm', price: { full: 1000, gas: 800 } }]
            });

            const res = await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Bashundhara',
                    color20mm: '#FF0000',
                    color22mm: '#00FF00',
                    variants: [{ size: '12kg', regulator: '20mm', price: { full: 1000, gas: 800 } }]
                });

            expect(res.status).toBe(409);
        });
    });

    describe('POST /cylinders/inventory', () => {
        let globalBrandId: string;

        beforeEach(async () => {
            const brand = await GlobalBrand.create({
                name: 'Bashundhara',
                color20mm: '#FF0000',
                color22mm: '#00FF00',
                variants: [
                    { size: '12kg', regulator: '20mm', price: { full: 1000, gas: 800 } },
                    { size: '35kg', regulator: '22mm', price: { full: 2000, gas: 1500 } }
                ]
            });
            globalBrandId = brand._id.toString();
        });

        it('should subscribe store to a brand and create inventory items', async () => {
            const res = await request(app)
                .post('/cylinders/inventory')
                .set('Authorization', `Bearer ${token}`)
                .set('x-store-id', storeId)
                .send({ globalBrandId });

            expect(res.status).toBe(201);
            expect(res.body.inventory).toHaveLength(2); // One for each variant
            expect(res.body.inventory[0].storeId).toBe(storeId);
            expect(res.body.inventory[0].brandName).toBe('Bashundhara');
        });

        it('should fail if already subscribed', async () => {
            await CylinderService.addBrandToStore(storeId, globalBrandId);

            const res = await request(app)
                .post('/cylinders/inventory')
                .set('Authorization', `Bearer ${token}`)
                .set('x-store-id', storeId)
                .send({ globalBrandId });

            expect(res.status).toBe(500); // Or 400 depending on implementation, service throws generic error currently caught as 500
        });
    });

    describe('PATCH /cylinders/inventory/:id', () => {
        let inventoryId: string;

        beforeEach(async () => {
            const brand = await GlobalBrand.create({
                name: 'Bashundhara',
                color20mm: '#FF0000',
                color22mm: '#00FF00',
                variants: [{ size: '12kg', regulator: '20mm', price: { full: 1000, gas: 800 } }]
            });
            const items = await CylinderService.addBrandToStore(storeId, brand._id.toString());
            inventoryId = items[0]._id.toString();
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

        it('should update prices', async () => {
            const res = await request(app)
                .patch(`/cylinders/inventory/${inventoryId}`)
                .set('Authorization', `Bearer ${token}`)
                .set('x-store-id', storeId)
                .send({
                    prices: { fullCylinder: 1500 }
                });

            expect(res.status).toBe(200);
            expect(res.body.inventory.prices.fullCylinder).toBe(1500);
        });
    });
});

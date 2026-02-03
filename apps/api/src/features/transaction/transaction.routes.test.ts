import request from 'supertest';
import { app } from '../../app';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { StoreInventory } from '../cylinder/cylinder.model';
import { CustomerModel } from '../customer/customer.model';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

describe('Transaction Routes', () => {
    let mongoServer: MongoMemoryReplSet;
    let token: string;
    let storeId: string;
    let productId: string;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({
             replSet: { count: 1, storageEngine: 'wiredTiger' }
        });
        const uri = mongoServer.getUri();
        console.log('Mongo URI:', uri);
        await mongoose.connect(uri);
        // Check if ReplSet
        try {
            const status = await mongoose.connection.db?.admin().command({ replSetGetStatus: 1 });
            console.log('ReplSet Status:', status?.set);
        } catch (e) {
            console.log('ReplSet Status Check Failed:', (e as any).message);
        }

        // Ensure collections exist to avoid "catalog changes" error in transaction
        await (mongoose.connection as any).createCollection('transactions');
        await (mongoose.connection as any).createCollection('storeinventories');

        // Setup Test Data
        storeId = new mongoose.Types.ObjectId().toString();
        const staffId = new mongoose.Types.ObjectId().toString();

        token = jwt.sign(
            { userId: staffId, role: 'staff', storeId },
            process.env.JWT_SECRET || 'supersecret'
        );
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Reset Inventory
        await StoreInventory.deleteMany({});

        // Seed a Product
        productId = new mongoose.Types.ObjectId().toString();
        const brandId = new mongoose.Types.ObjectId().toString();

        await StoreInventory.create({
            _id: productId,
            storeId: new mongoose.Types.ObjectId(storeId),
            brandId: new mongoose.Types.ObjectId(brandId),
            brandName: 'Test Brand',
            variant: {
                size: '12kg',
                regulator: '20mm',
                cylinderColor: 'Red',
            },
            counts: { full: 10, empty: 5, defected: 0 },
            prices: { fullCylinder: 1500, gasOnly: 1200 }
        });
    });

    it('should create a SALE transaction and decrement full stock', async () => {
        const payload = {
            items: [
                {
                    productId: productId,
                    type: 'CYLINDER',
                    quantity: 2,
                    unitPrice: 1500,
                    variant: '12kg Red'
                }
            ],
            type: 'SALE',
            paymentMethod: 'CASH'
        };

        const res = await request(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.storeId).toBe(storeId);
        expect(res.body.totalAmount).toBe(3000); // 2 * 1500

        // Verify Inventory Update
        const inventory = await StoreInventory.findById(productId);
        expect(inventory?.counts.full).toBe(8); // 10 - 2
    });

    it('should create a RETURN transaction and increment empty stock', async () => {
        const payload = {
            items: [
                {
                    productId: productId,
                    type: 'CYLINDER',
                    quantity: 3,
                    unitPrice: 0,
                    variant: '12kg Red'
                }
            ],
            type: 'RETURN',
            paymentMethod: 'CASH'
        };

        const res = await request(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        expect(res.status).toBe(201);

        // Verify Inventory Update
        const inventory = await StoreInventory.findById(productId);
        expect(inventory?.counts.empty).toBe(8); // 5 + 3
    });

    it('should fail if authentication is missing', async () => {
        const res = await request(app).post('/transactions').send({});
        expect(res.status).toBe(401);
    });

    it('should create a transaction with due amount and update Customer balance', async () => {
        // 1. Create a Customer
        const customer = await CustomerModel.create({
            storeId: new mongoose.Types.ObjectId(storeId),
            name: 'John Due',
            phone: '01700000000',
            address: '123 St',
            totalDue: 0
        });

        const payload = {
            items: [
                {
                    productId: productId,
                    type: 'CYLINDER',
                    quantity: 1,
                    unitPrice: 1500,
                    variant: '12kg Red'
                }
            ],
            type: 'SALE',
            paymentMethod: 'DUE',
            finalAmount: 1500,
            paidAmount: 500, // Due = 1000
            customerId: customer._id.toString(),
            customerType: 'Customer'
        };

        const res = await request(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.totalAmount).toBe(1500);
        expect(res.body.finalAmount).toBe(1500);
        expect(res.body.paidAmount).toBe(500);
        expect(res.body.dueAmount).toBe(1000);

        // Verify Customer Balance Update
        const updatedCustomer = await CustomerModel.findById(customer._id);
        expect(updatedCustomer?.totalDue).toBe(1000);
    });
});

/**
 * TEST SCENARIOS (Manifest)
 * ---------------------------------------------------
 * 1. [Happy Path] Create staff in a store (201)
 * 2. [Scope] Same staff ID allowed in different stores (201)
 * 3. [Validation] Duplicate staff ID in SAME store prevented (409)
 * 4. [Security] Non-owner denied adding staff (404/403)
 * 5. [Happy Path] List staff for owner (200)
 * 6. [Auth] Staff login with correct credentials (200)
 * 7. [Auth] Staff login fails with wrong password (401)
 * ---------------------------------------------------
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { StaffPublicRoutes } from './staff.routes';
import { StoreRoutes } from '../store/store.routes'; // Needed to create stores first
import { StaffModel } from './staff.model';

// Mock Auth Middleware
vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => next(),
}));

const mockAuthMiddleware = (req: any, res: any, next: any) => {
    const mockId = req.headers['x-mock-user-id'];
    if (mockId) {
        req.user = { userId: mockId, role: 'user' };
    }
    next();
};

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use('/stores', StoreRoutes); // Mounts management routes automatically
app.use('/staff', StaffPublicRoutes); // Mounts login at /staff/login

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
    // Drop collections but keep indexes, or use deleteMany
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    await StaffModel.ensureIndexes(); // Force index creation
});

const OWNER_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439012';

describe('Staff Feature (Integration)', () => {
    let storeAId: string;
    let storeBId: string;

    beforeEach(async () => {
        // Create two stores for the same owner (or different owners, to test cross-access)
        const resA = await request(app).post('/stores').set('x-mock-user-id', OWNER_ID).send({ name: 'Store A', slug: 'store-a' });
        storeAId = resA.body.store._id;

        const resB = await request(app).post('/stores').set('x-mock-user-id', OWNER_ID).send({ name: 'Store B', slug: 'store-b' });
        storeBId = resB.body.store._id;
    });

    describe('POST /stores/:storeId/staff', () => {
        it('should create staff in a store', async () => {
            const res = await request(app)
                .post(`/stores/${storeAId}/staff`)
                .set('x-mock-user-id', OWNER_ID)
                .send({
                    name: 'Alice',
                    staffId: '001',
                    password: 'password123',
                    role: 'manager'
                });

            expect(res.status).toBe(201);
            expect(res.body.staff).toMatchObject({
                name: 'Alice',
                staffId: '001',
                storeId: storeAId,
                role: 'manager'
            });
            // Password should not be returned
            expect(res.body.staff.passwordHash).toBeUndefined();
        });

        it('should enforce scoped uniqueness (same ID allowed in different stores)', async () => {
            // Add '001' to Store A
            await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
                .send({ name: 'Alice', staffId: '001', password: 'password123' });

            // Add '001' to Store B (Should succeed)
            const res = await request(app).post(`/stores/${storeBId}/staff`).set('x-mock-user-id', OWNER_ID)
                .send({ name: 'Bob', staffId: '001', password: 'password123' });

            expect(res.status).toBe(201);
        });

        it('should prevent duplicate ID in SAME store', async () => {
             // Add '001' to Store A
             await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
             .send({ name: 'Alice', staffId: '001', password: 'password123' });

             // Add '001' again to Store A
             const res = await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
             .send({ name: 'Alice Clone', staffId: '001', password: 'password123' });

             expect(res.status).toBe(409);
        });

        it('should deny non-owner from adding staff', async () => {
            const res = await request(app)
                .post(`/stores/${storeAId}/staff`)
                .set('x-mock-user-id', OTHER_ID) // Different User
                .send({ name: 'Hacker', staffId: '999', password: 'password123' });

            expect(res.status).toBe(404); // Or 403
        });
    });

    describe('GET /stores/:storeId/staff', () => {
        it('should list staff for owner', async () => {
            await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
                .send({ name: 'Alice', staffId: '001', password: 'password123' });

            const res = await request(app).get(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID);
            expect(res.status).toBe(200);
            expect(res.body.staff).toHaveLength(1);
        });
    });

    describe('POST /staff/login', () => {
        it('should login with correct storeId + staffId + password', async () => {
            // Create Staff
            await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
                .send({ name: 'Alice', staffId: '001', password: 'password123' });

            // Login
            const res = await request(app).post('/staff/login').send({
                storeId: storeAId,
                staffId: '001',
                password: 'password123'
            });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body.staff.name).toBe('Alice');
        });

        it('should login with Store SLUG + staffId + password', async () => {
             // Create Staff in Store A (slug: store-a)
             await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
                 .send({ name: 'Bob', staffId: '002', password: 'password123' });

             // Login using SLUG 'store-a'
             const res = await request(app).post('/staff/login').send({
                 storeId: 'store-a', // Using Slug
                 staffId: '002',
                 password: 'password123'
             });

             expect(res.status).toBe(200);
             expect(res.body.staff.name).toBe('Bob');
             // Verify token contains storeId
             const decoded: any = JSON.parse(Buffer.from(res.body.accessToken.split('.')[1], 'base64').toString());
             expect(decoded.storeId).toBe(storeAId);
        });

        it('should fail with wrong password', async () => {
             // Create Staff
             await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
             .send({ name: 'Alice', staffId: '001', password: 'password123' });

             // Login
             const res = await request(app).post('/staff/login').send({
                 storeId: storeAId,
                 staffId: '001',
                 password: 'wrongpass'
             });

             expect(res.status).toBe(401);
        });
    });
});

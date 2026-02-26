/**
 * TEST SCENARIOS (Manifest)
 * ---------------------------------------------------
 * 1. [Happy Path] Create staff in a store (201) with contact field
 * 2. [Scope] Same contact allowed in DIFFERENT stores (201)
 * 3. [Validation] Duplicate contact in SAME store prevented (409)
 * 4. [Validation] Invalid role rejected (400)
 * 5. [Security] Non-owner denied adding staff (404/403)
 * 6. [Happy Path] List staff for owner (200)
 * 7. [Auth] Staff login with contact + password (200)
 * 8. [Auth] Login via store SLUG (200)
 * 9. [Auth] Wrong password fails (401)
 * 10. [Auth] Login returns populated storeId object
 * ---------------------------------------------------
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { StaffPublicRoutes } from './staff.routes';
import { StoreRoutes } from '../store/store.routes';
import { StaffModel } from './staff.model';

// Mock Auth Middleware
vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => next(),
}));

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  const mockId = req.headers['x-mock-user-id'];
  if (mockId) req.user = { userId: mockId, role: 'user' };
  next();
};

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use('/stores', StoreRoutes);
app.use('/staff', StaffPublicRoutes);

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) await collections[key].deleteMany({});
  await StaffModel.ensureIndexes();
});

const OWNER_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439012';

describe('Staff Feature (Integration)', () => {
  let storeAId: string;
  let storeBId: string;

  beforeEach(async () => {
    const resA = await request(app).post('/stores').set('x-mock-user-id', OWNER_ID).send({ name: 'Store A', slug: 'store-a' });
    storeAId = resA.body.store._id;

    const resB = await request(app).post('/stores').set('x-mock-user-id', OWNER_ID).send({ name: 'Store B', slug: 'store-b' });
    storeBId = resB.body.store._id;
  });

  // ─── CREATE ─────────────────────────────────────────────────────────────────
  describe('POST /stores/:storeId/staff', () => {
    it('[Happy Path] should create a staff member using contact (phone)', async () => {
      const res = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123', role: 'staff' });

      expect(res.status).toBe(201);
      expect(res.body.staff).toMatchObject({ name: 'Alice', contact: '01711111111', role: 'staff', storeId: storeAId });
      expect(res.body.staff.passwordHash).toBeUndefined();
    });

    it('[Happy Path] should create a staff member using contact (email)', async () => {
      const res = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Bob', contact: 'bob@example.com', password: 'password123', role: 'manager' });

      expect(res.status).toBe(201);
      expect(res.body.staff.contact).toBe('bob@example.com');
      expect(res.body.staff.role).toBe('manager');
    });

    it('[Happy Path] can create owner and driver roles', async () => {
      const ownerRes = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Shop Owner', contact: 'owner@example.com', password: 'password123', role: 'owner' });
      expect(ownerRes.status).toBe(201);
      expect(ownerRes.body.staff.role).toBe('owner');

      const driverRes = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Driver Kamal', contact: '01900000001', password: 'password123', role: 'driver' });
      expect(driverRes.status).toBe(201);
      expect(driverRes.body.staff.role).toBe('driver');
    });

    it('[Validation] should reject invalid role', async () => {
      const res = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Bad Role', contact: '01711111111', password: 'password123', role: 'superadmin' });

      expect(res.status).toBe(400);
    });

    it('[Validation] should reject missing contact field', async () => {
      const res = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OWNER_ID)
        .send({ name: 'No Contact', password: 'password123', role: 'staff' });

      expect(res.status).toBe(400);
    });

    it('[Scope] same contact allowed in DIFFERENT stores', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123' });

      const res = await request(app).post(`/stores/${storeBId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice Clone', contact: '01711111111', password: 'password123' });

      expect(res.status).toBe(201);
    });

    it('[Validation] duplicate contact in SAME store rejected', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123' });

      const res = await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice2', contact: '01711111111', password: 'password123' });

      expect(res.status).toBe(409);
    });

    it('[Security] non-owner cannot add staff', async () => {
      const res = await request(app)
        .post(`/stores/${storeAId}/staff`)
        .set('x-mock-user-id', OTHER_ID)
        .send({ name: 'Hacker', contact: '01999999999', password: 'password123' });

      expect(res.status).toBe(404);
    });
  });

  // ─── LIST ───────────────────────────────────────────────────────────────────
  describe('GET /stores/:storeId/staff', () => {
    it('[Happy Path] should list staff for store owner', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123' });

      const res = await request(app).get(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID);
      expect(res.status).toBe(200);
      expect(res.body.staff).toHaveLength(1);
      expect(res.body.staff[0].contact).toBe('01711111111');
    });
  });

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  describe('POST /staff/login', () => {
    it('[Auth] logs in with storeId + contact + password', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123', role: 'staff' });

      const res = await request(app).post('/staff/login').send({
        storeId: storeAId,
        contact: '01711111111',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.staff.name).toBe('Alice');
    });

    it('[Auth] logs in using store SLUG', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Bob', contact: 'bob@store.com', password: 'password123' });

      const res = await request(app).post('/staff/login').send({
        storeId: 'store-a',
        contact: 'bob@store.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.staff.name).toBe('Bob');
      const decoded: any = JSON.parse(Buffer.from(res.body.accessToken.split('.')[1], 'base64').toString());
      expect(decoded.storeId).toBe(storeAId);
    });

    it('[Auth] fails with wrong password', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123' });

      const res = await request(app).post('/staff/login').send({
        storeId: storeAId,
        contact: '01711111111',
        password: 'wrongpass',
      });

      expect(res.status).toBe(401);
    });

    it('[Auth] fails with wrong contact', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Alice', contact: '01711111111', password: 'password123' });

      const res = await request(app).post('/staff/login').send({
        storeId: storeAId,
        contact: '01799999999',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });

    it('[Auth] returns populated storeId object on login', async () => {
      await request(app).post(`/stores/${storeAId}/staff`).set('x-mock-user-id', OWNER_ID)
        .send({ name: 'Charlie', contact: 'charlie@store.com', password: 'password123' });

      const res = await request(app).post('/staff/login').send({
        storeId: storeAId,
        contact: 'charlie@store.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(typeof res.body.staff.storeId).toBe('object');
      expect(res.body.staff.storeId).toHaveProperty('name', 'Store A');
      expect(res.body.staff.storeId._id).toBe(storeAId);
    });
  });
});

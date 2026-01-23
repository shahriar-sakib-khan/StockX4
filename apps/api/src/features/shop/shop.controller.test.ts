import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ShopRoutes } from './shop.routes';

// Mock Auth Middleware
vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const storeId = req.headers['x-store-id'];
    // Mock user attached to request (Assuming owner/manager)
    req.user = { userId: 'mock-user-id', role: 'owner' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/shops', ShopRoutes);

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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

const STORE_A = '507f1f77bcf86cd799439011';
const STORE_B = '507f1f77bcf86cd799439012';

describe('Shop Feature (Integration)', () => {
  describe('POST /shops', () => {
    it('should create a shop for a specific store', async () => {
      const res = await request(app)
        .post('/shops')
        .set('x-store-id', STORE_A)
        .send({
          name: 'Local Corner Shop',
          phone: '01711223344',
          address: 'Dhaka, Bangladesh'
        });

      expect(res.status).toBe(201);
      expect(res.body.shop).toMatchObject({
        name: 'Local Corner Shop',
        storeId: STORE_A,
        phone: '01711223344'
      });
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/shops')
        .set('x-store-id', STORE_A)
        .send({
          name: 'Incomplete Shop'
          // Missing phone, address
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should prevent duplicate phone numbers in the SAME store', async () => {
      await request(app).post('/shops').set('x-store-id', STORE_A).send({
        name: 'Shop 1', phone: '01700000000', address: 'Loc 1'
      });

      const res = await request(app).post('/shops').set('x-store-id', STORE_A).send({
        name: 'Shop 2', phone: '01700000000', address: 'Loc 2'
      });

      expect(res.status).toBe(409);
    });

    it('should allow same phone number in DIFFERENT stores', async () => {
      await request(app).post('/shops').set('x-store-id', STORE_A).send({
        name: 'Shop A', phone: '01700000000', address: 'Loc A'
      });

      const res = await request(app).post('/shops').set('x-store-id', STORE_B).send({
        name: 'Shop B', phone: '01700000000', address: 'Loc B'
      });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /shops', () => {
    it('should list only shops for the requesting store', async () => {
      await request(app).post('/shops').set('x-store-id', STORE_A).send({ name: 'A1', phone: '01711111111', address: 'A' });
      await request(app).post('/shops').set('x-store-id', STORE_B).send({ name: 'B1', phone: '01722222222', address: 'B' });

      const res = await request(app).get('/shops').set('x-store-id', STORE_A);

      expect(res.status).toBe(200);
      expect(res.body.shops).toHaveLength(1);
      expect(res.body.shops[0].name).toBe('A1');
    });
  });

  describe('GET /shops/:id', () => {
    it('should return shop details if owned by store', async () => {
      const create = await request(app).post('/shops').set('x-store-id', STORE_A).send({ name: 'Detail Shop', phone: '01733333333', address: 'D' });
      const id = create.body.shop._id;

      const res = await request(app).get(`/shops/${id}`).set('x-store-id', STORE_A);
      expect(res.status).toBe(200);
      expect(res.body.shop._id).toBe(id);
    });

    it('should return 404 if accessed by different store', async () => {
      const create = await request(app).post('/shops').set('x-store-id', STORE_A).send({ name: 'Secret Shop', phone: '01744444444', address: 'S' });
      const id = create.body.shop._id;

      const res = await request(app).get(`/shops/${id}`).set('x-store-id', STORE_B);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /shops/:id', () => {
    it('should delete shop', async () => {
      const create = await request(app).post('/shops').set('x-store-id', STORE_A).send({ name: 'Del Shop', phone: '01755555555', address: 'Del' });
      const id = create.body.shop._id;

      const res = await request(app).delete(`/shops/${id}`).set('x-store-id', STORE_A);
      expect(res.status).toBe(200);

      const check = await request(app).get(`/shops/${id}`).set('x-store-id', STORE_A);
      expect(check.status).toBe(404);
    });
  });
});

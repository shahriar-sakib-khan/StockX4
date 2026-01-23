import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ProductRoutes } from './product.routes';

vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'mock-user-id', role: 'owner' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/products', ProductRoutes);

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

describe('Product Feature (Integration)', () => {
  it('should create a product', async () => {
    const res = await request(app)
      .post('/products')
      .set('x-store-id', STORE_A)
      .send({
        name: 'Gas Stove Double',
        type: 'stove',
        costPrice: 2000,
        sellingPrice: 2500,
        stock: 10
      });

    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe('Gas Stove Double');
  });

  it('should fail with invalid Enum type', async () => {
    const res = await request(app)
      .post('/products')
      .set('x-store-id', STORE_A)
      .send({
        name: 'Weird Item',
        type: 'spaceship', // Invalid
        costPrice: 100,
        sellingPrice: 200
      });

    expect(res.status).toBe(400);
  });

  it('should prevent duplicate product name in same store', async () => {
    const item = { name: 'Regulator', type: 'regulator', costPrice: 100, sellingPrice: 150 };
    await request(app).post('/products').set('x-store-id', STORE_A).send(item);

    const res = await request(app).post('/products').set('x-store-id', STORE_A).send(item);
    expect(res.status).toBe(409);
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { CustomerRoutes } from './customer.routes';

vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'mock-user-id', role: 'owner' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/customers', CustomerRoutes);

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

describe('Customer Feature (Integration)', () => {
  it('should create a customer (B2C)', async () => {
    const res = await request(app)
      .post('/customers')
      .set('x-store-id', STORE_A)
      .send({
        name: 'John Doe',
        phone: '01755667788',
        address: 'Home Address'
      });

    expect(res.status).toBe(201);
    expect(res.body.customer.name).toBe('John Doe');
  });

  it('should prevent duplicate phone in same store', async () => {
    await request(app).post('/customers').set('x-store-id', STORE_A).send({ name: 'C1', phone: '01700000000' });
    const res = await request(app).post('/customers').set('x-store-id', STORE_A).send({ name: 'C2', phone: '01700000000' });
    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid phone number (too short)', async () => {
    const res = await request(app).post('/customers').set('x-store-id', STORE_A).send({ name: 'C3', phone: '017' });
    expect(res.status).toBe(400);
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { VehicleRoutes } from './vehicle.routes';

vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'mock-user-id', role: 'owner' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/vehicles', VehicleRoutes);

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

describe('Vehicle Feature (Integration)', () => {
  it('should create a vehicle', async () => {
    const res = await request(app)
      .post('/vehicles')
      .set('x-store-id', STORE_A)
      .send({
        licensePlate: 'DHAKA-METRO-GA-1234',
        vehicleModel: 'Tata Ace',
        driverName: 'Driver X',
        driverPhone: '01711111111'
      });

    expect(res.status).toBe(201);
    expect(res.body.vehicle.licensePlate).toBe('DHAKA-METRO-GA-1234');
  });

  it('should prevent duplicate license plate in same store', async () => {
    const truck = { licensePlate: 'TRUCK-1', vehicleModel: 'T1' };
    await request(app).post('/vehicles').set('x-store-id', STORE_A).send(truck);

    const res = await request(app).post('/vehicles').set('x-store-id', STORE_A).send(truck);
    expect(res.status).toBe(409);
  });
});

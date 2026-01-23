/**
 * TEST SCENARIOS (Manifest)
 * ---------------------------------------------------
 * 1. [Happy Path] Create store for authenticated user (201)
 * 2. [Validation] Create store rejects invalid input (400)
 * 3. [Isolation] GET /stores only returns user's stores (200)
 * 4. [Security] GET /stores/:id denies access to other user's store (404)
 * 5. [Happy Path] PUT /stores/:id updates store details (200)
 * 6. [Security] PUT /stores/:id denies update by non-owner (404)
 * 7. [Happy Path] DELETE /stores/:id removes store (200)
 * ---------------------------------------------------
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { StoreRoutes } from './store.routes';

// Mock Auth Middleware to simulate logged-in users
import { vi } from 'vitest';

// Must mock relative to the file path of test file
vi.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => next(),
}));

// We can define the middleware here to attach the user
const mockAuthMiddleware = (req: any, res: any, next: any) => {
    // Check if header is present
    const mockId = req.headers['x-mock-user-id'];
    if (mockId) {
        req.user = { userId: mockId, role: 'user' }; // Use userId to match interface
    }
    next();
};

const app = express();
app.use(express.json());

// We will mount routes dynamically to switch users in tests or just use a helper
// For simplicity, I'll define two apps or just use one and change the middleware?
// Better: route uses a specific middleware instance? No, that's hard.
// Alternative: Pass userId as a header 'x-mock-user-id' and have a test-only middleware read it.

app.use(mockAuthMiddleware);

// Mount the real routes
app.use('/stores', StoreRoutes);

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
  if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
  }
});

const USER_A_ID = '507f1f77bcf86cd799439011';
const USER_B_ID = '507f1f77bcf86cd799439012';

describe('Store Feature (Integration)', () => {

  describe('POST /stores', () => {
    it('should create a store for the authenticated user and generate 6-char ID', async () => {
      const res = await request(app)
        .post('/stores')
        .set('x-mock-user-id', USER_A_ID)
        .send({ name: 'User A Store' });

      expect(res.status).toBe(201);
      expect(res.body.store).toMatchObject({
        name: 'User A Store',
        ownerId: USER_A_ID,
      });
      // Verify generated ID
      expect(res.body.store.slug).toHaveLength(6);
      expect(res.body.store.slug).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should validate input using shared schema', async () => {
      const res = await request(app)
        .post('/stores')
        .set('x-mock-user-id', USER_A_ID)
        .send({ name: 'Hi' }); // Too short

      expect(res.status).toBe(400);
    });
  });

  describe('GET /stores (Isolation)', () => {
    it('should only return stores belonging to the user', async () => {
      // Create Store for A
      await request(app).post('/stores').set('x-mock-user-id', USER_A_ID).send({ name: 'Store A' });
      // Create Store for B
      await request(app).post('/stores').set('x-mock-user-id', USER_B_ID).send({ name: 'Store B' });

      // Query as A
      const resA = await request(app).get('/stores').set('x-mock-user-id', USER_A_ID);
      expect(resA.status).toBe(200);
      expect(resA.body.stores).toHaveLength(1);
      expect(resA.body.stores[0].name).toBe('Store A');

      // Query as B
      const resB = await request(app).get('/stores').set('x-mock-user-id', USER_B_ID);
      expect(resB.status).toBe(200);
      expect(resB.body.stores).toHaveLength(1);
      expect(resB.body.stores[0].name).toBe('Store B');
    });
  });

  describe('GET /stores/:id', () => {
    it('should deny access to another user\'s store', async () => {
      // Create Store A
      const createRes = await request(app).post('/stores').set('x-mock-user-id', USER_A_ID).send({ name: 'Store A' });
      const storeId = createRes.body.store._id;

      // Try access as B
      const res = await request(app).get(`/stores/${storeId}`).set('x-mock-user-id', USER_B_ID);
      expect(res.status).toBe(404); // 404 is safer than 403 for enumeration checks
    });
  });

  describe('PUT /stores/:id', () => {
    it('should update store details', async () => {
       const createRes = await request(app).post('/stores').set('x-mock-user-id', USER_A_ID).send({ name: 'Old Name' });
       const storeId = createRes.body.store._id;

       const res = await request(app)
        .put(`/stores/${storeId}`)
        .set('x-mock-user-id', USER_A_ID)
        .send({ name: 'New Name' });

       expect(res.status).toBe(200);
       expect(res.body.store.name).toBe('New Name');
    });

    it('should deny update to non-owner', async () => {
        const createRes = await request(app).post('/stores').set('x-mock-user-id', USER_A_ID).send({ name: 'My Store' });
        const storeId = createRes.body.store._id;

        const res = await request(app)
         .put(`/stores/${storeId}`)
         .set('x-mock-user-id', USER_B_ID)
         .send({ name: 'Hacked Name' });

        expect(res.status).toBe(404);
    });
  });

  describe('DELETE /stores/:id', () => {
      it('should delete the store', async () => {
        const createRes = await request(app).post('/stores').set('x-mock-user-id', USER_A_ID).send({ name: 'To Delete' });
        const storeId = createRes.body.store._id;

        const res = await request(app).delete(`/stores/${storeId}`).set('x-mock-user-id', USER_A_ID);
        expect(res.status).toBe(200);

        // Verify gone
        const check = await request(app).get(`/stores/${storeId}`).set('x-mock-user-id', USER_A_ID);
        expect(check.status).toBe(404);
      });
  });
});

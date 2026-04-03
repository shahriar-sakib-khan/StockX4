/**
 * SALARY MODULE — TEST MANIFEST
 * ─────────────────────────────────────────────────────
 * 1. [Happy Path] Pay salary → creates SALARY transaction + decrements salaryDue (201)
 * 2. [Happy Path] Pay bonus → creates SALARY transaction, does NOT decrement salaryDue (201)
 * 3. [Happy Path] Get salary history → returns only this staff's SALARY transactions (200)
 * 4. [Happy Path] Process accruals → increments salaryDue + updates lastSalaryProcessed (200)
 * 5. [Fix] Process accruals is idempotent — calling twice in same month doesn't double-accrue
 * 6. [Fix] salaryEnabled=false staff is skipped during accrual
 * 7. [Fix] Staff with salary=0 is skipped during accrual
 * 8. [Edge] Pay salary with amount > salaryDue → salaryDue goes negative (overpay allowed)
 * 9. [Edge] Staff not found → 404
 * 10. [Auth] Unauthenticated request → 401
 * 11. [Validation] Missing/invalid amount → 400
 * 12. [Tenant] Salary history respects store isolation
 * ─────────────────────────────────────────────────────
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { StaffModel } from '../staff.model';
import { Transaction } from '../../transaction/transaction.model';

describe('Salary Module (Integration)', () => {
  let mongoServer: MongoMemoryReplSet;
  let token: string;
  let storeId: string;
  let ownerId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(mongoServer.getUri());

    // Ensure collections exist to avoid catalog errors in transactions
    const conn = mongoose.connection as any;
    try { await conn.createCollection('transactions'); } catch {}
    try { await conn.createCollection('staffs'); } catch {}
    try { await conn.createCollection('stores'); } catch {}

    // Create a store via the API
    ownerId = new mongoose.Types.ObjectId().toString();
    token = jwt.sign(
      { userId: ownerId, role: 'user' },
      process.env.JWT_SECRET || 'supersecret'
    );

    const storeRes = await request(app)
      .post('/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Store', slug: 'test-store' });

    storeId = storeRes.body.store._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean staff and transactions between tests, keep the store
    await StaffModel.deleteMany({});
    await Transaction.deleteMany({});
  });

  /** Helper: create a staff member directly in DB  */
  const createStaff = async (overrides: Partial<any> = {}) => {
    const argon2 = await import('argon2');
    const hash = await argon2.hash('password123');
    return StaffModel.create({
      storeId,
      name: 'Test Staff',
      contact: '01700000001',
      passwordHash: hash,
      role: 'staff',
      salary: 10000,
      salaryDue: 5000,
      salaryEnabled: true,
      isActive: true,
      lastSalaryProcessed: new Date(),
      ...overrides,
    });
  };

  // ─── PAY SALARY ───────────────────────────────────────────────────────────
  describe('POST /stores/:storeId/staff/:staffId/salary/pay', () => {
    it('[Happy Path] should create SALARY transaction and decrement salaryDue', async () => {
      const staff = await createStaff();

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000 });

      expect(res.status).toBe(201);
      expect(res.body.transaction.type).toBe('SALARY');
      expect(res.body.transaction.finalAmount).toBe(5000);

      // Verify salaryDue decremented
      const updated = await StaffModel.findById(staff._id);
      expect(updated!.salaryDue).toBe(0); // 5000 - 5000
    });

    it('[Happy Path] bonus payment does NOT decrement salaryDue', async () => {
      const staff = await createStaff({ salaryDue: 5000 });

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 0, bonusAmount: 3000 });

      expect(res.status).toBe(201);
      expect(res.body.transaction.type).toBe('SALARY');

      // salaryDue unchanged
      const updated = await StaffModel.findById(staff._id);
      expect(updated!.salaryDue).toBe(5000);
    });

    it('[Edge] overpaying salary makes salaryDue negative', async () => {
      const staff = await createStaff({ salaryDue: 2000 });

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000 });

      expect(res.status).toBe(201);

      const updated = await StaffModel.findById(staff._id);
      expect(updated!.salaryDue).toBe(-3000); // 2000 - 5000
    });

    it('[Edge] staff not found → 404', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${fakeId}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000 });

      expect(res.status).toBe(404);
    });

    it('[Validation] missing amount → 400', async () => {
      const staff = await createStaff();

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('[Validation] negative amount → 400', async () => {
      const staff = await createStaff();

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -100 });

      expect(res.status).toBe(400);
    });

    it('[Auth] unauthenticated → 401', async () => {
      const staff = await createStaff();

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .send({ amount: 5000 });

      expect(res.status).toBe(401);
    });
  });

  // ─── SALARY HISTORY ────────────────────────────────────────────────────────
  describe('GET /stores/:storeId/staff/:staffId/salary/history', () => {
    it('[Happy Path] returns only this staff member\'s SALARY transactions', async () => {
      const staffA = await createStaff({ contact: '01700000001' });
      const staffB = await createStaff({ contact: '01700000002', name: 'Other Staff' });

      // Pay salary to both
      await request(app)
        .post(`/stores/${storeId}/staff/${staffA._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000 });

      await request(app)
        .post(`/stores/${storeId}/staff/${staffB._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 3000 });

      // Get history for staffA only
      const res = await request(app)
        .get(`/stores/${storeId}/staff/${staffA._id}/salary/history`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].finalAmount).toBe(5000);
      expect(res.body.meta.total).toBe(1);
    });

    it('[Tenant] does not leak salary data from other stores', async () => {
      // Create staff in our store
      const staff = await createStaff();

      // Pay salary
      await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000 });

      // Create another store
      const otherOwnerId = new mongoose.Types.ObjectId().toString();
      const otherToken = jwt.sign(
        { userId: otherOwnerId, role: 'user' },
        process.env.JWT_SECRET || 'supersecret'
      );
      const otherStoreRes = await request(app)
        .post('/stores')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Other Store', slug: 'other-store' });

      const otherStoreId = otherStoreRes.body.store._id;

      // Try to access staff's salary from the other store — should get 404 (store auth fails)
      const res = await request(app)
        .get(`/stores/${otherStoreId}/staff/${staff._id}/salary/history`)
        .set('Authorization', `Bearer ${token}`);

      // Token owner doesn't own otherStoreId → 404 from StoreService.findOne
      expect(res.status).toBe(404);
    });

    it('[Auth] unauthenticated → 401', async () => {
      const staff = await createStaff();

      const res = await request(app)
        .get(`/stores/${storeId}/staff/${staff._id}/salary/history`);

      expect(res.status).toBe(401);
    });
  });

  // ─── SALARY ACCRUAL ────────────────────────────────────────────────────────
  describe('POST /stores/:storeId/staff/:staffId/salary/accrue', () => {
    it('[Happy Path] increments salaryDue and updates lastSalaryProcessed', async () => {
      // Create staff with lastSalaryProcessed 2 months ago
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const staff = await createStaff({
        salary: 10000,
        salaryDue: 0,
        lastSalaryProcessed: twoMonthsAgo,
      });

      const res = await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/accrue`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await StaffModel.findById(staff._id);
      // Should have accrued 2 months × 10000 = 20000
      expect(updated!.salaryDue).toBe(20000);
      // lastSalaryProcessed should be updated to 1st of current month
      const now = new Date();
      expect(updated!.lastSalaryProcessed!.getMonth()).toBe(now.getMonth());
      expect(updated!.lastSalaryProcessed!.getFullYear()).toBe(now.getFullYear());
    });

    it('[Fix] calling accrue twice in same month does NOT double-accrue', async () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const staff = await createStaff({
        salary: 10000,
        salaryDue: 0,
        lastSalaryProcessed: twoMonthsAgo,
      });

      // First call
      await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/accrue`)
        .set('Authorization', `Bearer ${token}`);

      const afterFirst = await StaffModel.findById(staff._id);
      expect(afterFirst!.salaryDue).toBe(20000);

      // Second call — same month, should NOT accrue again
      await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/accrue`)
        .set('Authorization', `Bearer ${token}`);

      const afterSecond = await StaffModel.findById(staff._id);
      expect(afterSecond!.salaryDue).toBe(20000); // unchanged
    });

    it('[Fix] salaryEnabled=false staff is skipped', async () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const staff = await createStaff({
        salary: 10000,
        salaryDue: 0,
        salaryEnabled: false,
        lastSalaryProcessed: twoMonthsAgo,
      });

      await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/accrue`)
        .set('Authorization', `Bearer ${token}`);

      const updated = await StaffModel.findById(staff._id);
      expect(updated!.salaryDue).toBe(0); // unchanged
    });

    it('[Fix] salary=0 staff is skipped', async () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const staff = await createStaff({
        salary: 0,
        salaryDue: 0,
        lastSalaryProcessed: twoMonthsAgo,
      });

      await request(app)
        .post(`/stores/${storeId}/staff/${staff._id}/salary/accrue`)
        .set('Authorization', `Bearer ${token}`);

      const updated = await StaffModel.findById(staff._id);
      expect(updated!.salaryDue).toBe(0); // unchanged
    });
  });
});

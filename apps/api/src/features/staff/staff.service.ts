import { StaffModel } from './staff.model';
import { CreateStaffInput, StaffLoginInput } from '@repo/shared';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export class StaffService {
  static async create(storeId: string, data: CreateStaffInput) {
    // Enforce unique contact (phone/email) per store
    const existing = await StaffModel.findOne({ storeId, contact: data.contact.trim() });
    if (existing) throw new Error(`A staff member with contact "${data.contact}" already exists in this store`);

    const passwordHash = await argon2.hash(data.password);
    const staff = await StaffModel.create({
      storeId,
      name: data.name,
      contact: data.contact.trim(),
      passwordHash,
      role: data.role,
      image: data.image,
      salary: data.salary ?? 0,
      salaryDue: data.salaryDue ?? 0,
    });

    const { passwordHash: _, ...safeStaff } = staff.toObject();
    return safeStaff;
  }

  /**
   * Auto-creates an owner staff record when a new store is set up.
   * Called from StoreService.setupStore after the store is created.
   */
  static async createOwnerStaff(
    storeId: string,
    ownerContact: string,
    ownerName: string,
    temporaryPassword: string = 'owner123'
  ) {
    const passwordHash = await argon2.hash(temporaryPassword);
    const staff = await StaffModel.create({
      storeId,
      name: ownerName,
      contact: ownerContact,
      passwordHash,
      role: 'owner',
      salary: 0,
      salaryDue: 0,
    });
    const { passwordHash: _, ...safeStaff } = staff.toObject();
    return safeStaff;
  }

  static async update(storeId: string, staffDocId: string, data: Partial<CreateStaffInput>) {
    const updatePayload: any = { ...data };
    if (data.password) {
      updatePayload.passwordHash = await argon2.hash(data.password);
      delete updatePayload.password;
    }
    const staff = await StaffModel.findOneAndUpdate(
      { _id: staffDocId, storeId },
      updatePayload,
      { new: true }
    ).select('-passwordHash');
    if (!staff) throw new Error('Staff not found');
    return staff;
  }

  static async delete(storeId: string, staffDocId: string) {
    const result = await StaffModel.deleteOne({ _id: staffDocId, storeId });
    if (result.deletedCount === 0) throw new Error('Staff not found');
    return true;
  }

  static async findByStore(storeId: string) {
    await this.processMonthlySalaries(storeId);
    return StaffModel.find({ storeId }).select('-passwordHash');
  }

  static async processMonthlySalaries(storeId: string) {
    const staffMembers = await StaffModel.find({ storeId, isActive: true });
    const now = new Date();
    for (const staff of staffMembers) {
      if (!staff.salary || staff.salary <= 0) continue;
      const lastProcessed = staff.lastSalaryProcessed || staff.createdAt;
      const monthsDiff =
        (now.getFullYear() - lastProcessed.getFullYear()) * 12 + (now.getMonth() - lastProcessed.getMonth());
      if (monthsDiff > 0) {
        staff.salaryDue = (staff.salaryDue || 0) + staff.salary * monthsDiff;
        staff.lastSalaryProcessed = now;
        await staff.save();
      }
    }
  }

  static async login(data: StaffLoginInput) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(data.storeId);
    const { StoreModel } = await import('../store/store.model');
    const storeQuery = isObjectId
      ? { _id: data.storeId }
      : { $or: [{ slug: data.storeId }, { code: data.storeId }] };

    const store = await StoreModel.findOne(storeQuery);
    if (!store) throw new Error('Invalid Store ID');

    // Find by contact (phone or email)
    const staff = await StaffModel.findOne({
      storeId: store._id,
      contact: data.contact,
    }).populate('storeId');

    if (!staff) throw new Error('Invalid credentials');
    if (!staff.isActive) throw new Error('Account inactive');

    const valid = await argon2.verify(staff.passwordHash, data.password);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { userId: staff._id, role: staff.role, storeId: (staff.storeId as any)._id, type: 'staff' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    const { passwordHash: _, ...safeStaff } = staff.toObject();
    return { accessToken: token, staff: safeStaff };
  }
}

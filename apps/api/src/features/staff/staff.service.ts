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

  static async update(storeId: string, staffDocId: string, data: any) {
    const updatePayload: any = { ...data };
    
    // Check if there is an immediate salary change that requires a bump to salaryDue
    const existingStaff = await StaffModel.findOne({ _id: staffDocId, storeId });
    if (!existingStaff) throw new Error('Staff not found');

    if (data.salary !== undefined) {
      if (!data.salaryEffectiveDate || data.salaryEffectiveDate === 'immediate') {
         if (data.salary !== existingStaff.salary) {
             const diff = data.salary - existingStaff.salary;
             // Add the difference between the new and old salary to the due balance immediately
             updatePayload.salaryDue = (existingStaff.salaryDue || 0) + diff;
         }
      }
    }

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
    return StaffModel.find({ storeId }).select('-passwordHash');
  }
}

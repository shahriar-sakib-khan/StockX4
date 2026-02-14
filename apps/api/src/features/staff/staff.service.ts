import { StaffModel, IStaff } from './staff.model';
import { CreateStaffInput, StaffLoginInput } from '@repo/shared';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export class StaffService {
  static async create(storeId: string, data: CreateStaffInput) {
    const passwordHash = await argon2.hash(data.password);

    // Check duplication manually to return clean error?
    // Mongoose index handles it, but catching 11000 in controller is fine.

    const staff = await StaffModel.create({
      storeId,
      name: data.name,
      staffId: data.staffId,
      passwordHash,
      role: data.role,
      image: data.image,
    });

    // Don't return passwordHash
    const staffObj = staff.toObject();
    const { passwordHash: _, ...safeStaffModel } = staffObj;
    return safeStaffModel;
  }

  static async update(storeId: string, staffId: string, data: Partial<CreateStaffInput>) {
    const updatePayload: any = { ...data };

    if (data.password) {
        updatePayload.passwordHash = await argon2.hash(data.password);
        delete updatePayload.password;
    }

    const staff = await StaffModel.findOneAndUpdate(
        { _id: staffId, storeId },
        updatePayload,
        { new: true }
    ).select('-passwordHash');

    if (!staff) throw new Error('StaffModel not found');
    return staff;
  }

  static async delete(storeId: string, staffId: string) {
    const result = await StaffModel.deleteOne({ _id: staffId, storeId });
    if (result.deletedCount === 0) throw new Error('StaffModel not found');
    return true;
  }

  static async findByStore(storeId: string) {
    await this.processMonthlySalaries(storeId);
    return StaffModel.find({ storeId }).select('-passwordHash');
  }

  static async processMonthlySalaries(storeId: string) {
      // Find all active staff in this store
      const staffMembers = await StaffModel.find({ storeId, isActive: true });
      const now = new Date();

      for (const staff of staffMembers) {
          if (!staff.salary || staff.salary <= 0) continue;

          const lastProcessed = staff.lastSalaryProcessed || staff.createdAt;

          // Calculate months difference
          // This logic ensures we only add if a NEW month has started since last processed
          const monthsDiff = (now.getFullYear() - lastProcessed.getFullYear()) * 12 + (now.getMonth() - lastProcessed.getMonth());

          if (monthsDiff > 0) {
              const amountToAdd = staff.salary * monthsDiff;

              // Update staff
              staff.salaryDue = (staff.salaryDue || 0) + amountToAdd;
              staff.lastSalaryProcessed = now; // Set to now to mark as processed for this month(s)
              await staff.save();
          }
      }
  }

  static async login(data: StaffLoginInput) {
    // 1. Resolve Store Short ID (Slug) to _id
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(data.storeId);

    // Dynamic import to avoid circular dependency
    const { StoreModel } = await import('../store/store.model');
    const store = await StoreModel.findOne(isObjectId ? { _id: data.storeId } : { slug: data.storeId });

    if (!store) {
        throw new Error('Invalid Store ID');
    }

    const staff = await StaffModel.findOne({
      storeId: store._id,
      staffId: data.staffId
    }).populate('storeId'); // Populate store to return context?

    if (!staff) {
        throw new Error('Invalid credentials');
    }

    if (!staff.isActive) {
        throw new Error('Account inactive');
    }

    const valid = await argon2.verify(staff.passwordHash, data.password);
    if (!valid) {
        throw new Error('Invalid credentials');
    }

    // Generate Token (Special StaffModel Scope)
    const token = jwt.sign(
      {
        userId: staff._id, // Using standard userId claim
        role: staff.role,
        storeId: staff.storeId._id, // Extra claim
        type: 'staff' // Type discriminator
      },
      JWT_SECRET,
      { expiresIn: '12h' } // POS shifts might be long
    );

    const { passwordHash: _, ...safeStaffModel } = staff.toObject();

    return {
        accessToken: token,
        staff: safeStaffModel,
    };
  }
}

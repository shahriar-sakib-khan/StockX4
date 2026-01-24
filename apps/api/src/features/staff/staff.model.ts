import { Schema, model, Document, Types } from 'mongoose';
import { StaffRole, CreateStaffInput } from '@repo/shared';
import { z } from 'zod';

export interface IStaff extends Omit<CreateStaffInput, 'password'>, Document {
  storeId: Types.ObjectId;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    staffId: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: StaffRole.options, default: 'staff' },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for scoped uniqueness
staffSchema.index({ storeId: 1, staffId: 1 }, { unique: true });

export const StaffModel = model<IStaff>('Staff', staffSchema);

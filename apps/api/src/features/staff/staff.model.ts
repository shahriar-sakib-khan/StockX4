import { Schema, model, Document, Types } from 'mongoose';
import { StaffRole } from '@repo/shared';

export interface IStaff extends Document {
  storeId: Types.ObjectId;
  name: string;
  contact: string;          // phone OR email — unique key per store
  passwordHash: string;
  role: 'owner' | 'manager' | 'staff' | 'driver';
  image?: string;
  salary: number;
  salaryDue: number;
  lastSalaryProcessed?: Date;
  isActive: boolean;
  salaryEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },   // phone number OR email
    passwordHash: { type: String, required: true },
    role: { type: String, enum: StaffRole.options, default: 'staff' },
    image: { type: String },
    salary: { type: Number, default: 0 },
    salaryDue: { type: Number, default: 0 },
    lastSalaryProcessed: { type: Date, default: new Date() },
    isActive: { type: Boolean, default: true },
    salaryEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound unique index: one contact per store
staffSchema.index({ storeId: 1, contact: 1 }, { unique: true });

export const StaffModel = model<IStaff>('Staff', staffSchema);

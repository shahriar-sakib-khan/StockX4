import { Schema, model, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  storeId: Types.ObjectId;
  name: string;
  staffId: string;
  passwordHash: string;
  role: 'manager' | 'cashier' | 'staff' | 'driver';
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
    role: { type: String, enum: ['manager', 'cashier', 'staff', 'driver'], default: 'staff' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for scoped uniqueness
staffSchema.index({ storeId: 1, staffId: 1 }, { unique: true });

export const StaffModel = model<IStaff>('Staff', staffSchema);

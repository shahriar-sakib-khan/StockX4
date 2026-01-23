import mongoose, { Document, Schema } from 'mongoose';
import { CustomerInput } from '@repo/shared';

export interface ICustomer extends CustomerInput, Document {
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
  },
  { timestamps: true }
);

// Unique customer per store by phone
customerSchema.index({ storeId: 1, phone: 1 }, { unique: true });

export const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);

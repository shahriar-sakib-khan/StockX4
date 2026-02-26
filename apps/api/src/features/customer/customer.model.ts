import mongoose, { Document, Schema } from 'mongoose';
import { CustomerInput } from '@repo/shared';

export interface ICustomer extends CustomerInput, Document {
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  totalDue: number;
  dueCylinders?: {
    productId: string;
    brandName: string;
    quantity: number;
  }[];
}

const customerSchema = new Schema<ICustomer>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    type: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
    name: { type: String, required: true },
    ownerName: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    district: { type: String },
    imageUrl: { type: String },
    totalDue: { type: Number, default: 0 },
    dueCylinders: [
      {
        productId: { type: String, required: true },
        brandName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        _id: false
      }
    ],
  },
  { timestamps: true }
);

// Unique customer per store by phone
customerSchema.index({ storeId: 1, phone: 1 }, { unique: true });

export const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);

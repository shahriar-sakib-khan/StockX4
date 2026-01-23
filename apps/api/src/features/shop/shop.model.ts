import mongoose, { Document, Schema } from 'mongoose';
import { ShopInput } from '@repo/shared';

export interface IShop extends ShopInput, Document {
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    ownerName: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String },
  },
  { timestamps: true }
);

// Unique shop per store by phone
shopSchema.index({ storeId: 1, phone: 1 }, { unique: true });

export const ShopModel = mongoose.model<IShop>('Shop', shopSchema);

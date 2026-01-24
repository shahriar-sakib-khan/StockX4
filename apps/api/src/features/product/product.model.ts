import mongoose, { Document, Schema } from 'mongoose';
import { ProductInput } from '@repo/shared';

export interface IProduct extends ProductInput, Document {
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["stove", "regulator", "pipe", "accessory", "other"], required: true },
    brand: { type: String },
    description: { type: String },

    modelNumber: { type: String },
    burnerCount: { type: String, enum: ['single', 'double'] },
    size: { type: String, enum: ['22mm', '20mm'] },

    stock: { type: Number, default: 0, min: 0 },
    lowStockAlert: { type: Number, default: 5, min: 0 },

    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Unique product name per store
productSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);

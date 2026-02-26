import mongoose, { Document, Schema } from 'mongoose';

/**
 * GlobalProduct — a catalog of generic product TEMPLATES.
 * These are NOT tied to any store. They exist globally.
 *
 * When a new store is created, these templates are copied
 * into that store's Product collection with zero stock/prices.
 *
 * Think of it like a product library that every store starts from.
 */
export interface IGlobalProduct extends Document {
  key: string;           // unique identifier e.g. 'stove-1burner', 'regulator-22mm'
  name: string;          // display name e.g. '1-Burner Gas Stove'
  type: 'stove' | 'regulator';
  burnerCount?: '1' | '2' | '3' | '4';       // stoves only
  regulatorType?: '22mm' | '20mm';            // regulators only (was `size`)
  image: string;         // Cloudinary URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalProductSchema = new Schema<IGlobalProduct>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['stove', 'regulator'],
      required: true,
    },
    burnerCount: {
      type: String,
      enum: ['1', '2', '3', '4'],
    },
    regulatorType: {
      type: String,
      enum: ['22mm', '20mm'],
    },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GlobalProduct = mongoose.model<IGlobalProduct>('GlobalProduct', GlobalProductSchema);

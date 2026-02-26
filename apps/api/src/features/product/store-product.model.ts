import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  category: 'cylinder' | 'stove' | 'regulator';
  name: string; // Friendly mapped name
  isActive: boolean;
  isArchived: boolean;
  details: {
    // Cylinder specific
    brandId?: mongoose.Types.ObjectId;
    size?: string;
    regulatorType?: '20mm' | '22mm';
    // Stove specific
    brandName?: string;
    model?: string;
    burners?: 1 | 2 | 3 | 4;
    // Regulator specific
    type?: '20mm' | '22mm';
  };
}

const StoreProductSchema = new Schema<IStoreProduct>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  category: { type: String, enum: ['cylinder', 'stove', 'regulator'], required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  details: { type: Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

// Unique constraints to prevent duplicate SKUs
StoreProductSchema.index({ storeId: 1, 'details.brandId': 1, 'details.size': 1, 'details.regulatorType': 1 }, { unique: true, partialFilterExpression: { category: 'cylinder' } });
StoreProductSchema.index({ storeId: 1, 'details.brandName': 1, 'details.model': 1, 'details.burners': 1 }, { unique: true, partialFilterExpression: { category: 'stove' } });
StoreProductSchema.index({ storeId: 1, 'details.brandName': 1, 'details.model': 1, 'details.type': 1 }, { unique: true, partialFilterExpression: { category: 'regulator' } });

export const StoreProduct = mongoose.model<IStoreProduct>('StoreProduct', StoreProductSchema);

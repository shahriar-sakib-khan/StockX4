import { Schema, model, Document, Types } from 'mongoose';

export interface IStoreBrand extends Document {
    storeId: Types.ObjectId;
    globalBrandId?: Types.ObjectId; // Nullable for custom brands
    name: string;
    logo: string;
    cylinderImage: string;
    color: string;
    type: 'cylinder' | 'stove' | 'regulator'; // Categorization
    isCustom: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StoreBrandSchema = new Schema<IStoreBrand>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    globalBrandId: { type: Schema.Types.ObjectId, ref: 'GlobalBrand' },
    name: { type: String, required: true },
    logo: { type: String },
    cylinderImage: { type: String },
    color: { type: String },
    type: {
        type: String,
        enum: ['cylinder', 'stove', 'regulator'],
        default: 'cylinder',
        required: true
    },
    isCustom: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure a store doesn't duplicate the same global brand
StoreBrandSchema.index({ storeId: 1, globalBrandId: 1 }, { unique: true, partialFilterExpression: { globalBrandId: { $exists: true } } });

export const StoreBrand = model<IStoreBrand>('StoreBrand', StoreBrandSchema);

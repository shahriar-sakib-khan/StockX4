import { Schema, model, Document, Types } from 'mongoose';

/**
 * StoreBrand — per-store cylinder brand registry.
 *
 * Uses Reference + Override pattern:
 * - isCustom: false → linked to a GlobalBrand via globalBrandId.
 *   Name/logo/color/cylinderImage are NOT stored here — they're always
 *   read from GlobalBrand via populate(). No sync needed on GlobalBrand updates.
 * - isCustom: true → store-created custom brand. Stores its own
 *   customName/customLogo/customColor/customCylinderImage.
 */
export interface IStoreBrand extends Document {
    storeId: Types.ObjectId;
    globalBrandId?: Types.ObjectId;
    isActive: boolean;
    isCustom: boolean;

    // Only set for isCustom: true
    customName?: string;
    customLogo?: string;
    customColor?: string;
    customCylinderImage?: string;

    createdAt: Date;
    updatedAt: Date;
}

const StoreBrandSchema = new Schema<IStoreBrand>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    globalBrandId: { type: Schema.Types.ObjectId, ref: 'GlobalBrand' },
    isActive: { type: Boolean, default: true },
    isCustom: { type: Boolean, default: false },

    // Custom brand fields (only for isCustom: true)
    customName: { type: String },
    customLogo: { type: String },
    customColor: { type: String },
    customCylinderImage: { type: String },
}, { timestamps: true });

// A store cannot have two entries for the same global brand
StoreBrandSchema.index(
    { storeId: 1, globalBrandId: 1 },
    { unique: true, partialFilterExpression: { globalBrandId: { $exists: true } } }
);

export const StoreBrand = model<IStoreBrand>('StoreBrand', StoreBrandSchema);

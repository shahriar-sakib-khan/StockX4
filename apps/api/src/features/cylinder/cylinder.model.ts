import { Schema, model, Document } from 'mongoose';

// --- Local Store Inventory ---
export interface IStoreInventory extends Document {
    storeId: Schema.Types.ObjectId;
    brandId: Schema.Types.ObjectId;
    brandName: string; // Denormalized for display
    variant: {
        size: string;
        regulator: string;
        cylinderColor: string; // Denormalized for display
        cylinderImage?: string;
    };
    counts: {
        full: number;
        empty: number;
        defected: number;
    };
    prices: {
        fullCylinder: number;
        gasOnly: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const StoreInventorySchema = new Schema<IStoreInventory>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'GlobalBrand', required: true },
    brandName: { type: String, required: true },
    variant: {
        size: { type: String, required: true },
        regulator: { type: String, required: true },
        cylinderColor: { type: String, required: true },
        cylinderImage: { type: String }
    },
    counts: {
        full: { type: Number, default: 0 },
        empty: { type: Number, default: 0 },
        defected: { type: Number, default: 0 }
    },
    prices: {
        fullCylinder: { type: Number, default: 0 },
        gasOnly: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Compound unique index: A store cannot have duplicates of the same brand variant
StoreInventorySchema.index({ storeId: 1, brandId: 1, 'variant.size': 1, 'variant.regulator': 1 }, { unique: true });

export const StoreInventory = model<IStoreInventory>('StoreInventory', StoreInventorySchema);

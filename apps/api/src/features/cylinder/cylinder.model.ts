import { Schema, model, Document, Types } from 'mongoose';

// --- Local Store Inventory ---
export interface IStoreInventory extends Document {
    storeId: Types.ObjectId;
    brandId: Types.ObjectId;
    brandName: string; // Denormalized for display
    category: 'cylinder' | 'stove' | 'regulator';
    variant: {
        size?: string;
        regulator?: string;
        burners?: number;
        cylinderColor?: string; // Denormalized for display
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
        accessoryPrice: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const StoreInventorySchema = new Schema<IStoreInventory>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'GlobalBrand', required: true },
    brandName: { type: String, required: true },
    category: { type: String, enum: ['cylinder', 'stove', 'regulator'], default: 'cylinder', index: true },
    variant: {
        size: { type: String }, // Optional for non-cylinder
        regulator: { type: String }, // Optional
        burners: { type: Number }, // For stoves
        cylinderColor: { type: String }, // Optional
        cylinderImage: { type: String }
    },
    counts: {
        full: { type: Number, default: 0 },
        empty: { type: Number, default: 0 },
        defected: { type: Number, default: 0 }
    },
    prices: {
        fullCylinder: { type: Number, default: 0 },
        gasOnly: { type: Number, default: 0 },
        accessoryPrice: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Compound unique index: A store cannot have duplicates of the same brand variant
StoreInventorySchema.index({
    storeId: 1,
    brandId: 1,
    category: 1,
    'variant.size': 1,
    'variant.regulator': 1,
    'variant.burners': 1
}, { unique: true });

export const StoreInventory = model<IStoreInventory>('StoreInventory', StoreInventorySchema);

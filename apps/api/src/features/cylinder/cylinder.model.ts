import { Schema, model, Document, Types } from 'mongoose';

// --- Local Store Inventory (Matrix Record) ---
export interface IStoreInventory extends Document {
    storeId: Types.ObjectId;
    brandId: Types.ObjectId; // References StoreBrand
    category: 'cylinder' | 'stove' | 'regulator';

    // Matrix Coordinates
    variant: {
        size?: string;      // e.g. '12kg', '35kg'
        regulator?: string; // e.g. '20mm', '22mm'
        burners?: number;   // e.g. 1, 2
    };

    // Matrix Values
    counts: {
        full: number;
        empty: number;
        defected: number;
    };
    prices: {
        buyingPriceFull: number;
        buyingPriceGas: number;
        fullCylinder: number;   // Selling Price Full
        gasOnly: number;        // Selling Price Gas
    };
    createdAt: Date;
    updatedAt: Date;
}

const StoreInventorySchema = new Schema<IStoreInventory>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'StoreBrand', required: true, index: true },
    category: { type: String, enum: ['cylinder', 'stove', 'regulator'], default: 'cylinder', index: true },

    variant: {
        size: { type: String },
        regulator: { type: String },
        burners: { type: Number }
    },

    counts: {
        full: { type: Number, default: 0 },
        empty: { type: Number, default: 0 },
        defected: { type: Number, default: 0 }
    },

    prices: {
        buyingPriceFull: { type: Number, default: 0 },
        buyingPriceGas: { type: Number, default: 0 },
        fullCylinder: { type: Number, default: 0 },
        gasOnly: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Compound unique index: Matrix Guarantee
// A store cannot have two records for the same Brand + Size + Regulator
StoreInventorySchema.index({
    storeId: 1,
    brandId: 1,
    category: 1,
    'variant.size': 1,
    'variant.regulator': 1,
    'variant.burners': 1
}, { unique: true });

export const StoreInventory = model<IStoreInventory>('StoreInventory', StoreInventorySchema);

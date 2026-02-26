import { Schema, model, Document, Types } from 'mongoose';

export interface IStoreInventory extends Document {
  storeId: Types.ObjectId;
  productId: Types.ObjectId; // Reference to StoreProduct (SKU)

  counts: {
    full: number;
    empty: number;
    defected: number;
  };
  prices: {
    buyingPriceFull: number;
    buyingPriceGas: number;
    retailPriceFull: number;
    retailPriceGas: number;
    wholesalePriceFull: number;
    wholesalePriceGas: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreInventorySchema = new Schema<IStoreInventory>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'StoreProduct', required: true, index: true },

  counts: {
    full: { type: Number, default: 0 },
    empty: { type: Number, default: 0 },
    defected: { type: Number, default: 0 }
  },
  prices: {
    buyingPriceFull: { type: Number, default: 0 },
    buyingPriceGas: { type: Number, default: 0 },
    retailPriceFull: { type: Number, default: 0 },
    retailPriceGas: { type: Number, default: 0 },
    wholesalePriceFull: { type: Number, default: 0 },
    wholesalePriceGas: { type: Number, default: 0 }
  }
}, { timestamps: true });

// A store should only have ONE ledger record per SKU
StoreInventorySchema.index({ storeId: 1, productId: 1 }, { unique: true });

export const StoreInventory = model<IStoreInventory>('StoreInventory', StoreInventorySchema);

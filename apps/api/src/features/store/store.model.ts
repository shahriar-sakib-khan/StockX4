import { Schema, model, Document, Types } from 'mongoose';

export interface IStore extends Document {
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  code?: string;
  ownerName?: string;
  ownerPhone?: string;
  settings: {
    currency: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    code: { type: String },
    ownerName: { type: String },
    ownerPhone: { type: String },
    settings: {
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
);

export const StoreModel = model<IStore>('Store', storeSchema);

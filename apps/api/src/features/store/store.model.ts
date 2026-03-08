import { Schema, model, Document, Types } from 'mongoose';

export interface IStore extends Document {
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  code?: string;
  location?: string;
  ownerName?: string;
  ownerPhone?: string;
  settings: {
    currency: string;
    timezone: string;
  };
  cylinderSizes: string[];
  archivedCylinderSizes: string[];
  isSetupComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    location: { type: String },
    ownerName: { type: String },
    ownerPhone: { type: String },
    settings: {
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
    },
    cylinderSizes: { type: [String], default: ['12kg'] },
    archivedCylinderSizes: { type: [String], default: [] },
    isSetupComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StoreModel = model<IStore>('Store', storeSchema);

import mongoose, { Document, Schema } from 'mongoose';
import { VehicleInput } from '@repo/shared';

export interface IVehicle extends VehicleInput, Document {
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    licensePlate: { type: String, required: true },
    vehicleModel: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },
  },
  { timestamps: true }
);

// Unique vehicle per store
vehicleSchema.index({ storeId: 1, licensePlate: 1 }, { unique: true });

export const VehicleModel = mongoose.model<IVehicle>('Vehicle', vehicleSchema);

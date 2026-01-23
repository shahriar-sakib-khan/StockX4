import { VehicleModel, IVehicle } from './vehicle.model';
import { VehicleInput } from '@repo/shared';

export class VehicleService {
  static async create(storeId: string, data: VehicleInput): Promise<IVehicle> {
    const vehicle = await VehicleModel.create({ ...data, storeId });
    return vehicle;
  }

  static async findByStore(storeId: string): Promise<IVehicle[]> {
    return VehicleModel.find({ storeId }).sort({ createdAt: -1 });
  }

  static async findOne(vehicleId: string, storeId: string): Promise<IVehicle> {
    const vehicle = await VehicleModel.findOne({ _id: vehicleId, storeId });
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  static async update(vehicleId: string, storeId: string, data: Partial<VehicleInput>): Promise<IVehicle> {
    const vehicle = await VehicleModel.findOneAndUpdate(
      { _id: vehicleId, storeId },
      { $set: data },
      { new: true }
    );
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  static async delete(vehicleId: string, storeId: string): Promise<void> {
    const result = await VehicleModel.findOneAndDelete({ _id: vehicleId, storeId });
    if (!result) throw new Error('Vehicle not found');
  }
}

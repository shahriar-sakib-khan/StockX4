import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';
import { vehicleSchema } from '@repo/shared';

export class VehicleController {

  static async create(req: Request, res: Response) {
    try {
      const result = vehicleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const vehicle = await VehicleService.create(targetStoreId, result.data);
      return res.status(201).json({ vehicle });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Vehicle with this license plate already exists in this store' });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const vehicles = await VehicleService.findByStore(targetStoreId);
      return res.status(200).json({ vehicles });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const vehicle = await VehicleService.findOne(req.params.id, targetStoreId);
      return res.status(200).json({ vehicle });
    } catch (error: any) {
      if (error.message === 'Vehicle not found') return res.status(404).json({ error: 'Vehicle not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const result = vehicleSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const vehicle = await VehicleService.update(req.params.id, targetStoreId, result.data);
      return res.status(200).json({ vehicle });
    } catch (error: any) {
      if (error.message === 'Vehicle not found') return res.status(404).json({ error: 'Vehicle not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      await VehicleService.delete(req.params.id, targetStoreId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message === 'Vehicle not found') return res.status(404).json({ error: 'Vehicle not found' });
      return res.status(500).json({ error: error.message });
    }
  }
}

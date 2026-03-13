import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { StaffService } from './staff.service';
import { StoreService } from '../store/store.service';
import { createStaffSchema } from '@repo/shared';

export class StaffController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = req.user!.userId;
      await StoreService.findOne(storeId, userId);

      const result = createStaffSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.errors });

      const staff = await StaffService.create(storeId, result.data);
      return res.status(201).json({ staff });
    } catch (error: any) {
      if (error.code === 11000) return res.status(409).json({ error: 'This phone/email already exists for a staff in this store' });
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Staff creation failed' });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const { storeId } = req.params;
      const user = req.user!;
      if (user.role === 'manager' && user.storeId === storeId) {
        // authorized by role
      } else {
        await StoreService.findOne(storeId, user.userId);
      }
      const staff = await StaffService.findByStore(storeId);
      return res.status(200).json({ staff });
    } catch (error: any) {
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Failed to list staff' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { storeId, staffId } = req.params;
      const userId = req.user!.userId;
      await StoreService.findOne(storeId, userId);
      const staff = await StaffService.update(storeId, staffId, req.body);
      return res.status(200).json({ staff });
    } catch (error: any) {
      if (error.message === 'Staff not found') return res.status(404).json({ error: 'Staff not found' });
      return res.status(500).json({ error: 'Staff update failed' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { storeId, staffId } = req.params;
      const userId = req.user!.userId;
      await StoreService.findOne(storeId, userId);
      await StaffService.delete(storeId, staffId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: 'Staff deletion failed' });
    }
  }
}

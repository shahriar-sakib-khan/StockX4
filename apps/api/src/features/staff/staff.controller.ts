import { Request, Response } from 'express';
import { StaffService } from './staff.service';
import { StoreService } from '../store/store.service'; // Reuse for ownership check
import { createStaffSchema, staffLoginSchema } from '@repo/shared';

export class StaffController {

  // Owner only
  static async create(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = (req as any).user!.userId;

      // Verify ownership of the store
      const store = await StoreService.findOne(storeId, userId);
      // findOne throws if not found/owned

      const result = createStaffSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const staff = await StaffService.create(storeId, result.data);
      return res.status(201).json({ staff });

    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Staff ID already exists in this store' });
      }
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  // Owner only
   static async list(req: Request, res: Response) {
    try {
        const { storeId } = req.params;
        const userId = (req as any).user!.userId;

        // Verify ownership
        await StoreService.findOne(storeId, userId);

        const staff = await StaffService.findByStore(storeId);
        return res.status(200).json({ staff });
    } catch (error: any) {
        if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
        return res.status(500).json({ error: error.message });
    }
  }

  // Owner only
  static async update(req: Request, res: Response) {
      try {
          const { storeId, staffId } = req.params;
          const userId = (req as any).user!.userId;

          await StoreService.findOne(storeId, userId);
          const staff = await StaffService.update(storeId, staffId, req.body);
          return res.status(200).json({ staff });
      } catch (error: any) {
          if (error.message === 'Staff not found') return res.status(404).json({ error: 'Staff not found' });
          if (error.title === 'Store not found') return res.status(404).json({ error: 'Store not found' });
          return res.status(500).json({ error: error.message });
      }
  }

  // Owner only
  static async delete(req: Request, res: Response) {
      try {
          const { storeId, staffId } = req.params;
          const userId = (req as any).user!.userId;

          await StoreService.findOne(storeId, userId);
          await StaffService.delete(storeId, staffId);
          return res.status(200).json({ success: true });
      } catch (error: any) {
             if (error.message === 'Staff not found') return res.status(404).json({ error: 'Staff not found' });
             return res.status(500).json({ error: error.message });
      }
  }

  // Public (Staff Login)
  static async login(req: Request, res: Response) {
      try {
        const result = staffLoginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const data = await StaffService.login(result.data);
        return res.status(200).json(data);
      } catch (error: any) {
        if (error.message === 'Invalid credentials' || error.message === 'Account inactive') {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
      }
  }
}

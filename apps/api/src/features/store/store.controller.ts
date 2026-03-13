import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { StoreService } from './store.service';
import { createStoreSchema, updateStoreSchema, setupStoreSchema } from '@repo/shared';

export class StoreController {
  static async setup(req: AuthRequest, res: Response) {
    try {
      const result = setupStoreSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      const store = await StoreService.setupStore(req.user!.userId, result.data);
      return res.status(201).json({ store });
    } catch (error: any) {
      return res.status(500).json({ error: 'Store setup failed' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const result = createStoreSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const store = await StoreService.create(req.user!.userId, result.data);
      return res.status(201).json({ store });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Slug already exists' });
      }
      return res.status(500).json({ error: 'Store creation failed' });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const stores = await StoreService.findByOwner(req.user!.userId);
      return res.status(200).json({ stores });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to list stores' });
    }
  }

  static async get(req: AuthRequest, res: Response) {
    try {
      const store = await StoreService.findOne(req.params.id, req.user!.userId);
      return res.status(200).json({ store });
    } catch (error: any) {
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Failed to get store' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const result = updateStoreSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const store = await StoreService.update(req.params.id, req.user!.userId, result.data);
      return res.status(200).json({ store });
    } catch (error: any) {
        if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Store update failed' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await StoreService.delete(req.params.id, req.user!.userId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
        if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: 'Store deletion failed' });
    }
  }
}

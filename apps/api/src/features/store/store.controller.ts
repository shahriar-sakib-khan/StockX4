import { Request, Response } from 'express';
import { StoreService } from './store.service';
import { createStoreSchema, updateStoreSchema, setupStoreSchema } from '@repo/shared';

export class StoreController {
  static async setup(req: Request, res: Response) {
    try {
      console.log('--- NEW SETUP REQUEST ---');
      console.log('RAW SETUP PAYLOAD:', JSON.stringify(req.body, null, 2));
      const result = setupStoreSchema.safeParse(req.body);
      if (!result.success) {
        console.error('Store Setup Validation Error:', JSON.stringify(result.error.errors, null, 2));
        return res.status(400).json({ error: result.error.errors });
      }
      const store = await StoreService.setupStore((req as any).user!.userId, result.data);
      return res.status(201).json({ store });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const result = createStoreSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const store = await StoreService.create((req as any).user!.userId, result.data);
      return res.status(201).json({ store });
    } catch (error: any) {
      if (error.code === 11000) { // Duplicate key error
        return res.status(409).json({ error: 'Slug already exists' });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const stores = await StoreService.findByOwner((req as any).user!.userId);
      return res.status(200).json({ stores });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const store = await StoreService.findOne(req.params.id, (req as any).user!.userId);
      return res.status(200).json({ store });
    } catch (error: any) {
      if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const result = updateStoreSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const store = await StoreService.update(req.params.id, (req as any).user!.userId, result.data);
      return res.status(200).json({ store });
    } catch (error: any) {
        if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await StoreService.delete(req.params.id, (req as any).user!.userId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
        if (error.message === 'Store not found') return res.status(404).json({ error: 'Store not found' });
      return res.status(500).json({ error: error.message });
    }
  }
}

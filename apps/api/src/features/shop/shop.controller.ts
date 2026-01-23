import { Request, Response } from 'express';
import { ShopService } from './shop.service';
import { shopSchema } from '@repo/shared';

export class ShopController {

  // Create Shop
  static async create(req: Request, res: Response) {
    try {
      const result = shopSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const storeId = (req as any).user!.userId; // Pending: Verify if user is owner or authorized staff
      // Note: Assuming 'user' is attached by auth middleware and owner context is resolved.
      // Current auth implementation links user->store via 'userId' if owner.

      // If the User is an Owner, how do we know which Store they are operating on?
      // Since Owners can have multiple stores, the `storeId` should ideally be passed in headers or params.
      // However, for MVP/Simple Multi-tenancy, if we assume Owner context implies a selected store:
      // We might need a middleware to resolve `currentStore`.
      // For now, let's assume the request comes with `x-store-id` header or we pick the first store (if simplification needed).
      // BUT `StoreService` logic in current codebase suggests Stores are children of Users.
      // Let's rely on `x-store-id` header for Owners operating on a specific store.

      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const shop = await ShopService.create(targetStoreId, result.data);
      return res.status(201).json({ shop });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Shop with this phone already exists in this store' });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const shops = await ShopService.findByStore(targetStoreId);
      return res.status(200).json({ shops });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const shop = await ShopService.findOne(req.params.id, targetStoreId);
      return res.status(200).json({ shop });
    } catch (error: any) {
      if (error.message === 'Shop not found') return res.status(404).json({ error: 'Shop not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      const result = shopSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const shop = await ShopService.update(req.params.id, targetStoreId, result.data);
      return res.status(200).json({ shop });
    } catch (error: any) {
      if (error.message === 'Shop not found') return res.status(404).json({ error: 'Shop not found' });
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const targetStoreId = req.headers['x-store-id'] as string;
      if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

      await ShopService.delete(req.params.id, targetStoreId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message === 'Shop not found') return res.status(404).json({ error: 'Shop not found' });
      return res.status(500).json({ error: error.message });
    }
  }
}

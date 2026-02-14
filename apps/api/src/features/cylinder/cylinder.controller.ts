import { Request, Response } from 'express';
import { CylinderService } from './cylinder.service';
import { subscribeBrandSchema, updateInventorySchema, subscribeBatchBrandSchema } from '@repo/shared';

export class CylinderController {

    static async getInventory(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const inventory = await CylinderService.getStoreInventory(targetStoreId);
            return res.status(200).json({ inventory });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async upsertInventory(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            // We expect checks for brandId, variant, etc. in the service or via schema validation middleware
            // For now, passing body directly to service which handles partial updates
            const inventory = await CylinderService.upsertInventory(targetStoreId, req.body);
            return res.status(200).json({ inventory });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateInventory(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { id } = req.params;
            if (!id) return res.status(400).json({ error: 'Inventory ID required' });

            const inventory = await CylinderService.updateInventory(targetStoreId, id, req.body);
            return res.status(200).json({ inventory });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}


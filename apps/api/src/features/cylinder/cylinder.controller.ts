import { Request, Response } from 'express';
import { CylinderService } from './cylinder.service';
import { subscribeBrandSchema, updateInventorySchema, subscribeBatchBrandSchema } from '@repo/shared';

export class CylinderController {

    // --- Store ---
    static async addBrandToStore(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const result = subscribeBrandSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ error: result.error.errors });

            const inventory = await CylinderService.addBrandToStore(targetStoreId, result.data.globalBrandId);
            return res.status(201).json({ inventory });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

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

    static async updateInventory(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const result = updateInventorySchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ error: result.error.errors });

            const inventory = await CylinderService.updateInventory(targetStoreId, req.params.id, result.data);
            return res.status(200).json({ inventory });
        } catch (error: any) {
            if (error.message === 'Inventory item not found') return res.status(404).json({ error: 'Inventory item not found' });
            return res.status(500).json({ error: error.message });
        }
    }
    static async addBatchBrandsToStore(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });



            const result = subscribeBatchBrandSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ error: result.error.errors });

            const inventory = await CylinderService.addBatchBrandsToStore(targetStoreId, result.data.globalBrandIds);
            return res.status(201).json({ inventory });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async removeBrandFromStore(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { brandId } = req.params;
            if (!brandId) return res.status(400).json({ error: 'Brand ID required' });

            await CylinderService.removeBrandFromStore(targetStoreId, brandId);
            return res.status(200).json({ success: true });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}


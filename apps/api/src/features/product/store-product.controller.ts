import { Request, Response } from 'express';
import { StoreProductService } from './store-product.service';

export class StoreProductController {

    // Explicit trigger for matrix synchronization (usually called during Store settings update)
    static async syncCylinderMatrix(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            await StoreProductService.syncCylinderMatrix(targetStoreId);
            return res.status(200).json({ success: true, message: 'Matrix synchronized' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async archiveCylinderSize(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { size } = req.body;
            if (!size) return res.status(400).json({ error: 'Size is required' });

            await StoreProductService.archiveCylinderSize(targetStoreId, size);

            return res.status(200).json({ success: true, message: 'Size archived' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async addStove(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const product = await StoreProductService.upsertStoveProduct(targetStoreId, req.body);
            return res.status(200).json({ product });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async addRegulator(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const product = await StoreProductService.upsertRegulatorProduct(targetStoreId, req.body);
            return res.status(200).json({ product });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}

import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { StoreProduct } from '../product/store-product.model';

export class InventoryController {
    static async getInventory(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const inventory = await InventoryService.getStoreInventory(targetStoreId);
            return res.status(200).json({ inventory });
        } catch (error: any) {
            return res.status(500).json({ error: 'Inventory operation failed' });
        }
    }

    static async getSizeStats(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { size } = req.params;
            if (!size) return res.status(400).json({ error: 'Size is required' });

            const stats = await InventoryService.getSizeStats(targetStoreId, size);
            return res.status(200).json({ stats });
        } catch (error: any) {
            return res.status(500).json({ error: 'Inventory operation failed' });
        }
    }

    static async upsertInventory(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { productId, counts, prices } = req.body;
            if (!productId) return res.status(400).json({ error: 'productId is required' });

            const inventory = await InventoryService.upsertInventory(targetStoreId, productId, { counts, prices });
            return res.status(200).json({ inventory });
        } catch (error: any) {
            console.error('[InventoryController] upsertInventory error:', error);
            return res.status(500).json({ error: error.message || 'Inventory operation failed' });
        }
    }

    static async deleteInventory(req: Request, res: Response) {

        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { id } = req.params;

            // Archive the StoreProduct SKU (marks it inactive/archived)
            await StoreProduct.findOneAndUpdate(
                { _id: id, storeId: targetStoreId },
                { $set: { isActive: false, isArchived: true } }
            );

            return res.status(200).json({ success: true });
        } catch (error: any) {
            return res.status(500).json({ error: 'Inventory operation failed' });
        }
    }

    static async patchStoreProduct(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { productId } = req.params;
            const { details } = req.body;
            if (!details) return res.status(400).json({ error: 'details are required' });

            const product = await StoreProduct.findOneAndUpdate(
                { _id: productId, storeId: targetStoreId },
                { $set: { details } },
                { new: true }
            );
            if (!product) return res.status(404).json({ error: 'Product not found' });

            return res.status(200).json({ product });
        } catch (error: any) {
            return res.status(500).json({ error: 'Inventory operation failed' });
        }
    }
}

import { Request, Response } from 'express';
import { BrandService } from './brand.service';
import { globalBrandSchema } from '@repo/shared';

export class BrandController {
    static async createGlobalBrand(req: Request, res: Response) {
        try {
            const result = globalBrandSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ error: result.error.errors });

            const brand = await BrandService.createGlobalBrand(result.data);
            return res.status(201).json({ brand });
        } catch (error: any) {
             if (error.code === 11000) return res.status(409).json({ error: 'Brand name already exists' });
             return res.status(500).json({ error: error.message });
        }
    }

    static async getGlobalBrands(req: Request, res: Response) {
        try {
            const brands = await BrandService.getAllGlobalBrands();
            return res.status(200).json({ brands });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateGlobalBrand(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = globalBrandSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ error: result.error.errors });

            const brand = await BrandService.updateGlobalBrand(id, result.data);
            if (!brand) return res.status(404).json({ error: 'Brand not found' });
            return res.status(200).json({ brand });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteGlobalBrand(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const brand = await BrandService.deleteGlobalBrand(id);
            if (!brand) return res.status(404).json({ error: 'Brand not found' });
            return res.status(200).json({ message: 'Brand deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
    // --- Store Brand Management ---
    static async getStoreBrands(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const brands = await BrandService.getStoreBrands(targetStoreId);
            return res.status(200).json({ brands });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async addStoreBrand(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            // Expect { globalBrandId }
            const { globalBrandId } = req.body;
            if (!globalBrandId) return res.status(400).json({ error: 'Global Brand ID required' });

            const brand = await BrandService.addStoreBrand(targetStoreId, globalBrandId);
            return res.status(201).json({ brand });
        } catch (error: any) {
             if (error.message === 'Global Brand not found') return res.status(404).json({ error: 'Global Brand not found' });
            return res.status(500).json({ error: error.message });
        }
    }

    static async createCustomBrand(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            // Expect StoreBrandInput
            // Using logic from GlobalBrandSchema or loose validation for now
            const brand = await BrandService.createCustomBrand(targetStoreId, req.body);
            return res.status(201).json({ brand });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateStoreBrand(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { id } = req.params;
            const brand = await BrandService.updateStoreBrand(targetStoreId, id, req.body);

            if (!brand) return res.status(404).json({ error: 'Brand not found' });
            return res.status(200).json({ brand });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteStoreBrand(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { id } = req.params;
            const brand = await BrandService.deleteStoreBrand(targetStoreId, id);
            // We should also potentially delete associated inventory, but service decoupled it.
            // Ideally we delete inventory too. But let's stick to brand for now.

            if (!brand) return res.status(404).json({ error: 'Brand not found' });
            return res.status(200).json({ message: 'Store Brand deleted' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateStoreBrandsBulk(req: Request, res: Response) {
        try {
            const targetStoreId = req.headers['x-store-id'] as string;
            if (!targetStoreId) return res.status(400).json({ error: 'Store ID header required' });

            const { globalBrandIds, customBrandIds } = req.body;
            if (!Array.isArray(globalBrandIds)) return res.status(400).json({ error: 'globalBrandIds must be an array' });
            // customBrandIds is optional, but if present must be array
            if (customBrandIds && !Array.isArray(customBrandIds)) return res.status(400).json({ error: 'customBrandIds must be an array' });

            const brands = await BrandService.updateStoreBrandsBulk(targetStoreId, globalBrandIds, customBrandIds);
            return res.status(200).json({ brands });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}

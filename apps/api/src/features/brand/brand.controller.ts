import { Request, Response } from 'express';
import { BrandService } from './brand.service';
import { globalBrandSchema } from '@repo/shared';

export class BrandController {
    // --- Global Brands (admin-only) ---
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
            return res.status(200).json({ message: 'Brand deleted' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    // --- Store Brands ---
    static async getStoreBrands(req: Request, res: Response) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            if (!storeId) return res.status(400).json({ error: 'x-store-id header required' });
            const brands = await BrandService.getStoreBrands(storeId);
            return res.status(200).json({ brands });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async addStoreBrand(req: Request, res: Response) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            if (!storeId) return res.status(400).json({ error: 'x-store-id header required' });
            const { globalBrandId } = req.body;
            if (!globalBrandId) return res.status(400).json({ error: 'globalBrandId required' });
            const brand = await BrandService.addStoreBrand(storeId, globalBrandId);
            return res.status(201).json({ brand });
        } catch (error: any) {
            if (error.message === 'Global Brand not found') return res.status(404).json({ error: error.message });
            return res.status(500).json({ error: error.message });
        }
    }

    static async createCustomBrand(req: Request, res: Response) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            if (!storeId) return res.status(400).json({ error: 'x-store-id header required' });
            const { customName, customColor } = req.body;
            if (!customName) return res.status(400).json({ error: 'customName is required' });
            if (!customColor) return res.status(400).json({ error: 'customColor is required' });
            const brand = await BrandService.createCustomBrand(storeId, req.body);
            return res.status(201).json({ brand });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateStoreBrand(req: Request, res: Response) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            if (!storeId) return res.status(400).json({ error: 'x-store-id header required' });
            const { id } = req.params;
            const brand = await BrandService.updateStoreBrand(storeId, id, req.body);
            if (!brand) return res.status(404).json({ error: 'Brand not found' });
            return res.status(200).json({ brand });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteStoreBrand(req: Request, res: Response) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            if (!storeId) return res.status(400).json({ error: 'x-store-id header required' });
            const { id } = req.params;
            const result = await BrandService.deleteStoreBrand(storeId, id);
            return res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'StoreBrand not found') return res.status(404).json({ error: error.message });
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateStoreBrandsBulk(req: Request, res: Response) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            if (!storeId) return res.status(400).json({ error: 'x-store-id header required' });
            const { globalBrandIds } = req.body;
            if (!Array.isArray(globalBrandIds)) return res.status(400).json({ error: 'globalBrandIds must be an array' });
            const brands = await BrandService.updateStoreBrandsBulk(storeId, globalBrandIds);
            return res.status(200).json({ brands });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}

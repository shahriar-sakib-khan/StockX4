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
}

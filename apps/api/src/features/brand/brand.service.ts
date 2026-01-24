import { GlobalBrand } from './brand.model';
import { GlobalBrandInput } from '@repo/shared';

export class BrandService {
    static async createGlobalBrand(data: GlobalBrandInput) {
        return await GlobalBrand.create(data);
    }

    static async getAllGlobalBrands() {
        return await GlobalBrand.find({ isActive: true });
    }

    static async getGlobalBrandById(id: string) {
        return await GlobalBrand.findById(id);
    }

    static async updateGlobalBrand(id: string, data: GlobalBrandInput) {
        return await GlobalBrand.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteGlobalBrand(id: string) {
        return await GlobalBrand.findByIdAndDelete(id);
    }
    static async getGlobalBrandByIds(ids: string[]) {
        return await GlobalBrand.find({ _id: { $in: ids }, isActive: true });
    }
}

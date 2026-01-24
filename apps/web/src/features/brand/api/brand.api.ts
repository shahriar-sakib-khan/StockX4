import { api } from '@/lib/api';
import { GlobalBrandInput } from '@repo/shared';

export const brandApi = {
    getBrands: async () => {
        return api.get('brands').json<{ brands: any[] }>();
    },

    createBrand: async (data: GlobalBrandInput) => {
        return api.post('brands', { json: data }).json<{ brand: any }>();
    },

    updateBrand: async (id: string, data: GlobalBrandInput) => {
        return api.put(`brands/${id}`, { json: data }).json<{ brand: any }>();
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('upload', { body: formData }).json<{ url: string }>();
    },

    deleteBrand: async (id: string) => {
        return api.delete(`brands/${id}`).json();
    }
};

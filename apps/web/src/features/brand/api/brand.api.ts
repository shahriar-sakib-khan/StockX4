import { api } from '@/lib/api';
import { GlobalBrandInput } from '@repo/shared';

export const brandApi = {
    // Global (Master Data)
    getGlobalBrands: async () => {
        return api.get('brands').json<{ brands: any[] }>();
    },

    // Store (Local Data)
    getStoreBrands: async (storeId: string) => {
        return api.get('brands/store', {
            headers: { 'x-store-id': storeId }
        }).json<{ brands: any[] }>();
    },

    addStoreBrand: async (storeId: string, globalBrandId: string) => {
        return api.post('brands/store', {
            headers: { 'x-store-id': storeId },
            json: { globalBrandId }
        }).json<{ brand: any }>();
    },

    createCustomBrand: async (storeId: string, data: any) => {
        return api.post('brands/store/custom', {
            headers: { 'x-store-id': storeId },
            json: data
        }).json<{ brand: any }>();
    },

    deleteStoreBrand: async (storeId: string, id: string) => {
        return api.delete(`brands/store/${id}`, {
            headers: { 'x-store-id': storeId }
        }).json();
    },

    updateStoreBrand: async (storeId: string, id: string, data: any) => {
        return api.put(`brands/store/${id}`, {
            headers: { 'x-store-id': storeId },
            json: data
        }).json<{ brand: any }>();
    },

    updateStoreBrandsBulk: async (storeId: string, globalBrandIds: string[], customBrandIds: string[]) => {
        return api.put('brands/store/bulk/update', {
            headers: { 'x-store-id': storeId },
            json: { globalBrandIds, customBrandIds }
        }).json<{ brands: any[] }>();
    },

    // Legacy / Admin (Keep for now if needed, or remove)
    createGlobalBrand: async (data: GlobalBrandInput) => {
        return api.post('brands', { json: data }).json<{ brand: any }>();
    },

    updateGlobalBrand: async (id: string, data: GlobalBrandInput) => {
        return api.put(`brands/${id}`, { json: data }).json<{ brand: any }>();
    },

    deleteGlobalBrand: async (id: string) => {
        return api.delete(`brands/${id}`).json();
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('upload', { body: formData }).json<{ url: string }>();
    }
};

import { api } from '@/lib/api';
import { UpdateInventoryInput } from '@repo/shared';

export const inventoryApi = {
    getInventory: async (storeId: string) => {
        return api.get('inventory', {
            headers: { 'x-store-id': storeId }
        }).json<{ inventory: any[] }>();
    },

    getSizeStats: async (storeId: string, size: string) => {
        return api.get(`inventory/size-stats/${encodeURIComponent(size)}`, {
            headers: { 'x-store-id': storeId }
        }).json<{ stats: { cylinders: number, brands: number, transactions: number } }>();
    },

    upsertInventory: async (storeId: string, data: any) => {
        return api.post('inventory/upsert', {
            headers: { 'x-store-id': storeId },
            json: data
        }).json<{ inventory: any }>();
    }
};

export const storeProductApi = {
    syncCylinderMatrix: async (storeId: string) => {
        return api.post('store-products/sync-cylinders', {
             headers: { 'x-store-id': storeId }
        }).json<{ success: boolean; message: string }>();
    },

    archiveCylinderSize: async (storeId: string, size: string) => {
        return api.post('store-products/archive-size', {
             headers: { 'x-store-id': storeId },
             json: { size }
        }).json<{ success: boolean; message: string }>();
    },

    addStove: async (storeId: string, data: any) => {
        return api.post('store-products/stove', {
             headers: { 'x-store-id': storeId },
             json: data
        }).json<{ product: any }>();
    },

    addRegulator: async (storeId: string, data: any) => {
        return api.post('store-products/regulator', {
             headers: { 'x-store-id': storeId },
             json: data
        }).json<{ product: any }>();
    }
};

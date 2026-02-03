import { api } from '@/lib/api';
import { SubscribeBrandInput, UpdateInventoryInput } from '@repo/shared';

export const cylinderApi = {


    // --- Store Inventory ---
    getInventory: async (storeId: string) => {
        return api.get('cylinders/inventory', {
            headers: { 'x-store-id': storeId }
        }).json<{ inventory: any[] }>();
    },

    subscribeBrand: async (storeId: string, data: SubscribeBrandInput) => {
        return api.post('cylinders/inventory', {
            headers: { 'x-store-id': storeId },
            json: data
        }).json<{ inventory: any[] }>();
    },

    subscribeBatchBrand: async (storeId: string, globalBrandIds: string[]) => {
        return api.post('cylinders/inventory/batch', {
            headers: { 'x-store-id': storeId },
            json: { globalBrandIds }
        }).json<{ inventory: any[] }>();
    },

    removeBrand: async (storeId: string, globalBrandId: string) => {
        return api.delete(`cylinders/inventory/brands/${globalBrandId}`, {
            headers: { 'x-store-id': storeId }
        }).json<{ success: boolean }>();
    },

    updateInventory: async (storeId: string, inventoryId: string, data: UpdateInventoryInput) => {
        return api.patch(`cylinders/inventory/${inventoryId}`, {
             headers: { 'x-store-id': storeId },
             json: data
        }).json<{ inventory: any }>();
    }
};

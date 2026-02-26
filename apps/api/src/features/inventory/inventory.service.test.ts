import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connect, disconnect, clearDatabase } from '../../test/db';
import { InventoryService } from './inventory.service';
import { StoreInventory } from './inventory.model';
import { StoreProduct } from '../product/store-product.model';
import mongoose from 'mongoose';

describe('Inventory Service (Ledger Logic)', () => {
    let storeId: string;
    let productId: string;

    beforeAll(async () => await connect());
    afterAll(async () => await disconnect());

    beforeEach(async () => {
        await clearDatabase();
        storeId = new mongoose.Types.ObjectId().toString();

        // Create a fake SKU
        const product = await StoreProduct.create({
            storeId,
            category: 'stove',
            name: 'Test Stove',
            isActive: true,
            isArchived: false,
            details: { brandName: 'Test', burners: 2 }
        });
        productId = product._id.toString();
    });

    describe('upsertInventory()', () => {
        it('should create a new inventory ledger record for a product if none exists', async () => {
            const inv = await InventoryService.upsertInventory(storeId, productId, {
                counts: { full: 10, empty: 0, defected: 0 },
                prices: { retailPriceFull: 1000, buyingPriceFull: 800, wholesalePriceFull: 900, retailPriceGas: 0, buyingPriceGas: 0, wholesalePriceGas: 0 }
            });

            expect(inv).toBeDefined();
            expect(inv.productId.toString()).toBe(productId);
            expect(inv.counts.full).toBe(10);
            expect(inv.prices.retailPriceFull).toBe(1000);
        });

        it('should update an existing inventory ledger record', async () => {
            await InventoryService.upsertInventory(storeId, productId, {
                counts: { full: 10, empty: 0, defected: 0 },
                prices: { retailPriceFull: 1000, buyingPriceFull: 800, wholesalePriceFull: 900, retailPriceGas: 0, buyingPriceGas: 0, wholesalePriceGas: 0 }
            });

            // Update it
            const inv = await InventoryService.upsertInventory(storeId, productId, {
                counts: { full: 20 }, // Partial update
                prices: { retailPriceFull: 1100 } // Partial update
            });

            expect(inv.counts.full).toBe(20);
            expect(inv.prices.retailPriceFull).toBe(1100);
            expect(inv.prices.buyingPriceFull).toBe(800); // Preserve old values
        });
    });

    describe('getStoreInventory()', () => {
        it('should fetch all inventory and populate the StoreProduct', async () => {
            await InventoryService.upsertInventory(storeId, productId, {
                counts: { full: 5, empty: 0, defected: 0 },
                prices: { retailPriceFull: 500, buyingPriceFull: 400, wholesalePriceFull: 450, retailPriceGas: 0, buyingPriceGas: 0, wholesalePriceGas: 0 }
            });

            const items = await InventoryService.getStoreInventory(storeId);
            expect(items.length).toBe(1);
            expect(items[0].product).toBeDefined();
            expect(items[0].product.name).toBe('Test Stove');
            expect(items[0].product.category).toBe('stove');
            expect(items[0].counts.full).toBe(5);
        });
    });
});

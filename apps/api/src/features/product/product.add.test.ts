
import 'dotenv/config';
import { connectDB } from '../../config/db';
import { CylinderService } from '../cylinder/cylinder.service';
import { BrandService } from '../brand/brand.service';
import mongoose from 'mongoose';

const testAddProduct = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const storeId = new mongoose.Types.ObjectId().toString(); // Mock Store ID

        // 1. Create a Custom Brand (Mocking what useCreateCustomBrand does)
        const brandData = {
            name: 'TestStoveBrand_' + Date.now(),
            type: 'stove' as 'stove', // Explicit cast
            color: '#000000',
            // isCustom removed as it's not in StoreBrandInput
        };
        const brand = await BrandService.createCustomBrand(storeId, brandData);
        console.log('Brand Created:', brand._id);

        // 2. Add Product (Upsert Inventory)
        // Note: We are using CylinderService here because Stoves/Regulators are currently managed as 'Inventory' artifacts
        // alongside Cylinders. Future refactoring might move this to ProductService.
        const productData = {
            brandId: brand._id,
            category: 'stove',
            variant: { burners: 2 },
            counts: { full: 10, empty: 0, defected: 0 },
            prices: { fullCylinder: 5500 }
        };

        const inventory = await CylinderService.upsertInventory(storeId, productData);
        console.log('Inventory Upserted:', inventory);

        if (inventory.counts.full === 10 && (inventory.variant as any).burners === 2) {
             console.log('TEST PASSED: Product added successfully.');
        } else {
             console.log('TEST FAILED: Data mismatch.');
        }

    } catch (error) {
        console.error('TEST FAILED with error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testAddProduct();

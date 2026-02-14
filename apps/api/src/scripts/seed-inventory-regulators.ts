import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../features/user/user.model';
import { StoreModel } from '../features/store/store.model';
import { GlobalBrand } from '../features/brand/brand.model';
import { StoreBrand } from '../features/brand/store-brand.model';
import { StoreInventory } from '../features/cylinder/cylinder.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedRegulators = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Regulator Seeding');

        // 1. Find Store
        const email = 'sakib@gmail.com';
        const user = await User.findOne({ email });
        if (!user) process.exit(1);
        const store = await StoreModel.findOne({ ownerId: user._id });
        if (!store) process.exit(1);

        // 2. Fetch Regulator Global Brands
        const regulatorBrandNames = ['Generic', 'Premium', 'Safety Plus'];
        const regulatorGlobalBrands = await GlobalBrand.find({ name: { $in: regulatorBrandNames } });

        console.log(`Found ${regulatorGlobalBrands.length} regulator brands.`);

        for (const globalBrand of regulatorGlobalBrands) {
             // 3. Ensure StoreBrand
             let brand = await StoreBrand.findOne({ storeId: store._id, globalBrandId: globalBrand._id });
             if (!brand) {
                 brand = await StoreBrand.create({
                     storeId: store._id,
                     globalBrandId: globalBrand._id,
                     name: globalBrand.name,
                     isCustom: false,
                     isActive: true,
                     color: globalBrand.color,
                     logo: globalBrand.logo,
                     cylinderImage: globalBrand.cylinderImage,
                     type: 'regulator'
                 });
                 console.log(`Created Linked StoreBrand: ${globalBrand.name}`);
             }

             // 4. Seed Inventory (20mm, 22mm)
             const sizes = ['20mm', '22mm'];
             for (const size of sizes) {
                 const exists = await StoreInventory.findOne({
                     storeId: store._id,
                     category: 'regulator',
                     brandId: brand._id,
                     'variant.size': size
                 });

                 if (!exists) {
                     await StoreInventory.create({
                         storeId: store._id,
                         brandId: brand._id,
                         category: 'regulator',
                         variant: { size: size },
                         counts: {
                             full: Math.floor(Math.random() * 50) + 10,
                             empty: 0,
                             defected: 0
                         },
                         prices: {
                             buyingPriceFull: 120,
                             fullCylinder: 150, // Selling Price
                             buyingPriceGas: 0,
                             gasOnly: 0
                         }
                     });
                     console.log(`Seeded Regulator: ${globalBrand.name} ${size}`);
                 }
             }
        }

        console.log('✅ Regulator Inventory Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Regulator Seed Error:', error);
        process.exit(1);
    }
};

seedRegulators();

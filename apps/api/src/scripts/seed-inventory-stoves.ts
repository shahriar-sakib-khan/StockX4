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

const seedStoves = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Stove Seeding');

        // 1. Find Store
        const email = 'sakib@gmail.com';
        const user = await User.findOne({ email });
        if (!user) process.exit(1);
        const store = await StoreModel.findOne({ ownerId: user._id });
        if (!store) process.exit(1);

        // 2. Fetch Stove Global Brands
        const stoveBrandNames = ['RFL', 'Miyako', 'Walton', 'Gazi', 'Vision'];
        const stoveGlobalBrands = await GlobalBrand.find({ name: { $in: stoveBrandNames } });

        console.log(`Found ${stoveGlobalBrands.length} stove brands.`);

        for (const globalBrand of stoveGlobalBrands) {
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
                     type: 'stove' // Validate
                 });
                 console.log(`Created Linked StoreBrand: ${globalBrand.name}`);
             }

             // 4. Seeding Inventory (1 to 4 Burners)
             for (let b = 1; b <= 4; b++) {
                 const exists = await StoreInventory.findOne({
                     storeId: store._id,
                     category: 'stove',
                     brandId: brand._id,
                     'variant.burners': b
                 });

                 if (!exists) {
                     await StoreInventory.create({
                         storeId: store._id,
                         brandId: brand._id,
                         category: 'stove',
                         variant: { burners: b },
                         counts: {
                             full: Math.floor(Math.random() * 20) + 5,
                             empty: 0,
                             defected: 0
                         },
                         prices: {
                             fullCylinder: b === 1 ? 1200 : 2500,
                             buyingPriceFull: b === 1 ? 1000 : 2000,
                             buyingPriceGas: 0,
                             gasOnly: 0
                         }
                     });
                     console.log(`Seeded Stove: ${globalBrand.name} ${b} Burner`);
                 }
             }
        }

        console.log('✅ Stove Inventory Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Stove Seed Error:', error);
        process.exit(1);
    }
};

seedStoves();

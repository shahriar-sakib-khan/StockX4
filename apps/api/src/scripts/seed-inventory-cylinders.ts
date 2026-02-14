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

const seedCylinders = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Cylinder Inventory Seeding');

        // 1. Find Store
        const email = 'sakib@gmail.com';
        const user = await User.findOne({ email });
        if (!user) process.exit(1);

        const store = await StoreModel.findOne({ ownerId: user._id });
        if (!store) process.exit(1);

        // 2. Fetch Global Brands
        const targetBrandNames = ['Bashundhara LPG', 'Omera LPG', 'G-Gas'];
        const brands = await GlobalBrand.find({ name: { $in: targetBrandNames } });

        if (brands.length === 0) {
            console.warn('⚠️ No Target Brands found. Run "pnpm seed:brands" first.');
        } else {
            console.log(`Found ${brands.length} target brands. Seeding inventory...`);

            for (const globalBrand of brands) {
                // 3. Ensure StoreBrand Exists (Link Global -> Store)
                let storeBrand = await StoreBrand.findOne({ storeId: store._id, globalBrandId: globalBrand._id });
                if (!storeBrand) {
                    storeBrand = await StoreBrand.create({
                        storeId: store._id,
                        globalBrandId: globalBrand._id,
                        name: globalBrand.name,
                        isCustom: false,
                        isActive: true, // Activate for this store
                        color: globalBrand.color,
                        logo: globalBrand.logo,
                        cylinderImage: globalBrand.cylinderImage,
                        type: 'cylinder'
                    });
                    console.log(`Linked StoreBrand: ${globalBrand.name}`);
                }

                // 4. Create Inventory for Sizes/Regulators
                const variantsToSeed = [
                    { size: '12kg', regulator: '20mm' },
                    { size: '12kg', regulator: '22mm' },
                ];

                for (const variant of variantsToSeed) {
                    const exists = await StoreInventory.findOne({
                        storeId: store._id,
                        brandId: storeBrand._id,
                        'variant.size': variant.size,
                        'variant.regulator': variant.regulator
                    });

                    if (!exists) {
                        await StoreInventory.create({
                            storeId: store._id,
                            brandId: storeBrand._id,
                            category: 'cylinder',
                            variant: {
                                size: variant.size,
                                regulator: variant.regulator
                            },
                            counts: {
                                full: Math.floor(Math.random() * 50) + 10,
                                empty: Math.floor(Math.random() * 20),
                                defected: 0
                            },
                            prices: {
                                fullCylinder: variant.size === '12kg' ? 1450 : 3500,
                                gasOnly: variant.size === '12kg' ? 1100 : 2800
                            }
                        });
                        console.log(`Seeded Cylinder: ${globalBrand.name} ${variant.size} ${variant.regulator}`);
                    }
                }
            }
        }

        console.log('✅ Cylinder Inventory Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cylinder Seed Error:', error);
        process.exit(1);
    }
};

seedCylinders();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';
import argon2 from 'argon2';
import { User } from '../features/user/user.model';
import { StoreModel } from '../features/store/store.model';
import { StaffModel } from '../features/staff/staff.model';
import { CustomerModel } from '../features/customer/customer.model';
import { VehicleModel } from '../features/vehicle/vehicle.model';
import { ShopModel } from '../features/shop/shop.model';
import { ProductModel } from '../features/product/product.model';
import { GlobalBrand } from '../features/brand/brand.model';
import { StoreInventory } from '../features/cylinder/cylinder.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedStore = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Read uploads
        let uploads: Record<string, string> = {};
        try {
            const uploadsPath = path.join(__dirname, '../../uploads.json');
            if (fs.existsSync(uploadsPath)) {
                uploads = JSON.parse(fs.readFileSync(uploadsPath, 'utf-8'));
            }
        } catch (e) {
            console.warn('Could not read uploads.json, using placeholders');
        }

        // 1. Create User
        const email = 'sakib@gmail.com';
        const rawPassword = '123456';
        const passwordHash = await argon2.hash(rawPassword);

        // Fixed ID for consistent dev experience
        const fixedUserId = new mongoose.Types.ObjectId('5f8d04f147373d4722881234');

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                _id: fixedUserId,
                email,
                password: passwordHash,
                name: 'Sakib Khan',
                role: 'user',
            });
            console.log(`Created User: sakib@gmail.com (${user._id})`);
        } else {
            console.log('User sakib@gmail.com already exists');
        }

        // 2. Create Store
        // Fixed ID for consistent dev experience
        const fixedStoreId = new mongoose.Types.ObjectId('5f8d04f147373d4722885678');

        let store = await StoreModel.findOne({ ownerId: user._id });
        if (!store) {
            store = await StoreModel.create({
                _id: fixedStoreId,
                ownerId: user._id,
                name: 'Test Store',
                slug: 'test-store',
                settings: {
                    currency: 'BDT',
                    timezone: 'Asia/Dhaka',
                },
            });
            console.log(`Created Store: Test Store (${store._id})`);
        } else {
            console.log('Store for user already exists');
        }

        // 3. Create Staff
        const staffPasswordHash = await argon2.hash('staff123');
        const staffList = [
            { name: 'Staff One', staffId: 'staff1@test.com', role: 'staff' },
            { name: 'Staff Two', staffId: 'staff2@test.com', role: 'staff' },
            { name: 'Manager One', staffId: 'manager@test.com', role: 'manager' },
        ];

        for (const s of staffList) {
            const exists = await StaffModel.findOne({ storeId: store._id, staffId: s.staffId });
            if (!exists) {
                await StaffModel.create({
                    storeId: store._id,
                    name: s.name,
                    staffId: s.staffId,
                    passwordHash: staffPasswordHash,
                    role: s.role,
                    isActive: true,
                });
                console.log(`Created Staff: ${s.name} (${s.staffId})`);
            }
        }

        // 4. Create Customers
        const customers = [
            { name: 'Rahim Uddin', phone: '01700000001', address: 'Dhaka, Bangladesh' },
            { name: 'Karim Mia', phone: '01700000002', address: 'Mirpur, Dhaka' },
            { name: 'Customer Three', phone: '01700000003', address: 'Gulshan, Dhaka' },
            { name: 'Customer Four', phone: '01700000004', address: 'Banani, Dhaka' },
            { name: 'Customer Five', phone: '01700000005', address: 'Uttara, Dhaka' },
        ];

        for (const c of customers) {
            const exists = await CustomerModel.findOne({ storeId: store._id, phone: c.phone });
            if (!exists) {
                await CustomerModel.create({
                    storeId: store._id,
                    ...c,
                    totalDue: 0 // Initialize
                });
                console.log(`Created Customer: ${c.name}`);
            }
        }

        // 5. Create Shops (B2B)
        const shops = [
            { name: 'Bhai Bhai Store', ownerName: 'Bhai Owner', phone: '01800000001', address: 'Badda', district: 'Dhaka' },
            { name: 'Mayer Doa Enterprise', ownerName: 'Mayer Owner', phone: '01800000002', address: 'Rampura', district: 'Dhaka' },
            { name: 'Bismillah Traders', ownerName: 'Bismillah Owner', phone: '01800000003', address: 'Malibagh', district: 'Dhaka' },
        ];

        for (const sh of shops) {
             const exists = await ShopModel.findOne({ storeId: store._id, phone: sh.phone });
             if (!exists) {
                 await ShopModel.create({
                     storeId: store._id,
                     ...sh,
                     totalDue: 5000 // Some initial due for testing
                 });
                 console.log(`Created Shop: ${sh.name}`);
             }
        }

        // 6. Create Vehicles
        const vehicles = [
            { licensePlate: 'DHK-METRO-KA-11-2233', vehicleModel: 'Pickup 1 Ton', driverName: 'Driver Kamal', driverPhone: '01900000001' },
            { licensePlate: 'DHK-METRO-GA-33-4455', vehicleModel: 'Truck 3 Ton', driverName: 'Driver Jamal', driverPhone: '01900000002' },
        ];

        for (const v of vehicles) {
            const exists = await VehicleModel.findOne({ storeId: store._id, licensePlate: v.licensePlate });
            if (!exists) {
                await VehicleModel.create({
                    storeId: store._id,
                    ...v
                });
                console.log(`Created Vehicle: ${v.licensePlate}`);
            }
        }

        // 7. Seed Inventory (Requires Global Brands)
        // Ensure Global Brands exist (Assuming seed:brands run, or we check)
        // 7. Seed Inventory (Requires Global Brands)
        // Filter for specific brands as requested
        const targetBrandNames = ['Bashundhara LPG', 'Omera LPG', 'G-Gas'];
        const brands = await GlobalBrand.find({ name: { $in: targetBrandNames } });

        if (brands.length === 0) {
            console.warn('⚠️ No Target Brands found. Run "pnpm seed:brands" first.');
        } else {
            console.log(`Found ${brands.length} target brands. Seeding inventory...`);

            for (const brand of brands) {
                for (const variant of brand.variants) {
                    // Filter: "mostly 12 kg and 22 mm"
                    // Strategy: Include if (Size is 12kg) OR (Regulator is 22mm)
                    const is12kg = variant.size === '12kg';
                    const is22mm = variant.regulator === '22mm';

                    if (is12kg || is22mm) {
                        // Check if inventory exists
                        const exists = await StoreInventory.findOne({
                            storeId: store._id,
                            brandId: brand._id,
                            'variant.size': variant.size,
                            'variant.regulator': variant.regulator
                        });

                        if (!exists) {
                            await StoreInventory.create({
                                storeId: store._id,
                                brandId: brand._id,
                                brandName: brand.name,
                                category: 'cylinder',
                                variant: {
                                    size: variant.size,
                                    regulator: variant.regulator,
                                    cylinderColor: variant.regulator === '20mm' ? brand.color20mm : brand.color22mm,
                                    cylinderImage: variant.cylinderImage
                                },
                                counts: {
                                    full: Math.floor(Math.random() * 50) + 10, // Random 10-60
                                    empty: Math.floor(Math.random() * 20),
                                    defected: 0
                                },
                                prices: {
                                    fullCylinder: variant.size === '12kg' ? 1450 : 3500,
                                    gasOnly: variant.size === '12kg' ? 1100 : 2800
                                }
                            });
                        }
                    }
                }
            }
            console.log('Seeded Inventory for selected brands.');
        }

        // 7b. Seed Stoves and Regulators
        const stoveBrands = ['RFL', 'Miyako', 'Walton'];
        for (const brand of stoveBrands) {
             for (let b = 1; b <= 3; b++) { // 1, 2, 3 burners
                 const exists = await StoreInventory.findOne({
                     storeId: store._id,
                     category: 'stove',
                     brandName: brand,
                     'variant.burners': b
                 });

                 if (!exists) {
                     // Need a dummy brandId? or Reuse one? Or make brandId optional?
                     // Schema says brandId REQUIRED. So we need a GlobalBrand for RFL/Miyako or reuse existing.
                     // IMPORTANT: The schema requires 'brandId' ref 'GlobalBrand'.
                     // I should probably Create GlobalBrands for these accessories first or just pick a random one?
                     // Better: Create placeholders brands or just use one of the Gas brands if valid?
                     // No, let's create a generic "Accessory Brand" or actually create them in seed-brands?
                     // For now, let's reuse a "Generic" brand or just attach to "TotalGas" (placeholder) or creating them dynamically ?
                     // Let's create these brands in this script if missing.
                 }
             }
        }

        // REVISED PLAN: We need valid ObjectIDs for brandId.
        // Let's add 'RFL Gas' etc to 'seed-brands.ts' or just use 'Omera LPG' as the brand for stoves for simplicity?
        // No, user wants separate brands.
        // Let's quickly create a "Generic Accessory" brand in DB here if it doesn't exist?
        // Or better: Let's just use "Bashundhara LPG" for everything for this demo unless I update seed-brands.
        // Actually, user said "brand name, image and stepper".
        // Let's use "Bashundhara LPG" for Stoves too for now to avoid FK errors, OR fetch *any* brand.
       // ---------------------------------------------------------
    // 5. Seed Stoves (As Products)
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // 5. Seed Stoves (As Products)
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // 5. Seed Stoves (As Products)
    // ---------------------------------------------------------
    console.log('🔥 Seeding Stoves...');
    const stoveConfigs = [
        // 1 Burner
        { brand: 'RFL', name: 'RFL Gas Stove (1 Burner)', model: 'RFL-101', burners: '1', price: 1200, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668020/stockx/stoves/stove-1.png' },
        { brand: 'Walton', name: 'Walton Gas Stove (1 Burner)', model: 'WGS-1', burners: '1', price: 1100, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668020/stockx/stoves/stove-1.png' },
        { brand: 'Miyako', name: 'Miyako Gas Stove (1 Burner)', model: 'MGT-101', burners: '1', price: 1800, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668020/stockx/stoves/stove-1.png' },

        // 2 Burners
        { brand: 'RFL', name: 'RFL Gas Stove (2 Burners)', model: 'RFL-202', burners: '2', price: 2500, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668023/stockx/stoves/stove-2.png' },
        { brand: 'Walton', name: 'Walton Gas Stove (2 Burners)', model: 'WGS-2', burners: '2', price: 2200, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668023/stockx/stoves/stove-2.png' },
        { brand: 'Miyako', name: 'Miyako Gas Stove (2 Burners)', model: 'MGT-202', burners: '2', price: 3500, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668023/stockx/stoves/stove-2.png' },

        // 3 Burners
        { brand: 'RFL', name: 'RFL Gas Stove (3 Burners)', model: 'RFL-303', burners: '3', price: 3800, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668025/stockx/stoves/stove-3.png' },
        { brand: 'Walton', name: 'Walton Gas Stove (3 Burners)', model: 'WGS-3', burners: '3', price: 3400, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668025/stockx/stoves/stove-3.png' },

        // 4 Burners
        { brand: 'Miyako', name: 'Miyako Gas Stove (4 Burners)', model: 'MGT-404', burners: '4', price: 4500, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668027/stockx/stoves/stove-4.png' },
        { brand: 'Sharif', name: 'Sharif Gas Stove (4 Burners)', model: 'SGT-404', burners: '4', price: 4200, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668027/stockx/stoves/stove-4.png' },
    ];

    for (const s of stoveConfigs) {
        // Upsert based on model number
        await ProductModel.findOneAndUpdate(
            { storeId: store._id, modelNumber: s.model },
            {
                storeId: store._id,
                name: s.name,
                type: 'stove',
                brand: s.brand,
                modelNumber: s.model,
                burnerCount: s.burners, // 1, 2, 3, 4
                description: `${s.burners} Burner`, // Generic description
                sellingPrice: s.price,
                costPrice: s.price * 0.8,
                stock: Math.floor(Math.random() * 30) + 5, // Random 5-35
                damagedStock: Math.floor(Math.random() * 3),
                image: s.img
            },
            { upsert: true, new: true }
        );
        console.log(`Seeded/Updated Stove: ${s.name}`);
    }

    // ---------------------------------------------------------
    // 6. Seed Regulators (As Products)
    // ---------------------------------------------------------
    console.log('⚙️ Seeding Regulators...');
    const regulatorConfigs = [
        { brand: 'Generic', name: 'Regulator 22mm', model: 'REG-22', size: '22mm', price: 150, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668033/stockx/regulators/regulator-22.png' },
        { brand: 'Generic', name: 'Regulator 20mm', model: 'REG-20', size: '20mm', price: 150, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668031/stockx/regulators/regulator-20.png' },
        { brand: 'Premium', name: 'Premium Regulator 22mm', model: 'PRE-22', size: '22mm', price: 250, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668033/stockx/regulators/regulator-22.png' },
        { brand: 'Premium', name: 'Premium Regulator 20mm', model: 'PRE-20', size: '20mm', price: 250, img: 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668031/stockx/regulators/regulator-20.png' },
    ];

    for (const r of regulatorConfigs) {
        // Upsert based on model number
        await ProductModel.findOneAndUpdate(
             { storeId: store._id, modelNumber: r.model },
             {
                storeId: store._id,
                name: r.name,
                type: 'regulator',
                brand: r.brand,
                modelNumber: r.model,
                size: r.size, // 22mm/20mm
                sellingPrice: r.price,
                costPrice: r.price * 0.7,
                stock: Math.floor(Math.random() * 50) + 20, // Random 20-70
                damagedStock: Math.floor(Math.random() * 5),
                image: r.img
             },
             { upsert: true, new: true }
        );
        console.log(`Seeded/Updated Regulator: ${r.name}`);
    }

    console.log('✅ Store seeded successfully!');
    process.exit(0);

    } catch (error) {
        console.error('Seed Store Error:', error);
        process.exit(1);
    }
};

seedStore();

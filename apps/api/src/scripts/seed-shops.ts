import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../features/user/user.model';
import { StoreModel } from '../features/store/store.model';
import { ShopModel } from '../features/shop/shop.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedShops = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Shop Seeding');

        // 1. Find Store via User
        const email = 'sakib@gmail.com';
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User ${email} not found. Run seed:users first.`);
            process.exit(1);
        }

        const store = await StoreModel.findOne({ ownerId: user._id });
        if (!store) {
            console.error(`Store for ${email} not found. Run seed:stores first.`);
            process.exit(1);
        }

        // 2. Create Shops (B2B)
        const shops = [
            { name: 'Bhai Bhai Store', ownerName: 'Bhai Owner', phone: '01800000001', address: 'Badda', district: 'Dhaka' },
            { name: 'Mayer Doa Enterprise', ownerName: 'Mayer Owner', phone: '01800000002', address: 'Rampura', district: 'Dhaka' },
            { name: 'Bismillah Traders', ownerName: 'Bismillah Owner', phone: '01800000003', address: 'Malibagh', district: 'Dhaka' },
        ];

        for (const sh of shops) {
             await ShopModel.findOneAndUpdate(
                 { storeId: store._id, phone: sh.phone },
                 {
                     storeId: store._id,
                     ...sh,
                     totalDue: 5000 // Some initial due for testing
                 },
                 { upsert: true, new: true }
             );
             console.log(`Seeded/Updated Shop: ${sh.name}`);
        }

        console.log('✅ Shop Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Shop Seed Error:', error);
        process.exit(1);
    }
};

seedShops();

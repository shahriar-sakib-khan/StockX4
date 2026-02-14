import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../features/user/user.model';
import { StoreModel } from '../features/store/store.model';
import { CustomerModel } from '../features/customer/customer.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedCustomers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Customer Seeding');

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

        // 2. Create Customers
        const customers = [
            { name: 'Rahim Uddin', phone: '01700000001', address: 'Dhaka, Bangladesh' },
            { name: 'Karim Mia', phone: '01700000002', address: 'Mirpur, Dhaka' },
            { name: 'Customer Three', phone: '01700000003', address: 'Gulshan, Dhaka' },
            { name: 'Customer Four', phone: '01700000004', address: 'Banani, Dhaka' },
            { name: 'Customer Five', phone: '01700000005', address: 'Uttara, Dhaka' },
        ];

        for (const c of customers) {
            await CustomerModel.findOneAndUpdate(
                { storeId: store._id, phone: c.phone },
                {
                    storeId: store._id,
                    ...c,
                    totalDue: 0 // Initialize
                },
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated Customer: ${c.name}`);
        }

        console.log('✅ Customer Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Customer Seed Error:', error);
        process.exit(1);
    }
};

seedCustomers();

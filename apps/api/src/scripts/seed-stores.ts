import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import argon2 from 'argon2';
import { User } from '../features/user/user.model';
import { StoreModel } from '../features/store/store.model';
import { StaffModel } from '../features/staff/staff.model';
import { VehicleModel } from '../features/vehicle/vehicle.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedStores = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Store Seeding');

        // 1. Find User
        const email = 'sakib@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User ${email} not found. Run seed:users first.`);
            process.exit(1);
        }

        // 2. Create Store
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
            { name: 'Staff One', staffId: 'staff1@test.com', role: 'staff', phone: '01711111111', salary: 15000 },
            { name: 'Staff Two', staffId: 'staff2@test.com', role: 'staff', phone: '01722222222', salary: 18000 },
            { name: 'Manager One', staffId: 'manager@test.com', role: 'manager', phone: '01733333333', salary: 30000 },
        ];

        for (const s of staffList) {
            await StaffModel.findOneAndUpdate(
                { storeId: store._id, staffId: s.staffId },
                {
                    storeId: store._id,
                    name: s.name,
                    staffId: s.staffId,
                    passwordHash: staffPasswordHash,
                    role: s.role,
                    phone: s.phone,
                    salary: s.salary,
                    salaryDue: s.salary,
                    isActive: true,
                },
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated Staff: ${s.name} (${s.staffId})`);
        }

        // 4. Create Vehicles
        const vehicles = [
            { licensePlate: 'DHK-METRO-KA-11-2233', vehicleModel: 'Pickup 1 Ton', driverName: 'Driver Kamal', driverPhone: '01900000001' },
            { licensePlate: 'DHK-METRO-GA-33-4455', vehicleModel: 'Truck 3 Ton', driverName: 'Driver Jamal', driverPhone: '01900000002' },
        ];

        for (const v of vehicles) {
            await VehicleModel.findOneAndUpdate(
                { storeId: store._id, licensePlate: v.licensePlate },
                {
                    storeId: store._id,
                    ...v
                },
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated Vehicle: ${v.licensePlate}`);
        }

        console.log('✅ Store & Staff Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Store Seed Error:', error);
        process.exit(1);
    }
};

seedStores();

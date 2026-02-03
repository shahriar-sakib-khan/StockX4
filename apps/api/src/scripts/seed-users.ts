import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import argon2 from 'argon2';
import { User } from '../features/user/user.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB for User Seeding');

        const users = [
            { email: 'admin@gmail.com', password: 'admin123', name: 'Admin User', role: 'admin' },
            { email: 'test1@gmail.com', password: 'password123', name: 'Test User One', role: 'user' },
            { email: 'test2@gmail.com', password: 'password123', name: 'Test User Two', role: 'user' },
            { email: 'test3@gmail.com', password: 'password123', name: 'Test User Three', role: 'user' }
        ];

        for (const u of users) {
            const passwordHash = await argon2.hash(u.password);

            // Upsert user
            await User.findOneAndUpdate(
                { email: u.email },
                {
                    email: u.email,
                    password: passwordHash,
                    name: u.name,
                    role: u.role,
                },
                { upsert: true, new: true }
            );
            console.log(`✅ User sync: ${u.email} (Pass: ${u.password})`);
        }

        console.log('✅ User Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ User Seed Error:', error);
        process.exit(1);
    }
};

seedUsers();

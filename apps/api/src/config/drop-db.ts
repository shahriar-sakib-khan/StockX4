import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env specific to API
dotenv.config({ path: path.join(__dirname, '../../.env') });

const wipeDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not defined in environment');
        }

        console.log(' Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log(` Connected to ${mongoose.connection.name}`);

        console.log(' WARNING: Dropping database...');
        if (!mongoose.connection.db) {
            throw new Error('Database connection instance is undefined');
        }
        await mongoose.connection.db.dropDatabase();

        console.log('✅ Database wiped successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to wipe database:', error);
        process.exit(1);
    }
};

wipeDB();

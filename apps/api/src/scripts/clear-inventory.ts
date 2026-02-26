import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const clearInventory = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB...');

        await mongoose.connection.collection('storeinventories').deleteMany({});
        console.log('Cleared storeinventories collection!');

        process.exit(0);
    } catch (error) {
        console.error('Error clearing inventory:', error);
        process.exit(1);
    }
};

clearInventory();

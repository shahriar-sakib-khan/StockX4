import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../features/user/user.model';
import { StoreModel } from '../features/store/store.model';
import { StoreInventory } from '../features/cylinder/cylinder.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugDb = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const users = await User.find({}, 'name email _id');
        console.log('\n--- Users ---');
        users.forEach(u => console.log(`${u.name} (${u.email}) - ${u._id}`));

        const stores = await StoreModel.find({}, 'name ownerId _id');
        console.log('\n--- Stores ---');
        stores.forEach(s => console.log(`${s.name} (Owner: ${s.ownerId}) - ${s._id}`));

        const inventory = await StoreInventory.find({}, 'brandName variant.size counts.full storeId');
        console.log('\n--- Inventory ---');
        console.log(`Total Items: ${inventory.length}`);
        inventory.forEach(i => console.log(`${i.brandName} ${i.variant.size} (Full: ${i.counts?.full}) - Store: ${i.storeId}`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugDb();

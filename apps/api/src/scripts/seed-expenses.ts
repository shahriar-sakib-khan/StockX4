import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Transaction } from '../features/transaction/transaction.model';
import { StoreModel } from '../features/store/store.model';
import { CustomerModel } from '../features/customer/customer.model';
import { StaffModel } from '../features/staff/staff.model';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedTransactions = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stockx';
        await mongoose.connect(mongoUri);
        console.log('📦 Connected to MongoDB for seeding transactions...');

        // Get all stores
        const stores = await StoreModel.find();
        if (stores.length === 0) {
            console.log('❌ No stores found. Run store seed first.');
            return;
        }

        const expenseCategories = ['Electricity Bill', 'Shop Rent', 'Snacks', 'Internet Bill', 'Stationery'];

        let totalRecordsAdded = 0;

        for (const store of stores) {
            // Clean up old seeded transactions for this store
            await Transaction.deleteMany({
                storeId: store._id,
                'items.description': { $regex: /Seeded / }
            });

            const customers = await CustomerModel.find({ storeId: store._id });
            const staffList = await StaffModel.find({ storeId: store._id });

            const randomCustomer = () => customers.length ? customers[Math.floor(Math.random() * customers.length)]._id : undefined;
            const randomStaff = () => staffList.length ? staffList[Math.floor(Math.random() * staffList.length)]._id : undefined;

            // Add 15 expenses: 5 for today (0 days ago), 10 random past days
            const expenseDaysOffsets = [0, 0, 0, 0, 0, ...Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 1)];

            for (const offset of expenseDaysOffsets) {
                const date = new Date();
                date.setDate(date.getDate() - offset);

                const amount = Math.floor(Math.random() * 500) + 100; // Random amount between 100-600
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];

                const t = new Transaction({
                    storeId: store._id,
                    staffId: randomStaff(),
                    customerId: randomCustomer(),
                    customerType: 'Customer',
                    type: 'EXPENSE',
                    status: 'COMPLETED',
                    paymentMethod: 'CASH',
                    totalAmount: amount,
                    finalAmount: amount,
                    paidAmount: amount,
                    dueAmount: 0,
                    items: [{
                        productId: new mongoose.Types.ObjectId(), // Dummy ID
                        name: category,
                        type: 'GENERAL_EXPENSE',
                        quantity: 1,
                        unitPrice: amount,
                        subtotal: amount,
                        description: `Seeded expense for ${category}`
                    }],
                    createdAt: date,
                    updatedAt: date
                });

                await t.save();
                totalRecordsAdded++;
            }

            // Add 15 sales (Income): 5 for today, 10 random past days
            const saleDaysOffsets = [0, 0, 0, 0, 0, ...Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 1)];

            for (const offset of saleDaysOffsets) {
                const date = new Date();
                date.setDate(date.getDate() - offset);

                const amount = Math.floor(Math.random() * 5000) + 500; // Random amount between 500-5500

                const t = new Transaction({
                    storeId: store._id,
                    staffId: randomStaff(),
                    customerId: randomCustomer(),
                    customerType: 'Customer',
                    type: 'SALE',
                    status: 'COMPLETED',
                    paymentMethod: 'CASH',
                    totalAmount: amount,
                    finalAmount: amount,
                    paidAmount: amount,
                    dueAmount: 0,
                    items: [{
                        productId: new mongoose.Types.ObjectId(), // Dummy ID
                        name: "Seeded Retail Sale",
                        type: 'CYLINDER',
                        quantity: 1,
                        unitPrice: amount,
                        subtotal: amount,
                        description: `Seeded income`
                    }],
                    createdAt: date,
                    updatedAt: date
                });

                await t.save();
                totalRecordsAdded++;
            }

            console.log(`✅ Added 30 transactions (15 expenses, 15 sales) for store: ${store.name}`);
        }

        console.log(`🎉 Successfully seeded ${totalRecordsAdded} total transactions!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding transactions:', error);
        process.exit(1);
    }
};

seedTransactions();

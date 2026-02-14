import { Transaction } from '../transaction/transaction.model';
import { CustomerModel } from '../customer/customer.model';
import { ShopModel } from '../shop/shop.model';
import { StoreInventory } from '../cylinder/cylinder.model';
import { ProductModel } from '../product/product.model';
import mongoose from 'mongoose';

export class DashboardService {
    static async getStats(storeId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'day':
                startDate.setHours(0, 0, 0, 0); // Start of today
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setDate(1); // Start of current month
                startDate.setHours(0, 0, 0, 0); // Ensure start of day
                break;
            case 'year':
                startDate.setMonth(0, 1); // Start of year
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const dateQuery = {
            storeId,
            createdAt: { $gte: startDate }
        };

        // 1. Total Sales (Revenue)
        const salesAgg = await Transaction.aggregate([
            { $match: { ...dateQuery, type: 'SALE' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalSales = salesAgg[0]?.total || 0;

        // 2. Total Expenses
        const expensesAgg = await Transaction.aggregate([
            { $match: { ...dateQuery, type: 'EXPENSE' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalExpenses = expensesAgg[0]?.total || 0;

        // 3. Profit (Sales - Expenses)
        // Note: This is simplified. Real profit needs COGS.
        // For now, let's use Sales - Expenses as "Net Cash Flow" or "Operating Profit" proxy?
        // Actually, user likely wants Revenue - Cost.
        // But COGS calculation is complex without strict cost tracking per transaction item.
        // Let's stick to Cash Flow: Revenue - Expenses.
        const netProfit = totalSales - totalExpenses;


        // 4. Total Due (Receivable) - Snapshot (Not affected by date range, it's current state)
        // We can optionally filter by creation date if needed, but Due is usually cumulative.
        // Let's just return Current Total Due.
        const customerDueAgg = await CustomerModel.aggregate([
            { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
            { $group: { _id: null, total: { $sum: '$totalDue' } } }
        ]);
        const shopDueAgg = await ShopModel.aggregate([
            { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
            { $group: { _id: null, total: { $sum: '$totalDue' } } }
        ]);
        const totalDue = (customerDueAgg[0]?.total || 0) + (shopDueAgg[0]?.total || 0);

        // 5. Cash In Hand (Cash Box)
        // Cash In: Sales (Cash) + Due Payments (Cash)
        // Cash Out: Expenses (Cash)
        // This should probably be ALL TIME or explicitly tracked.
        // "Cash Box" usually implies current physical cash. So it should be ALL TIME.
        const cashInAgg = await Transaction.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    paymentMethod: 'CASH',
                    type: { $in: ['SALE', 'DUE_PAYMENT'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]);

        const cashOutAgg = await Transaction.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    paymentMethod: 'CASH',
                    type: { $in: ['EXPENSE'] } // Add 'RETURN' if cash refund?
                }
            },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } } // Expenses usually have paidAmount = finalAmount
        ]);

        const cashInHand = (cashInAgg[0]?.total || 0) - (cashOutAgg[0]?.total || 0);

        return {
            period,
            totalSales,
            totalExpenses,
            netProfit,
            totalDue,
            cashInHand
        };
    }

    static async getChartData(storeId: string, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        // Aggregate Sales & Expenses by Day
        const dailyStats = await Transaction.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    createdAt: { $gte: startDate, $lte: endDate },
                    type: { $in: ['SALE', 'EXPENSE'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "SALE"] }, "$finalAmount", 0]
                        }
                    },
                    expenses: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$finalAmount", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return dailyStats.map(stat => ({
            date: stat._id,
            sales: stat.sales,
            expenses: stat.expenses
        }));
    }

    static async getInventorySummary(storeId: string) {
        // 1. Low Stock Cylinders (Full < 5)
        const lowStockCylinders = await StoreInventory.find({
            storeId,
            'counts.full': { $lt: 5 }
        }).limit(5).select('brandName variant counts');

        // 2. Low Stock Products (Stock < 5)
        const lowStockProducts = await ProductModel.find({
            storeId,
            stock: { $lt: 5 }
        }).limit(5).select('name stock category');

        return {
            lowStock: [
                ...lowStockCylinders.map(c => ({
                    name: `${c.brandName} ${c.variant?.size || ''} ${c.variant?.regulator || ''}`,
                    stock: c.counts?.full,
                    type: 'Cylinder'
                })),
                ...lowStockProducts.map(p => ({
                    name: p.name,
                    stock: p.stock,
                    type: p.category || 'Product'
                }))
            ]
        };
    }
}

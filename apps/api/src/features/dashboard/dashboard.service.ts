import { TransactionService } from '../transaction/transaction.service';
import { InventoryService } from '../inventory/inventory.service';
import { Transaction } from '../transaction/transaction.model';
import { CustomerModel } from '../customer/customer.model';
import { ProductModel } from '../product/product.model';
import mongoose from 'mongoose';

export class DashboardService {
    static async getStats(storeId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'day': startDate.setHours(0, 0, 0, 0); break;
            case 'week': startDate.setDate(now.getDate() - 7); break;
            case 'month': startDate.setDate(now.getDate() - 30); break;
            case 'year': startDate.setMonth(0, 1); break;
        }

        const filters = { startDate: startDate.toISOString(), endDate: now.toISOString() };
        const summary = await TransactionService.getSummary(storeId, filters);

        // All-time Cash in Hand (not affected by period)
        const allTimeSummary = await TransactionService.getSummary(storeId, {});

        // Total Due (current snapshot)
        const customerDueAgg = await CustomerModel.aggregate([
            { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
            { $group: { _id: null, total: { $sum: '$totalDue' } } }
        ]);

        return {
            period,
            totalSales: summary.totalSales,
            totalExpenses: summary.totalExpenses,
            netProfit: summary.totalSales - summary.totalExpenses,
            totalDue: customerDueAgg[0]?.total || 0,
            cashInHand: allTimeSummary.netCashFlow,
            cashInPeriod: summary.cashIncome + summary.digitalIncome,
            cashOutPeriod: summary.totalExpenses
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
        // 1. Get Cylinder Snapshot using InventoryService (robust naming)
        const inventory = await InventoryService.getStoreInventory(storeId);
        const lowStockCylinders = inventory
            .filter(item => item.product?.category === 'cylinder' && (item.counts?.full || 0) < 5)
            .slice(0, 5)
            .map(item => ({
                name: item.product?.name || 'Unknown Cylinder',
                stock: item.counts?.full,
                type: 'Cylinder'
            }));

        // 2. Low Stock Products (Stoves/Regulators - basic search is fine)
        const lowStockProducts = await ProductModel.find({
            storeId,
            stock: { $lt: 5 }
        }).limit(5).select('name stock type');

        return {
            lowStock: [
                ...lowStockCylinders,
                ...lowStockProducts.map(p => ({
                    name: p.name,
                    stock: p.stock,
                    type: p.type || 'Product'
                }))
            ]
        };
    }
}

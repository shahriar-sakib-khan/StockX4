import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DashboardService } from './dashboard.service';
import { Transaction } from '../transaction/transaction.model';
import { CustomerModel } from '../customer/customer.model';
import { ShopModel } from '../shop/shop.model';
import { StoreInventory } from '../cylinder/cylinder.model';
import { ProductModel } from '../product/product.model';

// Mock the models
vi.mock('../transaction/transaction.model', () => ({
    Transaction: {
        aggregate: vi.fn(),
    }
}));
vi.mock('../customer/customer.model', () => ({
    CustomerModel: {
        aggregate: vi.fn(),
    }
}));
vi.mock('../shop/shop.model', () => ({
    ShopModel: {
        aggregate: vi.fn(),
    }
}));
vi.mock('../cylinder/cylinder.model', () => ({
    StoreInventory: {
        find: vi.fn(),
    }
}));
vi.mock('../product/product.model', () => ({
    ProductModel: {
        find: vi.fn(),
    }
}));


describe('DashboardService', () => {
    const storeId = '5f8d04f147373d4722885678'; // Valid 24-char hex string

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getStats', () => {
        it('should calculate stats correctly', async () => {
             // Mock Aggregate Responses
             // 1. Sales
             (Transaction.aggregate as any).mockResolvedValueOnce([{ total: 5000 }]);
             // 2. Expenses
             (Transaction.aggregate as any).mockResolvedValueOnce([{ total: 2000 }]);
             // 3. Customer Due
             (CustomerModel.aggregate as any).mockResolvedValueOnce([{ total: 1000 }]);
             // 4. Shop Due
             (ShopModel.aggregate as any).mockResolvedValueOnce([{ total: 500 }]);
             // 5. Cash In
             (Transaction.aggregate as any).mockResolvedValueOnce([{ total: 6000 }]);
             // 6. Cash Out
             (Transaction.aggregate as any).mockResolvedValueOnce([{ total: 1500 }]);

             const stats = await DashboardService.getStats(storeId, 'month');

             expect(stats.totalSales).toBe(5000);
             expect(stats.totalExpenses).toBe(2000);
             expect(stats.netProfit).toBe(3000); // 5000 - 2000
             expect(stats.totalDue).toBe(1500); // 1000 + 500
             expect(stats.cashInHand).toBe(4500); // 6000 - 1500
        });

        it('should handle zero values', async () => {
            (Transaction.aggregate as any).mockResolvedValue([]); // For all aggregates
            (CustomerModel.aggregate as any).mockResolvedValue([]);
            (ShopModel.aggregate as any).mockResolvedValue([]);

            const stats = await DashboardService.getStats(storeId, 'month');

            expect(stats.totalSales).toBe(0);
            expect(stats.totalExpenses).toBe(0);
            expect(stats.netProfit).toBe(0);
            expect(stats.totalDue).toBe(0);
            expect(stats.cashInHand).toBe(0);
        });
    });

    describe('getInventorySummary', () => {
        it('should return low stock items', async () => {
            const mockCylinders = [
                { brandName: 'Brand A', variant: { size: '12kg', regulator: '20mm' }, counts: { full: 2 } }
            ];
            const mockProducts = [
                { name: 'Stove X', stock: 3, category: 'stove' }
            ];

            (StoreInventory.find as any).mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue(mockCylinders)
                })
            });

            (ProductModel.find as any).mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue(mockProducts)
                })
            });

            const summary = await DashboardService.getInventorySummary(storeId);

            expect(summary.lowStock).toHaveLength(2);
            expect(summary.lowStock[0].name).toContain('Brand A');
            expect(summary.lowStock[0].stock).toBe(2);
            expect(summary.lowStock[1].name).toBe('Stove X');
            expect(summary.lowStock[1].stock).toBe(3);
        });
    });
});

import { useParams } from 'react-router-dom';
import { DashboardStats } from '../../dashboard/components/DashboardStats';
import { CashBox } from '../../dashboard/components/CashBox';
import { SalesExpenseChart } from '../../dashboard/components/SalesExpenseChart';
import { InventorySnapshot } from '../../dashboard/components/InventorySnapshot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../../auth/stores/auth.store';

export const StoreDashboard = () => {
    const { id: storeId } = useParams<{ id: string }>();
    const { user } = useAuthStore();

    if (!storeId) return <div>Store ID missing</div>;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Store Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        Overview of your store performance and daily activities.
                    </p>
                </div>
                <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link to={`/stores/${storeId}/pos`}>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Go to POS
                            </Link>
                        </Button>
                    <Button asChild>
                        <Link to={`/stores/${storeId}/transactions/new?type=EXPENSE`}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Record Expense
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <DashboardStats storeId={storeId} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts & Tables) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sales Chart */}
                    <div className="h-96">
                            <SalesExpenseChart storeId={storeId} />
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="space-y-8">
                    {/* Cash Box Widget */}
                    <CashBox storeId={storeId} />

                    {/* Inventory Snapshot */}
                    <div className="h-auto">
                        <InventorySnapshot storeId={storeId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

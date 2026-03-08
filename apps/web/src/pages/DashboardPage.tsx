import { UserLayout } from '../components/layout/UserLayout';
import { useAuthStore } from '../features/auth/stores/auth.store';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { CashBox } from '../features/dashboard/components/CashBox';
import { SalesExpenseChart } from '../features/dashboard/components/SalesExpenseChart';
import { InventorySnapshot } from '../features/dashboard/components/InventorySnapshot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart } from 'lucide-react';
import { storeApi } from '../features/store/api/store.api';
import { useQuery } from '@tanstack/react-query';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  return <DashboardContent user={user} />;
};

const DashboardContent = ({ user }: { user: any }) => {
    const { data: storesResponse, isLoading } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.list()
    });

    if (isLoading) return <div>Loading dashboard...</div>;

    const store = storesResponse?.stores?.[0];

    if (!store) {
        return (
            <UserLayout>
                <div className="p-4 sm:p-8 text-center text-muted-foreground">
                    <p>No store found. Please create a store first.</p>
                    <Button variant="default" className="mt-4 min-h-12">Create Store</Button>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1 text-sm sm:text-base">
                            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>.
                            Here's what's happening at <span className="text-primary font-bold">{store.name}</span> today.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                         <Button asChild variant="outline" className="flex-1 md:flex-none min-h-12">
                             <Link to={`/stores/${store._id}/pos`}>
                                 <ShoppingCart className="w-4 h-4 mr-2" />
                                 Go to POS
                             </Link>
                         </Button>
                        <Button asChild className="flex-1 md:flex-none min-h-12">
                            <Link to={`/stores/${store._id}/transactions/new?type=EXPENSE`}>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Record Expense
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <DashboardStats storeId={store._id} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column (Charts) */}
                    <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                        <div className="min-h-[250px] sm:min-h-[350px]">
                             <SalesExpenseChart storeId={store._id} />
                        </div>
                    </div>

                    {/* Right Column (Widgets) */}
                    <div className="space-y-6 lg:space-y-8">
                        <CashBox storeId={store._id} />
                        <InventorySnapshot storeId={store._id} />
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

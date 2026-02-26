import { UserLayout } from '../components/layout/UserLayout';
import { useAuthStore } from '../features/auth/stores/auth.store';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { CashBox } from '../features/dashboard/components/CashBox';
import { SalesExpenseChart } from '../features/dashboard/components/SalesExpenseChart';
import { InventorySnapshot } from '../features/dashboard/components/InventorySnapshot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // Assuming user has a store or associated store.
  // For now, we use the first store or a context store ID.
  // Ideally, useStore hook should provide current store context.
  // In the UserLayout, we might have access or we fetch it.
  // For this implementation, we'll try to get it from auth user's storeId if available
  // OR we need a way to select store.
  // Based on previous context, user might have `storeId`.

  // Let's assume user.storeId or similar.
  // If not, we might need to fetch the user's store.
  // Checking auth store... user object usually has storeId or manages.
  // Use a fallback or fetch logic.

  // HACK: For now, if user is owner, they might have a store associated.
  // Let's rely on the StoreLayout context if this page was inside it?
  // But DashboardPage is top level.
  // Let's assume the user object (from 'user' in auth store) has a `storeId` or `stores` array.
  // If we look at `useAuthStore` usage in `StaffDashboardPage`, it passes `storeId`.
  // Here we are in the main dashboard.

  // Re-checking how `StaffDashboardPage` gets `storeId`.
  // It gets it from params or user.

  // Let's try to use the store ID from the user object if available,
  // or default to the first store found for the user (we might need a "useStore" hook).

  // TEMPORARY: using a fixed ID or fetching.
  // Actually, let's look at `UserLayout`. It renders a sidebar.
  // Let's check `User.model` or `AuthStore`.

  // If the user is an owner, they might have multiple stores.
  // But for this MVP, let's assume one active store or pass a known ID.
  // Actually, let's just use the `user._id` to find the store? No, store has `ownerId`.

  // Let's fetch the store for the current user.
  // Since we don't have a global "Active Store" context at this level yet (only in /stores/:id routes),
  // we might need to fetch it or redirect to /stores/:id/dashboard if that's the pattern.

  // Current pattern seems to be:
  // /stores/:id/dashboard -> Store Dashboard
  // / -> Main Landing or User Dashboard?

  // If the user visits /dashboard, it implies a general dashboard.
  // If they have one store, show it.

  // Let's pause and check how to get the store ID.
  // For now, I will use a placeholder or handle the "No Store" case.

  // Implementation:
  // 1. Fetch stores for user.
  // 2. If 1 store, use it.
  // 3. If multiple, show selector (Scope creep? Just pick first).

  // Let's import `useStores` if it exists, or `storeApi`.

  // WAIT: The previous `StaffDashboardPage` used explicit `storeId`.
  // The `DashboardPage` is at `/dashboard`.
  // Let's try to fetch the store using `useQuery`.

  // START of component logic

  // Fix: We need the store ID to render components.
  // Let's assume for now we can get it.

  // Let's look at `store.api.ts` to see if we can fetch "my stores".

  // ... (Self-correction: I will add store fetching logic inside the component)

  return <DashboardContent user={user} />;
};

import { storeApi } from '../features/store/api/store.api';
import { useQuery } from '@tanstack/react-query';

const DashboardContent = ({ user }: { user: any }) => {
    const { data: storesResponse, isLoading } = useQuery({
        queryKey: ['my-stores'],
        queryFn: () => storeApi.list()
    });

    if (isLoading) return <div>Loading dashboard...</div>;

    const store = storesResponse?.stores?.[0]; // Pick first store for now

    if (!store) {
        return (
            <UserLayout>
                <div className="p-8 text-center text-muted-foreground">
                    <p>No store found. Please create a store first.</p>
                    <Button variant="default" className="mt-4">Create Store</Button>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">
                            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>.
                            Here's what's happening at <span className="text-primary font-bold">{store.name}</span> today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                         <Button asChild variant="outline">
                             <Link to={`/stores/${store._id}/pos`}>
                                 <ShoppingCart className="w-4 h-4 mr-2" />
                                 Go to POS
                             </Link>
                         </Button>
                        <Button asChild>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Charts & Tables) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Sales Chart */}
                        <div className="h-96">
                             <SalesExpenseChart storeId={store._id} />
                        </div>

                        {/* Recent Transactions (Using Inventory Snapshot for now as placeholder or separate component) */}
                         {/* We could add 'RecentTransactions' component here later */}
                    </div>

                    {/* Right Column (Widgets) */}
                    <div className="space-y-8">
                        {/* Cash Box Widget */}
                        <CashBox storeId={store._id} />

                        {/* Inventory Snapshot */}
                        <div className="h-auto">
                            <InventorySnapshot storeId={store._id} />
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

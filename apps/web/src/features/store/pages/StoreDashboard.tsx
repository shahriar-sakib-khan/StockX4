import { useParams } from 'react-router-dom';
import { DashboardStats } from '../../dashboard/components/DashboardStats';
import { CashBox } from '../../dashboard/components/CashBox';
import { SalesExpenseChart } from '../../dashboard/components/SalesExpenseChart';
import { InventorySnapshot } from '../../dashboard/components/InventorySnapshot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingCart, Users, Package, Wallet, History, FilePlus } from 'lucide-react';
import { useAuthStore } from '../../auth/stores/auth.store';
import { Card, CardContent } from '@/components/ui/card';

export const StoreDashboard = () => {
    const { id: storeId } = useParams<{ id: string }>();
    const { user } = useAuthStore();

    if (!storeId) return <div>Store ID missing</div>;

    const quickActions = [
        { label: 'New Sale', icon: ShoppingCart, link: `/stores/${storeId}/pos`, color: 'bg-income text-white' },
        { label: 'Add Stock', icon: Package, link: `/stores/${storeId}/inventory`, color: 'bg-indigo-600 text-white' },
        { label: 'Record Expense', icon: Wallet, link: `/stores/${storeId}/history`, color: 'bg-expense text-white' },
        { label: 'Manage Customers', icon: Users, link: `/stores/${storeId}/customers`, color: 'bg-sky-600 text-white' },
        { label: 'Diary', icon: History, link: `/stores/${storeId}/history`, color: 'bg-slate-700 text-white' },
        { label: 'Add Product', icon: FilePlus, link: `/stores/${storeId}/inventory`, color: 'bg-emerald-600 text-white' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">
                        Store <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-base sm:text-lg">
                        Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>. Here's your store.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button asChild size="lg" variant="outline" className="h-14 px-6 border-2 font-bold hover:bg-slate-50 w-full sm:w-auto">
                        <Link to={`/stores/${storeId}/pos`}>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Launch POS
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-6 border-2 font-bold hover:bg-slate-50 w-full sm:w-auto">
                        <Link to={`/stores/${storeId}/inventory`}>
                            <Package className="w-5 h-5 mr-2" />
                            Inventory
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="h-14 px-6 font-black shadow-lg shadow-primary/20 w-full sm:w-auto">
                        <Link to={`/stores/${storeId}/history`}>
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Record Expense
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {quickActions.map((action, idx) => (
                    <Link key={idx} to={action.link} className="h-full">
                        <Card className="hover:scale-[1.02] transition-transform cursor-pointer border-none shadow-sm hover:shadow-md h-full group overflow-hidden active:scale-95">
                            <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center gap-1.5 sm:gap-3 h-full min-h-[80px] sm:min-h-[100px]">
                                <div className={`h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner transition-colors ${action.color}`}>
                                    <action.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                </div>
                                <span className="font-black text-slate-700 uppercase tracking-tighter text-[9px] sm:text-xs group-hover:text-primary transition-colors leading-tight">
                                    {action.label}
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Cards */}
            <DashboardStats storeId={storeId} />

            {/* Main Content Grid (Reordered: CashBox -> Low Stock -> Rest) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Cash Box Widget */}
                        <div className="md:scale-105 origin-top transition-transform h-full">
                            <CashBox storeId={storeId} />
                        </div>

                        {/* Inventory Snapshot (Low stock) */}
                        <div className="h-full">
                            <InventorySnapshot storeId={storeId} />
                        </div>
                    </div>
                </div>

                {/* Left Column (Charts) */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-white border-none shadow-lg shadow-slate-200/50 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl tracking-tight">Financial Trends</h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Last 30 Days Portfolio</p>
                            </div>
                        </div>
                        <div className="p-2 sm:p-4 min-h-[300px] sm:h-96 w-full">
                            <SalesExpenseChart storeId={storeId} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

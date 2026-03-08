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
        { label: 'Record Expense', icon: Wallet, link: `/stores/${storeId}/transactions/new?type=EXPENSE`, color: 'bg-expense text-white' },
        { label: 'Manage Clients', icon: Users, link: `/stores/${storeId}/customers`, color: 'bg-sky-600 text-white' },
        { label: 'Diary', icon: History, link: `/stores/${storeId}/history`, color: 'bg-slate-700 text-white' },
        { label: 'Add Product', icon: FilePlus, link: `/stores/${storeId}/inventory`, color: 'bg-emerald-600 text-white' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                        Store <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>. Here's your store's performance today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 border-2 font-bold hover:bg-slate-50">
                        <Link to={`/stores/${storeId}/pos`}>
                            <ShoppingCart className="w-5 h-5 mr-3" />
                            Launch POS
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="h-14 px-8 font-black shadow-lg shadow-primary/20">
                        <Link to={`/stores/${storeId}/transactions/new?type=EXPENSE`}>
                            <PlusCircle className="w-5 h-5 mr-3" />
                            Record Expense
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {quickActions.map((action, idx) => (
                    <Link key={idx} to={action.link}>
                        <Card className="hover:scale-[1.02] transition-transform cursor-pointer border-none shadow-sm hover:shadow-md h-full group overflow-hidden">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner transition-colors ${action.color}`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <span className="font-black text-slate-700 uppercase tracking-tighter text-xs group-hover:text-primary transition-colors">
                                    {action.label}
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Cards */}
            <DashboardStats storeId={storeId} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white border-none shadow-lg shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">Financial Trends</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sales vs Expenses (Last 30 Days)</p>
                            </div>
                        </div>
                        <div className="p-4 h-96">
                            <SalesExpenseChart storeId={storeId} />
                        </div>
                    </Card>
                </div>

                {/* Right Column (Widgets) */}
                <div className="space-y-6">
                    {/* Cash Box Widget */}
                    <div className="scale-105 origin-top">
                        <CashBox storeId={storeId} />
                    </div>

                    {/* Inventory Snapshot */}
                    <div className="h-auto">
                        <InventorySnapshot storeId={storeId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

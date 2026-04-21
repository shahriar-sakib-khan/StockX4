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
        { label: 'New Sale', icon: ShoppingCart, link: `/stores/${storeId}/pos`, color: 'text-primary bg-primary/15' },
        { label: 'Add Stock', icon: Package, link: `/stores/${storeId}/inventory`, color: 'text-blue-600 bg-blue-500/15' },
        { label: 'Expense', icon: Wallet, link: `/stores/${storeId}/history`, color: 'text-destructive bg-destructive/15' },
        { label: 'Customers', icon: Users, link: `/stores/${storeId}/customers`, color: 'text-sky-600 bg-sky-500/15' },
        { label: 'Diary', icon: History, link: `/stores/${storeId}/history`, color: 'text-violet-600 bg-violet-500/15' },
        { label: 'Add Product', icon: FilePlus, link: `/stores/${storeId}/inventory`, color: 'text-emerald-600 bg-emerald-500/15' },
    ];

    return (
        // REMOVED pb-24 here because StoreLayout already handles bottom spacing!
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        Overview
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm md:text-base mt-1.5">
                        Welcome back, <span className="text-foreground font-bold">{user?.name}</span>. Here is your store at a glance.
                    </p>
                </div>
                
                {/* Primary Action Row */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-border/50 shadow-sm bg-card hover:bg-muted/50">
                        <Link to={`/stores/${storeId}/inventory`}>
                            <Package className="w-5 h-5 mr-2 opacity-70" />
                            Inventory
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/25">
                        <Link to={`/stores/${storeId}/pos`}>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Launch POS
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Action Bento Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {quickActions.map((action, idx) => (
                    <Link key={idx} to={action.link} className="h-full block group outline-none">
                        <Card className="h-full border-border/40 shadow-sm bg-card hover:shadow-md transition-all duration-200 active:scale-95">
                            <CardContent className="p-3 md:p-5 flex flex-col items-center justify-center text-center gap-2 md:gap-3 h-full min-h-[90px]">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${action.color}`}>
                                    <action.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-foreground/80 text-[10px] md:text-xs uppercase tracking-wider group-hover:text-foreground transition-colors">
                                    {action.label}
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Executive Stats Cards */}
            <DashboardStats storeId={storeId} />

            {/* Main Bento Grid Container */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Column: Cash & Inventory Snapshots */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div>
                        <CashBox storeId={storeId} />
                    </div>

                    <div className="flex-1">
                        <InventorySnapshot storeId={storeId} />
                    </div>
                </div>

                {/* Right Column: Financial Chart */}
                <div className="xl:col-span-2">
                    <Card className="h-full border-border/40 shadow-sm bg-card overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-5 md:p-6 border-b border-border/40 bg-muted/20">
                            <h3 className="font-bold text-foreground text-lg tracking-tight">Financial Trends</h3>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                                Revenue vs Expenses
                            </p>
                        </div>
                        <div className="p-4 md:p-6 flex-1">
                            <SalesExpenseChart storeId={storeId} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
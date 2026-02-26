import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { AlertTriangle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InventorySnapshotProps {
    storeId: string;
}

export const InventorySnapshot = ({ storeId }: InventorySnapshotProps) => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-inventory', storeId],
        queryFn: () => dashboardApi.getInventorySummary(storeId)
    });

    if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

    const lowStockItems = data?.lowStock || [];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Low Stock Alert</h3>
                    <p className="text-xs text-muted-foreground">Items needing attention</p>
                </div>
            </div>

            {lowStockItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400">
                    <Package className="w-10 h-10 mb-2 opacity-50" />
                    <p>Inventory looks good!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {lowStockItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                                <div>
                                    <p className="font-medium text-sm text-slate-700">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">{item.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-red-600 text-sm">{item.stock} left</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lowStockItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <button className="text-sm text-primary hover:underline font-medium">View Full Inventory</button>
                </div>
            )}
        </div>
    );
};

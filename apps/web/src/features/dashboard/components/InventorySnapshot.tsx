import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { AlertTriangle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

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
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm h-full font-sans">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight uppercase">Low Stock Alert</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Needs Attention</p>
                </div>
            </div>

            {lowStockItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-center text-slate-400">
                    <Package className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm font-medium italic">Inventory looks good!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {lowStockItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 transition-all hover:bg-white active:scale-95">
                            <div className="flex items-center gap-2.5">
                                <span className="text-[10px] font-black text-slate-300 w-3">#{idx + 1}</span>
                                <div>
                                    <p className="font-bold text-xs sm:text-sm text-slate-700 leading-tight">{item.name}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{item.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-red-600 text-[10px] sm:text-xs bg-red-50 px-2 py-1 rounded-md border border-red-100">
                                    {item.stock} left
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lowStockItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link to={`/stores/${storeId}/inventory`}>
                        <button className="w-full h-12 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs sm:text-sm text-primary font-black uppercase tracking-widest transition-colors border border-slate-200 shadow-sm active:shadow-inner">
                            Full Inventory
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

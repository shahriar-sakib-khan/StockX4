import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InventorySnapshotProps {
    storeId: string;
}

export const InventorySnapshot = ({ storeId }: InventorySnapshotProps) => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-inventory', storeId],
        queryFn: () => dashboardApi.getInventorySummary(storeId)
    });

    if (isLoading) return <Skeleton className="h-[220px] w-full rounded-2xl shadow-sm bg-muted/30" />;

    const lowStockItems = data?.lowStock || [];
    const hasLowStock = lowStockItems.length > 0;

    return (
        <Card className="h-full border-border/40 shadow-sm bg-card flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
                
                {/* Elegant Header */}
                <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-border/20">
                    <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-full ring-1 ring-inset ${
                            hasLowStock 
                            ? 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-500' 
                            : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-500'
                        }`}>
                            {hasLowStock ? (
                                <AlertTriangle className="w-4 h-4 md:w-4 md:h-4" strokeWidth={2} />
                            ) : (
                                <ShieldCheck className="w-4 h-4 md:w-4 md:h-4" strokeWidth={2} />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-sm tracking-tight leading-none">
                                {hasLowStock ? 'Action Required' : 'Stock Status'}
                            </h3>
                            <p className="text-[10px] text-muted-foreground/80 font-medium uppercase tracking-wider mt-1.5">
                                {hasLowStock ? 'Low Inventory Items' : 'Healthy Inventory'}
                            </p>
                        </div>
                    </div>
                    {hasLowStock && (
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {lowStockItems.length}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/30">
                    {!hasLowStock ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center px-4 animate-in fade-in duration-700">
                            <div className="relative mb-5">
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[20px] scale-150"></div>
                                <ShieldCheck className="w-10 h-10 text-emerald-500/80 relative z-10" strokeWidth={1} />
                            </div>
                            <p className="text-sm font-semibold text-foreground">Optimal Levels</p>
                            <p className="text-[11px] text-muted-foreground/70 mt-1.5 font-medium max-w-[200px] leading-relaxed">
                                All products are fully stocked. No immediate action required.
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[180px] md:h-[200px]">
                            <div className="flex flex-col px-3 py-1.5">
                                {lowStockItems.map((item: any, idx: number) => {
                                    const isCritical = item.stock <= 5;

                                    return (
                                        <div 
                                            key={idx} 
                                            className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:bg-muted/40 hover:border-border/40 transition-all duration-300 group cursor-default"
                                        >
                                            {/* min-w-0 and flex-1 are crucial here to allow text truncation to work inside flexbox */}
                                            <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                                                {/* Delicate Status Dot */}
                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCritical ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-amber-500'}`} />
                                                
                                                <div className="flex flex-col min-w-0">
                                                    <p className="font-semibold text-xs md:text-[13px] text-foreground leading-tight mb-1 truncate group-hover:text-primary transition-colors duration-300">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground/70 uppercase font-semibold tracking-wider leading-none">
                                                        {item.type}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="shrink-0 flex items-center">
                                                <span className={`inline-flex items-center justify-center font-bold text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                                                    isCritical 
                                                    ? 'bg-destructive/10 text-destructive' 
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                                                }`}>
                                                    {item.stock} left
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Refined Footer Action */}
                <div className="p-2 border-t border-border/20 bg-card">
                    <Button asChild variant="ghost" className="w-full text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center group h-9 rounded-lg transition-all duration-300">
                        <Link to={`/stores/${storeId}/inventory`}>
                            View Full Inventory
                            <ChevronRight className="w-3.5 h-3.5 ml-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </Link>
                    </Button>
                </div>
                
            </CardContent>
        </Card>
    );
};
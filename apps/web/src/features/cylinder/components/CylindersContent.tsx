import { useState, useMemo } from "react";
import { Loader2, Package, RefreshCw, Box, AlertTriangle, Search, Filter, Plus } from "lucide-react";
import { useInventory } from "@/features/cylinder/hooks/useCylinders";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { InventoryTable } from "@/features/cylinder/components/InventoryTable";
import { CreateBrandModal } from "@/features/brand/components/CreateBrandModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InventoryFilterStrip } from "./InventoryFilterStrip";
import { EditStoreSizesModal } from "./EditStoreSizesModal";

export const CylindersContent = ({ storeId, onAddToCart }: { storeId: string, onAddToCart: any }) => {
    const { data: inventoryData, isLoading: isInvLoading } = useInventory(storeId);
    const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);

    const brandMap = useMemo(() => {
        const map = new Map<string, any>();
        for (const b of (brandsData?.brands || [])) {
            map.set(b._id.toString(), b);
        }
        return map;
    }, [brandsData]);

    const [search, setSearch] = useState("");
    const [regulator, setRegulator] = useState<string | null>("22mm");
    const [sizeFilter, setSizeFilter] = useState<string | null>("12kg");
    const [statusFilter, setStatusFilter] = useState<'refill' | 'empty' | 'full' | 'defected' | null>(null);
    const [isManageOpen, setManageOpen] = useState(false);
    const [isEditSizesOpen, setEditSizesOpen] = useState(false);
    const [isRestockActive, setIsRestockActive] = useState(false);

    const displayInventory = useMemo(() => {
        const raw = (inventoryData?.inventory || []) as any[];
        return raw
            .filter((item: any) => item.product?.category === 'cylinder')
            .map((item: any) => {
                const details = item.product?.details || {};
                const brand = brandMap.get(details.brandId?.toString?.() || '') || null;
                return {
                    _id: item._id,
                    productId: item.productId,
                    brandId: brand || { _id: details.brandId, name: item.product?.name?.split(' ')?.[0] || '?', logo: '', cylinderImage: '' },
                    brandName: brand?.name || item.product?.name?.split(' LPG')?.[0] || item.product?.name || '?',
                    variant: {
                        size: details.size || '?',
                        regulator: details.regulatorType || '?',
                        cylinderImage: brand?.cylinderImage || '',
                    },
                    counts: item.counts || { full: 0, empty: 0, defected: 0 },
                    prices: item.prices || {
                        buyingPriceFull: 0, buyingPriceGas: 0,
                        retailPriceFull: 0, retailPriceGas: 0,
                        wholesalePriceFull: 0, wholesalePriceGas: 0,
                    },
                    isVirtual: item._id?.toString().startsWith('virtual-'),
                };
            });
    }, [inventoryData, brandMap]);

    const baseInventory = displayInventory.filter((item: any) => {
        if (search && !item.brandName.toLowerCase().includes(search.toLowerCase())) return false;
        if (regulator && item.variant.regulator !== regulator) return false;
        if (sizeFilter && item.variant.size !== sizeFilter) return false;
        return true;
    });

    const stats = {
        full: baseInventory.reduce((s: number, i: any) => s + (i.counts?.full || 0), 0),
        empty: baseInventory.reduce((s: number, i: any) => s + (i.counts?.empty || 0), 0),
        defect: baseInventory.reduce((s: number, i: any) => s + (i.counts?.defected || 0), 0),
    };

    const filteredInventory = baseInventory.filter((item: any) => {
        if (statusFilter === 'full' && (item.counts?.full || 0) === 0) return false;
        if (statusFilter === 'refill' && (item.counts?.empty || 0) === 0) return false;
        if (statusFilter === 'empty' && (item.counts?.empty || 0) === 0) return false;
        if (statusFilter === 'defected' && (item.counts?.defected || 0) === 0) return false;
        return true;
    });

    if (isInvLoading || isBrandsLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/50" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* THE FIX: Swapped permanent 'overflow-hidden' for dynamic 'overflow-visible' when open, so shadows and borders never get clipped */}
            <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] space-y-6 ${isRestockActive ? 'opacity-0 max-h-0 m-0 !mt-0 scale-95 overflow-hidden' : 'opacity-100 max-h-[2000px] scale-100 overflow-visible'}`}>
                
                {/* 1. THE STATS ROW: Removed the p-2 -m-2 hack for perfect grid alignment */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    
                    {/* Total Stock Card */}
                    <div
                        className={`group relative rounded-[1.25rem] p-3.5 sm:p-5 cursor-pointer flex flex-col gap-2 sm:gap-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border ${
                            statusFilter === null 
                            ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400 shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1'
                        }`}
                        onClick={() => setStatusFilter(null)}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors duration-500 ${statusFilter === null ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-800'}`}>
                                <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                            </div>
                            <p className={`text-[9px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-colors duration-500 truncate ${statusFilter === null ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`}>Total Stock</p>
                        </div>
                        <p className="text-2xl sm:text-4xl font-black tracking-tighter leading-none text-slate-900 mt-1 sm:mt-0">{stats.full + stats.empty}</p>
                    </div>
                    
                    {/* Package Card (Emerald) */}
                    <div
                        className={`group relative rounded-[1.25rem] p-3.5 sm:p-5 cursor-pointer flex flex-col gap-2 sm:gap-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border ${
                            statusFilter === 'full' 
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-md' 
                            : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/80 hover:shadow-[0_8px_25px_-8px_rgba(16,185,129,0.3)] hover:-translate-y-1'
                        }`}
                        onClick={() => setStatusFilter(statusFilter === 'full' ? null : 'full')}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors duration-500 ${statusFilter === 'full' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700'}`}>
                                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                            </div>
                            <p className={`text-[9px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-colors duration-500 truncate ${statusFilter === 'full' ? 'text-emerald-700' : 'text-slate-500 group-hover:text-emerald-700'}`}>Package</p>
                        </div>
                        <p className="text-2xl sm:text-4xl font-black tracking-tighter leading-none text-slate-900 mt-1 sm:mt-0">{stats.full}</p>
                    </div>

                    {/* Refill Card (Sky Blue) */}
                    <div
                        className={`group relative rounded-[1.25rem] p-3.5 sm:p-5 cursor-pointer flex flex-col gap-2 sm:gap-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border ${
                            statusFilter === 'refill' 
                            ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500 shadow-md' 
                            : 'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/80 hover:shadow-[0_8px_25px_-8px_rgba(14,165,233,0.3)] hover:-translate-y-1'
                        }`}
                        onClick={() => setStatusFilter(statusFilter === 'refill' ? null : 'refill')}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors duration-500 ${statusFilter === 'refill' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-700'}`}>
                                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                            </div>
                            <p className={`text-[9px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-colors duration-500 truncate ${statusFilter === 'refill' ? 'text-sky-700' : 'text-slate-500 group-hover:text-sky-700'}`}>Refill</p>
                        </div>
                        <p className="text-2xl sm:text-4xl font-black tracking-tighter leading-none text-slate-900 mt-1 sm:mt-0">{stats.empty}</p>
                    </div>

                    {/* Defected Card (Rose Red) */}
                    <div
                        className={`group relative rounded-[1.25rem] p-3.5 sm:p-5 cursor-pointer flex flex-col gap-2 sm:gap-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border ${
                            statusFilter === 'defected' 
                            ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500 shadow-md' 
                            : 'bg-white border-slate-200 hover:border-rose-400 hover:bg-rose-50/80 hover:shadow-[0_8px_25px_-8px_rgba(244,63,94,0.3)] hover:-translate-y-1'
                        }`}
                        onClick={() => setStatusFilter(statusFilter === 'defected' ? null : 'defected')}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors duration-500 ${statusFilter === 'defected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-700'}`}>
                                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                            </div>
                            <p className={`text-[9px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest transition-colors duration-500 truncate ${statusFilter === 'defected' ? 'text-rose-700' : 'text-slate-500 group-hover:text-rose-700'}`}>Defected</p>
                        </div>
                        <p className="text-2xl sm:text-4xl font-black tracking-tighter leading-none text-slate-900 mt-1 sm:mt-0">{stats.defect}</p>
                    </div>
                </div>

                {/* 2. THE FILTER & ACTION BAR */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 p-4 bg-white border border-slate-200/80 rounded-[1.25rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
                        
                        {/* Valve Size Row */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50 shadow-inner shrink-0">
                            <button
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-300 outline-none ${regulator === null ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={() => setRegulator(null)}
                            >All Valves</button>
                            <button
                                onClick={() => setRegulator('22mm')}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-300 outline-none ${regulator === '22mm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >22mm</button>
                            <button
                                onClick={() => setRegulator('20mm')}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-300 outline-none ${regulator === '20mm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >20mm</button>
                        </div>

                        {/* Weight Size Row */}
                        <div className="w-full sm:w-auto min-w-0">
                            <InventoryFilterStrip
                                storeId={storeId}
                                activeSize={sizeFilter}
                                onSizeChange={setSizeFilter}
                                onEditSizesClick={() => setEditSizesOpen(true)}
                            />
                        </div>
                    </div>

                    {/* Search & Manage Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
                        <div className="relative w-full sm:w-[240px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search brands..."
                                className="pl-10 h-10 w-full rounded-xl bg-slate-50 border-slate-200 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm font-medium shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => setManageOpen(true)} 
                            variant="outline"
                            className="h-10 rounded-xl font-bold w-full sm:w-auto hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} /> Manage Brands
                        </Button>
                    </div>
                </div>
            </div>

            {/* Empty State / Table Area */}
            {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200/80 rounded-3xl border-dashed shadow-sm">
                    <div className="p-5 bg-slate-50 rounded-2xl mb-5 border border-slate-100 shadow-inner">
                        <Filter className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-black text-xl text-slate-900 tracking-tight">No cylinders found</p>
                    <p className="text-slate-500 font-medium mt-2 text-center max-w-sm">Try adjusting your filters, clearing your search, or adding a new brand to your inventory.</p>
                </div>
            ) : (
                <InventoryTable 
                    storeId={storeId} 
                    inventory={filteredInventory} 
                    onRestockStateChange={setIsRestockActive} 
                    groupByBrand={sizeFilter === null || sizeFilter === 'All'} 
                />
            )}

            <CreateBrandModal 
                storeId={storeId} 
                open={isManageOpen} 
                onClose={() => setManageOpen(false)} 
            />

            <EditStoreSizesModal
                storeId={storeId}
                open={isEditSizesOpen}
                onClose={() => setEditSizesOpen(false)}
            />
        </div>
    );
};
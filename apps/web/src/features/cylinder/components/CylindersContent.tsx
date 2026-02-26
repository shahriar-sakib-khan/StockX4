import { useState, useMemo } from "react";
import { Loader2, Package, RefreshCw, Box, AlertTriangle, Search, Filter, Plus } from "lucide-react";
import { useInventory } from "@/features/cylinder/hooks/useCylinders";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { InventoryTable } from "@/features/cylinder/components/InventoryTable";
import { CreateBrandModal } from "@/features/brand/components/CreateBrandModal";
import { Input } from "@/components/ui/input";
import { CylinderSizeOptions } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { InventoryFilterStrip } from "./InventoryFilterStrip";
import { EditStoreSizesModal } from "./EditStoreSizesModal";

export const CylindersContent = ({ storeId, onAddToCart }: { storeId: string, onAddToCart: any }) => {
    const { data: inventoryData, isLoading: isInvLoading } = useInventory(storeId);
    const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);

    // Build a stable Map: StoreBrand._id (string) → resolved brand object
    // Because Mongoose cannot populate() inside a Mixed-typed schema, details.brandId
    // arrives as a plain string. We cross-reference the brand list instead.
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
                // details.brandId is a raw ObjectId string — look it up in brandMap
                const brand = brandMap.get(details.brandId?.toString?.() || '') || null;
                return {
                    _id: item._id,
                    productId: item.productId,
                    // Provide the full brand object for logo display
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

    if (isInvLoading || isBrandsLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`transition-all duration-500 ease-in-out overflow-hidden space-y-6 ${isRestockActive ? 'opacity-0 max-h-0 m-0 !mt-0' : 'opacity-100 max-h-[1000px]'}`}>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === null ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-card'}`}
                        onClick={() => setStatusFilter(null)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg"><Box className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Total Stock</p>
                                <p className="text-2xl font-bold">{stats.full + stats.empty}</p>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'full' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-card'}`}
                        onClick={() => setStatusFilter(statusFilter === 'full' ? null : 'full')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Package className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Package (Full)</p>
                                <p className="text-2xl font-bold">{stats.full}</p>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'refill' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-card'}`}
                        onClick={() => setStatusFilter(statusFilter === 'refill' ? null : 'refill')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><RefreshCw className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Refill (Empty)</p>
                                <p className="text-2xl font-bold">{stats.empty}</p>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === 'defected' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-card'}`}
                        onClick={() => setStatusFilter(statusFilter === 'defected' ? null : 'defected')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Defected</p>
                                <p className="text-2xl font-bold">{stats.defect}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex bg-muted rounded-lg p-1 gap-1">
                            <button
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${regulator === null ? 'bg-white text-zinc-950 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setRegulator(null)}
                            >All</button>
                            <button
                                onClick={() => setRegulator('22mm')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${regulator === '22mm' ? 'bg-orange-500 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}`}
                            >22mm</button>
                            <button
                                onClick={() => setRegulator('20mm')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${regulator === '20mm' ? 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200'}`}
                            >20mm</button>
                        </div>
                        <InventoryFilterStrip
                            storeId={storeId}
                            activeSize={sizeFilter}
                            onSizeChange={setSizeFilter}
                            onEditSizesClick={() => setEditSizesOpen(true)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search brands..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setManageOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Manage Brands
                        </Button>
                        <CreateBrandModal open={isManageOpen} onClose={() => setManageOpen(false)} storeId={storeId} />
                        <EditStoreSizesModal open={isEditSizesOpen} onClose={() => setEditSizesOpen(false)} storeId={storeId} />
                    </div>
                </div>
            </div>

            {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl border-dashed">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Filter className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-lg">No cylinders found</p>
                    <p className="text-muted-foreground text-sm">Try adjusting your filters or adding a new brand.</p>
                </div>
            ) : (
                <InventoryTable storeId={storeId!} inventory={filteredInventory} onRestockStateChange={setIsRestockActive} groupByBrand={!sizeFilter || sizeFilter === 'All'} />
            )}
        </div>
    );
};

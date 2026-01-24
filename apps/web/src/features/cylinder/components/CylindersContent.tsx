import { useState } from "react";
import { Loader2, Package, RefreshCw, Box, AlertTriangle, Search, Filter } from "lucide-react";
import { useInventory } from "@/features/cylinder/hooks/useCylinders";
import { InventoryTable } from "@/features/cylinder/components/InventoryTable";
import { AddBrandModal } from "@/features/cylinder/components/AddBrandModal";
import { Input } from "@/components/ui/input";
import { CylinderSizeOptions } from "@repo/shared";

export const CylindersContent = ({ storeId, onAddToCart }: { storeId: string, onAddToCart: any }) => {
    const { data, isLoading } = useInventory(storeId);

    // Filters
    const [search, setSearch] = useState("");
    const [regulator, setRegulator] = useState<string | null>(null);
    const [sizeFilter, setSizeFilter] = useState<string | null>("12kg");
    const [statusFilter, setStatusFilter] = useState<'refill' | 'empty' | 'full' | 'defected' | null>(null);

    const inventory = data?.inventory || [];

    const brands = inventory.reduce((acc: string[], item: any) => {
        const id = item.brandId?._id || item.brandId;
        if (id && !acc.includes(id)) acc.push(id);
        return acc;
    }, []);

    const stats = {
        full: inventory.reduce((sum: number, item: any) => sum + (item.counts?.full || 0), 0),
        empty: inventory.reduce((sum: number, item: any) => sum + (item.counts?.empty || 0), 0),
        defect: inventory.reduce((sum: number, item: any) => sum + (item.counts?.defected || 0), 0),
    };

    const filteredInventory = inventory.filter((item: any) => {
        if (search && !item.brandName.toLowerCase().includes(search.toLowerCase())) return false;
        if (regulator && item.variant.regulator !== regulator) return false;
        if (sizeFilter && item.variant.size !== sizeFilter) return false;

        if (statusFilter === 'full' && (item.counts?.full || 0) === 0) return false;
        if (statusFilter === 'refill' && (item.counts?.empty || 0) === 0) return false;
        if (statusFilter === 'empty' && (item.counts?.empty || 0) === 0) return false;
        if (statusFilter === 'defected' && (item.counts?.defected || 0) === 0) return false;

        return true;
    });

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === null ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-card'}`}
                    onClick={() => setStatusFilter(null)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Box className="w-5 h-5" />
                        </div>
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
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Package className="w-5 h-5" />
                        </div>
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
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <RefreshCw className="w-5 h-5" />
                        </div>
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
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
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
                    {/* Regulator Toggle */}
                    <div className="flex bg-muted rounded-lg p-1 gap-1">
                         <button
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${regulator === null ? 'bg-white text-zinc-950 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setRegulator(null)}
                        >
                            All
                        </button>
                        <button
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${regulator === '22mm' ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-orange-50'}`}
                            onClick={() => setRegulator('22mm')}
                        >
                            22mm
                        </button>
                        <button
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${regulator === '20mm' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-blue-50'}`}
                            onClick={() => setRegulator('20mm')}
                        >
                            20mm
                        </button>
                    </div>

                    {/* Size Selector */}
                    <select
                        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={sizeFilter || ''}
                        onChange={(e) => setSizeFilter(e.target.value || null)}
                    >
                        <option value="">All Sizes</option>
                        {CylinderSizeOptions.map((size: string) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
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
                    <AddBrandModal storeId={storeId!} existingBrandIds={brands} />
                </div>
            </div>

            {/* Empty State or Content */}
             {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl border-dashed">
                     <div className="p-4 bg-muted rounded-full mb-4">
                        <Filter className="w-8 h-8 text-muted-foreground" />
                     </div>
                     <p className="font-medium text-lg">No cylinders found</p>
                     <p className="text-muted-foreground text-sm">Try adjusting your filters or adding a new brand.</p>
                </div>
             ) : (
                 <InventoryTable storeId={storeId!} inventory={filteredInventory} onAddToCart={onAddToCart} />
             )}
        </div>
    );
};

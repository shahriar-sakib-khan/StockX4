import { useState, useMemo } from "react";
import { Loader2, Package, RefreshCw, Box, AlertTriangle, Search, Filter, Plus } from "lucide-react";
import { useInventory } from "@/features/cylinder/hooks/useCylinders";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { InventoryTable } from "@/features/cylinder/components/InventoryTable";
import { CreateBrandModal } from "@/features/brand/components/CreateBrandModal";
import { Input } from "@/components/ui/input";
import { CylinderSizeOptions } from "@repo/shared";
import { Button } from "@/components/ui/button";

export const CylindersContent = ({ storeId, onAddToCart }: { storeId: string, onAddToCart: any }) => {
    const { data: inventoryData, isLoading: isInventoryLoading } = useInventory(storeId);
    const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);

    // Filters
    const [search, setSearch] = useState("");
    const [regulator, setRegulator] = useState<string | null>("22mm");
    const [sizeFilter, setSizeFilter] = useState<string | null>("12kg");
    const [statusFilter, setStatusFilter] = useState<'refill' | 'empty' | 'full' | 'defected' | null>(null);
    const [isManageOpen, setManageOpen] = useState(false);

    const inventory = inventoryData?.inventory || [];
    const brands = (brandsData?.brands || []).filter((b: any) => b.isActive !== false && (b.type === 'cylinder' || !b.type));

    // Local Image Mapping
    const getLocalCylinderImage = (brandName: string) => {
        const map: Record<string, string> = {
            "Aygaz LPG": "aygaz",
            "Bashundhara LPG": "bashundhara",
            "Beximco LPG": "beximco",
            "Bin Habeeb LPG": "binhabib",
            "BM Energy": "bm",
            "Delta LPG": "delta",
            "Euro Gas": "euro",
            "Fresh LPG": "fresh",
            "G-Gas": "ggas",
            "Index LPG": "index",
            "Jamuna LPG": "jamuna",
            "JMI LPG": "jmi",
            "Laugfs Gas": "laugfs",
            "Navana LPG": "navana",
            "Omera LPG": "omera",
            "Orion Gas": "orion",
            "Petromax LPG": "petromax",
            "Promita LPG": "promita",
            "Sena LPG": "shena",
            "TotalGas": "total",
            "Unigas": "unigas"
        };

        const key = Object.keys(map).find(k => brandName.includes(k) || k.includes(brandName));
        const slug = key ? map[key] : brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

        return `/cylinder/22-12/${slug}-22-12.png`;
    };

    // Combine Brands with Inventory (Matrix View Logic)
    // Generate a flat list of all available slots (Brand x Variant)
    // Combine Brands with Inventory (Matrix View Logic)
    // Generate a flat list of all available slots (Brand x Variant)
    const combinedInventory = useMemo(() => {
        return brands.flatMap((brand: any) => {
            const localImage = getLocalCylinderImage(brand.name);

            const variantsToCheck = [
                { size: '12kg', regulator: '22mm', cylinderImage: localImage },
                { size: '12kg', regulator: '20mm', cylinderImage: localImage },
                { size: '35kg', regulator: '22mm', cylinderImage: localImage },
                { size: '45kg', regulator: '22mm', cylinderImage: localImage },
            ];

            return variantsToCheck.map(variant => {
                // Find existing inventory record
                const existing = inventory.find((i: any) =>
                    i.brandId?._id === brand._id &&
                    i.variant?.size === variant.size &&
                    i.variant?.regulator === variant.regulator
                );

                if (existing) {
                    return {
                        ...existing,
                        brandName: existing.brandId?.name || brand.name,
                        variant: {
                            ...existing.variant,
                            cylinderImage: localImage
                        }
                    };
                }

                // Create Virtual Item
                return {
                    _id: `virtual-${brand._id}-${variant.size}-${variant.regulator}`,
                    brandId: brand,
                    brandName: brand.name,
                    variant: {
                        size: variant.size,
                        regulator: variant.regulator,
                        cylinderImage: variant.cylinderImage
                    },
                    counts: { full: 0, empty: 0, defected: 0 },
                    prices: { buyingFull: 0, sellingFull: 0, buyingGas: 0, sellingGas: 0 },
                    isVirtual: true // Flag to indicate it's not in DB yet
                };
            });
        });
    }, [brands, inventory]);

    const displayInventory = combinedInventory;

    // Base Filter (Variants & Search)
    const baseInventory = displayInventory.filter((item: any) => {
        if (search && !item.brandName.toLowerCase().includes(search.toLowerCase())) return false;
        if (regulator && item.variant.regulator !== regulator) return false;
        if (sizeFilter && item.variant.size !== sizeFilter) return false;
        return true;
    });

    // Stats based on Base Filter
    const stats = {
        full: baseInventory.reduce((sum: number, item: any) => sum + (item.counts?.full || 0), 0),
        empty: baseInventory.reduce((sum: number, item: any) => sum + (item.counts?.empty || 0), 0),
        defect: baseInventory.reduce((sum: number, item: any) => sum + (item.counts?.defected || 0), 0),
    };

    // Final Filter (Status) - used for Table
    const filteredInventory = baseInventory.filter((item: any) => {
        if (statusFilter === 'full' && (item.counts?.full || 0) === 0) return false;
        if (statusFilter === 'refill' && (item.counts?.empty || 0) === 0) return false;
        if (statusFilter === 'empty' && (item.counts?.empty || 0) === 0) return false;
        if (statusFilter === 'defected' && (item.counts?.defected || 0) === 0) return false;
        return true;
    });

    // Validations: If we have brands but no inventory, we might want to hint that they need to add stock.
    // But BuyStockModal handles "Add Stock" for existing brands even if no inventory record exists?
    // BuyStockModal currently accepts an `item`. If no item, we can't open it easily.
    // We'll address "Virtual Items" (missing stock) later. For now, at least let them manage brands.

    if (isInventoryLoading || isBrandsLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

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
                            onClick={() => setRegulator('22mm')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                                regulator === '22mm'
                                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                            }`}
                        >
                            22mm
                        </button>
                        <button
                            onClick={() => setRegulator('20mm')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                                regulator === '20mm'
                                    ? 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200'
                            }`}
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
                    {/* Replaced AddBrandModal with new Managing Modal Button */}
                    <Button onClick={() => setManageOpen(true)}>
                         <Plus className="w-4 h-4 mr-2" /> Manage Brands
                    </Button>
                    <CreateBrandModal open={isManageOpen} onClose={() => setManageOpen(false)} storeId={storeId} />
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

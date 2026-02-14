import { useState } from "react";
import { Loader2, Flame, Filter, Plus } from "lucide-react";
import { useInventory } from "@/features/cylinder/hooks/useCylinders";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { CreateBrandModal } from "@/features/brand/components/CreateBrandModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DefectModal } from "@/features/cylinder/components/DefectModal";
import { BuyStockModal } from "@/features/cylinder/components/BuyStockModal";
import { ProductInventoryCard } from "@/features/cylinder/components/ProductInventoryCard";
import { AddProductModal } from "@/features/cylinder/components/AddProductModal";
import { useNavigate } from "react-router-dom";

export const StovesContent = ({ storeId, onAddToCart }: { storeId: string, onAddToCart: any }) => {
    const { data: inventoryData, isLoading: isInventoryLoading } = useInventory(storeId);
    const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);
    const navigate = useNavigate();

    // Filters
    const [search, setSearch] = useState("");
    const [burnerFilter, setBurnerFilter] = useState<number | null>(null);
    const [isManageOpen, setManageOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Modals
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const inventory = inventoryData?.inventory || [];
    // Filter for STOVE brands
    const brands = (brandsData?.brands || []).filter((b: any) => b.isActive !== false && b.type === 'stove');

    // Combine Brands with Inventory (Matrix View Logic) -> CHANGED: Only show existing inventory
    const displayInventory = inventory.map((item: any) => ({
        ...item,
        brandName: item.brandId?.name || 'Unknown Brand',
        brandLogo: item.brandId?.logo || '/placeholder.png',
        // Ensure variant/counts/prices structure is preserved as expected by cards
    })).filter((item: any) => item.category === 'stove');

    // Filter Logic
    const filteredInventory = displayInventory.filter((item: any) => {
        if (search && !item.brandName.toLowerCase().includes(search.toLowerCase())) return false;
        if (burnerFilter && item.variant.burners !== burnerFilter) return false;
        return true;
    });

    // Stats
    // Stats Helper
    const getStats = (items: any[]) => {
        const stock = items.reduce((sum: number, item: any) => sum + (item.counts?.full || 0) + (item.counts?.empty || 0), 0);
        const damaged = items.reduce((sum: number, item: any) => sum + (item.counts?.defected || 0), 0);
        return { stock, damaged };
    };

    const stats = {
        total: getStats(displayInventory),
        oneBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 1)),
        twoBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 2)),
        threeBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 3)),
        fourBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 4)),
    };

    const handleBuy = (item: any) => {
        setSelectedItem(item);
        setBuyModalOpen(true);
    };

    const handleSell = (item: any) => {
        // Prepare cart item for POS
        const cartItem = {
             productId: item._id,
             name: `${item.brandName} ${item.variant.burners} Burner`,
             price: item.prices.fullCylinder,
             quantity: 1,
             image: item.variant.cylinderImage,
             type: 'stove',
             variant: `${item.variant.burners} Burner`
        };
        onAddToCart(cartItem);
    };

    const handleAdjust = (item: any) => {
        setSelectedItem(item);
        setDefectModalOpen(true);
    }

    const renderSection = (burners: number) => {
        const items = filteredInventory.filter((i: any) => i.variant.burners === burners);
        if (items.length === 0) return null;

        const sectionImage = `/stoves/stove-${burners}.png`;

        return (
            <div className="bg-muted/10 rounded-xl p-6 border mb-8 border-dashed">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-lg border p-1 shrink-0 flex items-center justify-center shadow-sm">
                        <img src={sectionImage} alt={`${burners} Burner`} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">{burners} Burner{burners > 1 ? 'S' : ''}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item: any) => (
                        <ProductInventoryCard
                            key={item._id}
                            item={item}
                            type="stove"
                            image={sectionImage}
                            storeId={storeId}
                            onBuy={handleBuy}
                            onSell={handleSell}
                            onAdjust={handleAdjust}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (isInventoryLoading || isBrandsLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-20">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${burnerFilter === null ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-card'}`}
                    onClick={() => setBurnerFilter(null)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Total Units</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{stats.total.stock}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-xl font-bold text-destructive">{stats.total.damaged}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Stock / Damaged</p>
                        </div>
                    </div>
                </div>

                {[1, 2, 3, 4].map(b => {
                    const stat = b === 1 ? stats.oneBurner : b === 2 ? stats.twoBurner : b === 3 ? stats.threeBurner : stats.fourBurner;
                    return (
                    <div
                        key={b}
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${burnerFilter === b ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-card'}`}
                        onClick={() => setBurnerFilter(burnerFilter === b ? null : b)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <Flame className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">{b} Burner</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{stat.stock}</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-xl font-bold text-destructive">{stat.damaged}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Stock / Damaged</p>
                            </div>
                        </div>
                    </div>
                )})}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search gas stoves by brand..."
                        className="pl-9 bg-card"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                     <Plus className="w-4 h-4 mr-2" /> Add Gas Stoves
                </Button>
            </div>

            <CreateBrandModal open={isManageOpen} onClose={() => setManageOpen(false)} storeId={storeId} />

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                storeId={storeId}
                type="stove"
                existingBrands={brands}
            />

            {/* Grouped Content */}
            <div className="space-y-8">
                {filteredInventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl border-dashed">
                        <div className="p-4 bg-muted rounded-full mb-4">
                        <Filter className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-lg">No stoves found</p>
                        <p className="text-muted-foreground text-sm">Try adjusting your filters or adding a new brand.</p>
                    </div>
                ) : (
                    <>
                        {(!burnerFilter || burnerFilter === 1) && renderSection(1)}
                        {(!burnerFilter || burnerFilter === 2) && renderSection(2)}
                        {(!burnerFilter || burnerFilter === 3) && renderSection(3)}
                        {(!burnerFilter || burnerFilter === 4) && renderSection(4)}
                    </>
                )}
            </div>

            {/* Modals */}
             <BuyStockModal
                isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                brandName={selectedItem?.brandName || ''}
                variant={`${selectedItem?.variant?.burners} Burner`}
                logo={selectedItem?.brandLogo}
                cylinderImage={selectedItem?.variant?.cylinderImage}
                onAddToCart={onAddToCart} // Assuming logic handle inside or ignored if just stock update
                item={selectedItem}
                storeId={storeId}
                category="stove"
            />

            <DefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={selectedItem}
                storeId={storeId}
            />
        </div>
    );
};
